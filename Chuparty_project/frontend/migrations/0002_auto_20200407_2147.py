# Generated by Django 2.2.12 on 2020-04-07 18:47

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('frontend', '0001_initial'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Course',
        ),
        migrations.DeleteModel(
            name='Subject',
        ),
    ]