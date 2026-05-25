import json

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from ..models import BusinessProfile
from ..utils.file_upload import handle_license_upload

User = get_user_model()

MAX_LICENSE_FILES = 5


class RegisterB2BSerializer(serializers.Serializer):
    # User fields
    full_name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=20)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    # Business Profile fields
    business_name = serializers.CharField(max_length=255)
    license_number = serializers.CharField(max_length=100)
    license_files = serializers.ListField(
        child=serializers.FileField(),
        required=False,
        max_length=MAX_LICENSE_FILES,
        write_only=True,
        default=list
    )
    address = serializers.CharField()
    tax_id = serializers.CharField(max_length=50)

    def validate_license_files(self, value):
        if len(value) > MAX_LICENSE_FILES:
            raise serializers.ValidationError(f"Tối đa {MAX_LICENSE_FILES} file.")
        for f in value:
            if f.size > 10 * 1024 * 1024:
                raise serializers.ValidationError(f"File {f.name} vượt quá 10MB.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate_phone(self, value):
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("This phone number is already registered.")
        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        try:
            validate_password(data['password'])
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})

        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('confirm_password')
        license_files = validated_data.pop('license_files', []) or []

        user_data = {
            'username': validated_data['email'],
            'email': validated_data['email'],
            'full_name': validated_data['full_name'],
            'phone': validated_data['phone'],
            'role': User.Role.CUSTOMER,
            'status': User.Status.ACTIVE,
            'is_active': True,
            'is_verified': True
        }

        business_data = {
            'business_name': validated_data['business_name'],
            'license_number': validated_data['license_number'],
            'address': validated_data['address'],
            'tax_id': validated_data['tax_id']
        }

        with transaction.atomic():
            user = User.objects.create_user(**user_data)
            user.set_password(password)
            user.save()

            license_urls = []
            for f in license_files:
                try:
                    url = handle_license_upload(f)
                    license_urls.append(url)
                except Exception as e:
                    raise serializers.ValidationError(f"Failed to upload license file: {str(e)}")

            BusinessProfile.objects.create(
                user=user,
                license_file_url=json.dumps(license_urls) if license_urls else "",
                **business_data
            )

        return user
