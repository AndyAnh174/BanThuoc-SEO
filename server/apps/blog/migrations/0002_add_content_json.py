# Add content_json field to store raw Editor.js blocks for editing
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='blogpost',
            name='content_json',
            field=models.JSONField(blank=True, default=dict, help_text='Raw Editor.js JSON blocks for editing'),
        ),
    ]
