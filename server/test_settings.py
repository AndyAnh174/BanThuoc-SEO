import os
import django
import sys

sys.path.insert(0, '/app/apps')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.prod")
django.setup()

from django.conf import settings
print(f"SECRET_KEY type: {type(settings.SECRET_KEY)}")
print(f"SECRET_KEY value: {settings.SECRET_KEY!r}")

try:
    from rest_framework_simplejwt.settings import api_settings
    print(f"SimpleJWT SIGNING_KEY: {api_settings.SIGNING_KEY!r}")
    print(f"SimpleJWT ALGORITHM: {api_settings.ALGORITHM!r}")
    print(f"SimpleJWT VERIFYING_KEY: {api_settings.VERIFYING_KEY!r}")
except Exception as e:
    print(f"Error accessing SimpleJWT settings: {e}")

from users.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.backends import TokenBackend

print("--- Testing Token Generation ---")
try:
    user = User.objects.get(username='admin')
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    print(f"Token created: {access[:20]}...")
    
    # Explicitly pass key to see if it fixes it
    key = settings.SECRET_KEY
    print(f"Verifying with key: {key!r}")
    
    valid_data = TokenBackend(algorithm='HS256', signing_key=key).decode(access, verify=True)
    print("Token verification SUCCESS!")
    print(valid_data)
    
except Exception as e:
    print(f"FATAL ERROR: {e}")
    import traceback
    traceback.print_exc()
