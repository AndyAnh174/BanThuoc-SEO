"""
Product Review Views
"""
from rest_framework import serializers, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from django.db.models import Avg
from products.models import Review, Product
from orders.models import Order, OrderItem


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'user', 'user_name', 'product', 'rating',
            'title', 'content', 'is_verified_purchase', 'is_approved',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'is_verified_purchase', 'is_approved', 'created_at', 'updated_at']


class ProductReviewListCreateView(APIView):
    """
    GET  /api/products/<uuid:product_id>/reviews/ - List approved reviews
    POST /api/products/<uuid:product_id>/reviews/ - Create a review
    """
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get(self, request, product_id):
        reviews = Review.objects.filter(product_id=product_id, is_approved=True)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    def post(self, request, product_id):
        user = request.user

        # Check product exists
        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({"error": "San pham khong ton tai."}, status=status.HTTP_404_NOT_FOUND)

        # Check if already reviewed
        if Review.objects.filter(user=user, product=product).exists():
            return Response(
                {"error": "Ban da danh gia san pham nay roi."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user has a delivered order containing this product
        has_purchased = OrderItem.objects.filter(
            order__user=user,
            order__status=Order.Status.DELIVERED,
            product=product
        ).exists()

        rating = request.data.get('rating')
        if not rating or not (1 <= int(rating) <= 5):
            return Response(
                {"error": "Rating phai tu 1 den 5."},
                status=status.HTTP_400_BAD_REQUEST
            )

        review = Review.objects.create(
            user=user,
            product=product,
            rating=int(rating),
            title=request.data.get('title', ''),
            content=request.data.get('content', ''),
            is_verified_purchase=has_purchased,
            is_approved=False,  # Requires admin approval for pharma platform
        )

        serializer = ReviewSerializer(review)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProductReviewStatsView(APIView):
    """
    GET /api/products/<uuid:product_id>/reviews/stats/
    Get review statistics for a product.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, product_id):
        reviews = Review.objects.filter(product_id=product_id, is_approved=True)
        stats = reviews.aggregate(
            average_rating=Avg('rating'),
            total_reviews=models.Count('id'),
        )

        # Rating distribution
        from django.db.models import Count
        distribution = dict(
            reviews.values_list('rating').annotate(count=Count('id')).values_list('rating', 'count')
        )

        return Response({
            'average_rating': round(stats['average_rating'] or 0, 1),
            'total_reviews': stats['total_reviews'],
            'distribution': {i: distribution.get(i, 0) for i in range(1, 6)},
        })


# Fix import for Count
from django.db import models


class AdminReviewListView(ListAPIView):
    """
    GET /api/admin/reviews/
    List all reviews for admin moderation.
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'ADMIN':
            return Review.objects.none()
        qs = Review.objects.all()
        status_filter = self.request.query_params.get('status')
        if status_filter == 'pending':
            qs = qs.filter(is_approved=False)
        elif status_filter == 'approved':
            qs = qs.filter(is_approved=True)
        return qs


class AdminReviewModerateView(APIView):
    """
    POST /api/admin/reviews/<uuid:review_id>/moderate/
    Approve or reject a review.
    Body: { "action": "approve" | "reject" }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, review_id):
        if request.user.role != 'ADMIN':
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        try:
            review = Review.objects.get(pk=review_id)
        except Review.DoesNotExist:
            return Response({"error": "Review khong ton tai."}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')
        if action == 'approve':
            review.is_approved = True
            review.save()
            return Response({"message": "Da duyet review."})
        elif action == 'reject':
            review.delete()
            return Response({"message": "Da xoa review."})
        else:
            return Response({"error": "Action phai la 'approve' hoac 'reject'."}, status=status.HTTP_400_BAD_REQUEST)
