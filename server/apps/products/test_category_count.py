
from django.test import TestCase
from rest_framework.test import APIClient
from products.models import Category
from django.contrib.auth import get_user_model

User = get_user_model()

class CategoryCountTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser('admin', 'admin@example.com', 'password')
        self.client.force_authenticate(user=self.user)
        
        # Create categories
        # Active: 5
        for i in range(5):
            Category.objects.create(name=f"Active {i}", is_active=True)
            
        # Inactive: 3
        for i in range(3):
            Category.objects.create(name=f"Inactive {i}", is_active=False)

    def test_list_categories_response(self):
        response = self.client.get('/api/products/categories/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        print(f"Response keys: {data.keys()}")
        if 'active_count' in data:
            print(f"Active count in response: {data['active_count']}")
        else:
            print("Active count NOT in response")
            
        self.assertEqual(data['count'], 8)
        # We expect this to fail initially or print "NOT in response"
