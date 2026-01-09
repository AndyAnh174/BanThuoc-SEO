from rest_framework import serializers
from django.contrib.auth import get_user_model
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

class AdminUserSerializer(serializers.ModelSerializer):
    business_profile = BusinessProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'phone', 'role', 'status', 'is_active', 'date_joined', 'business_profile']

class AdminUserStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=User.Status.choices)
    reason = serializers.CharField(required=False, allow_blank=True, help_text="Reason for rejection")

    def validate(self, data):
        if data['status'] == User.Status.REJECTED and not data.get('reason'):
            raise serializers.ValidationError({"reason": "Reason is required when rejecting a user."})
        return data
