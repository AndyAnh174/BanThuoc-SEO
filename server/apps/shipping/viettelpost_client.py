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

    # ---- Address APIs ----

    def get_provinces(self):
        cache_key = 'vtp_provinces'
        cached = cache.get(cache_key)
        if cached: return cached
        data = self._get('/v2/address/listProvinces')
        result = data.get('data', [])
        if not isinstance(result, list): result = []
        cache.set(cache_key, result, 86400)
        return result

    def get_districts(self, province_id):
        cache_key = f'vtp_districts_{province_id}'
        cached = cache.get(cache_key)
        if cached: return cached
        data = self._get('/v2/address/listDistricts', {'provinceId': province_id})
        result = data.get('data', [])
        if not isinstance(result, list): result = []
        cache.set(cache_key, result, 86400)
        return result

    def get_wards(self, district_id):
        cache_key = f'vtp_wards_{district_id}'
        cached = cache.get(cache_key)
        if cached: return cached
        data = self._get('/v2/address/listWards', {'districtId': district_id})
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
