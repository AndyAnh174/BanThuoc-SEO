"""
Seed Flash Sale data.
Run with: python manage.py seed_flash_sales
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from products.models import Product, FlashSaleSession, FlashSaleItem

class Command(BaseCommand):
    help = 'Seed sample Flash Sale data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('⚡ Starting Flash Sale seeding...'))

        # Get existing products
        products = Product.objects.all()
        if not products.exists():
            self.stdout.write(self.style.ERROR('❌ No products found. Please run "python manage.py seed_products" first.'))
            return

        now = timezone.now()
        
        # 1. Create an Active Flash Sale (Running Now)
        session_name = "Flash Sale Giờ Vàng"
        start_time = now - timedelta(hours=1)
        end_time = now + timedelta(hours=2)
        
        session, created = FlashSaleSession.objects.get_or_create(
            name=session_name,
            defaults={
                'description': 'Săn sale giờ vàng giá sốc!',
                'start_time': start_time,
                'end_time': end_time,
                'status': FlashSaleSession.Status.ACTIVE,
                'banner_image': 'https://placehold.co/1200x400/orange/white?text=Flash+Sale',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(f"    ✓ Created Session: {session.name}")
        else:
            self.stdout.write(f"    ℹ Session exists: {session.name}")
            # Ensure it is active for testing
            session.start_time = start_time
            session.end_time = end_time
            session.status = FlashSaleSession.Status.ACTIVE
            session.save()

        # 2. Add products to the session
        added_count = 0
        
        # Pick first 5 products
        for i, product in enumerate(products[:5]):
            # 30-50% discount
            original_price = product.price
            discount_percent = 30 + (i * 5) # 30, 35, 40...
            flash_price = int(original_price * (100 - discount_percent) / 100)
            
            # Ensure price is valid
            if flash_price >= original_price:
                flash_price = original_price - 1000

            item, created = FlashSaleItem.objects.get_or_create(
                session=session,
                product=product,
                defaults={
                    'original_price': original_price,
                    'flash_sale_price': flash_price,
                    'total_quantity': 50,
                    'remaining_quantity': 50 - (i * 2), # Simulate some sales? No, seed fresh. Actually let's simulate some sold.
                    'sold_quantity': i * 2,
                    'max_per_user': 2,
                    'sort_order': i
                }
            )
            
            if created:
                added_count += 1
                self.stdout.write(f"      + Added: {product.name} (-{discount_percent}%)")

        self.stdout.write(self.style.SUCCESS(f'✅ Seeded {added_count} items into Flash Sale.'))
