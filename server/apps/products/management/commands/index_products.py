"""
Management command to index products into Elasticsearch.
Run with: python manage.py index_products

Options:
    --batch-size: Number of products to index per batch (default: 100)
    --rebuild: Delete existing index and rebuild from scratch
"""
from django.core.management.base import BaseCommand
from django.db import connection
from elasticsearch.exceptions import NotFoundError
import time
import sys

from products.models import Product
from products.documents import ProductDocument


class Command(BaseCommand):
    help = 'Index all products into Elasticsearch'

    def add_arguments(self, parser):
        parser.add_argument(
            '--batch-size',
            type=int,
            default=100,
            help='Number of products to index per batch (default: 100)'
        )
        parser.add_argument(
            '--rebuild',
            action='store_true',
            help='Delete existing index and rebuild from scratch'
        )

    def handle(self, *args, **options):
        batch_size = options['batch_size']
        rebuild = options['rebuild']
        
        self.stdout.write(self.style.NOTICE('🔍 Starting Elasticsearch indexing...'))
        self.stdout.write(f'   Batch size: {batch_size}')
        
        start_time = time.time()
        
        # Rebuild index if requested
        if rebuild:
            self.rebuild_index()
        
        # Get products to index
        products = Product.objects.filter(
            status='ACTIVE'
        ).select_related(
            'category',
            'manufacturer',
        ).prefetch_related(
            'images',
        )
        
        total_count = products.count()
        self.stdout.write(f'   Total products to index: {total_count}')
        
        if total_count == 0:
            self.stdout.write(self.style.WARNING('⚠️  No active products found to index.'))
            return
        
        # Index in batches
        indexed_count = 0
        error_count = 0
        
        for i in range(0, total_count, batch_size):
            batch = products[i:i + batch_size]
            batch_list = list(batch)
            
            try:
                # Bulk index the batch
                ProductDocument().update(batch_list)
                indexed_count += len(batch_list)
                
                # Progress logging
                progress = (indexed_count / total_count) * 100
                self.stdout.write(
                    f'   📦 Indexed {indexed_count}/{total_count} products ({progress:.1f}%)'
                )
                
            except Exception as e:
                error_count += len(batch_list)
                self.stdout.write(
                    self.style.ERROR(f'   ❌ Error indexing batch {i}-{i + batch_size}: {str(e)}')
                )
        
        # Summary
        elapsed_time = time.time() - start_time
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 50))
        self.stdout.write(self.style.SUCCESS('📊 Indexing Summary'))
        self.stdout.write(self.style.SUCCESS('=' * 50))
        self.stdout.write(f'   ✅ Successfully indexed: {indexed_count}')
        if error_count > 0:
            self.stdout.write(self.style.ERROR(f'   ❌ Failed: {error_count}'))
        self.stdout.write(f'   ⏱️  Time elapsed: {elapsed_time:.2f} seconds')
        self.stdout.write(f'   📈 Rate: {indexed_count / elapsed_time:.2f} products/second')
        self.stdout.write('')

    def rebuild_index(self):
        """Delete and recreate the Elasticsearch index"""
        self.stdout.write(self.style.WARNING('🔄 Rebuilding index...'))
        
        try:
            # Delete existing index
            index = ProductDocument._index
            index.delete(ignore=[400, 404])
            self.stdout.write('   🗑️  Deleted existing index')
        except NotFoundError:
            self.stdout.write('   ℹ️  Index does not exist, creating new one')
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'   ⚠️  Could not delete index: {str(e)}'))
        
        try:
            # Create new index with mappings
            ProductDocument.init()
            self.stdout.write('   ✅ Created new index with mappings')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'   ❌ Failed to create index: {str(e)}'))
            sys.exit(1)
