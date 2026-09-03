from rest_framework import status, viewsets, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import razorpay
import hmac
import hashlib
import json

from .models import Plan, UserSubscription, PaymentTransaction
from .serializers import (
    PlanSerializer, UserSubscriptionSerializer,
    PaymentTransactionSerializer, CreatePaymentOrderSerializer,
    VerifyPaymentSerializer
)


class PlanViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing pricing plans
    - list: Get all active plans
    - retrieve: Get specific plan details
    """
    queryset = Plan.objects.filter(is_active=True)
    serializer_class = PlanSerializer
    permission_classes = [AllowAny]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_subscription(request):
    """Get current user's subscription details"""
    try:
        subscription = UserSubscription.objects.get(user=request.user)
        serializer = UserSubscriptionSerializer(subscription)
        return Response(serializer.data)
    except UserSubscription.DoesNotExist:
        return Response(
            {'error': 'No subscription found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_transactions(request):
    """Get current user's payment transactions"""
    transactions = PaymentTransaction.objects.filter(user=request.user)
    serializer = PaymentTransactionSerializer(transactions, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_order(request):
    """Create Razorpay payment order"""
    serializer = CreatePaymentOrderSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    plan_id = serializer.validated_data['plan_id']

    try:
        plan = Plan.objects.get(id=plan_id, is_active=True)
    except Plan.DoesNotExist:
        return Response({'error': 'Plan not found'}, status=status.HTTP_404_NOT_FOUND)

    if plan.name == 'FREE':
        return Response(
            {'error': 'Cannot create payment for FREE plan'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Initialize Razorpay client
    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

    # Create Razorpay order
    amount_in_paise = int(plan.price * 100)  # Convert to paise
    razorpay_order = client.order.create({
        'amount': amount_in_paise,
        'currency': 'INR',
        'payment_capture': 1
    })

    # Create payment transaction record
    transaction = PaymentTransaction.objects.create(
        user=request.user,
        plan=plan,
        amount=plan.price,
        payment_gateway='RAZORPAY',
        razorpay_order_id=razorpay_order['id'],
        status='PENDING',
        ip_address=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT', '')
    )

    return Response({
        'order_id': razorpay_order['id'],
        'amount': amount_in_paise,
        'currency': 'INR',
        'key': settings.RAZORPAY_KEY_ID,
        'transaction_id': transaction.id,
        'plan_name': plan.display_name
    }, status=status.HTTP_201_CREATED)


def _activate_transaction(transaction, payment_id, payment_signature=''):
    """Mark a paid transaction successful and activate its subscription."""
    transaction.razorpay_payment_id = payment_id
    if payment_signature:
        transaction.razorpay_signature = payment_signature
    transaction.status = 'SUCCESS'
    transaction.completed_at = transaction.completed_at or timezone.now()
    transaction.save()

    subscription, created = UserSubscription.objects.get_or_create(user=transaction.user)
    if not created and subscription.plan != transaction.plan:
        subscription.previous_plan = subscription.plan.name
    subscription.plan = transaction.plan
    subscription.purchase_date = transaction.completed_at
    subscription.expiry_date = transaction.completed_at + timedelta(days=transaction.plan.validity_days)
    subscription.is_active = True
    subscription.save()
    return subscription


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_status(request, order_id):
    """Reconcile a QR payment whose checkout callback was not delivered."""
    import logging
    logger = logging.getLogger(__name__)

    logger.info(f"🔍 Checking payment status for order: {order_id}")

    try:
        transaction = PaymentTransaction.objects.get(
            razorpay_order_id=order_id,
            user=request.user
        )
    except PaymentTransaction.DoesNotExist:
        logger.error(f"❌ Transaction not found for order: {order_id}")
        return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)

    if transaction.status == 'SUCCESS':
        logger.info(f"✅ Transaction already successful for order: {order_id}")
        return Response({'status': 'SUCCESS', 'message': 'Payment already verified'})

    try:
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

        # Fetch payments for this order from Razorpay
        order_payments = client.order.payments(order_id)
        payments = order_payments.get('items', [])

        logger.info(f"📊 Found {len(payments)} payment(s) for order {order_id}")
        for p in payments:
            logger.info(f"   - Payment {p.get('id')}: status={p.get('status')}, method={p.get('method')}")

        captured_payment = next(
            (payment for payment in payments if payment.get('status') == 'captured'),
            None
        )

        if not captured_payment:
            logger.warning(f"⏳ No captured payment found yet for order: {order_id}")
            return Response({
                'status': transaction.status,
                'message': 'Payment not captured yet',
                'payments_count': len(payments)
            })

        # Payment found and captured! Activate subscription
        logger.info(f"💰 Captured payment found: {captured_payment['id']} for order {order_id}")
        _activate_transaction(transaction, captured_payment['id'])
        logger.info(f"✅ Subscription activated for user {request.user.email}")

        return Response({
            'status': 'SUCCESS',
            'message': 'Payment verified and subscription activated',
            'payment_id': captured_payment['id']
        })

    except razorpay.errors.BadRequestError as e:
        logger.error(f"❌ Razorpay BadRequest: {str(e)} for order {order_id}")
        return Response({
            'error': 'Invalid request to payment gateway',
            'status': transaction.status
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.error(f"❌ Error checking payment status: {str(e)} for order {order_id}")
        return Response({
            'error': 'Failed to check payment status',
            'status': transaction.status,
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_config_check(request):
    """Check Razorpay configuration status (admin/debug only)"""
    import logging
    logger = logging.getLogger(__name__)

    is_configured = bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET)
    key_prefix = settings.RAZORPAY_KEY_ID[:8] if settings.RAZORPAY_KEY_ID else 'NOT_SET'

    # Determine if using test or live keys
    key_type = 'unknown'
    if settings.RAZORPAY_KEY_ID:
        if settings.RAZORPAY_KEY_ID.startswith('rzp_test_'):
            key_type = 'TEST (sandbox)'
        elif settings.RAZORPAY_KEY_ID.startswith('rzp_live_'):
            key_type = 'LIVE (production)'

    logger.info(f"🔧 Config check - Razorpay configured: {is_configured}, Key type: {key_type}")

    return Response({
        'razorpay_configured': is_configured,
        'key_prefix': key_prefix,
        'key_type': key_type,
        'environment': 'production' if not settings.DEBUG else 'development'
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def razorpay_webhook(request):
    """Activate payments reported by Razorpay independently of the browser."""
    import logging
    logger = logging.getLogger(__name__)

    logger.info(f"🔔 Webhook received from Razorpay - IP: {request.META.get('REMOTE_ADDR')}")

    signature = request.headers.get('X-Razorpay-Signature', '')
    if not signature:
        logger.error("❌ Webhook missing X-Razorpay-Signature header")
        return Response({'error': 'Missing signature'}, status=status.HTTP_400_BAD_REQUEST)

    expected_signature = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode(),
        request.body,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, signature):
        logger.error("❌ Webhook signature verification failed")
        return Response({'error': 'Invalid webhook signature'}, status=status.HTTP_400_BAD_REQUEST)

    logger.info("✅ Webhook signature verified")

    try:
        payload = json.loads(request.body)
        event = payload.get('event')
        logger.info(f"📨 Webhook event: {event}")

        payment = payload['payload']['payment']['entity']
        order_id = payment.get('order_id')
        payment_id = payment.get('id')
        payment_status = payment.get('status')

        logger.info(f"💳 Payment details - Order: {order_id}, Payment: {payment_id}, Status: {payment_status}")
    except (ValueError, KeyError, TypeError) as e:
        logger.error(f"❌ Invalid webhook payload: {str(e)}")
        return Response({'error': 'Invalid webhook payload'}, status=status.HTTP_400_BAD_REQUEST)

    if payload.get('event') not in ('payment.captured', 'order.paid'):
        logger.info(f"⏭️ Ignoring event: {payload.get('event')}")
        return Response({'status': 'ignored'})

    try:
        transaction = PaymentTransaction.objects.get(razorpay_order_id=order_id)
        logger.info(f"📦 Transaction found for order: {order_id}")
    except PaymentTransaction.DoesNotExist:
        logger.error(f"❌ Transaction not found for order: {order_id}")
        return Response({'status': 'ignored'})

    if transaction.status == 'SUCCESS':
        logger.info(f"✅ Transaction already successful: {order_id}")
        return Response({'status': 'already_processed'})

    logger.info(f"🚀 Activating subscription for order: {order_id}")
    _activate_transaction(transaction, payment_id)
    logger.info(f"🎉 Webhook processed successfully - Subscription activated for user: {transaction.user.email}")

    return Response({'status': 'success'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    """Verify Razorpay payment and activate subscription"""
    import logging
    logger = logging.getLogger(__name__)

    logger.info(f"🔐 Payment verification requested by user: {request.user.email}")

    serializer = VerifyPaymentSerializer(data=request.data)

    if not serializer.is_valid():
        logger.error(f"❌ Invalid verification data: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    razorpay_order_id = serializer.validated_data['razorpay_order_id']
    razorpay_payment_id = serializer.validated_data['razorpay_payment_id']
    razorpay_signature = serializer.validated_data['razorpay_signature']

    logger.info(f"📦 Order: {razorpay_order_id}, Payment: {razorpay_payment_id}")

    # Get transaction
    try:
        transaction = PaymentTransaction.objects.get(
            razorpay_order_id=razorpay_order_id,
            user=request.user
        )
    except PaymentTransaction.DoesNotExist:
        logger.error(f"❌ Transaction not found for order: {razorpay_order_id}")
        return Response(
            {'error': 'Transaction not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Verify signature
    generated_signature = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
        hashlib.sha256
    ).hexdigest()

    if generated_signature != razorpay_signature:
        logger.error(f"❌ Signature mismatch for order: {razorpay_order_id}")
        transaction.status = 'FAILED'
        transaction.failure_reason = 'Signature verification failed'
        transaction.save()
        return Response(
            {'error': 'Payment verification failed'},
            status=status.HTTP_400_BAD_REQUEST
        )

    logger.info(f"✅ Signature verified for order: {razorpay_order_id}")
    subscription = _activate_transaction(transaction, razorpay_payment_id, razorpay_signature)
    logger.info(f"🎉 Subscription activated for user: {request.user.email} - Plan: {subscription.plan.name}")

    return Response({
        'message': 'Payment verified successfully',
        'subscription': UserSubscriptionSerializer(subscription).data
    }, status=status.HTTP_200_OK)