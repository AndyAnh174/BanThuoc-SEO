# Generated migration: add VNPay payment method and payment_txn_ref field

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('orders', '0002_returnrequest'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='payment_txn_ref',
            field=models.CharField(blank=True, default='', help_text='VNPay transaction reference', max_length=255),
        ),
        migrations.AlterField(
            model_name='order',
            name='payment_method',
            field=models.CharField(choices=[('COD', 'Cash on Delivery'), ('BANKING', 'Banking Transfer'), ('VNPAY', 'VNPay Online Payment')], default='COD', max_length=20),
        ),
    ]
