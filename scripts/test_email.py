import os
import sys
import django

# Add server directory to python path
sys.path.append(os.path.join(os.path.dirname(__file__), '../server'))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.local")

django.setup()

from django.core.mail import send_mail
from django.conf import settings

def test_email():
    subject = 'Test Email from BanThuoc'
    message = 'This is a test email to verify SMTP configuration.'
    email_from = settings.DEFAULT_FROM_EMAIL
    recipient_list = ['hovietanh147@gmail.com']
    
    print(f"Attempting to send email from {email_from} to {recipient_list}...")
    try:
        send_mail(subject, message, email_from, recipient_list)
        print("Email sent successfully!")
    except Exception as e:
        print(f"Failed to send email. Error: {e}")

if __name__ == "__main__":
    test_email()
