from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'payments'

router = DefaultRouter()
router.register(r'plans', views.PlanViewSet, basename='plan')

urlpatterns = [
    path('', include(router.urls)),

    # Subscription
    path('subscription/', views.my_subscription, name='my_subscription'),

    # Transactions
    path('transactions/', views.my_transactions, name='my_transactions'),

    # Payment flow
    path('create-order/', views.create_payment_order, name='create_payment_order'),
    path('verify-payment/', views.verify_payment, name='verify_payment'),
]
