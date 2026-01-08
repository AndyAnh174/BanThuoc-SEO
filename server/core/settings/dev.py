from .base import *

DEBUG = True

# Add any development specific settings here
# e.g. debug toolbar
INSTALLED_APPS += []

MIDDLEWARE += []

# In dev, we might want to see emails in console
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
