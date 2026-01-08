from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from ..serializers.registration import RegisterB2BSerializer

class RegisterB2BView(generics.CreateAPIView):
    # This view handles Business-to-Business Registration
    serializer_class = RegisterB2BSerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "message": "Registration successful. Please wait for admin approval.",
            "user_id": user.id,
            "email": user.email,
            "status": user.status
        }, status=status.HTTP_201_CREATED)
