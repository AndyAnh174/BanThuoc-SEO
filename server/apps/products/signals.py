"""
Signals for auto-syncing Product data to Elasticsearch.
Automatically updates Elasticsearch index when products are created, updated, or deleted.
"""
from django.db.models.signals import post_save, post_delete, m2m_changed
from django.dispatch import receiver
from django.conf import settings
import logging

from products.models import Product, Category, Manufacturer, ProductImage

logger = logging.getLogger(__name__)


def update_product_in_elasticsearch(product):
    """
    Update a single product in Elasticsearch.
    Only indexes if product is ACTIVE.
    """
    try:
        from products.documents import ProductDocument
        
        if product.status == 'ACTIVE':
            # Index/update the product
            ProductDocument().update(product)
            logger.info(f"Elasticsearch: Updated product {product.sku}")
        else:
            # Remove from index if not active
            try:
                doc = ProductDocument.get(id=str(product.id))
                doc.delete()
                logger.info(f"Elasticsearch: Removed inactive product {product.sku}")
            except Exception:
                pass  # Document might not exist
                
    except Exception as e:
        logger.error(f"Elasticsearch sync failed for product {product.sku}: {str(e)}")


def delete_product_from_elasticsearch(product_id):
    """Remove a product from Elasticsearch index."""
    try:
        from products.documents import ProductDocument
        
        try:
            doc = ProductDocument.get(id=str(product_id))
            doc.delete()
            logger.info(f"Elasticsearch: Deleted product {product_id}")
        except Exception:
            pass  # Document might not exist
            
    except Exception as e:
        logger.error(f"Elasticsearch delete failed for product {product_id}: {str(e)}")


# =============================================================================
# Product Signals
# =============================================================================

@receiver(post_save, sender=Product)
def product_post_save(sender, instance, created, **kwargs):
    """
    Signal handler for Product save.
    Updates Elasticsearch when a product is created or updated.
    """
    update_product_in_elasticsearch(instance)


@receiver(post_delete, sender=Product)
def product_post_delete(sender, instance, **kwargs):
    """
    Signal handler for Product delete.
    Removes product from Elasticsearch.
    """
    delete_product_from_elasticsearch(instance.id)


# =============================================================================
# Related Model Signals
# =============================================================================

@receiver(post_save, sender=Category)
def category_post_save(sender, instance, **kwargs):
    """
    Signal handler for Category save.
    Updates all products in this category when category info changes.
    """
    try:
        from products.documents import ProductDocument
        
        # Get all active products in this category
        products = Product.objects.filter(
            category=instance,
            status='ACTIVE'
        ).select_related('category', 'manufacturer').prefetch_related('images')
        
        if products.exists():
            ProductDocument().update(products)
            logger.info(f"Elasticsearch: Updated {products.count()} products for category {instance.name}")
            
    except Exception as e:
        logger.error(f"Elasticsearch sync failed for category {instance.name}: {str(e)}")


@receiver(post_save, sender=Manufacturer)
def manufacturer_post_save(sender, instance, **kwargs):
    """
    Signal handler for Manufacturer save.
    Updates all products by this manufacturer when manufacturer info changes.
    """
    try:
        from products.documents import ProductDocument
        
        # Get all active products by this manufacturer
        products = Product.objects.filter(
            manufacturer=instance,
            status='ACTIVE'
        ).select_related('category', 'manufacturer').prefetch_related('images')
        
        if products.exists():
            ProductDocument().update(products)
            logger.info(f"Elasticsearch: Updated {products.count()} products for manufacturer {instance.name}")
            
    except Exception as e:
        logger.error(f"Elasticsearch sync failed for manufacturer {instance.name}: {str(e)}")


@receiver(post_save, sender=ProductImage)
@receiver(post_delete, sender=ProductImage)
def product_image_changed(sender, instance, **kwargs):
    """
    Signal handler for ProductImage changes.
    Updates the product when its images change.
    """
    try:
        if instance.product:
            update_product_in_elasticsearch(instance.product)
    except Exception as e:
        logger.error(f"Elasticsearch sync failed for product image: {str(e)}")
