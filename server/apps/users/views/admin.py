from rest_framework import generics, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import threading

from ..serializers.admin import AdminUserSerializer, AdminUserStatusUpdateSerializer

User = get_user_model()

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin or staff users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in [User.Role.ADMIN, User.Role.STAFF])

class AdminUserListView(generics.ListAPIView):
    """
    List all business customers.
    Filter by status via query param: /api/admin/users?status=PENDING
    """
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        queryset = User.objects.filter(role=User.Role.CUSTOMER).order_by('-date_joined')
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param.upper())
        return queryset

class AdminUserStatusUpdateView(generics.UpdateAPIView):
    """
    Approve or Reject a user.
    """
    serializer_class = AdminUserStatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    queryset = User.objects.all()
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        new_status = serializer.validated_data['status']
        reason = serializer.validated_data.get('reason', '')

        # Update user
        user.status = new_status
        if new_status == User.Status.ACTIVE:
            user.is_active = True
        elif new_status in [User.Status.REJECTED, User.Status.LOCKED]:
            user.is_active = False
        
        user.save()

        # Send Email in background
        self._send_status_email(user, new_status, reason)
        
        return Response(AdminUserSerializer(user).data)

    def _send_status_email(self, user, new_status, reason):
        def _send():
            try:
                subject = ""
                template = ""
                frontend_url = getattr(settings, 'NEXT_PUBLIC_FRONTEND_URL', 'http://localhost:3000') 
                
                context = {
                    'user': user, 
                    'login_url': f"{frontend_url}/auth/login",
                    'reason': reason
                }

                if new_status == User.Status.ACTIVE:
                    subject = "BanThuoc - Tài khoản đã được phê duyệt"
                    template = "users/emails/approved.html"
                elif new_status == User.Status.REJECTED:
                    subject = "BanThuoc - Cập nhật trạng thái đăng ký"
                    template = "users/emails/rejected.html"
                
                if template:
                    # Template path relative to templates directory
                    # server/apps/users/templates/emails/approved.html
                    # Django loads app_dir/templates/ + path
                    # so 'emails/approved.html' is correct assuming 'emails' is directly under 'users/templates' or similar.
                    # Wait, we made D:\Freelance\BanThuoc\server\apps\users\templates\emails\approved.html
                    # By default Django app loader looks in app/templates/
                    # So 'emails/approved.html' is correct.
                    
                    html_message = render_to_string(f'emails/{template.split("/")[-1]}', context)
                    plain_message = strip_tags(html_message)
                    
                    send_mail(
                        subject,
                        plain_message,
                        settings.DEFAULT_FROM_EMAIL,
                        [user.email],
                        html_message=html_message,
                        fail_silently=True
                    )
            except Exception as e:
                print(f"Error sending status email: {e}")
        
        threading.Thread(target=_send).start()
