from rest_framework import serializers
from products.models import FlashSaleSession, FlashSaleItem, Product
from products.serializers.product import ProductAdminListSerializer

class FlashSaleItemAdminSerializer(serializers.ModelSerializer):
    """Admin CRUD for FlashSaleItem"""
    product_details = ProductAdminListSerializer(source='product', read_only=True)
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    class Meta:
        model = FlashSaleItem
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'sold_quantity']


class FlashSaleSessionAdminSerializer(serializers.ModelSerializer):
    """Admin CRUD for FlashSaleSession"""
    items = FlashSaleItemAdminSerializer(many=True, read_only=True)

    class Meta:
        model = FlashSaleSession
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'slug']
