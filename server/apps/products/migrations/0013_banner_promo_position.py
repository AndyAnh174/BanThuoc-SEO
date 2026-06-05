from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [("products", "0012_product_is_best_selling")]
    operations = [
        migrations.AlterField(
            model_name="banner",
            name="display_position",
            field=models.CharField(
                choices=[("HERO", "Hero Banner"), ("ROW", "Banner Row"), ("PROMO", "Promo Banner")],
                default="HERO", max_length=10, verbose_name="Vị trí hiển thị",
            ),
        ),
    ]
