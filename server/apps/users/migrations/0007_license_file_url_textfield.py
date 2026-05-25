# Generated manually to change license_file_url from CharField to TextField

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_address'),
    ]

    operations = [
        migrations.AlterField(
            model_name='businessprofile',
            name='license_file_url',
            field=models.TextField(help_text='JSON array of URLs to license files in storage'),
        ),
    ]
