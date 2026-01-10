"""
Seed data for products app.
Run with: python manage.py seed_products
"""
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from products.models import Category, Manufacturer, Product, ProductImage


class Command(BaseCommand):
    help = 'Seed sample data for products'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('🌱 Starting seed data...'))
        
        # Seed Categories
        self.seed_categories()
        
        # Seed Manufacturers
        self.seed_manufacturers()
        
        # Seed Products
        self.seed_products()
        
        self.stdout.write(self.style.SUCCESS('✅ Seed data completed successfully!'))

    def seed_categories(self):
        """Seed hierarchical categories for pharmacy products"""
        self.stdout.write('  📁 Creating categories...')
        
        categories_data = [
            # Level 1: Main categories
            {'name': 'Thuốc', 'slug': 'thuoc', 'description': 'Các loại thuốc điều trị bệnh', 'parent': None},
            {'name': 'Thực phẩm chức năng', 'slug': 'thuc-pham-chuc-nang', 'description': 'Thực phẩm bảo vệ sức khỏe', 'parent': None},
            {'name': 'Thiết bị y tế', 'slug': 'thiet-bi-y-te', 'description': 'Dụng cụ và thiết bị y tế gia đình', 'parent': None},
            {'name': 'Chăm sóc cá nhân', 'slug': 'cham-soc-ca-nhan', 'description': 'Sản phẩm chăm sóc cá nhân', 'parent': None},
            {'name': 'Mẹ và Bé', 'slug': 'me-va-be', 'description': 'Sản phẩm dành cho mẹ và bé', 'parent': None},
        ]
        
        # Create level 1 categories
        created_categories = {}
        for cat_data in categories_data:
            cat, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults={
                    'name': cat_data['name'],
                    'description': cat_data['description'],
                }
            )
            created_categories[cat_data['slug']] = cat
            if created:
                self.stdout.write(f"    ✓ Created: {cat.name}")
        
        # Level 2: Sub-categories for "Thuốc"
        thuoc = created_categories['thuoc']
        thuoc_sub = [
            {'name': 'Thuốc kháng sinh', 'slug': 'thuoc-khang-sinh', 'description': 'Các loại kháng sinh', 'parent': thuoc},
            {'name': 'Thuốc giảm đau, hạ sốt', 'slug': 'thuoc-giam-dau-ha-sot', 'description': 'Thuốc giảm đau và hạ sốt', 'parent': thuoc},
            {'name': 'Thuốc ho, cảm cúm', 'slug': 'thuoc-ho-cam-cum', 'description': 'Thuốc điều trị ho và cảm cúm', 'parent': thuoc},
            {'name': 'Thuốc tiêu hóa', 'slug': 'thuoc-tieu-hoa', 'description': 'Thuốc hỗ trợ tiêu hóa', 'parent': thuoc},
            {'name': 'Thuốc tim mạch', 'slug': 'thuoc-tim-mach', 'description': 'Thuốc điều trị tim mạch', 'parent': thuoc},
            {'name': 'Thuốc da liễu', 'slug': 'thuoc-da-lieu', 'description': 'Thuốc bôi ngoài da', 'parent': thuoc},
        ]
        
        for cat_data in thuoc_sub:
            cat, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults={
                    'name': cat_data['name'],
                    'description': cat_data['description'],
                    'parent': cat_data['parent'],
                }
            )
            created_categories[cat_data['slug']] = cat
            if created:
                self.stdout.write(f"    ✓ Created: {cat.name}")
        
        # Level 2: Sub-categories for "Thực phẩm chức năng"
        tpcn = created_categories['thuc-pham-chuc-nang']
        tpcn_sub = [
            {'name': 'Vitamin & Khoáng chất', 'slug': 'vitamin-khoang-chat', 'description': 'Bổ sung vitamin và khoáng chất', 'parent': tpcn},
            {'name': 'Hỗ trợ tiêu hóa', 'slug': 'ho-tro-tieu-hoa', 'description': 'TPCN hỗ trợ tiêu hóa', 'parent': tpcn},
            {'name': 'Hỗ trợ xương khớp', 'slug': 'ho-tro-xuong-khop', 'description': 'TPCN hỗ trợ xương khớp', 'parent': tpcn},
            {'name': 'Tăng cường miễn dịch', 'slug': 'tang-cuong-mien-dich', 'description': 'TPCN tăng cường miễn dịch', 'parent': tpcn},
            {'name': 'Hỗ trợ giảm cân', 'slug': 'ho-tro-giam-can', 'description': 'TPCN hỗ trợ giảm cân', 'parent': tpcn},
        ]
        
        for cat_data in tpcn_sub:
            cat, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults={
                    'name': cat_data['name'],
                    'description': cat_data['description'],
                    'parent': cat_data['parent'],
                }
            )
            created_categories[cat_data['slug']] = cat
            if created:
                self.stdout.write(f"    ✓ Created: {cat.name}")

        # Level 3: Sub-categories for some level 2
        vitamin_cat = created_categories['vitamin-khoang-chat']
        vitamin_sub = [
            {'name': 'Vitamin C', 'slug': 'vitamin-c', 'description': 'Vitamin C tăng đề kháng', 'parent': vitamin_cat},
            {'name': 'Vitamin D', 'slug': 'vitamin-d', 'description': 'Vitamin D hỗ trợ xương', 'parent': vitamin_cat},
            {'name': 'Vitamin tổng hợp', 'slug': 'vitamin-tong-hop', 'description': 'Vitamin tổng hợp đa năng', 'parent': vitamin_cat},
            {'name': 'Omega 3-6-9', 'slug': 'omega-3-6-9', 'description': 'Dầu cá và Omega', 'parent': vitamin_cat},
        ]
        
        for cat_data in vitamin_sub:
            cat, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults={
                    'name': cat_data['name'],
                    'description': cat_data['description'],
                    'parent': cat_data['parent'],
                }
            )
            created_categories[cat_data['slug']] = cat
            if created:
                self.stdout.write(f"    ✓ Created: {cat.name}")
        
        self.created_categories = created_categories
        self.stdout.write(f"  📁 Total categories: {Category.objects.count()}")

    def seed_manufacturers(self):
        """Seed manufacturers/brands"""
        self.stdout.write('  🏭 Creating manufacturers...')
        
        manufacturers_data = [
            {
                'name': 'Dược Hậu Giang',
                'slug': 'duoc-hau-giang',
                'description': 'Công ty Cổ phần Dược Hậu Giang - một trong những công ty dược phẩm hàng đầu Việt Nam',
                'country': 'Việt Nam',
                'website': 'https://www.dhgpharma.com.vn',
            },
            {
                'name': 'Sanofi',
                'slug': 'sanofi',
                'description': 'Tập đoàn dược phẩm đa quốc gia của Pháp',
                'country': 'Pháp',
                'website': 'https://www.sanofi.com',
            },
            {
                'name': 'Pfizer',
                'slug': 'pfizer',
                'description': 'Công ty dược phẩm và công nghệ sinh học hàng đầu thế giới',
                'country': 'Mỹ',
                'website': 'https://www.pfizer.com',
            },
            {
                'name': 'Dược phẩm Imexpharm',
                'slug': 'imexpharm',
                'description': 'Công ty Cổ phần Dược phẩm Imexpharm',
                'country': 'Việt Nam',
                'website': 'https://www.imexpharm.com',
            },
            {
                'name': 'Traphaco',
                'slug': 'traphaco',
                'description': 'Công ty Cổ phần Traphaco - Đông dược và thực phẩm chức năng',
                'country': 'Việt Nam',
                'website': 'https://www.traphaco.com.vn',
            },
            {
                'name': 'GlaxoSmithKline',
                'slug': 'gsk',
                'description': 'Tập đoàn dược phẩm và chăm sóc sức khỏe Anh Quốc',
                'country': 'Anh',
                'website': 'https://www.gsk.com',
            },
            {
                'name': 'Abbott',
                'slug': 'abbott',
                'description': 'Công ty chăm sóc sức khỏe toàn cầu',
                'country': 'Mỹ',
                'website': 'https://www.abbott.com',
            },
            {
                'name': 'Blackmores',
                'slug': 'blackmores',
                'description': 'Thương hiệu thực phẩm chức năng hàng đầu Australia',
                'country': 'Australia',
                'website': 'https://www.blackmores.com.au',
            },
        ]
        
        created_manufacturers = {}
        for mfr_data in manufacturers_data:
            mfr, created = Manufacturer.objects.get_or_create(
                slug=mfr_data['slug'],
                defaults=mfr_data
            )
            created_manufacturers[mfr_data['slug']] = mfr
            if created:
                self.stdout.write(f"    ✓ Created: {mfr.name}")
        
        self.created_manufacturers = created_manufacturers
        self.stdout.write(f"  🏭 Total manufacturers: {Manufacturer.objects.count()}")

    def seed_products(self):
        """Seed sample products"""
        self.stdout.write('  💊 Creating products...')
        
        products_data = [
            # Thuốc giảm đau, hạ sốt
            {
                'sku': 'PARA500',
                'name': 'Paracetamol 500mg',
                'slug': 'paracetamol-500mg',
                'short_description': 'Thuốc giảm đau, hạ sốt thông dụng',
                'description': 'Paracetamol 500mg là thuốc giảm đau, hạ sốt dùng để điều trị các cơn đau nhẹ đến vừa và hạ sốt.',
                'price': 25000,
                'sale_price': 22000,
                'category_slug': 'thuoc-giam-dau-ha-sot',
                'manufacturer_slug': 'duoc-hau-giang',
                'product_type': 'MEDICINE',
                'ingredients': 'Mỗi viên chứa: Paracetamol 500mg',
                'dosage': 'Người lớn: 1-2 viên/lần, 3-4 lần/ngày. Tối đa 8 viên/ngày.',
                'usage': 'Uống với nước, sau bữa ăn.',
                'contraindications': 'Người mẫn cảm với paracetamol, suy gan nặng.',
                'side_effects': 'Hiếm gặp: phản ứng dị ứng, phát ban da.',
                'storage': 'Bảo quản nơi khô ráo, tránh ánh sáng, nhiệt độ dưới 30°C.',
                'unit': 'Hộp',
                'quantity_per_unit': '10 vỉ x 10 viên',
                'stock_quantity': 500,
                'status': 'ACTIVE',
                'requires_prescription': False,
                'is_featured': True,
            },
            {
                'sku': 'EFFERA-COLD',
                'name': 'Efferalgan Cảm cúm',
                'slug': 'efferalgan-cam-cum',
                'short_description': 'Thuốc điều trị triệu chứng cảm cúm',
                'description': 'Efferalgan Cảm cúm giúp giảm các triệu chứng cảm cúm như sốt, đau đầu, nghẹt mũi.',
                'price': 85000,
                'category_slug': 'thuoc-ho-cam-cum',
                'manufacturer_slug': 'sanofi',
                'product_type': 'MEDICINE',
                'ingredients': 'Paracetamol 500mg, Phenylephrine HCl 5mg, Chlorpheniramine 2mg',
                'dosage': 'Người lớn: 1-2 viên/lần, cách 4-6 giờ. Tối đa 6 viên/ngày.',
                'usage': 'Uống với nước.',
                'unit': 'Hộp',
                'quantity_per_unit': '4 vỉ x 4 viên',
                'stock_quantity': 200,
                'status': 'ACTIVE',
                'requires_prescription': False,
            },
            # Kháng sinh
            {
                'sku': 'AMOX500',
                'name': 'Amoxicillin 500mg',
                'slug': 'amoxicillin-500mg',
                'short_description': 'Kháng sinh nhóm Penicillin',
                'description': 'Amoxicillin 500mg là kháng sinh phổ rộng dùng điều trị nhiễm khuẩn đường hô hấp, tiết niệu, da và mô mềm.',
                'price': 45000,
                'category_slug': 'thuoc-khang-sinh',
                'manufacturer_slug': 'imexpharm',
                'product_type': 'MEDICINE',
                'ingredients': 'Mỗi viên chứa: Amoxicillin trihydrat tương đương Amoxicillin 500mg',
                'dosage': 'Người lớn: 250-500mg mỗi 8 giờ hoặc 500-875mg mỗi 12 giờ.',
                'usage': 'Uống trước hoặc sau bữa ăn.',
                'contraindications': 'Người dị ứng với Penicillin hoặc Cephalosporin.',
                'side_effects': 'Tiêu chảy, buồn nôn, phát ban, nhiễm nấm.',
                'storage': 'Bảo quản nơi khô ráo, tránh ánh sáng, nhiệt độ dưới 25°C.',
                'unit': 'Hộp',
                'quantity_per_unit': '2 vỉ x 10 viên',
                'stock_quantity': 150,
                'status': 'ACTIVE',
                'requires_prescription': True,
                'is_featured': False,
            },
            # Vitamin
            {
                'sku': 'VITC-1000',
                'name': 'Vitamin C 1000mg Blackmores',
                'slug': 'vitamin-c-1000mg-blackmores',
                'short_description': 'Viên uống bổ sung Vitamin C tăng đề kháng',
                'description': 'Vitamin C 1000mg Blackmores giúp tăng cường hệ miễn dịch, chống oxy hóa và hỗ trợ sức khỏe làn da.',
                'price': 450000,
                'sale_price': 399000,
                'category_slug': 'vitamin-c',
                'manufacturer_slug': 'blackmores',
                'product_type': 'SUPPLEMENT',
                'ingredients': 'Ascorbic acid (Vitamin C) 1000mg',
                'dosage': 'Người lớn: 1 viên/ngày hoặc theo chỉ dẫn của bác sĩ.',
                'usage': 'Uống sau bữa ăn với nước.',
                'storage': 'Bảo quản nơi khô ráo, tránh ánh sáng trực tiếp.',
                'unit': 'Lọ',
                'quantity_per_unit': '150 viên',
                'stock_quantity': 100,
                'status': 'ACTIVE',
                'requires_prescription': False,
                'is_featured': True,
            },
            {
                'sku': 'OMEGA3-ABBOTT',
                'name': 'Omega 3-6-9 Abbott',
                'slug': 'omega-3-6-9-abbott',
                'short_description': 'Dầu cá bổ sung Omega tốt cho tim mạch',
                'description': 'Omega 3-6-9 Abbott cung cấp các axit béo thiết yếu giúp hỗ trợ sức khỏe tim mạch, não bộ và thị lực.',
                'price': 520000,
                'category_slug': 'omega-3-6-9',
                'manufacturer_slug': 'abbott',
                'product_type': 'SUPPLEMENT',
                'ingredients': 'Fish Oil 1000mg (EPA 180mg, DHA 120mg), Vitamin E 10IU',
                'dosage': 'Người lớn: 1-2 viên/ngày.',
                'usage': 'Uống sau bữa ăn.',
                'storage': 'Bảo quản trong tủ lạnh sau khi mở.',
                'unit': 'Lọ',
                'quantity_per_unit': '100 viên nang mềm',
                'stock_quantity': 80,
                'status': 'ACTIVE',
                'requires_prescription': False,
            },
            # Hỗ trợ tiêu hóa
            {
                'sku': 'BOGANIC',
                'name': 'Boganic - Bổ gan giải độc',
                'slug': 'boganic-bo-gan-giai-doc',
                'short_description': 'Thực phẩm chức năng bổ gan từ thảo dược',
                'description': 'Boganic chiết xuất từ actiso, cà gai leo giúp bổ gan, giải độc, tăng cường chức năng gan.',
                'price': 180000,
                'sale_price': 165000,
                'category_slug': 'ho-tro-tieu-hoa',
                'manufacturer_slug': 'traphaco',
                'product_type': 'SUPPLEMENT',
                'ingredients': 'Cao actiso 100mg, Cao Cà gai leo 80mg, Cao râu ngô 50mg',
                'dosage': 'Người lớn: 2 viên/lần, 2 lần/ngày.',
                'usage': 'Uống trước bữa ăn 30 phút.',
                'storage': 'Bảo quản nơi khô ráo, tránh ánh sáng.',
                'unit': 'Hộp',
                'quantity_per_unit': '5 vỉ x 20 viên',
                'stock_quantity': 300,
                'status': 'ACTIVE',
                'requires_prescription': False,
                'is_featured': True,
            },
            # Thiết bị y tế (to have variety)
            {
                'sku': 'THERMO-OMRON',
                'name': 'Nhiệt kế điện tử Omron',
                'slug': 'nhiet-ke-dien-tu-omron',
                'short_description': 'Nhiệt kế điện tử đo nhanh chính xác',
                'description': 'Nhiệt kế điện tử Omron MC-246 đo nhiệt độ cơ thể nhanh chóng, chính xác trong 60 giây.',
                'price': 150000,
                'category_slug': 'thiet-bi-y-te',
                'manufacturer_slug': 'abbott',  # Using Abbott as placeholder
                'product_type': 'MEDICAL_DEVICE',
                'ingredients': '',
                'dosage': '',
                'usage': 'Đặt nhiệt kế dưới nách hoặc lưỡi, đợi tín hiệu báo hoàn thành.',
                'storage': 'Bảo quản nơi khô ráo, tránh va đập.',
                'unit': 'Cái',
                'quantity_per_unit': '1 cái + 1 pin',
                'stock_quantity': 50,
                'status': 'ACTIVE',
                'requires_prescription': False,
            },
            # Xương khớp
            {
                'sku': 'GLUCOSA-500',
                'name': 'Glucosamine 500mg',
                'slug': 'glucosamine-500mg',
                'short_description': 'Hỗ trợ xương khớp, giảm đau khớp',
                'description': 'Glucosamine 500mg giúp tái tạo sụn khớp, giảm đau và cải thiện chức năng vận động của khớp.',
                'price': 380000,
                'sale_price': 340000,
                'category_slug': 'ho-tro-xuong-khop',
                'manufacturer_slug': 'blackmores',
                'product_type': 'SUPPLEMENT',
                'ingredients': 'Glucosamine Sulfate 500mg, Chondroitin Sulfate 400mg',
                'dosage': 'Người lớn: 2 viên/ngày.',
                'usage': 'Uống sau bữa ăn.',
                'storage': 'Bảo quản nơi khô ráo, nhiệt độ dưới 30°C.',
                'unit': 'Lọ',
                'quantity_per_unit': '90 viên',
                'stock_quantity': 120,
                'status': 'ACTIVE',
                'requires_prescription': False,
                'is_featured': True,
            },
        ]
        
        for prod_data in products_data:
            # Get category and manufacturer
            category = self.created_categories.get(prod_data.pop('category_slug'))
            manufacturer = self.created_manufacturers.get(prod_data.pop('manufacturer_slug'))
            
            if not category or not manufacturer:
                self.stdout.write(self.style.WARNING(f"    ⚠ Skipped {prod_data['name']}: missing category or manufacturer"))
                continue
            
            prod_data['category'] = category
            prod_data['manufacturer'] = manufacturer
            
            product, created = Product.objects.get_or_create(
                sku=prod_data['sku'],
                defaults=prod_data
            )
            
            if created:
                # Add sample images
                ProductImage.objects.create(
                    product=product,
                    image_url=f'/media/products/{product.slug}-1.jpg',
                    alt_text=product.name,
                    is_primary=True,
                    sort_order=0
                )
                self.stdout.write(f"    ✓ Created: {product.name}")
        
        self.stdout.write(f"  💊 Total products: {Product.objects.count()}")
