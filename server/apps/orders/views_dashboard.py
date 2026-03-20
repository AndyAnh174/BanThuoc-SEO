"""
Admin Dashboard Statistics API Views
"""
from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum, Count, Q, F
from django.db.models.functions import TruncDate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Order
from products.models import Product
from users.models import User


class IsAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'ADMIN'


class AdminDashboardStatsView(APIView):
    """
    GET /api/admin/dashboard/stats/
    Returns aggregated dashboard statistics.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=7)
        month_start = today_start - timedelta(days=30)

        # Order stats
        orders_today = Order.objects.filter(created_at__gte=today_start).count()
        orders_week = Order.objects.filter(created_at__gte=week_start).count()
        orders_month = Order.objects.filter(created_at__gte=month_start).count()
        orders_total = Order.objects.count()

        # Revenue stats (only delivered/completed orders)
        delivered_filter = Q(status=Order.Status.DELIVERED)
        revenue_today = Order.objects.filter(delivered_filter, created_at__gte=today_start).aggregate(
            total=Sum('final_amount'))['total'] or 0
        revenue_week = Order.objects.filter(delivered_filter, created_at__gte=week_start).aggregate(
            total=Sum('final_amount'))['total'] or 0
        revenue_month = Order.objects.filter(delivered_filter, created_at__gte=month_start).aggregate(
            total=Sum('final_amount'))['total'] or 0
        revenue_total = Order.objects.filter(delivered_filter).aggregate(
            total=Sum('final_amount'))['total'] or 0

        # Pending revenue (all non-cancelled orders)
        pending_revenue = Order.objects.exclude(
            status__in=[Order.Status.CANCELLED, Order.Status.RETURNED]
        ).aggregate(total=Sum('final_amount'))['total'] or 0

        # Orders by status
        orders_by_status = dict(
            Order.objects.values_list('status').annotate(count=Count('id')).values_list('status', 'count')
        )

        # New users
        new_users_today = User.objects.filter(date_joined__gte=today_start).count()
        new_users_month = User.objects.filter(date_joined__gte=month_start).count()
        total_users = User.objects.count()

        # Low stock products
        low_stock_products = list(
            Product.objects.filter(
                stock_quantity__lte=F('low_stock_threshold'),
                status='ACTIVE'
            ).values('id', 'name', 'sku', 'stock_quantity', 'low_stock_threshold')[:10]
        )

        # Recent orders
        recent_orders = list(
            Order.objects.order_by('-created_at')[:10].values(
                'id', 'full_name', 'status', 'final_amount', 'payment_method', 'created_at'
            )
        )

        # Top selling products (by quantity in last 30 days)
        from orders.models import OrderItem
        top_products = list(
            OrderItem.objects.filter(
                order__created_at__gte=month_start
            ).exclude(
                order__status=Order.Status.CANCELLED
            ).values('product_name').annotate(
                total_sold=Sum('quantity'),
                total_revenue=Sum('total_price')
            ).order_by('-total_sold')[:10]
        )

        return Response({
            'orders': {
                'today': orders_today,
                'week': orders_week,
                'month': orders_month,
                'total': orders_total,
                'by_status': orders_by_status,
            },
            'revenue': {
                'today': revenue_today,
                'week': revenue_week,
                'month': revenue_month,
                'total': revenue_total,
                'pending': pending_revenue,
            },
            'users': {
                'today': new_users_today,
                'month': new_users_month,
                'total': total_users,
            },
            'low_stock_products': low_stock_products,
            'recent_orders': recent_orders,
            'top_products': top_products,
        })


class AdminRevenueChartView(APIView):
    """
    GET /api/admin/dashboard/revenue-chart/?days=30
    Returns daily revenue data for charts.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        days = min(days, 365)  # Cap at 1 year

        now = timezone.now()
        start_date = now - timedelta(days=days)

        daily_revenue = (
            Order.objects.filter(
                created_at__gte=start_date
            ).exclude(
                status__in=[Order.Status.CANCELLED, Order.Status.RETURNED]
            ).annotate(
                date=TruncDate('created_at')
            ).values('date').annotate(
                revenue=Sum('final_amount'),
                order_count=Count('id')
            ).order_by('date')
        )

        daily_orders = (
            Order.objects.filter(
                created_at__gte=start_date
            ).annotate(
                date=TruncDate('created_at')
            ).values('date').annotate(
                total=Count('id'),
                cancelled=Count('id', filter=Q(status=Order.Status.CANCELLED))
            ).order_by('date')
        )

        return Response({
            'revenue': list(daily_revenue),
            'orders': list(daily_orders),
        })
