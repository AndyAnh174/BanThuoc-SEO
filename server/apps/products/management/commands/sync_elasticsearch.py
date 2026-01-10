"""
Management command for periodic Elasticsearch sync.
Can be run as a cron job to ensure data consistency.

Usage:
    # Full sync all products
    python manage.py sync_elasticsearch

    # Sync only products modified in last N hours
    python manage.py sync_elasticsearch --hours 24

    # Dry run (show what would be synced)
    python manage.py sync_elasticsearch --dry-run

Cron example (run every 6 hours):
    0 */6 * * * cd /path/to/project && python manage.py sync_elasticsearch --hours 6
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import time

from products.models import Product
from products.documents import ProductDocument


class Command(BaseCommand):
    help = 'Sync products to Elasticsearch (for cron jobs)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--hours',
            type=int,
            default=None,
            help='Only sync products modified in the last N hours'
        )
        parser.add_argument(
            '--batch-size',
            type=int,
            default=100,
            help='Batch size for syncing (default: 100)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be synced without actually syncing'
        )

    def handle(self, *args, **options):
        hours = options['hours']
        batch_size = options['batch_size']
        dry_run = options['dry_run']
        
        self.stdout.write(self.style.NOTICE('🔄 Starting Elasticsearch sync...'))
        
        if dry_run:
            self.stdout.write(self.style.WARNING('   DRY RUN - No changes will be made'))
        
        start_time = time.time()
        
        # Build queryset
        queryset = Product.objects.select_related(
            'category',
            'manufacturer',
        ).prefetch_related(
            'images',
        )
        
        if hours:
            cutoff = timezone.now() - timedelta(hours=hours)
            queryset = queryset.filter(updated_at__gte=cutoff)
            self.stdout.write(f'   Syncing products modified in last {hours} hours')
        
        # Separate active and inactive products
        active_products = queryset.filter(status='ACTIVE')
        inactive_products = queryset.exclude(status='ACTIVE')
        
        active_count = active_products.count()
        inactive_count = inactive_products.count()
        
        self.stdout.write(f'   Active products to index: {active_count}')
        self.stdout.write(f'   Inactive products to remove: {inactive_count}')
        
        if dry_run:
            self.stdout.write(self.style.SUCCESS('\n✅ Dry run complete. No changes made.'))
            return
        
        indexed_count = 0
        removed_count = 0
        error_count = 0
        
        # Index active products in batches
        if active_count > 0:
            self.stdout.write('\n📥 Indexing active products...')
            for i in range(0, active_count, batch_size):
                batch = list(active_products[i:i + batch_size])
                try:
                    ProductDocument().update(batch)
                    indexed_count += len(batch)
                    progress = (indexed_count / active_count) * 100
                    self.stdout.write(f'   Indexed {indexed_count}/{active_count} ({progress:.1f}%)')
                except Exception as e:
                    error_count += len(batch)
                    self.stdout.write(self.style.ERROR(f'   Error: {str(e)}'))
        
        # Remove inactive products from index
        if inactive_count > 0:
            self.stdout.write('\n🗑️  Removing inactive products from index...')
            for product in inactive_products:
                try:
                    doc = ProductDocument.get(id=str(product.id))
                    doc.delete()
                    removed_count += 1
                except Exception:
                    pass  # Document might not exist in index
        
        # Summary
        elapsed_time = time.time() - start_time
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 50))
        self.stdout.write(self.style.SUCCESS('📊 Sync Summary'))
        self.stdout.write(self.style.SUCCESS('=' * 50))
        self.stdout.write(f'   ✅ Indexed: {indexed_count}')
        self.stdout.write(f'   🗑️  Removed: {removed_count}')
        if error_count > 0:
            self.stdout.write(self.style.ERROR(f'   ❌ Errors: {error_count}'))
        self.stdout.write(f'   ⏱️  Time: {elapsed_time:.2f}s')
        self.stdout.write('')
