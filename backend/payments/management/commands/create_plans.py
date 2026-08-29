from django.core.management.base import BaseCommand
from payments.models import Plan


class Command(BaseCommand):
    help = 'Create/update subscription plans with production pricing (₹499, ₹999, ₹1499)'

    def handle(self, *args, **options):
        plans = [
            {
                'name': 'FREE',
                'display_name': 'Free',
                'max_cards': 4,
                'price': 0.00,
                'description': 'Get started'
            },
            {
                'name': 'SILVER',
                'display_name': 'Silver',
                'max_cards': 10,
                'price': 499.00,  # Production price
                'description': 'For small families'
            },
            {
                'name': 'GOLD',
                'display_name': 'Gold',
                'max_cards': 18,
                'price': 999.00,  # Production price
                'description': 'For growing families'
            },
            {
                'name': 'DIAMOND',
                'display_name': 'Diamond',
                'max_cards': 999999,  # Unlimited
                'price': 1499.00,  # Production price
                'description': 'Unlimited cards'
            }
        ]

        for plan_data in plans:
            plan, created = Plan.objects.update_or_create(
                name=plan_data['name'],
                defaults={
                    'display_name': plan_data['display_name'],
                    'max_cards': plan_data['max_cards'],
                    'price': plan_data['price'],
                    'description': plan_data['description']
                }
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created plan: {plan.display_name} (₹{plan.price})')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'⚠ Updated plan: {plan.display_name} (₹{plan.price})')
                )

        self.stdout.write(
            self.style.SUCCESS('\n✅ All subscription plans are ready for production!')
        )
        self.stdout.write(
            self.style.SUCCESS('\n💰 Production prices: Silver ₹499, Gold ₹999, Diamond ₹1499')
        )
