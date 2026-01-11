from rest_framework import serializers
from products.models import Manufacturer

class ManufacturerAdminSerializer(serializers.ModelSerializer):
    """Serializer for Admin to manage Manufacturers"""
    class Meta:
        model = Manufacturer
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'slug']
