"""
Return Request Views
"""
from datetime import timedelta
from django.utils import timezone
from django.db.models import F
from rest_framework import serializers, permissions, status
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response

from .models import Order
from .models_return import ReturnRequest


class ReturnRequestSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='order.id', read_only=True)

    class Meta:
        model = ReturnRequest
        fields = [
            'id', 'order', 'order_id', 'user', 'reason', 'status',
            'refund_amount', 'admin_notes', 'created_at', 'processed_at'
        ]
        read_only_fields = ['user', 'status', 'refund_amount', 'admin_notes', 'processed_at']


class CreateReturnRequestView(APIView):
    """
    POST /api/orders/<int:order_id>/return/
    Create a return request for a delivered order (within 7 days).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id):
        user = request.user

        try:
            order = Order.objects.get(pk=order_id, user=user)
        except Order.DoesNotExist:
            return Response({"error": "Don hang khong ton tai."}, status=status.HTTP_404_NOT_FOUND)

        if order.status != Order.Status.DELIVERED:
            return Response(
                {"error": "Chi co the yeu cau tra hang voi don hang da giao."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check 7-day return window
        if order.updated_at < timezone.now() - timedelta(days=7):
            return Response(
                {"error": "Da qua thoi han tra hang (7 ngay sau khi nhan hang)."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check existing return request
        if ReturnRequest.objects.filter(order=order, status__in=['PENDING', 'APPROVED']).exists():
            return Response(
                {"error": "Don hang nay da co yeu cau tra hang dang xu ly."},
                status=status.HTTP_400_BAD_REQUEST
            )

        reason = request.data.get('reason', '').strip()
        if not reason:
            return Response({"error": "Vui long nhap ly do tra hang."}, status=status.HTTP_400_BAD_REQUEST)

        return_request = ReturnRequest.objects.create(
            order=order,
            user=user,
            reason=reason,
            refund_amount=order.final_amount,
        )

        serializer = ReturnRequestSerializer(return_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MyReturnRequestsView(ListAPIView):
    """
    GET /api/returns/my/
    List current user's return requests.
    """
    serializer_class = ReturnRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ReturnRequest.objects.filter(user=self.request.user)


class AdminReturnRequestListView(ListAPIView):
    """
    GET /api/admin/returns/
    List all return requests for admin.
    """
    serializer_class = ReturnRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'ADMIN':
            return ReturnRequest.objects.none()
        qs = ReturnRequest.objects.all()
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter.upper())
        return qs


class AdminReturnRequestActionView(APIView):
    """
    POST /api/admin/returns/<uuid:return_id>/action/
    Approve or reject a return request.
    Body: { "action": "approve" | "reject", "admin_notes": "..." }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, return_id):
        if request.user.role != 'ADMIN':
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        try:
            return_req = ReturnRequest.objects.get(pk=return_id)
        except ReturnRequest.DoesNotExist:
            return Response({"error": "Yeu cau tra hang khong ton tai."}, status=status.HTTP_404_NOT_FOUND)

        if return_req.status != ReturnRequest.Status.PENDING:
            return Response(
                {"error": "Yeu cau nay da duoc xu ly."},
                status=status.HTTP_400_BAD_REQUEST
            )

        action = request.data.get('action')
        admin_notes = request.data.get('admin_notes', '')

        if action == 'approve':
            return_req.status = ReturnRequest.Status.APPROVED
            return_req.admin_notes = admin_notes
            return_req.processed_at = timezone.now()
            return_req.save()

            # Update order status
            order = return_req.order
            order.status = Order.Status.RETURNED
            order.save()

            # Restore stock
            for item in order.items.all():
                if item.product:
                    from products.models import Product
                    Product.objects.filter(pk=item.product.pk).update(
                        stock_quantity=F('stock_quantity') + item.quantity
                    )

            # Refund loyalty points if awarded
            if order.points_awarded and order.user:
                from users.models import RewardPointLog
                points = order.calculate_loyalty_points()
                RewardPointLog.objects.create(
                    user=order.user,
                    points=-points,
                    reason=RewardPointLog.Reason.ORDER_REFUND,
                    related_order=order,
                    description=f"Points refunded for returned Order #{order.id}"
                )

            return Response({"message": "Da duyet yeu cau tra hang."})

        elif action == 'reject':
            return_req.status = ReturnRequest.Status.REJECTED
            return_req.admin_notes = admin_notes
            return_req.processed_at = timezone.now()
            return_req.save()
            return Response({"message": "Da tu choi yeu cau tra hang."})

        else:
            return Response(
                {"error": "Action phai la 'approve' hoac 'reject'."},
                status=status.HTTP_400_BAD_REQUEST
            )
