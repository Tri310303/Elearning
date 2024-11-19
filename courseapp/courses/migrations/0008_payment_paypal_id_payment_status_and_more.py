# Generated by Django 4.2.6 on 2024-10-04 08:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0007_alter_payment_address_alter_payment_email_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='paypal_id',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='payment',
            name='status',
            field=models.CharField(default='Pending', max_length=50),
        ),
        migrations.AlterUniqueTogether(
            name='payment',
            unique_together={('user', 'book')},
        ),
    ]
