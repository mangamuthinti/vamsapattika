from rest_framework import serializers
from .models import Plan, UserSubscription, PaymentTransaction


class PlanSerializer(serializers.ModelSerializer):
    """Plan serializer"""

    class Meta:
        model = Plan
        fields = ['id', 'name', 'display_name', 'max_cards', 'price', 'description', 'validity_days', 'is_active']
        read_only_fields = ['id']


class UserSubscriptionSerializer(serializers.ModelSerializer):
    """User subscription serializer"""

    plan_details = PlanSerializer(source='plan', read_only=True)
    days_remaining = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = UserSubscription
        fields = [
            'id', 'plan', 'plan_details', 'purchase_date', 'expiry_date',
            'is_active', 'auto_renew', 'days_remaining', 'is_expired', 'created_at'
        ]
        read_only_fields = ['id', 'plan_details', 'days_remaining', 'is_expired', 'created_at']

    def get_days_remaining(self, obj):
        return obj.days_remaining()

    def get_is_expired(self, obj):
        return obj.is_expired()


class PaymentTransactionSerializer(serializers.ModelSerializer):
    """Payment transaction serializer"""

    plan_name = serializers.CharField(source='plan.display_name', read_only=True)

    class Meta:
        model = PaymentTransaction
        fields = [
            'id', 'plan', 'plan_name', 'amount', 'payment_gateway',
            'razorpay_order_id', 'razorpay_payment_id', 'status',
            'failure_reason', 'created_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'plan_name', 'razorpay_order_id', 'status',
            'failure_reason', 'created_at', 'completed_at'
        ]


class CreatePaymentOrderSerializer(serializers.Serializer):
    """Serializer for creating Razorpay payment order"""

    plan_id = serializers.IntegerField(required=True)

    def validate_plan_id(self, value):
        try:
            plan = Plan.objects.get(id=value, is_active=True)
            if plan.name == 'FREE':
                raise serializers.ValidationError("Cannot create payment order for FREE plan")
        except Plan.DoesNotExist:
            raise serializers.ValidationError("Invalid plan ID")
        return value


class VerifyPaymentSerializer(serializers.Serializer):
    """Serializer for verifying Razorpay payment"""

    razorpay_order_id = serializers.CharField(required=True)
    razorpay_payment_id = serializers.CharField(required=True)
    razorpay_signature = serializers.CharField(required=True)
