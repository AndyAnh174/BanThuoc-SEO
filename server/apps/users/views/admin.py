from rest_framework import generics, permissions, status as http_status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.db.models import Q
import threading

from ..serializers.admin import (
    AdminUserSerializer, 
    AdminUserStatusUpdateSerializer,
    AdminUserCreateSerializer,
    AdminUserUpdateSerializer
)

User = get_user_model()

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.ADMIN)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class AdminUserListView(generics.ListAPIView):
    """
    List all users.
    Filter by status via query param: /api/admin/users?status=PENDING
    Filter by role via query param: /api/admin/users?role=ADMIN
    Search by name/email: /api/admin/users?search=keyword
    """
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')
        
        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param and status_param.upper() != 'ALL':
            queryset = queryset.filter(status=status_param.upper())
        
        # Filter by role
        role_param = self.request.query_params.get('role')
        if role_param and role_param.upper() != 'ALL':
            queryset = queryset.filter(role=role_param.upper())
        
        # Search by name, email, username
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) |
                Q(email__icontains=search) |
                Q(username__icontains=search) |
                Q(phone__icontains=search)
            )
        
        return queryset

class AdminUserDetailView(generics.RetrieveAPIView):
    """
    Get details of a specific user.
    """
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    queryset = User.objects.all()
    lookup_field = 'id'

class AdminUserCreateView(generics.CreateAPIView):
    """
    Create a new user.
    """
    serializer_class = AdminUserCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    queryset = User.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(AdminUserSerializer(user).data, status=http_status.HTTP_201_CREATED)

class AdminUserUpdateView(generics.UpdateAPIView):
    """
    Update user info.
    """
    serializer_class = AdminUserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    queryset = User.objects.all()
    lookup_field = 'id'
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)  # Allow PATCH
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(AdminUserSerializer(user).data)

class AdminUserDeleteView(generics.DestroyAPIView):
    """
    Delete a user.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    queryset = User.objects.all()
    lookup_field = 'id'
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Prevent admin from deleting themselves
        if instance.id == request.user.id:
            return Response(
                {"detail": "Không thể xóa tài khoản của chính mình."},
                status=http_status.HTTP_400_BAD_REQUEST
            )
        
        self.perform_destroy(instance)
        return Response(status=http_status.HTTP_204_NO_CONTENT)

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

