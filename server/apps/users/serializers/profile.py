import json
from rest_framework import serializers
from django.contrib.auth import get_user_model
from ..models import BusinessProfile

User = get_user_model()
MAX_LICENSE_FILES = 5


class BusinessProfileSerializer(serializers.ModelSerializer):
    """Serializer for viewing business profile."""
    license_file_url = serializers.SerializerMethodField()

    class Meta:
        model = BusinessProfile
        fields = ['business_name', 'license_number', 'license_file_url', 'address', 'tax_id']
        read_only_fields = fields

    def get_license_file_url(self, obj):
        return obj.get_license_files()


class BusinessProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for customer to update their business profile."""
    license_files = serializers.ListField(
        child=serializers.FileField(),
        required=False,
        max_length=MAX_LICENSE_FILES,
        write_only=True,
        default=list
    )

    class Meta:
        model = BusinessProfile
        fields = ['business_name', 'license_number', 'tax_id', 'address', 'license_files']

    def update(self, instance, validated_data):
        license_files = validated_data.pop('license_files', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if license_files:
            from ..utils.file_upload import handle_license_upload
            license_urls = []
            for f in license_files:
                url = handle_license_upload(f)
                license_urls.append(url)
            instance.license_file_url = json.dumps(license_urls)

        instance.save()
        return instance


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

