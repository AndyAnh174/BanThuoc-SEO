import json
from django.test import RequestFactory
from products.views.public import FeaturedProductsView
from products.models import Product

def run():
    factory = RequestFactory()
    request = factory.get('/api/products/featured/')
    view = FeaturedProductsView.as_view()
    response = view(request)
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.data
        if hasattr(data, 'get') and data.get('results'):
            results = data['results']
        else:
            results = data # ListAPIView might return list directly if pagination is off? 
            # Check serializer pagination. StandardResultsSetPagination used in ListView but FeaturedView doesn't specify one?
            # FeaturedProductsView doesn't verify pagination_class, defaults to None? No, defaults to settings.
            # But get_queryset slices [:8] so pagination might be weird if applied?
            # Actually generic ListAPIView applies pagination if set.
            # Let's just print structure.

        # Simplify output for debugging
        debug_list = []
        if isinstance(results, dict) and 'results' in results: 
             results = results['results']

        for p in results:
            if 'Glucosamine' in p['name']:
                debug_list.append({
                    'name': p['name'],
                    'price': p['price'],
                    'sale_price': p['sale_price'],
                    'sale_price_type': str(type(p['sale_price'])),
                    'is_on_sale': p.get('is_on_sale'),
                    'current_price': p.get('current_price')
                })
        
        print(json.dumps(debug_list, indent=2))
    else:
        print("Failed to fetch")
