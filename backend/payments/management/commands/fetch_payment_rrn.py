from django.core.management.base import BaseCommand
from django.conf import settings
from payments.models import PaymentTransaction
import razorpay
import time


class Command(BaseCommand):
    help = 'Fetch and update bank RRN for successful transactions that are missing it'

    def add_arguments(self, parser):
        parser.add_argument(
            '--transaction-id',
            type=str,
            help='Update specific transaction by transaction_id',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Update all successful transactions missing RRN',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without saving',
        )

    def handle(self, *args, **options):
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

        if options['transaction_id']:
            # Update specific transaction
            try:
                transaction = PaymentTransaction.objects.get(transaction_id=options['transaction_id'])
                transactions = [transaction]
            except PaymentTransaction.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"Transaction {options['transaction_id']} not found"))
                return
        elif options['all']:
            # Update all successful transactions without RRN
            transactions = PaymentTransaction.objects.filter(
                status='SUCCESS',
                bank_rrn__isnull=True,
                razorpay_payment_id__isnull=False
            )
        else:
            self.stdout.write(self.style.ERROR('Please specify --transaction-id or --all'))
            return

        total = transactions.count() if hasattr(transactions, 'count') else len(transactions)
        self.stdout.write(f"Found {total} transaction(s) to process")

        updated_count = 0
        failed_count = 0

        for transaction in transactions:
            try:
                self.stdout.write(f"\nProcessing transaction {transaction.transaction_id}...")
                self.stdout.write(f"  Payment ID: {transaction.razorpay_payment_id}")

                # Fetch payment details from Razorpay
                payment_details = client.payment.fetch(transaction.razorpay_payment_id)

                # Log full payment details for debugging
                self.stdout.write(self.style.WARNING(f"  Payment details: {payment_details}"))

                # Extract acquirer data
                acquirer_data = payment_details.get('acquirer_data', {})
                self.stdout.write(f"  Acquirer data: {acquirer_data}")

                # Try to get RRN
                bank_rrn = None
                if acquirer_data:
                    bank_rrn = acquirer_data.get('rrn') or acquirer_data.get('bank_transaction_id')

                if bank_rrn:
                    self.stdout.write(self.style.SUCCESS(f"  ✓ Found RRN: {bank_rrn}"))

                    if not options['dry_run']:
                        transaction.bank_rrn = bank_rrn
                        transaction.save(update_fields=['bank_rrn'])
                        self.stdout.write(self.style.SUCCESS(f"  ✓ Updated transaction {transaction.transaction_id}"))
                    else:
                        self.stdout.write(self.style.WARNING(f"  [DRY RUN] Would update RRN to: {bank_rrn}"))

                    updated_count += 1
                else:
                    self.stdout.write(self.style.WARNING(f"  ⚠ No RRN found in payment details"))
                    failed_count += 1

                # Rate limiting - don't overwhelm Razorpay API
                time.sleep(0.5)

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  ✗ Error: {str(e)}"))
                failed_count += 1

        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS(f"Summary:"))
        self.stdout.write(f"  Total processed: {total}")
        self.stdout.write(f"  Successfully updated: {updated_count}")
        self.stdout.write(f"  Failed/No RRN: {failed_count}")

        if options['dry_run']:
            self.stdout.write(self.style.WARNING("\n[DRY RUN MODE] No changes were saved"))