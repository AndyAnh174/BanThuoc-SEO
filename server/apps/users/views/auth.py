from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Custom Status Check
        if self.user.status == 'PENDING':
            raise serializers.ValidationError(
                {"detail": "Tài khoản của bạn đang chờ duyệt. Vui lòng liên hệ quản trị viên."},
                code='account_pending'
            )
        elif self.user.status == 'LOCKED':
            raise serializers.ValidationError(
                {"detail": "Tài khoản của bạn đã bị khóa."},
                code='account_locked'
            )
        elif self.user.status == 'REJECTED':
             raise serializers.ValidationError(
                {"detail": "Tài khoản của bạn đã bị từ chối."},
                code='account_rejected'
            )

        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
