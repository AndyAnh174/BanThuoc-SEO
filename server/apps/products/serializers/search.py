"""
Elasticsearch serializers for search results.
These serializers format data returned from Elasticsearch.
"""
from rest_framework import serializers


class CategorySearchSerializer(serializers.Serializer):
    """Serializer for category in search results"""
    id = serializers.CharField()
    name = serializers.CharField()
    slug = serializers.CharField()
    full_path = serializers.CharField()


class ManufacturerSearchSerializer(serializers.Serializer):
    """Serializer for manufacturer in search results"""
    id = serializers.CharField()
    name = serializers.CharField()
    slug = serializers.CharField()
    country = serializers.CharField(allow_blank=True, required=False)


class ProductDocumentSerializer(serializers.Serializer):
    """
    Serializer for ProductDocument search results from Elasticsearch.
    
    Formats data for UI display including:
    - Basic product info (name, slug, sku)
    - Pricing info with discount
    - Category and manufacturer links
    - Primary image
    """
    # Basic info
    id = serializers.CharField(source='meta.id', read_only=True)
    name = serializers.CharField()
    slug = serializers.CharField()
    sku = serializers.CharField()
    short_description = serializers.CharField(allow_blank=True, required=False)
    
    # Pricing
    price = serializers.FloatField()
    sale_price = serializers.FloatField(allow_null=True, required=False)
    current_price = serializers.FloatField()
    discount_percentage = serializers.IntegerField()
    is_on_sale = serializers.BooleanField()
    
    # Product info
    product_type = serializers.CharField()
    unit = serializers.CharField()
    stock_quantity = serializers.IntegerField()
    requires_prescription = serializers.BooleanField()
    is_featured = serializers.BooleanField()
    
    # Related objects
    category = CategorySearchSerializer()
    manufacturer = ManufacturerSearchSerializer()
    
    # Image
    primary_image_url = serializers.CharField(allow_null=True, required=False)
    
    # Meta
    created_at = serializers.DateTimeField()
    
    # Computed fields for UI
    product_url = serializers.SerializerMethodField()
    category_url = serializers.SerializerMethodField()
    manufacturer_url = serializers.SerializerMethodField()
    
    # Search score (relevance)
    score = serializers.SerializerMethodField()

    def get_product_url(self, obj):
        """Generate product detail URL"""
        return f"/products/{obj.slug}"

    def get_category_url(self, obj):
        """Generate category URL"""
        if obj.category:
            return f"/categories/{obj.category.slug}"
        return None

    def get_manufacturer_url(self, obj):
        """Generate manufacturer URL"""
        if obj.manufacturer:
            return f"/manufacturers/{obj.manufacturer.slug}"
        return None

    def get_score(self, obj):
        """Get Elasticsearch relevance score"""
        return getattr(obj.meta, 'score', None)


class ProductSearchResponseSerializer(serializers.Serializer):
    """
    Wrapper serializer for search response.
    Includes results, pagination info, and aggregations.
    """
    total = serializers.IntegerField()
    page = serializers.IntegerField()
    page_size = serializers.IntegerField()
    total_pages = serializers.IntegerField()
    results = ProductDocumentSerializer(many=True)
    
    # Facets/Aggregations for filtering UI
    facets = serializers.DictField(required=False)


class SearchSuggestionSerializer(serializers.Serializer):
    """
    Serializer for search autocomplete suggestions.
    Returns minimal data for quick display.
    """
    name = serializers.CharField()
    slug = serializers.CharField()
    category_name = serializers.SerializerMethodField()
    price = serializers.FloatField()
    primary_image_url = serializers.CharField(allow_null=True, required=False)

    def get_category_name(self, obj):
        """Get category name for suggestion"""
        if obj.category:
            return obj.category.name
        return None
