from rest_framework import serializers
from ..models import RewardPointLog

class RewardPointLogSerializer(serializers.ModelSerializer):
    """Serializer for Reward Point Logs."""
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")
    reason_display = serializers.CharField(source='get_reason_display', read_only=True)

    class Meta:
        model = RewardPointLog
        fields = ['id', 'points', 'reason', 'reason_display', 'description', 'created_at', 'related_order']
