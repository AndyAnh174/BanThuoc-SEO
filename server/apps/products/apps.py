from django.apps import AppConfig


class ProductsConfig(AppConfig):
    name = "products"
    default_auto_field = 'django.db.models.BigAutoField'

    def ready(self):
        """
        Import signals when the app is ready.
        This enables auto-sync to Elasticsearch.
        """
        try:
            import products.signals  # noqa: F401
        except ImportError:
            pass
