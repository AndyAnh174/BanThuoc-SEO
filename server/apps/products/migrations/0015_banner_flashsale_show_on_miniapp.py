# Generated migration: add show_on_miniapp to Banner and FlashSaleSession

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0014_add_retail_price_show_on_miniapp'),
    ]

    operations = [
        migrations.AddField(
            model_name='banner',
            name='show_on_miniapp',
            field=models.BooleanField(default=False, verbose_name='Hiển thị trên Mini App'),
        ),
        migrations.AddField(
            model_name='flashsalesession',
            name='show_on_miniapp',
            field=models.BooleanField(default=False, help_text='Hiển thị trên Mini App'),
        ),
    ]
