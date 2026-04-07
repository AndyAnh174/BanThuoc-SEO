from django.conf import settings
from django.db import models


class AuditLog(models.Model):
    """
    Audit log entry. Records who did what, when, on which target,
    and what fields changed.
    """

    class Action(models.TextChoices):
        CREATE = "CREATE", "Create"
        UPDATE = "UPDATE", "Update"
        DELETE = "DELETE", "Delete"
        LOGIN = "LOGIN", "Login"
        LOGOUT = "LOGOUT", "Logout"

    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
        help_text="User who performed the action (null = anonymous/system)",
    )
    user_email = models.CharField(max_length=255, blank=True, default="")
    user_role = models.CharField(max_length=20, blank=True, default="")
    action = models.CharField(max_length=20, choices=Action.choices, db_index=True)
    target_type = models.CharField(
        max_length=100,
        blank=True,
        default="",
        db_index=True,
        help_text="Model label, e.g. 'products.Product'",
    )
    target_id = models.CharField(max_length=64, blank=True, default="", db_index=True)
    target_repr = models.CharField(max_length=255, blank=True, default="")
    changes = models.JSONField(
        default=dict,
        blank=True,
        help_text="{field: {old: ..., new: ...}} for UPDATE; full snapshot for CREATE/DELETE",
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["target_type", "target_id"]),
            models.Index(fields=["action", "-created_at"]),
        ]

    def __str__(self):
        who = self.user_email or "anonymous"
        return f"[{self.created_at:%Y-%m-%d %H:%M}] {who} {self.action} {self.target_type}#{self.target_id}"
