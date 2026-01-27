from django.urls import path
from .views import RegisterB2BView, AdminUserListView, AdminUserStatusUpdateView, AdminUserDetailView
from .views.admin import AdminUserCreateView, AdminUserUpdateView, AdminUserDeleteView
from .views.file_upload import FileUploadView, FileDeleteView

urlpatterns = [
    path('auth/register', RegisterB2BView.as_view(), name='register-b2b'),
    
    # File Upload
    path('files/upload/', FileUploadView.as_view(), name='file-upload'),
    path('files/delete/', FileDeleteView.as_view(), name='file-delete'),
    
    # Admin Management
    path('admin/users', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/create', AdminUserCreateView.as_view(), name='admin-user-create'),
    path('admin/users/<int:id>', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/users/<int:id>/update', AdminUserUpdateView.as_view(), name='admin-user-update'),
    path('admin/users/<int:id>/delete', AdminUserDeleteView.as_view(), name='admin-user-delete'),
    path('admin/users/<int:id>/status', AdminUserStatusUpdateView.as_view(), name='admin-user-status'),
]

