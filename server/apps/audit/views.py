from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics

from .models import AuditLog
from .permissions import IsAdminRole
from .serializers import AuditLogSerializer

User = get_user_model()


class AuditLogListView(generics.ListAPIView):
    """
    GET /api/admin/audit-logs/
    List audit log entries. Admin only.
    Query params: user_id, action, target_type, search, from_date, to_date, page, page_size
    """

    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminRole]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["action", "target_type", "user"]
    search_fields = ["user_email", "target_repr", "ip_address"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = AuditLog.objects.select_related("user").all()
        params = self.request.query_params

        user_id = params.get("user_id")
        if user_id:
            qs = qs.filter(user_id=user_id)

        from_date = params.get("from_date")
        if from_date:
            qs = qs.filter(created_at__gte=from_date)

        to_date = params.get("to_date")
        if to_date:
            qs = qs.filter(created_at__lte=to_date)

        return qs


class AuditLogUserHistoryView(generics.ListAPIView):
    """
    GET /api/admin/audit-logs/users/<user_id>/
    Lịch sử hoạt động của 1 user cụ thể. Admin only.
    """

    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        user_id = self.kwargs.get("user_id")
        return (
            AuditLog.objects.select_related("user")
            .filter(user_id=user_id)
            .order_by("-created_at")
        )
