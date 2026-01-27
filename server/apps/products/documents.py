"""
Elasticsearch document definitions for Products app.
Defines how Product models are indexed in Elasticsearch.
"""
from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from django.conf import settings

from products.models import Product, Category, Manufacturer


@registry.register_document
class ProductDocument(Document):
    """
    Elasticsearch document mapping for Product model.
    
    Indexed fields:
    - name (Text): Full-text search with Vietnamese analyzer
    - slug (Keyword): Exact match for URL lookups
    - price (Float): For range filtering and sorting
    - sale_price (Float): For sale filtering
    - category (Object): Nested category info with name as Text
    - manufacturer (Object): Nested manufacturer info
    - short_description (Text): For search
    - product_type (Keyword): For filtering
    - status (Keyword): For filtering active products
    """
    
    # Text fields for full-text search
    name = fields.TextField(
        attr='name',
        fields={
            'raw': fields.KeywordField(),  # For exact match and sorting
            'suggest': fields.CompletionField(),  # For autocomplete
        }
    )
    
    slug = fields.KeywordField(attr='slug')
    
    short_description = fields.TextField(attr='short_description')
    
    # Numeric fields
    price = fields.FloatField(attr='price')
    sale_price = fields.FloatField(attr='sale_price')
    current_price = fields.FloatField()
    discount_percentage = fields.IntegerField()
    
    # Keyword fields for filtering
    sku = fields.KeywordField(attr='sku')
    product_type = fields.KeywordField(attr='product_type')
    status = fields.KeywordField(attr='status')
    requires_prescription = fields.BooleanField(attr='requires_prescription')
    is_featured = fields.BooleanField(attr='is_featured')
    is_on_sale = fields.BooleanField()
    
    # Nested object for category
    category = fields.ObjectField(
        properties={
            'id': fields.KeywordField(),
            'name': fields.TextField(
                fields={
                    'raw': fields.KeywordField(),
                }
            ),
            'slug': fields.KeywordField(),
            'full_path': fields.TextField(),
        }
    )
    
    # Nested object for manufacturer
    manufacturer = fields.ObjectField(
        properties={
            'id': fields.KeywordField(),
            'name': fields.TextField(
                fields={
                    'raw': fields.KeywordField(),
                }
            ),
            'slug': fields.KeywordField(),
            'country': fields.KeywordField(),
        }
    )
    
    # Primary image URL
    primary_image_url = fields.KeywordField()
    
    # Timestamps
    created_at = fields.DateField(attr='created_at')
    updated_at = fields.DateField(attr='updated_at')

    class Index:
        # Name of the Elasticsearch index
        name = 'products'
        # Index settings
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0,
            'analysis': {
                'analyzer': {
                    'vietnamese_analyzer': {
                        'type': 'custom',
                        'tokenizer': 'standard',
                        'filter': ['lowercase', 'asciifolding'],
                    }
                }
            }
        }

    class Django:
        model = Product
        # Fields to include in index
        fields = [
            'unit',
            'stock_quantity',
        ]
        
        # Signals to auto-update index
        # Update document when related model changes
        related_models = [Category, Manufacturer]

    def get_queryset(self):
        """
        Optimized queryset for indexing.
        Uses select_related to minimize database queries.
        """
        return super().get_queryset().select_related(
            'category',
            'manufacturer',
        ).filter(
            status='ACTIVE'
        )

    def get_instances_from_related(self, related_instance):
        """Return products related to the modified instance."""
        if isinstance(related_instance, Category):
            return related_instance.products.filter(status='ACTIVE')
        elif isinstance(related_instance, Manufacturer):
            return related_instance.products.filter(status='ACTIVE')
        return []

    def prepare_category(self, instance):
        """Prepare category data for indexing"""
        if instance.category:
            return {
                'id': str(instance.category.id),
                'name': instance.category.name,
                'slug': instance.category.slug,
                'full_path': instance.category.get_full_path(),
            }
        return None

    def prepare_manufacturer(self, instance):
        """Prepare manufacturer data for indexing"""
        if instance.manufacturer:
            return {
                'id': str(instance.manufacturer.id),
                'name': instance.manufacturer.name,
                'slug': instance.manufacturer.slug,
                'country': instance.manufacturer.country,
            }
        return None

    def prepare_current_price(self, instance):
        """Get current effective price"""
        return float(instance.current_price)

    def prepare_discount_percentage(self, instance):
        """Get discount percentage"""
        return instance.discount_percentage

    def prepare_is_on_sale(self, instance):
        """Check if product is on sale"""
        return instance.is_on_sale

    def prepare_primary_image_url(self, instance):
        """Get primary image URL"""
        primary = instance.primary_image
        if primary:
            return primary.image_url
        return None
