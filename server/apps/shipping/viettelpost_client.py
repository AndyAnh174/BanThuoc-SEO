"""
ViettelPost API Client
Docs: docs/api/viettelpost/README.md
"""
import requests
from django.conf import settings
from django.core.cache import cache


class ViettelPostClient:
    """Thin wrapper around ViettelPost Partner API"""

    def __init__(self):
        self.token = settings.VTP_TOKEN
        self.base_url = settings.VTP_BASE_URL

    def _headers(self):
        return {
            'Content-Type': 'application/json;charset=UTF-8',
            'Token': self.token,
        }

    def _post(self, path, body):
        r = requests.post(f'{self.base_url}{path}', headers=self._headers(), json=body, timeout=15)
        data = r.json()
        if data.get('error') or data.get('status') not in (200, 201):
            raise VTPError(data.get('status', r.status_code), data.get('message', 'Unknown'))
        return data

    def _get(self, path, params=None):
        r = requests.get(f'{self.base_url}{path}', headers=self._headers(), params=params, timeout=15)
        return r.json()

    # ---- Address APIs (V3 - no auth, 34 provinces, 2-level) ----

    def get_provinces_v3(self):
        """V3 provinces — no auth required, returns 34 provinces"""
        cache_key = 'vtp_v3_provinces'
        cached = cache.get(cache_key)
        if cached: return cached
        r = requests.get(f'{self.base_url}/v3/categories/listProvinceNew', timeout=15)
        data = r.json()
        result = data.get('data', [])
        if not isinstance(result, list): result = []
        cache.set(cache_key, result, 86400)
        return result

    def get_wards_v3(self, province_id):
        """V3 wards — no auth required, direct province→ward"""
        cache_key = f'vtp_v3_wards_{province_id}'
        cached = cache.get(cache_key)
        if cached: return cached
        r = requests.get(f'{self.base_url}/v3/categories/listWardsNew?provinceId={province_id}', timeout=15)
        data = r.json()
        result = data.get('data', [])
        if not isinstance(result, list): result = []
        cache.set(cache_key, result, 86400)
        return result

    # ---- Fee ----

    def calculate_fee(self, *, sender_province, sender_district, sender_ward,
                      receiver_province, receiver_district, receiver_ward,
                      weight=500, product_type='HH', national_type=1,
                      order_service='VHT', money_collection=0, product_price=0,
                      length=20, width=20, height=10):
        return self._post('/v2/order/getPrice', {
            'SENDER_PROVINCE': int(sender_province),
            'SENDER_DISTRICT': int(sender_district),
            'SENDER_WARD': int(sender_ward),
            'RECEIVER_PROVINCE': int(receiver_province),
            'RECEIVER_DISTRICT': int(receiver_district),
            'RECEIVER_WARD': int(receiver_ward),
            'PRODUCT_TYPE': product_type,
            'PRODUCT_WEIGHT': int(weight),
            'PRODUCT_PRICE': int(product_price),
            'MONEY_COLLECTION': int(money_collection),
            'NATIONAL_TYPE': national_type,
            'PRODUCT_LENGTH': int(length),
            'PRODUCT_WIDTH': int(width),
            'PRODUCT_HEIGHT': int(height),
            'ORDER_SERVICE': order_service,
        })

    # ---- Order ----

    def create_order(self, order_data):
        return self._post('/v2/order/createOrder', order_data)

    def get_order(self, order_number):
        return self._post('/v2/order/getOrderDetail', {'ORDER_NUMBER': order_number})

    def cancel_order(self, order_number):
        return self._post('/v2/order/cancelOrder', {'ORDER_NUMBER': order_number})

    # ---- Print ----

    def get_print_url(self, order_numbers):
        return self._post('/v2/order/printBill', {'ORDER_NUMBER': order_numbers})


class VTPError(Exception):
    def __init__(self, code, message):
        self.code = code
        self.message = message
        super().__init__(f'VTP Error {code}: {message}')


vtp = ViettelPostClient()
