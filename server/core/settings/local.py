from .base import *

DEBUG = True
ALLOWED_HOSTS = ["*"]

# Override any local settings here
print("🔧 Django is running in LOCAL mode.")

# In dev, use SMTP to send real emails (comment out to use console backend)
# EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"

# Disable Elasticsearch auto-sync in local mode (no ES running)
ELASTICSEARCH_DSL_AUTOSYNC = False
ELASTICSEARCH_DSL_AUTO_REFRESH = False
