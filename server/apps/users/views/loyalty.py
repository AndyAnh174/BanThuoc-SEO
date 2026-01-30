from rest_framework import generics, permissions
from ..models import RewardPointLog
from ..serializers.loyalty import RewardPointLogSerializer

class UserPointLogListView(generics.ListAPIView):
    """
    List reward point history for the current user.
    GET /api/me/points/
    """
    serializer_class = RewardPointLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RewardPointLog.objects.filter(user=self.request.user)
