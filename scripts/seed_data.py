import os
import sys
import django
import random
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone

# Setup Django Environment
# Check if running in container (app at /app) or local (at server/)
current_dir = os.path.dirname(__file__)
if os.path.exists(os.path.join(current_dir, '../core')):
    sys.path.append(os.path.join(current_dir, '..'))
else:
    sys.path.append(os.path.join(current_dir, '../server'))

# Use production settings if running in prod container, but local works if inside container
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.base")
django.setup()

# Mock ES registry to avoid ConnectionRefused errors (since ES is not in docker-compose)
try:
    import django_elasticsearch_dsl
    def mock_es_action(*args, **kwargs):
        pass
    django_elasticsearch_dsl.registries.registry.update = mock_es_action
    django_elasticsearch_dsl.registries.registry.delete = mock_es_action
    print("Elasticsearch updates disabled for seeding.")
except ImportError:
    pass

from products.models import Category, Manufacturer, Product, ProductImage, Banner
from products.models.flash_sale import FlashSaleSession, FlashSaleItem

def create_categories():
    print("Creating Categories...")
    # Root Categories
    med_cat, _ = Category.objects.get_or_create(
        name="Thuốc", 
        defaults={"description": "Các loại thuốc chữa bệnh", "is_active": True}
    )
    sup_cat, _ = Category.objects.get_or_create(
        name="Thực phẩm chức năng", 
        defaults={"description": "Sản phẩm hỗ trợ sức khỏe", "is_active": True}
    )
    dev_cat, _ = Category.objects.get_or_create(
        name="Thiết bị y tế", 
        defaults={"description": "Dụng cụ y tế gia đình", "is_active": True}
    )

    # Sub Categories
    Category.objects.get_or_create(name="Kháng sinh", parent=med_cat)
    Category.objects.get_or_create(name="Giảm đau, Hạ sốt", parent=med_cat)
    Category.objects.get_or_create(name="Tiêu hóa", parent=med_cat)
    
    Category.objects.get_or_create(name="Vitamin & Khoáng chất", parent=sup_cat)
    Category.objects.get_or_create(name="Sắc đẹp", parent=sup_cat)
    
    Category.objects.get_or_create(name="Máy đo huyết áp", parent=dev_cat)
    Category.objects.get_or_create(name="Nhiệt kế", parent=dev_cat)
    
    print("Categories created.")
    return {
        "med": med_cat,
        "sup": sup_cat,
        "dev": dev_cat
    }

def create_manufacturers():
    print("Creating Manufacturers...")
    brands = [
        {"name": "Dược Hậu Giang (DHG)", "country": "Vietnam", "website": "https://dhgpharma.com.vn"},
        {"name": "Traphaco", "country": "Vietnam", "website": "https://traphaco.com.vn"},
        {"name": "Sanofi", "country": "France", "website": "https://sanofi.com.vn"},
        {"name": "Rohto", "country": "Japan", "website": "https://rohto.com.vn"},
        {"name": "Omron", "country": "Japan", "website": "https://omron-healthcare.vn"},
    ]
    
    created_brands = []
    for brand in brands:
        obj, _ = Manufacturer.objects.get_or_create(
            name=brand["name"],
            defaults={
                "country": brand["country"],
                "website": brand["website"],
                "description": f"Manufacturer from {brand['country']}"
            }
        )
        created_brands.append(obj)
    
    print("Manufacturers created.")
    return {b.name: b for b in created_brands}

def create_products(cats, brands):
    print("Creating Products...")
    
    # Generic helpers
    def create_prod_helper(name, sku, cat_name, brand_name, price, sale_price=None, img=None, is_med=True):
        # Find category - simplified lookup
        parent = None
        if cat_name in ["Thuốc", "Thực phẩm chức năng", "Thiết bị y tế"]:
             category = Category.objects.get(name=cat_name)
        else:
             category = Category.objects.filter(name=cat_name).first()
             if not category:
                 category = cats["med"] # fallback

        manufacturer = brands.get(brand_name) or Manufacturer.objects.first()
        
        prod, created = Product.objects.get_or_create(
            sku=sku,
            defaults={
                "name": name,
                "category": category,
                "manufacturer": manufacturer,
                "price": price,
                "sale_price": sale_price,
                "description": f"Mô tả chi tiết cho sản phẩm {name}. Công dụng, liều dùng, cách bảo quản...",
                "short_description": f"Sản phẩm {name} chính hãng",
                "status": Product.Status.ACTIVE,
                "stock_quantity": random.randint(10, 100),
                "is_featured": random.choice([True, False]),
                "product_type": Product.ProductType.MEDICINE if is_med else Product.ProductType.SUPPLEMENT
            }
        )
        
        if img:
            ProductImage.objects.get_or_create(product=prod, is_primary=True, defaults={"image_url": img})
        
        return prod

    # Products List
    create_prod_helper("Panadol Extra", "PAN-001", "Giảm đau, Hạ sốt", "Sanofi", 150000, 135000, "https://cdn.example.com/panadol.jpg")
    create_prod_helper("Hapacol 250", "HAP-001", "Giảm đau, Hạ sốt", "Dược Hậu Giang (DHG)", 80000, None, "https://cdn.example.com/hapacol.jpg")
    create_prod_helper("Tottri Traphaco", "TOT-001", "Tiêu hóa", "Traphaco", 120000, 110000, "https://cdn.example.com/tottri.jpg")
    create_prod_helper("Berberin", "BER-001", "Tiêu hóa", "Dược Hậu Giang (DHG)", 50000, None, "https://cdn.example.com/berberin.jpg")
    create_prod_helper("Vitamin C 1000mg", "VIT-C-001", "Vitamin & Khoáng chất", "Dược Hậu Giang (DHG)", 90000, 85000, "https://cdn.example.com/vitc.jpg", is_med=False)
    create_prod_helper("Máy đo huyết áp Omron HEM-7121", "OMR-001", "Máy đo huyết áp", "Omron", 850000, 790000, "https://cdn.example.com/omron-hem.jpg", is_med=False)
    create_prod_helper("Rohto Mentholatum", "ROT-001", "Sắc đẹp", "Rohto", 65000, None, "https://cdn.example.com/rohto.jpg", is_med=False)
    create_prod_helper("Boganic", "BOG-001", "Thực phẩm chức năng", "Traphaco", 110000, 95000, "https://cdn.example.com/boganic.jpg", is_med=False)

    print("Products created.")

def create_banners():
    print("Creating Banners...")
    banners = [
        {
            "title": "Siêu Sale Mùa Hè",
            "subtitle": "Giảm giá sốc lên đến 50%",
            "image_url": "https://cdn.example.com/banner-summer.jpg",
            "background_color": "#ff6b6b"
        },
        {
            "title": "Chăm sóc sức khỏe gia đình",
            "subtitle": "Combo vitamin cho cả nhà",
            "image_url": "https://cdn.example.com/banner-family.jpg",
            "background_color": "#4ecdc4"
        },
        {
            "title": "Thiết bị y tế chính hãng",
            "subtitle": "Bảo hành 12 tháng",
            "image_url": "https://cdn.example.com/banner-device.jpg",
            "background_color": "#1a535c"
        }
    ]
    
    for i, b in enumerate(banners):
        Banner.objects.get_or_create(
            title=b["title"],
            defaults={
                "subtitle": b["subtitle"],
                "image_url": b["image_url"],
                "background_color": b["background_color"],
                "sort_order": i,
                "is_active": True
            }
        )
    print("Banners created.")

def create_flash_sale():
    print("Creating Flash Sale...")
    now = timezone.now()
    start = now.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
    end = start + timedelta(hours=2)
    
    session, created = FlashSaleSession.objects.get_or_create(
        name="Flash Sale Giờ Vàng",
        defaults={
            "description": "Giảm giá cực sốc trong 2 giờ",
            "start_time": start,
            "end_time": end,
            "is_active": True
        }
    )
    
    # Add products
    products = Product.objects.filter(status=Product.Status.ACTIVE)[:5]
    for p in products:
        FlashSaleItem.objects.get_or_create(
            session=session,
            product=p,
            defaults={
                "flash_sale_price": p.price * Decimal("0.7"), # 30% off
                "total_quantity": 50,
                "remaining_quantity": 50,
                "max_per_user": 2
            }
        )
    print("Flash Sale created.")

if __name__ == "__main__":
    cats = create_categories()
    brands = create_manufacturers()
    create_products(cats, brands)
    create_banners()
    create_flash_sale()
    print("Done! Sample data populated.")
