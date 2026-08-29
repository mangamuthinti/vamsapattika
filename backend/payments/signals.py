from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Plan, UserSubscription

User = get_user_model()


@receiver(post_save, sender=User)
def create_user_subscription(sender, instance, created, **kwargs):
    """Automatically assign FREE plan to new users"""
    if created:
        try:
            free_plan = Plan.objects.get(name='FREE')
            UserSubscription.objects.create(
                user=instance,
                plan=free_plan,
                is_active=True
            )
        except Plan.DoesNotExist:
            pass  # FREE plan not found, skip
