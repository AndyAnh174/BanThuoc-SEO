from .base import *

DEBUG = True
ALLOWED_HOSTS = ["*"]

# Override any local settings here
print("🔧 Django is running in LOCAL mode.")

# In dev, we might want to see emails in console
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
