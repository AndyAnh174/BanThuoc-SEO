# Generated migration: add GHN shipping fields to Order

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('orders', '0003_add_vnpay_support'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='ghn_order_code',
            field=models.CharField(blank=True, default='', max_length=50, verbose_name='GHN Order Code'),
        ),
        migrations.AddField(
            model_name='order',
            name='ghn_status',
            field=models.CharField(blank=True, default='', max_length=30, verbose_name='GHN Status'),
        ),
        migrations.AddField(
            model_name='order',
            name='ghn_expected_delivery_time',
            field=models.DateTimeField(blank=True, null=True, verbose_name='GHN Expected Delivery'),
        ),
    ]
