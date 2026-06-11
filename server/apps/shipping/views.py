"""
Shipping API views — GHN integration
"""
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .ghn_client import ghn, GHNError
from orders.models import Order


# ---- Address APIs (public) ----

class GHNProvinceListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            provinces = ghn.get_provinces()
            # Normalize: ensure list of dicts
            if isinstance(provinces, dict):
                provinces = [provinces]
            data = [{
                'id': p.get('ProvinceID'),
                'name': p.get('ProvinceName'),
                'code': p.get('Code'),
            } for p in provinces]
            return Response(data)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class GHNDistrictListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        province_id = request.query_params.get('province_id')
        if not province_id:
            return Response({'error': 'province_id is required'}, status=400)
        try:
            districts = ghn.get_districts(province_id)
            if isinstance(districts, dict):
                districts = [districts]
            data = [{
                'id': d.get('DistrictID'),
                'name': d.get('DistrictName'),
            } for d in districts]
            return Response(data)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class GHNWardListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        district_id = request.query_params.get('district_id')
        if not district_id:
            return Response({'error': 'district_id is required'}, status=400)
        try:
            wards = ghn.get_wards(district_id)
            if isinstance(wards, dict):
                wards = [wards]
            data = [{
                'code': w.get('WardCode'),
                'name': w.get('WardName'),
            } for w in wards]
            return Response(data)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


# ---- Fee Calculation (public) ----

class GHNCalculateFeeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            to_district_id = request.data.get('to_district_id')
            to_ward_code = request.data.get('to_ward_code')
            weight = request.data.get('weight', 200)
            cod_value = request.data.get('cod_value', 0)
            items = request.data.get('items')

            if not to_district_id or not to_ward_code:
                return Response({'error': 'to_district_id and to_ward_code required'}, status=400)

            result = ghn.calculate_fee(
                to_district_id=to_district_id,
                to_ward_code=to_ward_code,
                weight=max(int(weight), 200),  # min 200g
                cod_value=cod_value,
                items=items,
            )
            return Response(result.get('data', {}))
        except GHNError as e:
            return Response({'error': e.message}, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


# ---- Admin: Create GHN shipment ----

class GHNCreateShipmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        order = get_object_or_404(Order, pk=order_id)

        if request.user.role != 'ADMIN':
            return Response({'error': 'Admin only'}, status=403)

        if order.ghn_order_code:
            return Response({'error': 'Da co ma GHN: ' + order.ghn_order_code}, status=400)

        try:
            # Map order items to GHN items
            ghn_items = []
            total_weight = 0
            for item in order.items.all():
                w = 200  # default 200g per item
                ghn_items.append({
                    'name': item.product_name,
                    'code': item.product.sku if item.product else '',
                    'quantity': item.quantity,
                    'price': int(item.price),
                    'weight': w,
                })
                total_weight += w * item.quantity

            result = ghn.create_order({
                'to_name': order.full_name,
                'to_phone': order.phone_number,
                'to_address': order.address,
                'to_ward_name': _get_ward_name(order.ward),
                'to_district_name': order.district,
                'to_province_name': order.province,
                'payment_type_id': 2,  # receiver pays shipping
                'required_note': 'KHONGCHOXEMHANG',
                'weight': max(total_weight, 200),
                'length': 20,
                'width': 20,
                'height': 10,
                'cod_amount': int(order.final_amount) if order.payment_method == 'COD' else 0,
                'content': f'Don hang #{order.id}',
                'note': order.note or '',
                'items': ghn_items,
                'service_type_id': 2,
            })

            ghn_data = result.get('data', {})
            order.ghn_order_code = ghn_data.get('order_code', '')
            if ghn_data.get('expected_delivery_time'):
                from dateutil.parser import parse
                order.ghn_expected_delivery_time = parse(ghn_data['expected_delivery_time'])
            order.ghn_status = 'ready_to_pick'
            order.save(update_fields=['ghn_order_code', 'ghn_status', 'ghn_expected_delivery_time'])

            return Response({
                'order_code': order.ghn_order_code,
                'fee': ghn_data.get('fee', {}),
                'total_fee': ghn_data.get('total_fee', 0),
                'expected_delivery_time': str(ghn_data.get('expected_delivery_time', '')),
            })
        except GHNError as e:
            return Response({'error': e.message}, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class GHNPrintTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        order = get_object_or_404(Order, pk=order_id)

        if not order.ghn_order_code:
            return Response({'error': 'Chua co ma don GHN'}, status=400)

        try:
            result = ghn.print_token([order.ghn_order_code])
            token = result.get('data', {}).get('token', '')
            return Response({
                'token': token,
                'print_url': f'https://online-gateway.ghn.vn/a5/public-api/printA5?token={token}',
            })
        except GHNError as e:
            return Response({'error': e.message}, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


# ---- GHN Webhook Receiver ----

class GHNWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        """Receive GHN status callbacks, update order status."""
        order_code = request.data.get('OrderCode')
        ghn_status = request.data.get('Status', '')

        if not order_code:
            return Response({'error': 'Missing OrderCode'}, status=400)

        try:
            order = Order.objects.get(ghn_order_code=order_code)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)

        order.ghn_status = ghn_status

        # Map GHN status → Order status
        STATUS_MAP = {
            'ready_to_pick': Order.Status.CONFIRMED,
            'picking': Order.Status.PROCESSING,
            'picked': Order.Status.PROCESSING,
            'delivering': Order.Status.SHIPPING,
            'delivered': Order.Status.DELIVERED,
            'return': Order.Status.RETURNED,
            'returned': Order.Status.RETURNED,
            'cancel': Order.Status.CANCELLED,
        }
        mapped = STATUS_MAP.get(ghn_status)
        if mapped and order.status != mapped:
            order.status = mapped

        order.save()

        return Response({'status': 'ok'})


def _get_ward_name(ward_input):
    """Try to extract ward name from text or code."""
    if not ward_input:
        return ''
    # If it's a number, it might be a GHN ward code — try to look it up
    if str(ward_input).isdigit():
        try:
            # Try to fetch from GHN cache — not practical for all wards
            pass
        except Exception:
            pass
    # Return as-is (it might be a name already)
    return str(ward_input)


# ============================================================
# ViettelPost Views
# ============================================================

from .viettelpost_client import vtp, VTPError


class VTPProvinceListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            provinces = vtp.get_provinces()
            data = [{'id': p.get('PROVINCE_ID'), 'name': p.get('PROVINCE_NAME'),
                     'code': p.get('PROVINCE_CODE')} for p in provinces]
            return Response(data)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class VTPDistrictListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        province_id = request.query_params.get('province_id')
        if not province_id:
            return Response({'error': 'province_id required'}, status=400)
        try:
            districts = vtp.get_districts(province_id)
            data = [{'id': d.get('DISTRICT_ID'), 'name': d.get('DISTRICT_NAME')} for d in districts]
            return Response(data)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class VTPWardListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        district_id = request.query_params.get('district_id')
        if not district_id:
            return Response({'error': 'district_id required'}, status=400)
        try:
            wards = vtp.get_wards(district_id)
            data = [{'id': w.get('WARD_ID'), 'name': w.get('WARD_NAME')} for w in wards]
            return Response(data)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class VTPCalculateFeeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            result = vtp.calculate_fee(
                sender_province=request.data.get('sender_province', 1),
                sender_district=request.data.get('sender_district', 1),
                sender_ward=request.data.get('sender_ward', 1),
                receiver_province=request.data.get('receiver_province'),
                receiver_district=request.data.get('receiver_district'),
                receiver_ward=request.data.get('receiver_ward'),
                weight=request.data.get('weight', 500),
                money_collection=request.data.get('money_collection', 0),
            )
            return Response(result.get('data', {}))
        except VTPError as e:
            return Response({'error': e.message}, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class VTPCreateShipmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        order = get_object_or_404(Order, pk=order_id)
        if request.user.role != 'ADMIN':
            return Response({'error': 'Admin only'}, status=403)

        try:
            result = vtp.create_order({
                'ORDER_NUMBER': str(order.id),
                'PRODUCT_NAME': f'Don hang #{order.id}',
                'PRODUCT_TYPE': 'HH',
                'PRODUCT_WEIGHT': 500,
                'PRODUCT_QUANTITY': 1,
                'PRODUCT_PRICE': int(order.total_amount),
                'ORDER_PAYMENT': 1,
                'MONEY_COLLECTION': int(order.final_amount) if order.payment_method == 'COD' else 0,
                'ORDER_SERVICE': 'VHT',
                'ORDER_NOTE': order.note or '',
                'SENDER_FULLNAME': 'BanThuocSi NKN Pharma',
                'SENDER_PHONE': '0967705287',
                'SENDER_ADDRESS': '118/127C/27 Phan Huy Ich, P.Tan Son, TP.HCM',
                'SENDER_PROVINCE': request.data.get('sender_province', 1),
                'SENDER_DISTRICT': request.data.get('sender_district', 1),
                'SENDER_WARD': request.data.get('sender_ward', 1),
                'RECEIVER_FULLNAME': order.full_name,
                'RECEIVER_PHONE': order.phone_number,
                'RECEIVER_ADDRESS': order.address,
                'RECEIVER_PROVINCE': request.data.get('receiver_province'),
                'RECEIVER_DISTRICT': request.data.get('receiver_district'),
                'RECEIVER_WARD': request.data.get('receiver_ward'),
                'PRODUCT_LENGTH': 20, 'PRODUCT_WIDTH': 20, 'PRODUCT_HEIGHT': 10,
            })
            vtp_data = result.get('data', {})
            order.vtp_order_code = vtp_data.get('ORDER_NUMBER', '')
            order.shipping_carrier = 'VTP'
            order.save(update_fields=['vtp_order_code', 'shipping_carrier'])
            return Response({'order_number': order.vtp_order_code, 'fee': vtp_data.get('MONEY_TOTAL', 0)})
        except VTPError as e:
            return Response({'error': e.message}, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
