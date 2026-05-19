"""
Import products from crawl-data-old-website.csv into database.
Run with: python manage.py import_csv /path/to/crawl-data-old-website.csv
"""
import csv
import os
import re
from decimal import Decimal, InvalidOperation

from django.core.management.base import BaseCommand
from django.utils.text import slugify

from products.models import Category, Manufacturer, Product, ProductType


# Map CSV status to Product status
STATUS_MAP = {
    'Tạm hết hàng': 'OUT_OF_STOCK',
    'Có giới hạn': 'ACTIVE',
    'Ngưng bán': 'INACTIVE',
}

# Map category name to product_type code
CATEGORY_TO_PRODUCT_TYPE = {
    'Thuốc': 'MEDICINE',
    'Thực phẩm chức năng': 'SUPPLEMENT',
    'Dược mỹ phẩm': 'COSMETIC',
    'Thiết bị và vật tư y tế': 'MEDICAL_DEVICE',
    'Hàng tiêu dùng': 'OTHER',
}

# Known manufacturer keywords to extract from product names
MANUFACTURER_PATTERNS = [
    # Multi-word first (longest match wins)
    (r'dược\s+việt\s+đức', 'Dược Phẩm Việt Đức'),
    (r'boston\s+việt\s+nam', 'Boston Pharma'),
    (r'gia\s+nguyễn', 'Dược phẩm Gia Nguyễn'),
    (r'tv\.\s*pharm[a]?', 'Trà Vinh Pharma'),
    (r'tv\.\s*pharma', 'Trà Vinh Pharma'),
    (r'tv\s+pharm', 'Trà Vinh Pharma'),
    # Single word patterns
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
    (r'opc\b', 'Dược phẩm OPC'),
    (r'yên\s*bái', 'Dược phẩm Yên Bái'),
    (r'hà\s*tây', 'Hataphar - Hà Tây'),
    (r'hậu\s*giang', 'Dược Hậu Giang'),
    (r'nam\s*hà', 'Dược Phẩm Nam Hà'),
    (r'tín\s*phong', 'Tín Phong Pharma'),
    (r'pharbaco', 'Pharbaco - Trung Ương 1'),
    (r'hanoipharma', 'Hanoipharma'),
    (r'thanh\s*hóa', 'Thanh Hóa - Thephaco'),
    (r'thephaco', 'Thanh Hóa - Thephaco'),
    (r'liên\s*hợp\s*đông\s*dương', 'Liên Hợp Đông Dương'),
    (r'meracine', 'Meracine'),
]


def parse_manufacturer_name(product_name: str) -> str | None:
    """Try to extract manufacturer from product name."""
    name_lower = product_name.lower().strip()
    for pattern, mfr_name in MANUFACTURER_PATTERNS:
        if re.search(pattern, name_lower):
            return mfr_name
    return None


def parse_stock(row: dict) -> int:
    """Sum stock from 3 warehouse columns."""
    total = 0
    for col in ['Tồn kho DN', 'Tồn kho HN', 'Tồn kho BD']:
        try:
            val = row.get(col, '0').strip()
            if val:
                total += int(float(val))
        except (ValueError, AttributeError):
            pass
    return total


def parse_price(raw: str) -> Decimal:
    """Parse price from CSV, return Decimal or 0."""
    try:
        cleaned = raw.strip().replace(',', '.')
        return Decimal(cleaned).quantize(Decimal('1'))
    except (InvalidOperation, ValueError, AttributeError):
        return Decimal('0')


class Command(BaseCommand):
    help = 'Import products from crawl-data-old-website.csv'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to CSV file')

    def handle(self, *args, **options):
        csv_path = options['csv_file']
        if not os.path.exists(csv_path):
            self.stderr.write(self.style.ERROR(f'File not found: {csv_path}'))
            return

        # Preload or create categories
        categories_map = self._ensure_categories()

        # Create a default manufacturer for unknown products
        default_mfr, _ = Manufacturer.objects.get_or_create(
            slug='chua-xac-dinh',
            defaults={'name': 'Chưa xác định', 'is_active': True}
        )

        # Preload or create product types
        product_type_map = self._ensure_product_types()

        # Read CSV
        stats = {'created': 0, 'skipped_duplicate': 0, 'skipped_missing': 0, 'errors': 0}
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
                    stats['skipped_missing'] += 1
                    continue

                # Skip duplicates
                if sku in seen_skus:
                    stats['skipped_duplicate'] += 1
                    self.stdout.write(self.style.WARNING(f'  ⚠ Duplicate SKU: {sku} — skipped'))
                    continue
                seen_skus.add(sku)

                # Check if SKU already exists in DB
                if Product.objects.filter(sku=sku).exists():
                    stats['skipped_duplicate'] += 1
                    self.stdout.write(self.style.WARNING(f'  ⚠ SKU already in DB: {sku} — skipped'))
                    continue

                # Category
                category = categories_map.get(category_name)
                if not category:
                    category, _ = Category.objects.get_or_create(
                        name=category_name,
                        defaults={'slug': slugify(category_name), 'is_active': True}
                    )
                    categories_map[category_name] = category

                # Manufacturer
                mfr_name = parse_manufacturer_name(name)
                if mfr_name:
                    manufacturer, _ = Manufacturer.objects.get_or_create(
                        name=mfr_name,
                        defaults={'slug': slugify(mfr_name), 'is_active': True}
                    )
                else:
                    manufacturer = default_mfr

                # Product type from category
                product_type = product_type_map.get(category_name)

                # Status
                status = STATUS_MAP.get(status_raw, 'DRAFT')

                # Price
                price = parse_price(price_raw)

                # Stock
                stock = parse_stock(row)

                try:
                    Product.objects.create(
                        sku=sku,
                        name=name,
                        price=price,
                        category=category,
                        manufacturer=manufacturer,
                        product_type=product_type,
                        status=status,
                        stock_quantity=stock,
                    )
                    stats['created'] += 1
                    if stats['created'] % 50 == 0:
                        self.stdout.write(f'  ... {stats["created"]} products created')
                except Exception as e:
                    stats['errors'] += 1
                    self.stderr.write(self.style.ERROR(f'  ✗ Error creating {sku}: {e}'))

        # Summary
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(
            f'Done. Total rows: {total_rows} | '
            f'Created: {stats["created"]} | '
            f'Duplicates skipped: {stats["skipped_duplicate"]} | '
            f'Missing data: {stats["skipped_missing"]} | '
            f'Errors: {stats["errors"]}'
        ))

    def _ensure_categories(self):
        """Create/lookup categories that exist in CSV."""
        csv_categories = [
            ('Thuốc', 'thuoc'),
            ('Thực phẩm chức năng', 'thuc-pham-chuc-nang'),
            ('Dược mỹ phẩm', 'duoc-my-pham'),
            ('Thiết bị và vật tư y tế', 'thiet-bi-va-vat-tu-y-te'),
            ('Hàng tiêu dùng', 'hang-tieu-dung'),
        ]
        result = {}
        for name, slug in csv_categories:
            cat, created = Category.objects.get_or_create(
                slug=slug,
                defaults={'name': name, 'is_active': True}
            )
            if created:
                self.stdout.write(f'  ✓ Created category: {name}')
            result[name] = cat
            # Also match by name in case slug differs
            result[name.upper()] = cat
        return result

    def _ensure_product_types(self):
        """Create/lookup product types based on category mapping."""
        type_data = {
            'Thuốc': ('MEDICINE', 'Thuốc'),
            'Thực phẩm chức năng': ('SUPPLEMENT', 'Thực phẩm chức năng'),
            'Dược mỹ phẩm': ('COSMETIC', 'Dược mỹ phẩm'),
            'Thiết bị và vật tư y tế': ('MEDICAL_DEVICE', 'Thiết bị và vật tư y tế'),
            'Hàng tiêu dùng': ('OTHER', 'Khác'),
        }
        result = {}
        for cat_name, (code, display) in type_data.items():
            pt, created = ProductType.objects.get_or_create(
                code=code,
                defaults={'name': display}
            )
            if created:
                self.stdout.write(f'  ✓ Created product type: {display}')
            result[cat_name] = pt
        return result
