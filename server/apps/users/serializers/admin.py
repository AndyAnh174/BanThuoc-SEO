from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from ..models import BusinessProfile
from ..utils.file_upload import MinioHandler

User = get_user_model()

class BusinessProfileSerializer(serializers.ModelSerializer):
    license_file_url = serializers.SerializerMethodField()

    class Meta:
        model = BusinessProfile
        fields = ['business_name', 'license_number', 'license_file_url', 'address', 'tax_id']

    def get_license_file_url(self, obj):
        if not obj.license_file_url:
            return None
        
        # Check if URL is local/direct MinIO URL
        # We stored it as full URL, e.g., http://localhost:9000/bucket/folder/file.ext
        # We need to extract the object name: folder/file.ext
        try:
            # Assuming standard structure: server/bucket/object_key
            # Split by bucket name
            handler = MinioHandler()
            bucket_name = handler.bucket_name
            
            if bucket_name in obj.license_file_url:
                parts = obj.license_file_url.split(f"/{bucket_name}/")
                if len(parts) > 1:
                    object_name = parts[1]
                    signed_url = handler.get_presigned_url(object_name)
                    return signed_url if signed_url else obj.license_file_url
            
            return obj.license_file_url
        except Exception:
            return obj.license_file_url

from products.models import Favorite
from products.serializers.public import ProductListSerializer
from orders.serializers import OrderSerializer

class AdminUserSerializer(serializers.ModelSerializer):
    business_profile = BusinessProfileSerializer(read_only=True)
    favorites = serializers.SerializerMethodField()
    orders = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'phone', 'role', 'status', 'is_active', 'date_joined', 'business_profile', 'loyalty_points', 'favorites', 'orders']

    def get_favorites(self, obj):
        products = [fav.product for fav in Favorite.objects.filter(user=obj).select_related('product')]
        return ProductListSerializer(products, many=True).data

    def get_orders(self, obj):
        # Limit to last 5-10 orders to avoid bloating the response
        user_orders = obj.orders.all().order_by('-created_at')[:10]
        return OrderSerializer(user_orders, many=True).data

class AdminUserStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=User.Status.choices)
    reason = serializers.CharField(required=False, allow_blank=True, help_text="Reason for rejection")

    def validate(self, data):
        if data['status'] == User.Status.REJECTED and not data.get('reason'):
            raise serializers.ValidationError({"reason": "Reason is required when rejecting a user."})
        return data


class AdminUserCreateSerializer(serializers.ModelSerializer):
    """Serializer for admin to create new users."""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'full_name', 'phone', 'role', 'status']
        extra_kwargs = {
            'email': {'required': True},
            'role': {'required': True},
            'status': {'required': False, 'default': User.Status.ACTIVE},
        }
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Mật khẩu không khớp."})
        return data
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email đã được sử dụng.")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Tên đăng nhập đã tồn tại.")
        return value
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Set default status to ACTIVE for admin-created users
        if 'status' not in validated_data:
            validated_data['status'] = User.Status.ACTIVE
        
        # Set is_active based on status
        validated_data['is_active'] = validated_data.get('status') == User.Status.ACTIVE
        
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for admin to update user info."""
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    
    class Meta:
        model = User
        fields = ['full_name', 'phone', 'role', 'status', 'is_active', 'email', 'password']
        extra_kwargs = {
            'email': {'required': False},
        }
    
    def validate_email(self, value):
        user = self.instance
        if User.objects.filter(email=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("Email đã được sử dụng.")
        return value
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        # Update is_active based on status
        if 'status' in validated_data:
            validated_data['is_active'] = validated_data['status'] == User.Status.ACTIVE
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance

