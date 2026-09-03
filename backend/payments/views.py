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
    try:
        transaction = PaymentTransaction.objects.get(
            razorpay_order_id=order_id,
            user=request.user
        )
    except PaymentTransaction.DoesNotExist:
        return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)

    if transaction.status == 'SUCCESS':
        return Response({'status': 'SUCCESS'})

    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    payments = client.order.payments(order_id).get('items', [])
    captured_payment = next(
        (payment for payment in payments if payment.get('status') == 'captured'),
        None
    )

    if not captured_payment:
        return Response({'status': transaction.status})

    _activate_transaction(transaction, captured_payment['id'])
    return Response({'status': 'SUCCESS'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    """Verify Razorpay payment and activate subscription"""
    serializer = VerifyPaymentSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    razorpay_order_id = serializer.validated_data['razorpay_order_id']
    razorpay_payment_id = serializer.validated_data['razorpay_payment_id']
    razorpay_signature = serializer.validated_data['razorpay_signature']

    # Get transaction
    try:
        transaction = PaymentTransaction.objects.get(
            razorpay_order_id=razorpay_order_id,
            user=request.user
        )
    except PaymentTransaction.DoesNotExist:
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
        transaction.status = 'FAILED'
        transaction.failure_reason = 'Signature verification failed'
        transaction.save()
        return Response(
            {'error': 'Payment verification failed'},
            status=status.HTTP_400_BAD_REQUEST
        )

    subscription = _activate_transaction(transaction, razorpay_payment_id, razorpay_signature)

    return Response({
        'message': 'Payment verified successfully',
        'subscription': UserSubscriptionSerializer(subscription).data
    }, status=status.HTTP_200_OK)
