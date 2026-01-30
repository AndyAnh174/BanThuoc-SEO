
import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from orders.models import Order
from users.models import RewardPointLog
from decimal import Decimal

User = get_user_model()

def test_reward_points():
    print("Testing Reward Logic...")
    
    # 1. Create User
    username = "test_reward_user"
    email = "test_reward@example.com"
    if User.objects.filter(username=username).exists():
        User.objects.filter(username=username).delete()
        
    user = User.objects.create_user(username=username, email=email, password="password123")
    print(f"User created: {user} (Points: {user.loyalty_points})")
    
    # 2. Create Order
    order = Order.objects.create(
        user=user,
        full_name="Test User",
        phone_number="0123456789",
        address="Test Address",
        total_amount=Decimal('500000'),
        final_amount=Decimal('500000'),
        status=Order.Status.PENDING
    )
    print(f"Order created: #{order.id} (Status: {order.status})")
    
    # 3. Change Status to DELIVERED
    print("Changing status to DELIVERED...")
    order.status = Order.Status.DELIVERED
    # Trigger signal explicitly if .save() is not enough (Django signals run on save)
    order.save()
    
    # Reload user
    user.refresh_from_db()
    
    # 4. Verify
    print(f"User Points after delivery: {user.loyalty_points}")
    expected_points = int(500000 / 1000) # 500
    
    if user.loyalty_points == expected_points:
        print("✅ User points updated correctly.")
    else:
        print(f"❌ User points MISMATCH. Expected {expected_points}, got {user.loyalty_points}")
        
    # Check Logs
    log = RewardPointLog.objects.filter(user=user, related_order=order).first()
    if log:
        print(f"✅ Log entry found: {log}")
    else:
        print("❌ No Log entry found!")

    # Cleanup
    order.delete()
    user.delete()

if __name__ == '__main__':
    test_reward_points()
