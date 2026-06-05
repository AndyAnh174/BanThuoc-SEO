from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [("products", "0011_banner_display_position")]
    operations = [
        migrations.AddField(
            model_name="product",
            name="is_best_selling",
            field=models.BooleanField(default=False, help_text="Best selling product"),
        ),
    ]
