from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    path('', views.PaymentListView.as_view(), name='payment_list'),
    path('create/', views.PaymentCreateView.as_view(), name='payment_create'),
    path('<int:pk>/', views.PaymentDetailView.as_view(), name='payment_detail'),
    path('stripe/webhook/', views.StripeWebhookView.as_view(), name='stripe_webhook'),
    path('refund/<int:pk>/', views.RefundCreateView.as_view(), name='refund_create'),
]
