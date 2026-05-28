# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0010_review"),
    ]

    operations = [
        migrations.AddField(
            model_name="banner",
            name="display_position",
            field=models.CharField(
                choices=[("HERO", "Hero Banner"), ("ROW", "Banner Row")],
                default="HERO",
                max_length=10,
                verbose_name="Vị trí hiển thị",
            ),
        ),
    ]
