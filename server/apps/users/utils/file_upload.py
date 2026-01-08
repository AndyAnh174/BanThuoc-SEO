import os
import uuid
from django.conf import settings
from minio import Minio
from minio.error import S3Error
from datetime import datetime

class MinioHandler:
    def __init__(self):
        self.client = Minio(
            endpoint=settings.MINIO_ENDPOINT.replace('http://', '').replace('https://', ''),
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_USE_SSL if hasattr(settings, 'MINIO_USE_SSL') else False
        )
        self.bucket_name = settings.MINIO_BUCKET_NAME

    def upload_file(self, file_data, folder="licenses"):
        """
        Uploads a file to MinIO and returns the URL.
        file_data: The InMemoryUploadedFile object.
        folder: Target folder in the bucket.
        """
        try:
            # Generate a unique filename
            ext = os.path.splitext(file_data.name)[1]
            filename = f"{folder}/{datetime.now().strftime('%Y%m%d')}/{uuid.uuid4()}{ext}"
            
            # Ensure bucket exists
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)

            # Upload
            self.client.put_object(
                bucket_name=self.bucket_name,
                object_name=filename,
                data=file_data,
                length=file_data.size,
                content_type=file_data.content_type
            )

            # Generate URL (assuming public bucket or presigned)
            # For now returning the relative path or absolute URL depending on requirement.
            # Requirement says "return URL". Let's construct a direct URL if public.
            # If using localhost, constructing full URL might be tricky with Docker,
            # so often returning the object path or a proxy URL is better.
            # Let's return the full URL assuming it's accessible.
            
            base_url = settings.MINIO_ENDPOINT
            if not base_url.startswith('http'):
                 base_url = f"http://{base_url}"
                 
            return f"{base_url}/{self.bucket_name}/{filename}"

        except S3Error as e:
            print(f"MinIO Upload Error: {e}")
            raise e

def handle_license_upload(file_obj):
    handler = MinioHandler()
    return handler.upload_file(file_obj, folder="business_licenses")
