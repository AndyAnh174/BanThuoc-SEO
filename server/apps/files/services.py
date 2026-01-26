from django.conf import settings
from minio import Minio
from minio.error import S3Error
import uuid
import os
from datetime import datetime

class MinioService:
    def __init__(self):
        # Remove 'http://' or 'https://' from endpoint for Minio client
        endpoint = settings.MINIO_ENDPOINT.replace('http://', '').replace('https://', '')
        
        self.client = Minio(
            endpoint=endpoint,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=False  # Local development usually HTTP
        )
        self.bucket_name = settings.MINIO_BUCKET_NAME
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                # Set public policy just in case
                policy = '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":["*"]},"Action":["s3:GetBucketLocation","s3:ListBucket","s3:ListBucketMultipartUploads"],"Resource":["arn:aws:s3:::%s"]},{"Effect":"Allow","Principal":{"AWS":["*"]},"Action":["s3:GetObject","s3:PutObject","s3:DeleteObject","s3:ListMultipartUploadParts","s3:AbortMultipartUpload"],"Resource":["arn:aws:s3:::%s/*"]}]}' % (self.bucket_name, self.bucket_name)
                self.client.set_bucket_policy(self.bucket_name, policy)
        except S3Error as err:
            print(f"MinIO bucket error: {err}")

    def upload_file(self, file_obj, folder="uploads"):
        """
        Uploads a file to MinIO and returns the public URL.
        """
        # Generate unique filename
        ext = os.path.splitext(file_obj.name)[1]
        filename = f"{folder}/{datetime.now().strftime('%Y/%m/%d')}/{uuid.uuid4()}{ext}"
        
        # Upload
        self.client.put_object(
            self.bucket_name,
            filename,
            file_obj,
            file_obj.size,
            content_type=file_obj.content_type
        )
        
        # Return URL
        # We need to construct the URL manually because client.presigned_get_object is for private objects
        # For public objects: http://localhost:9000/bucket-name/filename
        protocol = "http" # or https if configured
        # Use settings.MINIO_ENDPOINT which includes protocol
        base_url = settings.MINIO_ENDPOINT
        return f"{base_url}/{self.bucket_name}/{filename}"
