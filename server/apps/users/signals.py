from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.contrib.auth import get_user_model
import threading

User = get_user_model()

@receiver(post_save, sender=User)
def send_welcome_email(sender, instance, created, **kwargs):
    """
    Sends a welcome email to the user upon registration (created=True).
    This runs in a separate thread to avoid blocking the request.
    """
    if created and instance.role == User.Role.CUSTOMER:
        # Define the email sending logic
        def _send():
            try:
                subject = "Welcome to BanThuoc - Registration Received"
                # Simple HTML content for now
                html_message = render_to_string('emails/welcome.html', {'user': instance})
                plain_message = strip_tags(html_message)
                
                send_mail(
                    subject,
                    plain_message,
                    settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@banthuoc.vn',
                    [instance.email],
                    html_message=html_message,
                    fail_silently=True,
                )
                print(f"Welcome email sent to {instance.email}")
            except Exception as e:
                print(f"Failed to send welcome email: {e}")

        # Run in a thread
        thread = threading.Thread(target=_send)
        thread.start()
