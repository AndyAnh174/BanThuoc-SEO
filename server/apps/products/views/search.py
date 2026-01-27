"""
Elasticsearch-powered search views.
Provides fuzzy search, autocomplete, and advanced filtering.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.conf import settings
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from elasticsearch_dsl import Q as ESQ
import math

from products.documents import ProductDocument
from products.serializers.search import (
    ProductDocumentSerializer,
    ProductSearchResponseSerializer,
    SearchSuggestionSerializer,
)


class ElasticsearchProductSearchView(APIView):
    """
    Advanced product search using Elasticsearch with fuzzy matching.
    
    Features:
    - Fuzzy search (typo tolerance)
    - Multi-field search (name, description, category, manufacturer)
    - Price range filtering
    - Category/Manufacturer filtering
    - Sorting
    - Pagination
    - Faceted search (aggregations)
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="Search products with Elasticsearch",
        operation_description="Advanced search with fuzzy matching and filters",
        manual_parameters=[
            openapi.Parameter('q', openapi.IN_QUERY, description="Search query", type=openapi.TYPE_STRING),
            openapi.Parameter('category', openapi.IN_QUERY, description="Category slug", type=openapi.TYPE_STRING),
            openapi.Parameter('manufacturer', openapi.IN_QUERY, description="Manufacturer slug", type=openapi.TYPE_STRING),
            openapi.Parameter('min_price', openapi.IN_QUERY, description="Minimum price", type=openapi.TYPE_NUMBER),
            openapi.Parameter('max_price', openapi.IN_QUERY, description="Maximum price", type=openapi.TYPE_NUMBER),
            openapi.Parameter('product_type', openapi.IN_QUERY, description="Product type", type=openapi.TYPE_STRING),
            openapi.Parameter('on_sale', openapi.IN_QUERY, description="On sale only", type=openapi.TYPE_BOOLEAN),
            openapi.Parameter('sort', openapi.IN_QUERY, description="Sort by: relevance, price_asc, price_desc, newest", type=openapi.TYPE_STRING),
            openapi.Parameter('page', openapi.IN_QUERY, description="Page number", type=openapi.TYPE_INTEGER),
            openapi.Parameter('page_size', openapi.IN_QUERY, description="Results per page", type=openapi.TYPE_INTEGER),
        ],
        responses={200: ProductSearchResponseSerializer()}
    )
    def get(self, request):
        # Get query parameters
        query = request.query_params.get('q', '').strip()
        category = request.query_params.get('category', '')
        manufacturer = request.query_params.get('manufacturer', '')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        product_type = request.query_params.get('product_type', '')
        on_sale = request.query_params.get('on_sale', '').lower() in ('true', '1', 'yes')
        sort = request.query_params.get('sort', 'relevance')
        page = int(request.query_params.get('page', 1))
        page_size = min(int(request.query_params.get('page_size', 12)), 100)

        # Build Elasticsearch search
        search = ProductDocument.search()

        # Only search active products
        search = search.filter('term', status='ACTIVE')

        # Main search query with fuzzy matching
        if query:
            # Multi-match with fuzziness for typo tolerance
            search = search.query(
                'bool',
                should=[
                    # Fuzzy match on name (highest boost)
                    ESQ('match', name={'query': query, 'fuzziness': 'AUTO', 'boost': 3}),
                    # Exact match on name (higher boost for exact)
                    ESQ('match_phrase', name={'query': query, 'boost': 5}),
                    # Match on short description
                    ESQ('match', short_description={'query': query, 'fuzziness': 'AUTO', 'boost': 1}),
                    # Match on category name
                    ESQ('nested', path='category', query=ESQ('match', category__name={'query': query, 'fuzziness': 'AUTO', 'boost': 2})) if hasattr(search, '_nested') else ESQ('match', **{'category.name': {'query': query, 'fuzziness': 'AUTO', 'boost': 2}}),
                    # Match on manufacturer name
                    ESQ('match', **{'manufacturer.name': {'query': query, 'fuzziness': 'AUTO', 'boost': 1.5}}),
                    # Match on SKU (exact)
                    ESQ('term', sku={'value': query.upper(), 'boost': 4}),
                ],
                minimum_should_match=1
            )

        # Filter by category
        if category:
            search = search.filter('term', **{'category.slug': category})

        # Filter by manufacturer
        if manufacturer:
            search = search.filter('term', **{'manufacturer.slug': manufacturer})

        # Filter by price range
        if min_price:
            search = search.filter('range', current_price={'gte': float(min_price)})
        if max_price:
            search = search.filter('range', current_price={'lte': float(max_price)})

        # Filter by product type
        if product_type:
            search = search.filter('term', product_type=product_type)

        # Filter on sale products
        if on_sale:
            search = search.filter('term', is_on_sale=True)

        # Sorting
        if sort == 'price_asc':
            search = search.sort('current_price')
        elif sort == 'price_desc':
            search = search.sort('-current_price')
        elif sort == 'newest':
            search = search.sort('-created_at')
        # 'relevance' uses default ES scoring

        # Add aggregations for faceted search
        search.aggs.bucket('categories', 'terms', field='category.slug', size=20)
        search.aggs.bucket('manufacturers', 'terms', field='manufacturer.slug', size=20)
        search.aggs.bucket('product_types', 'terms', field='product_type', size=10)
        search.aggs.bucket('price_ranges', 'range', field='current_price', ranges=[
            {'to': 50000, 'key': 'under_50k'},
            {'from': 50000, 'to': 100000, 'key': '50k_100k'},
            {'from': 100000, 'to': 500000, 'key': '100k_500k'},
            {'from': 500000, 'key': 'over_500k'},
        ])

        # Pagination
        start = (page - 1) * page_size
        search = search[start:start + page_size]

        # Execute search
        try:
            response = search.execute()
        except Exception as e:
            return Response(
                {'error': f'Search failed: {str(e)}'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # Serialize results
        results = ProductDocumentSerializer(response.hits, many=True).data

        # Build facets from aggregations
        facets = {}
        if hasattr(response, 'aggregations'):
            aggs = response.aggregations
            if hasattr(aggs, 'categories'):
                facets['categories'] = [
                    {'slug': bucket.key, 'count': bucket.doc_count}
                    for bucket in aggs.categories.buckets
                ]
            if hasattr(aggs, 'manufacturers'):
                facets['manufacturers'] = [
                    {'slug': bucket.key, 'count': bucket.doc_count}
                    for bucket in aggs.manufacturers.buckets
                ]
            if hasattr(aggs, 'product_types'):
                facets['product_types'] = [
                    {'type': bucket.key, 'count': bucket.doc_count}
                    for bucket in aggs.product_types.buckets
                ]
            if hasattr(aggs, 'price_ranges'):
                facets['price_ranges'] = [
                    {'range': bucket.key, 'count': bucket.doc_count}
                    for bucket in aggs.price_ranges.buckets
                ]

        # Build response
        total = response.hits.total.value if hasattr(response.hits.total, 'value') else response.hits.total
        total_pages = math.ceil(total / page_size)

        return Response({
            'count': total,
            'page': page,
            'page_size': page_size,
            'total_pages': total_pages,
            'results': results,
            'facets': facets,
        })


class ElasticsearchSuggestView(APIView):
    """
    Autocomplete/suggestion endpoint for search box.
    Returns quick suggestions as user types.
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="Get search suggestions",
        operation_description="Autocomplete suggestions for search box",
        manual_parameters=[
            openapi.Parameter('q', openapi.IN_QUERY, description="Search query (min 2 chars)", type=openapi.TYPE_STRING, required=True),
        ],
        responses={200: SearchSuggestionSerializer(many=True)}
    )
    def get(self, request):
        query = request.query_params.get('q', '').strip()

        if len(query) < 2:
            return Response({'suggestions': []})

        # Build search with prefix matching
        search = ProductDocument.search()
        search = search.filter('term', status='ACTIVE')
        
        # Use prefix and fuzzy for autocomplete
        search = search.query(
            'bool',
            should=[
                # Prefix match (starts with)
                ESQ('prefix', **{'name.raw': {'value': query.lower(), 'boost': 3}}),
                # Fuzzy match for typos
                ESQ('match', name={'query': query, 'fuzziness': 'AUTO', 'boost': 1}),
            ],
            minimum_should_match=1
        )

        # Limit results for speed
        search = search[:10]

        try:
            response = search.execute()
        except Exception as e:
            return Response({'suggestions': []})

        # Serialize suggestions
        suggestions = SearchSuggestionSerializer(response.hits, many=True).data

        return Response({'suggestions': suggestions})
