"""
User Profile API Views
"""
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model

from ..serializers.profile import UserProfileSerializer, UserProfileUpdateSerializer
from ..utils.file_upload import MinioHandler

User = get_user_model()


class UserProfileView(generics.RetrieveAPIView):
    """
    Get current user's profile.
    GET /api/me/
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserProfileUpdateView(generics.UpdateAPIView):
    """
    Update current user's profile.
    PATCH /api/me/update/
    """
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        partial = True
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserProfileSerializer(user).data)


class UserAvatarUploadView(APIView):
    """
    Upload avatar for current user.
    POST /api/me/avatar/
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('file')
        
        if not file:
            return Response(
                {"error": "Vui lòng chọn file ảnh"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (max 5MB for avatars)
        max_size = 5 * 1024 * 1024  # 5MB
        if file.size > max_size:
            return Response(
                {"error": "Kích thước file không được vượt quá 5MB"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file type - only images
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if file.content_type not in allowed_types:
            return Response(
                {"error": "Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            handler = MinioHandler()
            
            # Delete old avatar if exists
            user = request.user
            if user.avatar:
                try:
                    # Extract object name from URL
                    parts = user.avatar.split(f"/{handler.bucket_name}/")
                    if len(parts) == 2:
                        old_object_name = parts[1]
                        handler.client.remove_object(handler.bucket_name, old_object_name)
                except Exception:
                    pass  # Ignore errors when deleting old avatar
            
            # Upload new avatar
            url = handler.upload_file(file, folder='avatars')
            
            # Update user avatar
            user.avatar = url
            user.save(update_fields=['avatar'])
            
            return Response({
                "avatar": url,
                "message": "Cập nhật avatar thành công"
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"Upload thất bại: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChangePasswordView(APIView):
    """
    Change password for current user.
    POST /api/me/change-password/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        # Validate required fields
        if not old_password or not new_password or not confirm_password:
            return Response(
                {"error": "Vui lòng nhập đầy đủ thông tin"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check old password
        if not user.check_password(old_password):
            return Response(
                {"error": "Mật khẩu hiện tại không đúng"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check new password match
        if new_password != confirm_password:
            return Response(
                {"error": "Mật khẩu mới không khớp"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate password length
        if len(new_password) < 6:
            return Response(
                {"error": "Mật khẩu mới phải có ít nhất 6 ký tự"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Change password
        user.set_password(new_password)
        user.save()

        return Response(
            {"message": "Đổi mật khẩu thành công"},
            status=status.HTTP_200_OK
        )

