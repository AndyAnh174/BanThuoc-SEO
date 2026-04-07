"""
Signal handlers that auto-write AuditLog entries for tracked models.

We deliberately keep TRACKED_MODELS as string labels and resolve them
lazily at app-ready time to avoid hard import dependencies.
"""
import threading

from django.apps import apps
from django.db.models.signals import post_delete, post_save, pre_save

from .models import AuditLog
from .utils import diff_snapshots, model_to_snapshot, write_audit

# Models we want to audit. Format: "app_label.ModelName"
TRACKED_MODELS = [
    "users.User",
    "products.Product",
    "products.Category",
    "products.Manufacturer",
    "products.Banner",
    "products.FlashSaleSession",
    "orders.Order",
    "vouchers.Voucher",
]

# Per-thread cache of pre-save snapshots, keyed by (model_label, pk)
_pre_save_cache = threading.local()


def _cache():
    if not hasattr(_pre_save_cache, "data"):
        _pre_save_cache.data = {}
    return _pre_save_cache.data


def _label(sender):
    return f"{sender._meta.app_label}.{sender.__name__}"


def _handle_pre_save(sender, instance, **kwargs):
    if instance.pk is None:
        return  # New object, nothing to snapshot
    try:
        old = sender.objects.filter(pk=instance.pk).first()
        if old is not None:
            _cache()[(_label(sender), instance.pk)] = model_to_snapshot(old)
    except Exception:
        pass


def _handle_post_save(sender, instance, created, **kwargs):
    # Skip AuditLog itself to avoid recursion
    if sender is AuditLog:
        return
    label = _label(sender)
    new_snapshot = model_to_snapshot(instance)

    if created:
        write_audit(
            action=AuditLog.Action.CREATE,
            target_type=label,
            target_id=instance.pk,
            target_repr=str(instance)[:255],
            changes={"new": new_snapshot},
        )
    else:
        old_snapshot = _cache().pop((label, instance.pk), None)
        changes = diff_snapshots(old_snapshot, new_snapshot)
        if not changes:
            return  # No real change → don't spam
        write_audit(
            action=AuditLog.Action.UPDATE,
            target_type=label,
            target_id=instance.pk,
            target_repr=str(instance)[:255],
            changes=changes,
        )


def _handle_post_delete(sender, instance, **kwargs):
    if sender is AuditLog:
        return
    label = _label(sender)
    write_audit(
        action=AuditLog.Action.DELETE,
        target_type=label,
        target_id=instance.pk,
        target_repr=str(instance)[:255],
        changes={"old": model_to_snapshot(instance)},
    )


def _connect():
    for label in TRACKED_MODELS:
        try:
            model = apps.get_model(label)
        except LookupError:
            continue
        if model is None:
            continue
        pre_save.connect(_handle_pre_save, sender=model, dispatch_uid=f"audit_pre_{label}")
        post_save.connect(_handle_post_save, sender=model, dispatch_uid=f"audit_post_{label}")
        post_delete.connect(_handle_post_delete, sender=model, dispatch_uid=f"audit_del_{label}")


_connect()
