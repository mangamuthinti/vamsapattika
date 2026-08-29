from django.contrib import admin
from .models import Plan, UserSubscription, PaymentTransaction

@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'name', 'max_cards', 'formatted_price', 'validity_days', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'display_name']

    def formatted_price(self, obj):
        return f"₹{obj.price}"
    formatted_price.short_description = 'Price'

@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'purchase_date', 'expiry_date', 'is_active', 'days_remaining']
    list_filter = ['plan', 'is_active', 'purchase_date']
    search_fields = ['user__email']
    readonly_fields = ['created_at', 'updated_at']
    
    def days_remaining(self, obj):
        days = obj.days_remaining()
        return days if days is not None else 'N/A'
    days_remaining.short_description = 'Days Left'

@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'formatted_amount', 'payment_gateway', 'status', 'created_at']
    list_filter = ['status', 'payment_gateway', 'created_at']
    search_fields = ['user__email', 'razorpay_order_id', 'razorpay_payment_id']
    readonly_fields = ['created_at', 'updated_at', 'completed_at']

    def formatted_amount(self, obj):
        return f"₹{obj.amount}"
    formatted_amount.short_description = 'Amount'
