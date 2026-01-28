from rest_framework import serializers
from django.contrib.auth import get_user_model
from ..models import BusinessProfile

User = get_user_model()


class BusinessProfileSerializer(serializers.ModelSerializer):
    """Serializer for business profile."""
    
    class Meta:
        model = BusinessProfile
        fields = ['business_name', 'license_number', 'license_file_url', 'address', 'tax_id']
        read_only_fields = fields


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for viewing user profile."""
    business_profile = BusinessProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'phone', 'avatar', 'role', 'status', 'date_joined', 'is_verified', 'business_profile', 'loyalty_points']
        read_only_fields = ['id', 'username', 'email', 'role', 'status', 'date_joined', 'is_verified', 'loyalty_points']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    
    class Meta:
        model = User
        fields = ['full_name', 'phone']
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

