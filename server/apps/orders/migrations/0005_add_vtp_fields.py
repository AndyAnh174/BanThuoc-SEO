# Generated migration: add ViettelPost shipping fields

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('orders', '0004_add_ghn_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='vtp_order_code',
            field=models.CharField(blank=True, default='', max_length=50, verbose_name='VTP Order Code'),
        ),
        migrations.AddField(
            model_name='order',
            name='shipping_carrier',
            field=models.CharField(blank=True, default='', max_length=20, verbose_name='Shipping Carrier'),
        ),
    ]
