import os
from minio import Minio
from minio.error import S3Error

# Configuration - update these if your .env is different
MINIO_ENDPOINT = "localhost:9000"
MINIO_ACCESS_KEY = "minioadmin"
MINIO_SECRET_KEY = "minioadmin"
BUCKET_NAME = "banthuoc-media"

def main():
    # Initialize MinIO client
    client = Minio(
        MINIO_ENDPOINT,
        access_key=MINIO_ACCESS_KEY,
        secret_key=MINIO_SECRET_KEY,
        secure=False  # HTTP
    )

    print(f"Connecting to MinIO at {MINIO_ENDPOINT}...")

    # Check if bucket exists
    if not client.bucket_exists(BUCKET_NAME):
        print(f"Bucket '{BUCKET_NAME}' does not exist. Please run docker-compose up first.")
        return
    else:
        print(f"Bucket '{BUCKET_NAME}' found.")

    # Create a test file
    test_file = "test_minio_upload.txt"
    with open(test_file, "w") as f:
        f.write("This is a test file for MinIO upload/retrieve.")

    object_name = "public/test_file.txt"

    try:
        # Upload
        print(f"Uploading {test_file} to {BUCKET_NAME}/{object_name}...")
        client.fput_object(BUCKET_NAME, object_name, test_file)
        print("Upload successful.")

        # Test Public Access (since we set policy to download for public folder)
        import requests
        public_url = f"http://{MINIO_ENDPOINT}/{BUCKET_NAME}/{object_name}"
        print(f"Testing public access at: {public_url}")
        
        response = requests.get(public_url)
        if response.status_code == 200:
            print("Public retrieval successful! Content:")
            print(response.text)
        else:
            print(f"Public retrieval failed with status code: {response.status_code}")

    except S3Error as e:
        print("MinIO Error:", e)
    except Exception as e:
        print("Error:", e)
    finally:
        # Cleanup local file
        if os.path.exists(test_file):
            os.remove(test_file)

if __name__ == "__main__":
    main()
