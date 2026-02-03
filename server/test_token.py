import os
import django
import sys

# Add apps to path if needed (though manage.py usually handles it, here we are standalone)
sys.path.insert(0, '/app/apps')

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.prod")
django.setup()

from users.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.backends import TokenBackend

print("--- Testing Token Generation ---")
try:
    user = User.objects.get(username='admin')
    print(f"User found: {user.username} (ID: {user.id})")
    
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    print(f"Token created successfully. Length: {len(access)}")
    
    print("--- Verifying Token ---")
    valid_data = TokenBackend(algorithm='HS256').decode(access, verify=True)
    print("Token verification SUCCESS!")
    print(f"Token payload: {valid_data}")
    
except Exception as e:
    print(f"FATAL ERROR: {e}")
    import traceback
    traceback.print_exc()
