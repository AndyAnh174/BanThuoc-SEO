import os
import django
import sys

sys.path.insert(0, '/app/apps')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.prod")
django.setup()

from users.models import User

try:
    u = User.objects.get(username='admin')
    print(f"Current role: {u.role}")
    if u.role != User.Role.ADMIN:
        u.role = User.Role.ADMIN
        u.save()
        print(f"Updated role to: {u.role}")
    else:
        print("Role is already ADMIN")
except Exception as e:
    print(f"Error: {e}")
