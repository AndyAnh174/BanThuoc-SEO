from django.urls import path

from .views import AuditLogListView, AuditLogUserHistoryView

urlpatterns = [
    path("admin/audit-logs/", AuditLogListView.as_view(), name="audit-log-list"),
    path(
        "admin/audit-logs/users/<int:user_id>/",
        AuditLogUserHistoryView.as_view(),
        name="audit-log-user-history",
    ),
]
