"""
File Upload API Views
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from users.utils.file_upload import MinioHandler


class FileUploadView(APIView):
    """
    Upload file to MinIO storage.
    Returns the public URL of the uploaded file.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @swagger_auto_schema(
        operation_summary="Upload file",
        operation_description="Upload a file to MinIO storage. Returns the URL.",
        manual_parameters=[
            openapi.Parameter(
                'file',
                openapi.IN_FORM,
                description="File to upload",
                type=openapi.TYPE_FILE,
                required=True
            ),
            openapi.Parameter(
                'folder',
                openapi.IN_FORM,
                description="Target folder (default: uploads)",
                type=openapi.TYPE_STRING,
                required=False
            ),
        ],
        responses={
            201: openapi.Response(
                description="File uploaded successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'url': openapi.Schema(type=openapi.TYPE_STRING),
                        'filename': openapi.Schema(type=openapi.TYPE_STRING),
                    }
                )
            ),
            400: "Bad Request - No file provided",
            401: "Unauthorized",
        },
        tags=['Files']
    )
    def post(self, request):
        file = request.FILES.get('file')
        folder = request.data.get('folder', 'uploads')

        if not file:
            return Response(
                {"error": "No file provided"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if file.size > max_size:
            return Response(
                {"error": "File size exceeds 10MB limit"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file type for images
        allowed_types = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf',  # Also allow PDFs for documents
        ]
        if file.content_type not in allowed_types:
            return Response(
                {"error": f"File type {file.content_type} not allowed. Allowed: {', '.join(allowed_types)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            handler = MinioHandler()
            url = handler.upload_file(file, folder=folder)
            
            return Response({
                "url": url,
                "filename": file.name,
                "size": file.size,
                "content_type": file.content_type
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {"error": f"Upload failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FileDeleteView(APIView):
    """
    Delete file from MinIO storage.
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="Delete file",
        operation_description="Delete a file from MinIO storage (Admin only)",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'url': openapi.Schema(type=openapi.TYPE_STRING, description='URL of file to delete'),
            },
            required=['url']
        ),
        tags=['Files']
    )
    def post(self, request):
        url = request.data.get('url')
        
        if not url:
            return Response(
                {"error": "URL is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            handler = MinioHandler()
            # Extract object name from URL
            # URL format: http://minio:9000/bucket-name/folder/filename
            parts = url.split(f"/{handler.bucket_name}/")
            if len(parts) != 2:
                return Response(
                    {"error": "Invalid URL format"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            object_name = parts[1]
            handler.client.remove_object(handler.bucket_name, object_name)
            
            return Response({"message": "File deleted successfully"})
            
        except Exception as e:
            return Response(
                {"error": f"Delete failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
