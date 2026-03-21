from .base import *

DEBUG = True
ALLOWED_HOSTS = ["*"]

# Override Redis to not use password in dev (docker-compose.yml dev has no redis password)
import os
redis_host = os.environ.get('REDIS_HOST', 'localhost')
redis_port = os.environ.get('REDIS_PORT', '6379')
REDIS_URL = f"redis://{redis_host}:{redis_port}/1"
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_URL,
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

# Override any local settings here
print("🔧 Django is running in LOCAL mode.")

# In dev, use SMTP to send real emails (comment out to use console backend)
# EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"

# Disable Elasticsearch auto-sync in local mode (no ES running)
ELASTICSEARCH_DSL_AUTOSYNC = False
ELASTICSEARCH_DSL_AUTO_REFRESH = False
