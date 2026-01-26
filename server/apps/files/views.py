from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status
from django.utils.decorators import method_decorator
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .services import MinioService

class FileUploadView(APIView):
    """
    Upload a file to MinIO storage.
    """
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated] # Or IsAdminUser depending on needs

    @swagger_auto_schema(
        operation_summary="Upload file",
        manual_parameters=[
            openapi.Parameter(
                name="file",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_FILE,
                required=True,
                description="File to upload"
            ),
            openapi.Parameter(
                name="folder",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=False,
                description="Target folder (default: uploads)"
            )
        ],
        responses={200: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'url': openapi.Schema(type=openapi.TYPE_STRING),
                'filename': openapi.Schema(type=openapi.TYPE_STRING)
            }
        )}
    )
    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        folder = request.data.get('folder', 'uploads')
        
        try:
            minio_service = MinioService()
            url = minio_service.upload_file(file_obj, folder=folder)
            
            return Response({
                "url": url,
                "filename": file_obj.name
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
