from django.urls import path
from .views import RegisterB2BView, AdminUserListView, AdminUserStatusUpdateView, AdminUserDetailView

urlpatterns = [
    path('auth/register', RegisterB2BView.as_view(), name='register-b2b'),
    # Admin Management
    path('admin/users', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:id>', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/users/<int:id>/status', AdminUserStatusUpdateView.as_view(), name='admin-user-status'),
]
