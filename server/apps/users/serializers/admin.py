from rest_framework import serializers
from django.contrib.auth import get_user_model
from ..models import BusinessProfile

User = get_user_model()

class BusinessProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessProfile
        fields = ['business_name', 'license_number', 'license_file_url', 'address', 'tax_id']

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
