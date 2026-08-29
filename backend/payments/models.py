from django.db import models
from django.conf import settings
from django.utils import timezone

class Plan(models.Model):
    """Pricing plans - Free, Silver, Gold, Diamond"""
    
    PLAN_CHOICES = [
        ('FREE', 'Free'),
        ('SILVER', 'Silver'),
        ('GOLD', 'Gold'),
        ('DIAMOND', 'Diamond'),
    ]
    
    name = models.CharField(max_length=20, choices=PLAN_CHOICES, unique=True)
    display_name = models.CharField(max_length=50)
    max_cards = models.IntegerField(help_text="Maximum family member cards allowed")
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price in INR")
    description = models.TextField(blank=True)
    validity_days = models.IntegerField(default=365, help_text="Plan validity in days")
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'plans'
        verbose_name = 'Plan'
        verbose_name_plural = 'Plans'
        ordering = ['price']
    
    def __str__(self):
        return f"{self.display_name} - ₹{self.price}"


class UserSubscription(models.Model):
    """User subscription status"""
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subscription'
    )
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT)
    
    purchase_date = models.DateTimeField(null=True, blank=True)
    expiry_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    auto_renew = models.BooleanField(default=False)
    previous_plan = models.CharField(max_length=20, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_subscriptions'
        verbose_name = 'User Subscription'
        verbose_name_plural = 'User Subscriptions'
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['expiry_date']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.plan.display_name}"
    
    def is_expired(self):
        """Check if subscription has expired"""
        if self.plan.name == 'FREE':
            return False
        if self.expiry_date:
            return timezone.now() > self.expiry_date
        return False
    
    def days_remaining(self):
        """Get days remaining until expiry"""
        if not self.expiry_date or self.plan.name == 'FREE':
            return None
        delta = self.expiry_date - timezone.now()
        return max(0, delta.days)


class PaymentTransaction(models.Model):
    """Payment transaction records"""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    ]
    
    GATEWAY_CHOICES = [
        ('RAZORPAY', 'Razorpay'),
        ('STRIPE', 'Stripe'),
        ('MANUAL', 'Manual'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Payment gateway fields
    payment_gateway = models.CharField(max_length=50, choices=GATEWAY_CHOICES, default='RAZORPAY')
    razorpay_order_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    failure_reason = models.TextField(blank=True)
    
    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'payment_transactions'
        verbose_name = 'Payment Transaction'
        verbose_name_plural = 'Payment Transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['razorpay_order_id']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - ₹{self.amount} - {self.status}"
