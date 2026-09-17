from django.core.management.base import BaseCommand
from payments.models import PaymentTransaction


class Command(BaseCommand):
    help = 'Update transaction IDs to use Razorpay payment_id or order_id'

    def handle(self, *args, **options):
        self.stdout.write('🔄 Updating transaction IDs...')

        transactions = PaymentTransaction.objects.all()
        updated_count = 0

        for transaction in transactions:
            old_transaction_id = transaction.transaction_id

            # Use payment_id if available (completed payments), otherwise use order_id
            if transaction.razorpay_payment_id:
                new_transaction_id = transaction.razorpay_payment_id
            elif transaction.razorpay_order_id:
                new_transaction_id = transaction.razorpay_order_id
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f'⚠️  Transaction {transaction.id} has no Razorpay IDs, skipping...'
                    )
                )
                continue

            # Only update if changed
            if old_transaction_id != new_transaction_id:
                transaction.transaction_id = new_transaction_id
                transaction.save(update_fields=['transaction_id'])
                updated_count += 1
                self.stdout.write(
                    f'  ✅ Transaction {transaction.id}: {old_transaction_id} → {new_transaction_id}'
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Successfully updated {updated_count} transaction IDs!'
            )
        )