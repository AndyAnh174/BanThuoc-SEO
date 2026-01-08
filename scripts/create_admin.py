import os
import sys
import django

sys.path.append(os.path.join(os.path.dirname(__file__), '../server'))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.local")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_admin():
    username = input("Enter admin username (default: admin): ") or "admin"
    email = input("Enter admin email (default: admin@banthuoc.local): ") or "admin@banthuoc.local"
    password = input("Enter admin password (default: Admin@123): ") or "Admin@123"

    if User.objects.filter(username=username).exists():
        print(f"User {username} already exists.")
        u = User.objects.get(username=username)
        u.role = User.Role.ADMIN
        u.is_staff = True
        u.is_superuser = True
        u.save()
        print(f"Updated {username} to ADMIN role.")
    else:
        User.objects.create_superuser(
            username=username, 
            email=email, 
            password=password,
            role=User.Role.ADMIN,
            is_active=True,
            full_name="System Admin"
        )
        print(f"Created admin user: {username}")

if __name__ == "__main__":
    create_admin()
