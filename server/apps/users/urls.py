from django.urls import path
from .views import RegisterB2BView, AdminUserListView, AdminUserStatusUpdateView, AdminUserDetailView
from .views.admin import AdminUserCreateView, AdminUserUpdateView, AdminUserDeleteView
from .views.file_upload import FileUploadView, FileDeleteView
from .views.profile import UserProfileView, UserProfileUpdateView, UserAvatarUploadView, ChangePasswordView
from .views.verify_email import VerifyEmailView

urlpatterns = [
    path('auth/register', RegisterB2BView.as_view(), name='register-b2b'),
    path('auth/verify-email/<str:token>/', VerifyEmailView.as_view(), name='verify-email'),
    
    # File Upload
    path('files/upload/', FileUploadView.as_view(), name='file-upload'),
    path('files/delete/', FileDeleteView.as_view(), name='file-delete'),
    
    # User Profile (current user)
    path('me/', UserProfileView.as_view(), name='user-profile'),
    path('me/update/', UserProfileUpdateView.as_view(), name='user-profile-update'),
    path('me/avatar/', UserAvatarUploadView.as_view(), name='user-avatar-upload'),
    path('me/change-password/', ChangePasswordView.as_view(), name='user-change-password'),
    
    # Admin Management
    path('admin/users', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/create', AdminUserCreateView.as_view(), name='admin-user-create'),
    path('admin/users/<int:id>', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/users/<int:id>/update', AdminUserUpdateView.as_view(), name='admin-user-update'),
    path('admin/users/<int:id>/delete', AdminUserDeleteView.as_view(), name='admin-user-delete'),
    path('admin/users/<int:id>/status', AdminUserStatusUpdateView.as_view(), name='admin-user-status'),
]



