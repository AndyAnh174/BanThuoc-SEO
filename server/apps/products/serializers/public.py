"""
Product serializers for public API.
"""
from rest_framework import serializers
from products.models import Category, Manufacturer, Product, ProductImage, Favorite


class CategoryTreeSerializer(serializers.ModelSerializer):
    """Serializer for Category with children (tree structure)"""
    children = serializers.SerializerMethodField()
    full_path = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'image',
            'is_active', 'full_path', 'product_count', 'children'
        ]

    def get_children(self, obj):
        """Get active children categories"""
        children = obj.get_children().filter(is_active=True)
        return CategoryTreeSerializer(children, many=True).data

    def get_full_path(self, obj):
        return obj.get_full_path()

    def get_product_count(self, obj):
        """Count products in this category and all descendants"""
        descendants = obj.get_descendants(include_self=True)
        return Product.objects.filter(
            category__in=descendants,
            status='ACTIVE'
        ).count()


class CategorySimpleSerializer(serializers.ModelSerializer):
    """Simple serializer for Category (used in Product detail)"""
    full_path = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'full_path']

    def get_full_path(self, obj):
        return obj.get_full_path()


class ManufacturerSerializer(serializers.ModelSerializer):
    """Serializer for Manufacturer"""
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Manufacturer
        fields = [
            'id', 'name', 'slug', 'description', 'logo', 
            'website', 'country', 'product_count'
        ]

    def get_product_count(self, obj):
        return obj.products.filter(status='ACTIVE').count()


class ManufacturerSimpleSerializer(serializers.ModelSerializer):
    """Simple serializer for Manufacturer (used in Product list)"""
    class Meta:
        model = Manufacturer
        fields = ['id', 'name', 'slug', 'logo', 'country']


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for ProductImage"""
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'alt_text', 'is_primary', 'sort_order']


from products.models import Category, Manufacturer, Product, ProductImage, Favorite

# ... (Previous code) ...

class ProductListSerializer(serializers.ModelSerializer):
    """
    Serializer for Product list view (lightweight).
    Used for listing products with essential info only.
    """
    category = CategorySimpleSerializer(read_only=True)
    manufacturer = ManufacturerSimpleSerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    current_price = serializers.DecimalField(max_digits=12, decimal_places=0, read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    is_on_sale = serializers.BooleanField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name', 'slug', 'short_description',
            'price', 'sale_price', 'current_price', 'discount_percentage', 'is_on_sale',
            'primary_image', 'category', 'manufacturer',
            'product_type', 'unit', 'quantity_per_unit', 'stock_quantity',
            'requires_prescription', 'is_featured', 'status',
            'is_liked', 'likes_count'
        ]

    def get_primary_image(self, obj):
        """Get primary image URL"""
        primary = obj.primary_image
        if primary:
            return ProductImageSerializer(primary).data
        return None

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, product=obj).exists()
        return False

    def get_likes_count(self, obj):
        return obj.favorited_by.count()


class ProductDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for Product detail view (full info).
    Includes all product information and related images.
    """
    category = CategorySimpleSerializer(read_only=True)
    manufacturer = ManufacturerSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    current_price = serializers.DecimalField(max_digits=12, decimal_places=0, read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    is_on_sale = serializers.BooleanField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    related_products = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name', 'slug', 'description', 'short_description',
            'price', 'sale_price', 'current_price', 'discount_percentage', 'is_on_sale',
            'category', 'manufacturer', 'images',
            'product_type', 'ingredients', 'dosage', 'usage',
            'contraindications', 'side_effects', 'storage',
            'unit', 'quantity_per_unit', 'stock_quantity', 'is_low_stock',
            'requires_prescription', 'is_featured', 'status',
            'meta_title', 'meta_description',
            'related_products', 'created_at', 'updated_at',
            'is_liked', 'likes_count'
        ]

    def get_related_products(self, obj):
        """Get related products from the same category"""
        related = Product.objects.filter(
            category=obj.category,
            status='ACTIVE'
        ).exclude(id=obj.id).select_related(
            'category', 'manufacturer'
        ).prefetch_related('images')[:4]
        
        return ProductListSerializer(related, many=True, context=self.context).data

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, product=obj).exists()
        return False

    def get_likes_count(self, obj):
        return obj.favorited_by.count()
