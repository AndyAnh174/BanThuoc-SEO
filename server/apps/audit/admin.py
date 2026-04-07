from django.contrib import admin

from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "user_email", "action", "target_type", "target_id", "ip_address")
    list_filter = ("action", "target_type", "created_at")
    search_fields = ("user_email", "target_repr", "ip_address")
    readonly_fields = [f.name for f in AuditLog._meta.fields]
