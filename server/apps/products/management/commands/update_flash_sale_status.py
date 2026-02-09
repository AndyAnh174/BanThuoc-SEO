"""
Management command to update Flash Sale session statuses.
Run this periodically via cron to auto-transition sessions.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from products.models import FlashSaleSession


class Command(BaseCommand):
    help = 'Update Flash Sale session statuses based on current time'

    def handle(self, *args, **options):
        now = timezone.now()
        self.stdout.write(f'Current time: {now}')

        # Activate scheduled sessions that have started
        scheduled_to_activate = FlashSaleSession.objects.filter(
            status=FlashSaleSession.Status.SCHEDULED,
            is_active=True,
            start_time__lte=now,
            end_time__gte=now
        )
        for session in scheduled_to_activate:
            session.status = FlashSaleSession.Status.ACTIVE
            session.save(update_fields=['status', 'updated_at'])
            self.stdout.write(self.style.SUCCESS(f'Activated: {session.name}'))

        # End active sessions that have finished
        active_to_end = FlashSaleSession.objects.filter(
            status=FlashSaleSession.Status.ACTIVE,
            end_time__lt=now
        )
        for session in active_to_end:
            session.status = FlashSaleSession.Status.ENDED
            session.save(update_fields=['status', 'updated_at'])
            self.stdout.write(self.style.SUCCESS(f'Ended: {session.name}'))

        # End scheduled sessions that never started and have passed
        old_scheduled = FlashSaleSession.objects.filter(
            status=FlashSaleSession.Status.SCHEDULED,
            end_time__lt=now
        )
        for session in old_scheduled:
            session.status = FlashSaleSession.Status.ENDED
            session.save(update_fields=['status', 'updated_at'])
            self.stdout.write(self.style.SUCCESS(f'Marked as ended: {session.name}'))

        self.stdout.write(self.style.SUCCESS('Flash sale status update complete!'))
