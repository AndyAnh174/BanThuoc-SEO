import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Category

try:
    cat = Category.objects.get(name='Thuốc da liễu')
    print(f"CATEGORY_DEBUG: Name='{cat.name}', Parent='{cat.parent}', ParentID='{cat.parent_id}'")
except Category.DoesNotExist:
    print("CATEGORY_DEBUG: Category 'Thuốc da liễu' not found")
except Exception as e:
    print(f"CATEGORY_DEBUG: Error: {e}")
