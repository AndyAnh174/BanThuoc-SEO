import os
import django
import sys

sys.path.insert(0, '/app/apps')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.prod")
django.setup()

from users.models import User

try:
    u = User.objects.get(username='admin')
    u.set_password('admin')
    u.save()
    print("Password for 'admin' set to 'admin' SUCCESSFULLY.")
except Exception as e:
    print(f"Failed to set password: {e}")
