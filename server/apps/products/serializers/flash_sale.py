"""
Serializers for Flash Sale system.
"""
from rest_framework import serializers
from django.utils import timezone

from products.models import FlashSaleSession, FlashSaleItem, Product
from products.serializers.public import ProductListSerializer


class FlashSaleItemSerializer(serializers.ModelSerializer):
    """Serializer for FlashSaleItem in flash sale listing"""
    product = ProductListSerializer(read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    is_sold_out = serializers.BooleanField(read_only=True)
    sold_percentage = serializers.IntegerField(read_only=True)

    class Meta:
        model = FlashSaleItem
        fields = [
            'id', 'product', 'original_price', 'flash_sale_price',
            'discount_percentage', 'total_quantity', 'remaining_quantity',
            'sold_quantity', 'sold_percentage', 'max_per_user',
            'is_sold_out', 'is_active', 'sort_order'
        ]


class FlashSaleItemDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for a single flash sale item"""
    product = ProductListSerializer(read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    is_sold_out = serializers.BooleanField(read_only=True)
    sold_percentage = serializers.IntegerField(read_only=True)
    session_name = serializers.CharField(source='session.name', read_only=True)
    session_end_time = serializers.DateTimeField(source='session.end_time', read_only=True)

    class Meta:
        model = FlashSaleItem
        fields = [
            'id', 'product', 'original_price', 'flash_sale_price',
            'discount_percentage', 'total_quantity', 'remaining_quantity',
            'sold_quantity', 'sold_percentage', 'max_per_user',
            'is_sold_out', 'is_active', 'session_name', 'session_end_time'
        ]


class FlashSaleSessionListSerializer(serializers.ModelSerializer):
    """Serializer for listing flash sale sessions"""
    is_currently_active = serializers.BooleanField(read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    is_ended = serializers.BooleanField(read_only=True)
    time_remaining = serializers.FloatField(read_only=True)
    total_items = serializers.IntegerField(source='total_items_count', read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = FlashSaleSession
        fields = [
            'id', 'name', 'slug', 'description', 'banner_image',
            'start_time', 'end_time', 'status',
            'is_currently_active', 'is_upcoming', 'is_ended',
            'time_remaining', 'total_items', 'items_count',
            'max_items_per_user'
        ]

    def get_items_count(self, obj):
        """Get count of available items"""
        return obj.available_items.count()


class FlashSaleSessionDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for a flash sale session with items"""
    is_currently_active = serializers.BooleanField(read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    is_ended = serializers.BooleanField(read_only=True)
    time_remaining = serializers.FloatField(read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    items = FlashSaleItemSerializer(many=True, read_only=True)

    class Meta:
        model = FlashSaleSession
        fields = [
            'id', 'name', 'slug', 'description', 'banner_image',
            'start_time', 'end_time', 'status',
            'is_currently_active', 'is_upcoming', 'is_ended',
            'time_remaining', 'total_items', 'max_items_per_user',
            'items', 'created_at'
        ]


class CurrentFlashSaleSerializer(serializers.Serializer):
    """
    Serializer for get_current_flash_sale API response.
    Returns current/upcoming flash sale with preview items.
    """
    current_session = FlashSaleSessionListSerializer(allow_null=True)
    upcoming_session = FlashSaleSessionListSerializer(allow_null=True)
    featured_items = FlashSaleItemSerializer(many=True)
    server_time = serializers.DateTimeField()

    def to_representation(self, instance):
        """Custom representation for the flash sale response"""
        current = instance.get('current_session')
        upcoming = instance.get('upcoming_session')
        featured_items = instance.get('featured_items', [])
        
        return {
            'current_session': FlashSaleSessionListSerializer(current).data if current else None,
            'upcoming_session': FlashSaleSessionListSerializer(upcoming).data if upcoming else None,
            'featured_items': FlashSaleItemSerializer(featured_items, many=True).data,
            'server_time': timezone.now().isoformat(),
        }
