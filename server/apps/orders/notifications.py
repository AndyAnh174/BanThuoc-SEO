"""
Order Email Notifications
"""
import threading
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def send_order_confirmation(order):
    """Send order confirmation email after successful order creation."""
    if not order.email and not (order.user and order.user.email):
        return

    recipient = order.email or order.user.email

    def _send():
        try:
            context = _build_order_context(order)
            html_message = render_to_string('emails/order_confirmation.html', context)
            plain_message = strip_tags(html_message)

            send_mail(
                subject=f"BanThuoc - Xac nhan don hang #{order.id}",
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                html_message=html_message,
                fail_silently=False,
            )
        except Exception as e:
            print(f"Failed to send order confirmation email: {e}")

    thread = threading.Thread(target=_send)
    thread.start()


def send_order_status_change(order, old_status, new_status):
    """Send email when order status changes."""
    if not order.email and not (order.user and order.user.email):
        return

    recipient = order.email or order.user.email

    status_labels = {
        'PENDING': 'Cho xu ly',
        'CONFIRMED': 'Da xac nhan',
        'PROCESSING': 'Dang xu ly',
        'SHIPPING': 'Dang giao hang',
        'DELIVERED': 'Da giao hang',
        'CANCELLED': 'Da huy',
        'RETURNED': 'Da tra hang',
    }

    def _send():
        try:
            context = _build_order_context(order)
            context['old_status'] = status_labels.get(old_status, old_status)
            context['new_status'] = status_labels.get(new_status, new_status)

            html_message = render_to_string('emails/order_status_update.html', context)
            plain_message = strip_tags(html_message)

            send_mail(
                subject=f"BanThuoc - Cap nhat don hang #{order.id}",
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                html_message=html_message,
                fail_silently=False,
            )
        except Exception as e:
            print(f"Failed to send order status email: {e}")

    thread = threading.Thread(target=_send)
    thread.start()


def _build_order_context(order):
    """Build common context for order emails."""
    def fmt(val):
        return "{:,.0f}".format(val).replace(",", ".")

    items = []
    for item in order.items.all():
        items.append({
            'product_name': item.product_name,
            'quantity': item.quantity,
            'price': fmt(item.price),
            'total_price': fmt(item.total_price),
        })

    return {
        'order': order,
        'items': items,
        'formatted_total': fmt(order.total_amount),
        'formatted_shipping': fmt(order.shipping_fee),
        'formatted_discount': fmt(order.discount_amount),
        'formatted_final': fmt(order.final_amount),
        'frontend_url': getattr(settings, 'NEXT_PUBLIC_FRONTEND_URL', 'http://localhost:3000'),
    }
