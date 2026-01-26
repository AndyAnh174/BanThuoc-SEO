"""
Banner serializers.
"""
from rest_framework import serializers
from products.models import Banner


class BannerSerializer(serializers.ModelSerializer):
    """Serializer for Banner model"""
    is_visible = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Banner
        fields = [
            'id', 'title', 'subtitle',
            'image_url', 'link_url', 'link_text',
            'background_color', 'text_color',
            'sort_order', 'is_active', 'is_visible',
            'start_date', 'end_date',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_visible']


class BannerAdminSerializer(serializers.ModelSerializer):
    """Admin serializer for Banner with all fields editable"""
    is_visible = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Banner
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_visible']
