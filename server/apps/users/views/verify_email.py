"""
Email Verification Views
"""
import secrets
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from django.shortcuts import redirect
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import threading

from ..models import User, EmailVerificationToken


class VerifyEmailView(APIView):
    """
    Verify email using token.
    GET /api/auth/verify-email/<token>/
    """
    permission_classes = [AllowAny]

    def get(self, request, token):
        frontend_url = getattr(settings, 'NEXT_PUBLIC_FRONTEND_URL', 'http://localhost:3000')
        
        try:
            verification = EmailVerificationToken.objects.get(
                token=token,
                is_used=False
            )
            
            # Check if expired
            if verification.expires_at < timezone.now():
                return redirect(f"{frontend_url}/auth/verify-email?status=expired")
            
            # Activate user
            user = verification.user
            user.is_active = True
            user.is_verified = True
            user.status = User.Status.ACTIVE
            user.save()
            
            # Mark token as used
            verification.is_used = True
            verification.save()
            
            return redirect(f"{frontend_url}/auth/verify-email?status=success")
            
        except EmailVerificationToken.DoesNotExist:
            return redirect(f"{frontend_url}/auth/verify-email?status=invalid")


def create_verification_token(user):
    """Create a verification token for user."""
    # Delete any existing tokens
    EmailVerificationToken.objects.filter(user=user).delete()
    
    # Create new token
    token = secrets.token_urlsafe(48)
    expires_at = timezone.now() + timedelta(hours=24)
    
    verification = EmailVerificationToken.objects.create(
        user=user,
        token=token,
        expires_at=expires_at
    )
    return verification


def send_verification_email(user, token):
    """Send verification email to user."""
    def _send():
        try:
            # Backend API URL for verification
            api_url = getattr(settings, 'SITE_URL', 'http://localhost:8000')
            verify_url = f"{api_url}/api/auth/verify-email/{token}/"
            
            subject = "BanThuoc - Xác thực email của bạn"
            
            context = {
                'user': user,
                'verify_url': verify_url,
            }
            
            html_message = render_to_string('emails/verify_email.html', context)
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
            print(f"Failed to send verification email: {e}")
    
    thread = threading.Thread(target=_send)
    thread.start()
