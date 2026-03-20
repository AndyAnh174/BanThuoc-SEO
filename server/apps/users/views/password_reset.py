"""
Password Reset Views
"""
import secrets
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import threading

from ..models import User, PasswordResetToken


class RequestPasswordResetView(APIView):
    """
    Request a password reset email.
    POST /api/auth/forgot-password/
    Body: { "email": "user@example.com" }
    """
    permission_classes = [AllowAny]
    throttle_classes = []

    def get_throttles(self):
        from core.throttles import PasswordResetRateThrottle
        return [PasswordResetRateThrottle()]

    def post(self, request):
        email = request.data.get('email', '').strip()

        if not email:
            return Response(
                {"error": "Vui lòng nhập email."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Always return success to prevent email enumeration
        try:
            user = User.objects.get(email=email, is_active=True)
        except User.DoesNotExist:
            return Response(
                {"message": "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu."},
                status=status.HTTP_200_OK
            )

        # Invalidate existing tokens
        PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)

        # Create new token
        token = secrets.token_urlsafe(48)
        expires_at = timezone.now() + timedelta(hours=1)

        PasswordResetToken.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )

        # Send email in background thread
        send_password_reset_email(user, token)

        return Response(
            {"message": "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu."},
            status=status.HTTP_200_OK
        )


class ConfirmPasswordResetView(APIView):
    """
    Confirm password reset with token.
    POST /api/auth/reset-password/
    Body: { "token": "...", "new_password": "..." }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token', '').strip()
        new_password = request.data.get('new_password', '').strip()

        if not token or not new_password:
            return Response(
                {"error": "Token và mật khẩu mới là bắt buộc."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 8:
            return Response(
                {"error": "Mật khẩu phải có ít nhất 8 ký tự."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            reset_token = PasswordResetToken.objects.get(
                token=token,
                is_used=False
            )
        except PasswordResetToken.DoesNotExist:
            return Response(
                {"error": "Link đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if reset_token.expires_at < timezone.now():
            return Response(
                {"error": "Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Reset password
        user = reset_token.user
        user.set_password(new_password)
        user.save()

        # Mark token as used
        reset_token.is_used = True
        reset_token.save()

        return Response(
            {"message": "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới."},
            status=status.HTTP_200_OK
        )


def send_password_reset_email(user, token):
    """Send password reset email in background thread."""
    def _send():
        try:
            frontend_url = getattr(settings, 'NEXT_PUBLIC_FRONTEND_URL', 'http://localhost:3000')
            reset_url = f"{frontend_url}/auth/reset-password?token={token}"

            subject = "BanThuoc - Đặt lại mật khẩu"

            context = {
                'user': user,
                'reset_url': reset_url,
            }

            html_message = render_to_string('emails/password_reset.html', context)
            plain_message = strip_tags(html_message)

            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
        except Exception as e:
            print(f"Failed to send password reset email: {e}")

    thread = threading.Thread(target=_send)
    thread.start()
