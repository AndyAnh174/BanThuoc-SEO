import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.prod')
django.setup()

from products.models import Category
from django.conf import settings

def fix_minio_urls():
    print(f"Checking categories for incorrect MinIO URLs...")
    # Find all categories with image containing 'minio:9000'
    categories = Category.objects.filter(image__icontains='minio:9000')
    
    count = categories.count()
    print(f"Found {count} categories with incorrect URLs.")
    
    if count == 0:
        return

    public_base = settings.MINIO_PUBLIC_ENDPOINT
    if public_base.endswith('/'):
        public_base = public_base[:-1]

    for cat in categories:
        old_url = cat.image
        # Replace minio:9000 with public domain
        # Assuming format http://minio:9000/bucket/...
        # And public format https://banthuoc.andyanh.id.vn/minio-api/bucket/...
        
        # We need to extract the path after the domain/port
        # Split by minio:9000
        if 'minio:9000' in old_url:
            path = old_url.split('minio:9000')[1]
            new_url = f"{public_base}{path}"
            
            print(f"Fixing {cat.name}: {old_url} -> {new_url}")
            cat.image = new_url
            cat.save()

    print("Migration complete.")

if __name__ == "__main__":
    fix_minio_urls()
