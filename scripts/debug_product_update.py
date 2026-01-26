import requests
import json
import os
import sys

# Setup
BASE_URL = "http://localhost:8000/api"
USERNAME = "admin"
PASSWORD = "Admin@123"

def login():
    url = f"{BASE_URL}/auth/token/"
    payload = {"username": USERNAME, "password": PASSWORD}
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()["access"]
    except Exception as e:
        print(f"Login failed: {e}")
        if response:
            print(response.text)
        sys.exit(1)

def get_first_product(token):
    headers = {"Authorization": f"Bearer {token}"}
    url = f"{BASE_URL}/admin/products/"
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Failed to list products: {response.text}")
        sys.exit(1)
    
    data = response.json()
    results = data.get('results', [])
    if not results:
        print("No products found.")
        sys.exit(1)
    return results[0]

def update_product(token, product):
    headers = {"Authorization": f"Bearer {token}"}
    url = f"{BASE_URL}/admin/products/{product['id']}/"
    
    # Payload similar to what frontend sends (PATCH)
    payload = {
        "name": product["name"],
        "sku": product["sku"],
        "slug": product["slug"],
        "category": product["category"], # Assuming ID
        "manufacturer": product["manufacturer"], # Assuming ID
        "price": product["price"],
        "stock_quantity": product["stock_quantity"],
        "images": [
            {
                "image_url": "http://minio:9000/test.jpg",
                "is_primary": True,
                "sort_order": 0
            }
        ]
    }
    
    print(f"Attempting to PATCH {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    response = requests.patch(url, json=payload, headers=headers)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    token = login()
    print("Logged in.")
    product = get_first_product(token)
    print(f"Found product: {product['name']} ({product['id']})")
    update_product(token, product)
