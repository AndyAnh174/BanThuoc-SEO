import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.prod')

# Add project root to sys.path
sys.path.append('/app')

django.setup()

from django.conf import settings
from apps.files.services import MinioService
from django.core.files.uploadedfile import SimpleUploadedFile

def test_upload():
    print("--- Starting MinIO Verification ---")
    print(f"Settings MINIO_PUBLIC_ENDPOINT: {getattr(settings, 'MINIO_PUBLIC_ENDPOINT', 'NOT SET')}")
    print(f"Environment MINIO_PUBLIC_ENDPOINT: {os.environ.get('MINIO_PUBLIC_ENDPOINT', 'NOT SET')}")
    
    try:
        service = MinioService()
        print(f"MinioService initialized. Bucket: {service.bucket_name}")
        
        # Create dummy file
        content = SimpleUploadedFile("verify_test.txt", b"test content verification", content_type="text/plain")
        
        url = service.upload_file(content)
        
        print(f"SUCCESS! Generated URL: {url}")
        
    except Exception as e:
        print(f"FAILURE! Error: {e}")

if __name__ == "__main__":
    test_upload()
