# Generated by Django 4.2.6 on 2024-10-03 08:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0006_payment_address_payment_email_payment_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='payment',
            name='address',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='payment',
            name='email',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='payment',
            name='name',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
