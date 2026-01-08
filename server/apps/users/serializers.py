from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from .models import BusinessProfile
from .utils.file_upload import handle_license_upload

User = get_user_model()

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
    license_file = serializers.FileField()
    address = serializers.CharField()
    tax_id = serializers.CharField(max_length=50)

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
        # Extract data
        password = validated_data.pop('password')
        validated_data.pop('confirm_password')
        license_file = validated_data.pop('license_file')
        
        # User data
        user_data = {
            'username': validated_data['email'], # Use email as username
            'email': validated_data['email'],
            'full_name': validated_data['full_name'],
            'phone': validated_data['phone'],
            'role': User.Role.CUSTOMER,
            'status': User.Status.PENDING,
            'is_active': False
        }

        # Business Profile data
        business_data = {
            'business_name': validated_data['business_name'],
            'license_number': validated_data['license_number'],
            'address': validated_data['address'],
            'tax_id': validated_data['tax_id']
        }

        with transaction.atomic():
            # 1. Create User
            user = User.objects.create_user(**user_data)
            user.set_password(password)
            user.save()

            # 2. Upload License
            try:
                license_url = handle_license_upload(license_file)
            except Exception as e:
                # If upload fails, the transaction will rollback automatically due to exception
                raise serializers.ValidationError(f"Failed to upload license file: {str(e)}")

            # 3. Create Business Profile
            BusinessProfile.objects.create(
                user=user,
                license_file_url=license_url,
                **business_data
            )
        
        return user
