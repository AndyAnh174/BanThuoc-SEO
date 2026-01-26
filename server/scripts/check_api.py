from django.test import RequestFactory
from products.views.public import CategoryListView
import json

def run():
    factory = RequestFactory()
    request = factory.get('/api/categories/')
    view = CategoryListView.as_view()
    response = view(request)
    response.render()
    
    data = response.data
    results = data.get('results', data) if isinstance(data, dict) else data
    
    print("ROOT CATEGORIES:")
    for c in results:
        print(f"- {c['name']}")
        
    thuoc = next((c for c in results if c['name'] == 'Thuốc'), None)
    if thuoc:
        print("\nCHILDREN OF 'Thuốc':")
        for child in thuoc['children']:
            print(f"  - {child['name']}")
    else:
        print("\n'Thuốc' category not found in root list!")
