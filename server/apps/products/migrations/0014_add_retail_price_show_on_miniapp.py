# Generated — add retail_price + show_on_miniapp for Mini App B2C

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0013_banner_promo_position"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="retail_price",
            field=models.DecimalField(blank=True, decimal_places=0, help_text="B2C retail price for Mini App", max_digits=12, null=True),
        ),
        migrations.AddField(
            model_name="product",
            name="show_on_miniapp",
            field=models.BooleanField(default=False, help_text="Show on Mini App (B2C retail)"),
        ),
    ]
