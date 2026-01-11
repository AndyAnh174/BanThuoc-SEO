from rest_framework import serializers
from django.db import transaction
from products.models import Product, ProductImage, Category, Manufacturer

class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for ProductImage"""
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'alt_text', 'is_primary', 'sort_order']
        read_only_fields = ['id']
        ref_name = 'AdminProductImage'


class ProductAdminListSerializer(serializers.ModelSerializer):
    """Serializer for listing products in admin (lightweight)"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    manufacturer_name = serializers.CharField(source='manufacturer.name', read_only=True)
    primary_image = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name', 'slug', 'category', 'category_name',
            'manufacturer', 'manufacturer_name',
            'price', 'sale_price', 'stock_quantity',
            'status', 'is_featured', 'primary_image', 'images', 'created_at'
        ]

    def get_primary_image(self, obj):
        primary = obj.primary_image
        return primary.image_url if primary else None


class ProductAdminSerializer(serializers.ModelSerializer):
    """Serializer for Creating/Updating Product in Admin"""
    images = ProductImageSerializer(many=True, required=False)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    manufacturer = serializers.PrimaryKeyRelatedField(queryset=Manufacturer.objects.all())

    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name', 'slug', 'description', 'short_description',
            'price', 'sale_price',
            'category', 'manufacturer',
            'product_type', 'unit', 'quantity_per_unit',
            'stock_quantity', 'low_stock_threshold',
            'ingredients', 'dosage', 'usage', 'contraindications', 'side_effects', 'storage',
            'requires_prescription', 'is_featured', 'status',
            'meta_title', 'meta_description',
            'images'
        ]

    @transaction.atomic
    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        product = Product.objects.create(**validated_data)

        # Create images
        for img_data in images_data:
            ProductImage.objects.create(product=product, **img_data)

        return product

    @transaction.atomic
    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)
        
        # Update product fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update images if provided
        if images_data is not None:
            # Simple strategy: Delete old images and recreate new ones
            # Or smarter: check IDs? 
            # For simplicity in this iteration:
            # If image has ID, update it. If no ID, create it. 
            # If ID not in list, delete it?
            
            # Let's take the "full replacement" approach for simplicity first, 
            # but user UX might want to keep existing ones.
            # Better approach: 
            # Frontend sends all current images. 
            # We delete any images NOT in the incoming list?
            
            # Current simplest: Delete all and recreate. 
            # Warning: IDs change.
            instance.images.all().delete()
            for img_data in images_data:
                ProductImage.objects.create(product=instance, **img_data)

        return instance
