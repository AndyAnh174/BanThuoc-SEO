import os
import django
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.local')
django.setup()

from products.models import Banner

def fix_banners():
    print("Checking banners...")
    # Get all banners
    banners = Banner.objects.all()
    
    for banner in banners:
        print(f"Banner: {banner.title}, Start: {banner.start_date}, End: {banner.end_date}, Active: {banner.is_active}")
        
        # Force set start_date to yesterday if it exists, to ensure it's visible
        if banner.start_date:
            banner.start_date = timezone.now() - timedelta(days=1)
            banner.save()
            print(f"  -> Fixed start_date to: {banner.start_date}")
            
        print(f"  -> Is Visible Now? {banner.is_visible}")

if __name__ == "__main__":
    fix_banners()
