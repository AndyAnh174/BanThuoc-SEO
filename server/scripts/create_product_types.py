from products.models.product_type import ProductType

types = [
    {"name": "Thuốc", "code": "MEDICINE", "description": "Sản phẩm là thuốc chữa bệnh"},
    {"name": "Thực phẩm chức năng", "code": "SUPPLEMENT", "description": "Sản phẩm bổ trợ sức khỏe"},
    {"name": "Thiết bị y tế", "code": "MEDICAL_DEVICE", "description": "Dụng cụ, thiết bị y tế"},
    {"name": "Mỹ phẩm", "code": "COSMETIC", "description": "Sản phẩm làm đẹp"},
    {"name": "Khác", "code": "OTHER", "description": "Các sản phẩm khác"},
]

for t in types:
    obj, created = ProductType.objects.get_or_create(
        code=t['code'],
        defaults={"name": t['name'], "description": t['description']}
    )
    if created:
        print(f"Created: {t['name']}")
    else:
        print(f"Exists: {t['name']}")
