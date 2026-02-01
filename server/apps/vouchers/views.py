"""
API views for Voucher system.
"""
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from drf_yasg import openapi
from decimal import Decimal
from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend

from vouchers.models import Voucher, UserVoucher
from vouchers.serializers import (
    VoucherSerializer,
    VoucherDetailSerializer,
    UserVoucherSerializer,
    ApplyVoucherRequestSerializer,
    ApplyVoucherResponseSerializer,
    ClaimVoucherRequestSerializer,
)
from vouchers.services import VoucherValidator, VoucherError


class ApplyVoucherView(APIView):
    """
    Apply/validate a voucher code.
    
    POST /api/vouchers/apply/
    
    Input: code, order_total
    Output: discount_amount, validation_result
    """
    permission_classes = [AllowAny]  # Allow guest checkout with vouchers

    @swagger_auto_schema(
        operation_summary="Apply voucher code",
        operation_description="Validate a voucher code and calculate discount amount",
        request_body=ApplyVoucherRequestSerializer,
        responses={
            200: ApplyVoucherResponseSerializer,
            400: openapi.Response(description="Invalid request")
        }
    )
    def post(self, request):
        serializer = ApplyVoucherRequestSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {'error': 'Invalid request', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = serializer.validated_data
        code = data['code']
        order_total = Decimal(str(data['order_total']))
        category_ids = data.get('category_ids', [])
        product_ids = data.get('product_ids', [])
        is_first_order = data.get('is_first_order', False)
        
        # Get user if authenticated
        user = request.user if request.user.is_authenticated else None
        
        # Validate voucher
        validator = VoucherValidator(code=code, user=user)
        result = validator.validate(
            order_total=order_total,
            category_ids=category_ids,
            product_ids=product_ids,
            is_first_order=is_first_order
        )
        
        # Remove voucher object from response (not serializable)
        result.pop('voucher', None)
        
        return Response(result)


class CheckVoucherView(APIView):
    """
    Quick check if a voucher code is valid.
    
    GET /api/vouchers/check/?code=SALE10
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="Check voucher validity",
        operation_description="Quick check if a voucher code exists and is valid",
        manual_parameters=[
            openapi.Parameter('code', openapi.IN_QUERY, description="Voucher code", type=openapi.TYPE_STRING, required=True),
        ],
        responses={200: VoucherSerializer}
    )
    def get(self, request):
        code = request.query_params.get('code', '').upper().strip()
        
        if not code:
            return Response(
                {'error': 'code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            voucher = Voucher.objects.get(code=code)
            
            # Basic validity info
            response = {
                'exists': True,
                'valid': voucher.is_valid,
                'voucher': VoucherSerializer(voucher).data if voucher.is_valid else None,
            }
            
            if not voucher.is_valid:
                if voucher.is_expired:
                    response['reason'] = 'expired'
                elif voucher.status != Voucher.Status.ACTIVE:
                    response['reason'] = 'inactive'
                elif voucher.usage_limit and voucher.usage_count >= voucher.usage_limit:
                    response['reason'] = 'used_up'
            
            return Response(response)
            
        except Voucher.DoesNotExist:
            return Response({
                'exists': False,
                'valid': False,
                'voucher': None,
                'reason': 'not_found'
            })


class AvailableVouchersView(generics.ListAPIView):
    """
    List all currently available vouchers.
    
    GET /api/vouchers/available/
    """
    permission_classes = [AllowAny]
    serializer_class = VoucherSerializer

    def get_queryset(self):
        now = timezone.now()
        return Voucher.objects.filter(
            status=Voucher.Status.ACTIVE,
            start_date__lte=now,
            end_date__gte=now,
        ).order_by('-discount_value')


class VoucherDetailView(generics.RetrieveAPIView):
    """
    Get voucher details by code.
    
    GET /api/vouchers/<code>/
    """
    permission_classes = [AllowAny]
    serializer_class = VoucherDetailSerializer
    lookup_field = 'code'

    def get_queryset(self):
        return Voucher.objects.filter(status=Voucher.Status.ACTIVE)


class UserVouchersView(generics.ListAPIView):
    """
    List user's claimed vouchers.
    
    GET /api/vouchers/my/
    
    Requires authentication.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserVoucherSerializer

    def get_queryset(self):
        return UserVoucher.objects.filter(
            user=self.request.user
        ).select_related('voucher').order_by('-claimed_at')


class ClaimVoucherView(APIView):
    """
    Claim/save a voucher to user's account.
    
    POST /api/vouchers/claim/
    
    Requires authentication.
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Claim a voucher",
        operation_description="Save a voucher to user's account for later use",
        request_body=ClaimVoucherRequestSerializer,
        responses={
            200: UserVoucherSerializer,
            400: openapi.Response(description="Invalid voucher"),
            409: openapi.Response(description="Already claimed")
        }
    )
    def post(self, request):
        serializer = ClaimVoucherRequestSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {'error': 'Invalid request', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        code = serializer.validated_data['code'].upper().strip()
        
        try:
            voucher = Voucher.objects.get(code=code)
        except Voucher.DoesNotExist:
            return Response(
                {'error': 'Voucher not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if voucher is valid
        if not voucher.is_valid:
            return Response(
                {'error': 'Voucher is not valid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already claimed
        existing = UserVoucher.objects.filter(
            user=request.user,
            voucher=voucher
        ).first()
        
        if existing:
            return Response(
                {
                    'error': 'Already claimed',
                    'user_voucher': UserVoucherSerializer(existing).data
                },
                status=status.HTTP_409_CONFLICT
            )
        
        # Create user voucher
        user_voucher = UserVoucher.objects.create(
            user=request.user,
            voucher=voucher,
            status=UserVoucher.Status.CLAIMED
        )
        
        return Response(
            UserVoucherSerializer(user_voucher).data,
            status=status.HTTP_201_CREATED
        )


class CalculateDiscountView(APIView):
    """
    Calculate discount for given products/order.
    
    POST /api/vouchers/calculate/
    
    For cart page to show potential discount without applying.
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="Calculate potential discount",
        operation_description="Calculate discount without applying the voucher",
        request_body=ApplyVoucherRequestSerializer,
        responses={200: ApplyVoucherResponseSerializer}
    )
    def post(self, request):
        serializer = ApplyVoucherRequestSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {'error': 'Invalid request', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = serializer.validated_data
        code = data['code']
        order_total = Decimal(str(data['order_total']))
        
        # Get user if authenticated
        user = request.user if request.user.is_authenticated else None
        
        # Just calculate, don't apply
        validator = VoucherValidator(code=code, user=user)
        result = validator.validate(
            order_total=order_total,
            category_ids=data.get('category_ids', []),
            product_ids=data.get('product_ids', []),
            is_first_order=data.get('is_first_order', False)
        )
        
        result.pop('voucher', None)
        
        return Response(result)


class AdminVoucherViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for managing vouchers.
    
    CRUD for Vouchers.
    """
    queryset = Voucher.objects.all()
    serializer_class = VoucherSerializer
    permission_classes = [permissions.IsAuthenticated] # Should be IsAdminUser eventually
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'discount_type']
    search_fields = ['code', 'name']
    ordering_fields = ['created_at', 'end_date', 'usage_count']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
