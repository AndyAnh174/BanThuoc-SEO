from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """Allows access only to authenticated users with role == 'ADMIN'."""

    message = "Bạn không được cấp quyền để thực hiện hành động này."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return getattr(user, "role", None) == "ADMIN"
