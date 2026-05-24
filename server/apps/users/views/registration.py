from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from ..serializers.registration import RegisterB2BSerializer
from .verify_email import create_verification_token, send_verification_email
import logging

logger = logging.getLogger(__name__)


class RegisterB2BView(generics.CreateAPIView):
    # This view handles Business-to-Business Registration
    serializer_class = RegisterB2BSerializer
    permission_classes = [AllowAny]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Send verification email to the user
        try:
            token_obj = create_verification_token(user)
            send_verification_email(user, token_obj.token)
        except Exception as e:
            logger.error(f"Failed to send verification email to {user.email}: {e}")

        return Response({
            "message": "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
            "user_id": user.id,
            "email": user.email,
            "status": user.status
        }, status=status.HTTP_201_CREATED)
