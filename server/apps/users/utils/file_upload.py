import os
import uuid
from django.conf import settings
from minio import Minio
from minio.error import S3Error
from datetime import datetime, timedelta

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
                self._set_public_policy()
            
            # Check/Set policy if needed (simple check for existing buckets in dev)
            self._set_public_policy() # Uncomment to force update existing bucket

            # Upload
            self.client.put_object(
                bucket_name=self.bucket_name,
                object_name=filename,
                data=file_data,
                length=file_data.size,
                content_type=file_data.content_type
            )

            # Generate URL (assuming public bucket or presigned)
            env_public = os.environ.get('MINIO_PUBLIC_ENDPOINT')
            base_url = env_public if env_public else getattr(settings, 'MINIO_PUBLIC_ENDPOINT', settings.MINIO_ENDPOINT)
            
            # Ensure protocol
            if not base_url.startswith('http'):
                 base_url = f"https://{base_url}" # Default to secure if missing
                 
            # Ensure no trailing slash
            if base_url.endswith('/'):
                base_url = base_url[:-1]

            return f"{base_url}/{self.bucket_name}/{filename}"

        except S3Error as e:
            print(f"MinIO Upload Error: {e}")
            raise e

    def _set_public_policy(self):
        import json
        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {"AWS": ["*"]},
                    "Action": ["s3:GetObject"],
                    "Resource": [f"arn:aws:s3:::{self.bucket_name}/*"]
                }
            ]
        }
        try:
            self.client.set_bucket_policy(self.bucket_name, json.dumps(policy))
        except Exception as e:
            print(f"Error setting bucket policy: {e}")

    def get_presigned_url(self, object_name):
        """
        Generates a presigned URL using public endpoint so signature matches.
        """
        try:
            public_endpoint = os.environ.get('MINIO_PUBLIC_ENDPOINT') or getattr(settings, 'MINIO_PUBLIC_ENDPOINT', None)
            if public_endpoint:
                # Use public endpoint client so signature is computed with public host
                public_host = public_endpoint.replace('https://', '').replace('http://', '').rstrip('/')
                is_ssl = public_endpoint.startswith('https://')
                public_client = Minio(
                    endpoint=public_host,
                    access_key=settings.MINIO_ACCESS_KEY,
                    secret_key=settings.MINIO_SECRET_KEY,
                    secure=is_ssl
                )
                return public_client.get_presigned_url(
                    "GET",
                    self.bucket_name,
                    object_name,
                    expires=timedelta(hours=1)
                )
            # Fallback: use internal client
            return self.client.get_presigned_url(
                "GET",
                self.bucket_name,
                object_name,
                expires=timedelta(hours=1)
            )
        except Exception as e:
            print(f"Error generating presigned URL: {e}")
            return None

def handle_license_upload(file_obj):
    handler = MinioHandler()
    return handler.upload_file(file_obj, folder="business_licenses")
