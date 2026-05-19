"""Standalone CSV import script — run from /tmp with Django setup."""
import csv
import os
import re
import sys
from decimal import Decimal, InvalidOperation

# Ensure /app is on the Python path
sys.path.insert(0, '/app')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.prod')
import django
django.setup()

from django.utils.text import slugify
from products.models import Category, Manufacturer, Product, ProductType

STATUS_MAP = {
    'Tạm hết hàng': 'OUT_OF_STOCK',
    'Có giới hạn': 'ACTIVE',
    'Ngưng bán': 'INACTIVE',
}

CATEGORY_TO_PRODUCT_TYPE = {
    'Thuốc': 'MEDICINE',
    'Thực phẩm chức năng': 'SUPPLEMENT',
    'Dược mỹ phẩm': 'COSMETIC',
    'Thiết bị và vật tư y tế': 'MEDICAL_DEVICE',
    'Hàng tiêu dùng': 'OTHER',
}

MANUFACTURER_PATTERNS = [
    (r'dược\s+việt\s+đức', 'Dược Phẩm Việt Đức'),
    (r'boston\s+việt\s+nam', 'Boston Pharma'),
    (r'gia\s+nguyễn', 'Dược phẩm Gia Nguyễn'),
    (r'tv\.\s*pharm[a]?', 'Trà Vinh Pharma'),
    (r'tv\.\s*pharma', 'Trà Vinh Pharma'),
    (r'tv\s+pharm', 'Trà Vinh Pharma'),
    (r'vidipha', 'Vidipha'),
    (r'donaipharm', 'DonaiPharm'),
    (r'yuhan', 'Yuhan'),
    (r'pharmedic', 'Pharmedic'),
    (r'dhg\b', 'Dược Hậu Giang'),
    (r'merap\b', 'MERAP'),
    (r'stella\b', 'Stella Pharm'),
    (r'imexpharm', 'Dược phẩm Imexpharm'),
    (r'davac\b', 'Davac'),
    (r'kolmar\b', 'KOLMAR PHARMA'),
    (r'ss\s*pharm', 'SS Pharm'),
    (r'saphar\b', 'Saphar'),
]

def parse_manufacturer_name(product_name):
    name_lower = product_name.lower().strip()
    for pattern, mfr_name in MANUFACTURER_PATTERNS:
        if re.search(pattern, name_lower):
            return mfr_name
    return None

def parse_stock(row):
    total = 0
    for col in ['Tồn kho DN', 'Tồn kho HN', 'Tồn kho BD']:
        try:
            val = row.get(col, '0').strip()
            if val:
                total += int(float(val))
        except (ValueError, AttributeError):
            pass
    return total

def parse_price(raw):
    try:
        cleaned = raw.strip().replace(',', '.')
        return Decimal(cleaned).quantize(Decimal('1'))
    except (InvalidOperation, ValueError, AttributeError):
        return Decimal('0')

def main():
    csv_path = sys.argv[1] if len(sys.argv) > 1 else '/tmp/crawl-data.csv'
    if not os.path.exists(csv_path):
        print(f'File not found: {csv_path}')
        sys.exit(1)

    # Ensure categories
    csv_categories = [
        ('Thuốc', 'thuoc'),
        ('Thực phẩm chức năng', 'thuc-pham-chuc-nang'),
        ('Dược mỹ phẩm', 'duoc-my-pham'),
        ('Thiết bị và vật tư y tế', 'thiet-bi-va-vat-tu-y-te'),
        ('Hàng tiêu dùng', 'hang-tieu-dung'),
    ]
    cat_map = {}
    for name, slug in csv_categories:
        cat, _ = Category.objects.get_or_create(slug=slug, defaults={'name': name, 'is_active': True})
        cat_map[name] = cat
        cat_map[name.upper()] = cat

    # Default manufacturer
    default_mfr, _ = Manufacturer.objects.get_or_create(
        slug='chua-xac-dinh', defaults={'name': 'Chưa xác định', 'is_active': True}
    )

    # Product types
    pt_map = {}
    type_data = {
        'Thuốc': ('MEDICINE', 'Thuốc'),
        'Thực phẩm chức năng': ('SUPPLEMENT', 'Thực phẩm chức năng'),
        'Dược mỹ phẩm': ('COSMETIC', 'Dược mỹ phẩm'),
        'Thiết bị và vật tư y tế': ('MEDICAL_DEVICE', 'Thiết bị và vật tư y tế'),
        'Hàng tiêu dùng': ('OTHER', 'Khác'),
    }
    for cat_name, (code, display) in type_data.items():
        pt, _ = ProductType.objects.get_or_create(code=code, defaults={'name': display})
        pt_map[cat_name] = pt

    # Pre-build manufacturer cache
    mfr_cache = {}
    existing_manufacturers = {m.name: m for m in Manufacturer.objects.all()}

    # Read CSV
    created = skipped_dup = skipped_missing = errors = 0
    seen_skus = set()

    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        total_rows = 0

        for row in reader:
            total_rows += 1
            sku = row.get('Mã SKU', '').strip()
            name = row.get('Tên sản phẩm', '').strip()
            category_name = row.get('Ngành hàng', '').strip()
            status_raw = row.get('Trạng thái', '').strip()
            price_raw = row.get('Giá (đã VAT)', '0').strip()

            if not sku or not name:
                skipped_missing += 1
                continue

            if sku in seen_skus:
                skipped_dup += 1
                print(f'  SKIP dup CSV: {sku}')
                continue
            seen_skus.add(sku)

            if Product.objects.filter(sku=sku).exists():
                skipped_dup += 1
                print(f'  SKIP dup DB: {sku}')
                continue

            # Category
            category = cat_map.get(category_name)
            if not category:
                category, _ = Category.objects.get_or_create(
                    name=category_name,
                    defaults={'slug': slugify(category_name), 'is_active': True}
                )
                cat_map[category_name] = category

            # Manufacturer
            mfr_name = parse_manufacturer_name(name)
            if mfr_name:
                if mfr_name in existing_manufacturers:
                    manufacturer = existing_manufacturers[mfr_name]
                elif mfr_name in mfr_cache:
                    manufacturer = mfr_cache[mfr_name]
                else:
                    manufacturer, _ = Manufacturer.objects.get_or_create(
                        name=mfr_name,
                        defaults={'slug': slugify(mfr_name), 'is_active': True}
                    )
                    mfr_cache[mfr_name] = manufacturer
            else:
                manufacturer = default_mfr

            product_type = pt_map.get(category_name)
            status = STATUS_MAP.get(status_raw, 'DRAFT')
            price = parse_price(price_raw)
            stock = parse_stock(row)

            try:
                Product.objects.create(
                    sku=sku, name=name, price=price,
                    category=category, manufacturer=manufacturer,
                    product_type=product_type, status=status,
                    stock_quantity=stock,
                )
                created += 1
                if created % 50 == 0:
                    print(f'  ... {created} products')
            except Exception as e:
                errors += 1
                print(f'  ERROR {sku}: {e}')

    print(f'\n=== IMPORT COMPLETE ===')
    print(f'Total rows: {total_rows} | Created: {created} | Dup skipped: {skipped_dup} | Missing: {skipped_missing} | Errors: {errors}')
    print(f'Products in DB: {Product.objects.count()}')

if __name__ == '__main__':
    main()
