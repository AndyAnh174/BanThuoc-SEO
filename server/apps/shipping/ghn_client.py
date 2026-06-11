"""
GHN (Giao Hang Nhanh) API Client
Docs: docs/api/ghn/README.md
"""
import requests
from django.conf import settings
from django.core.cache import cache


class GHNClient:
    """Thin wrapper around GHN v2 API"""

    def __init__(self):
        self.token = settings.GHN_TOKEN
        self.shop_id = settings.GHN_SHOP_ID
        self.base_url = settings.GHN_BASE_URL  # v2 API
        # master-data APIs are NOT under /v2/ — they use a different base
        self.md_base = self.base_url.rsplit('/v2', 1)[0]  # strip /v2
        self.test_mode = getattr(settings, 'GHN_TEST_MODE', True)

    def _url(self, path):
        return f"{self.base_url}/{path}"

    def _md_url(self, path):
        """URL for master-data endpoints (no /v2 prefix)"""
        return f"{self.md_base}/{path}"

    def _headers(self, with_shop=False):
        h = {
            'Content-Type': 'application/json',
            'Token': self.token,
        }
        if with_shop:
            h['ShopId'] = str(self.shop_id)
        return h

    def _get(self, path, params=None):
        r = requests.get(self._url(path), headers=self._headers(), params=params, timeout=15)
        r.raise_for_status()
        return r.json()

    def _post(self, path, body, with_shop=False):
        r = requests.post(self._url(path), headers=self._headers(with_shop), json=body, timeout=15)
        data = r.json()
        if data.get('code') != 200:
            raise GHNError(data.get('code', r.status_code),
                          data.get('message', '') + ' | ' + data.get('code_message_value', ''))
        return data

    # ---- Address APIs (cached 24h) ----

    def get_provinces(self):
        cache_key = 'ghn_provinces'
        cached = cache.get(cache_key)
        if cached:
            return cached
        r = requests.get(self._md_url('master-data/province'), headers=self._headers(), timeout=15)
        r.raise_for_status()
        data = r.json()
        result = data.get('data', [])
        cache.set(cache_key, result, 86400)
        return result

    def get_districts(self, province_id):
        cache_key = f'ghn_districts_{province_id}'
        cached = cache.get(cache_key)
        if cached:
            return cached
        r = requests.post(self._md_url('master-data/district'), headers=self._headers(), json={'province_id': int(province_id)}, timeout=15)
        r.raise_for_status()
        data = r.json()
        result = data.get('data', [])
        cache.set(cache_key, result, 86400)
        return result

    def get_wards(self, district_id):
        cache_key = f'ghn_wards_{district_id}'
        cached = cache.get(cache_key)
        if cached:
            return cached
        r = requests.post(self._md_url('master-data/ward'), headers=self._headers(), json={'district_id': int(district_id)}, timeout=15)
        r.raise_for_status()
        data = r.json()
        result = data.get('data', [])
        cache.set(cache_key, result, 86400)
        return result

    # ---- Fee & Services ----

    def calculate_fee(self, *, to_district_id, to_ward_code, weight,
                      length=20, width=20, height=10, insurance_value=0,
                      cod_value=0, service_type_id=2, items=None):
        body = {
            'service_type_id': service_type_id,
            'to_district_id': int(to_district_id),
            'to_ward_code': str(to_ward_code),
            'weight': int(weight),
            'length': int(length),
            'width': int(width),
            'height': int(height),
            'insurance_value': int(insurance_value),
            'cod_value': int(cod_value),
        }
        if items:
            body['items'] = items
        return self._post('shipping-order/fee', body, with_shop=True)

    def get_services(self, from_district_id, to_district_id):
        return self._post('shipping-order/available-services', {
            'shop_id': int(self.shop_id),
            'from_district': int(from_district_id),
            'to_district': int(to_district_id),
        }, with_shop=True)

    # ---- Order APIs ----

    def create_order(self, order_data):
        """
        Create GHN shipment.
        order_data dict must include: to_name, to_phone, to_address,
        to_ward_code, to_district_id, service_type_id, payment_type_id,
        required_note, weight, length, width, height, cod_amount, content, items
        """
        return self._post('shipping-order/create', order_data, with_shop=True)

    def get_order(self, order_code):
        return self._post('shipping-order/detail', {'order_code': order_code}, with_shop=True)

    def cancel_order(self, order_codes):
        return self._post('switch-status/cancel', {'order_codes': order_codes}, with_shop=True)

    # ---- Print ----

    def print_token(self, order_codes):
        return self._post('a5/gen-token', {'order_codes': order_codes}, with_shop=True)

    # ---- Pick shift ----

    def get_pick_shifts(self):
        return self._get('shift/date')


class GHNError(Exception):
    def __init__(self, code, message):
        self.code = code
        self.message = message
        super().__init__(f"GHN Error {code}: {message}")


# Singleton
ghn = GHNClient()
