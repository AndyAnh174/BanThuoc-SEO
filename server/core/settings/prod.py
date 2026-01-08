from .base import *

DEBUG = False

# Security settings for production
SECURE_SSL_REDIRECT = env.bool("DJANGO_SECURE_SSL_REDIRECT", default=True)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# In production, use real email backend (e.g. SMTP)
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
