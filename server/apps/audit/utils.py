from django.db import models

from .middleware import get_client_ip, get_current_request
from .models import AuditLog


def _serialize_value(v):
    """Convert a model value to JSON-safe form."""
    if v is None:
        return None
    if isinstance(v, (str, int, float, bool)):
        return v
    if isinstance(v, models.Model):
        return str(v.pk)
    try:
        return str(v)
    except Exception:
        return None


def model_to_snapshot(instance):
    """Build a {field: value} dict for a model instance, skipping heavy fields."""
    snapshot = {}
    for field in instance._meta.concrete_fields:
        # Skip large/binary fields
        if field.get_internal_type() in ("BinaryField",):
            continue
        try:
            value = getattr(instance, field.attname, None)
        except Exception:
            value = None
        snapshot[field.name] = _serialize_value(value)
    return snapshot


def diff_snapshots(old, new):
    """Return {field: {old, new}} for fields that changed."""
    if not old:
        return {}
    changes = {}
    for k, new_val in new.items():
        old_val = old.get(k)
        if old_val != new_val:
            changes[k] = {"old": old_val, "new": new_val}
    return changes


def write_audit(
    *,
    action,
    user=None,
    target_type="",
    target_id="",
    target_repr="",
    changes=None,
    request=None,
):
    """Persist an AuditLog entry. Safe to call from signals or views."""
    req = request or get_current_request()
    if user is None and req is not None:
        u = getattr(req, "user", None)
        if u is not None and getattr(u, "is_authenticated", False):
            user = u

    ip = get_client_ip(req) if req is not None else None
    ua = req.META.get("HTTP_USER_AGENT", "")[:500] if req is not None else ""

    try:
        AuditLog.objects.create(
            user=user if (user and getattr(user, "pk", None)) else None,
            user_email=getattr(user, "email", "") or "",
            user_role=getattr(user, "role", "") or "",
            action=action,
            target_type=target_type or "",
            target_id=str(target_id) if target_id is not None else "",
            target_repr=(target_repr or "")[:255],
            changes=changes or {},
            ip_address=ip,
            user_agent=ua,
        )
    except Exception as e:
        # Never let audit logging break the request
        import logging

        logging.getLogger(__name__).warning("audit log failed: %s", e)
