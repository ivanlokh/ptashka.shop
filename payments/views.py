from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView, ListView, DetailView
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .models import Payment, Refund, PaymentMethod


@method_decorator(login_required, name='dispatch')
class PaymentListView(ListView):
    """Список платежів користувача"""
    template_name = 'payments/payment_list.html'
    context_object_name = 'payments'
    paginate_by = 10
    
    def get_queryset(self):
        return Payment.objects.filter(order__user=self.request.user).order_by('-created_at')


@method_decorator(login_required, name='dispatch')
class PaymentDetailView(DetailView):
    """Детальна інформація про платіж"""
    template_name = 'payments/payment_detail.html'
    context_object_name = 'payment'
    
    def get_queryset(self):
        return Payment.objects.filter(order__user=self.request.user)


@method_decorator(login_required, name='dispatch')
class PaymentCreateView(TemplateView):
    """Створення платежу"""
    template_name = 'payments/payment_create.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        order_id = self.kwargs.get('order_id')
        if order_id:
            context['order'] = get_object_or_404(Order, id=order_id, user=self.request.user)
        return context


@method_decorator(login_required, name='dispatch')
class RefundCreateView(TemplateView):
    """Створення повернення коштів"""
    template_name = 'payments/refund_create.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        payment_id = self.kwargs.get('pk')
        context['payment'] = get_object_or_404(Payment, id=payment_id, order__user=self.request.user)
        return context


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(TemplateView):
    """Webhook для Stripe"""
    
    def post(self, request, *args, **kwargs):
        import stripe
        from django.conf import settings
        
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            return JsonResponse({'error': 'Invalid payload'}, status=400)
        except stripe.error.SignatureVerificationError:
            return JsonResponse({'error': 'Invalid signature'}, status=400)
        
        # Handle the event
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            # Update payment status
            try:
                payment = Payment.objects.get(transaction_id=payment_intent['id'])
                payment.status = 'completed'
                payment.save()
            except Payment.DoesNotExist:
                pass
        
        return JsonResponse({'status': 'success'})