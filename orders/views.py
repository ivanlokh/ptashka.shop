from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView, ListView, DetailView
from django.contrib import messages
from .models import Order, Address, Coupon


@method_decorator(login_required, name='dispatch')
class OrderListView(ListView):
    """Список замовлень користувача"""
    template_name = 'orders/order_list.html'
    context_object_name = 'orders'
    paginate_by = 10
    
    def get_queryset(self):
        return self.request.user.orders.all().order_by('-created_at')


@method_decorator(login_required, name='dispatch')
class OrderDetailView(DetailView):
    """Детальна інформація про замовлення"""
    template_name = 'orders/order_detail.html'
    context_object_name = 'order'
    
    def get_queryset(self):
        return self.request.user.orders.all()


@method_decorator(login_required, name='dispatch')
class OrderCreateView(TemplateView):
    """Створення замовлення"""
    template_name = 'orders/order_create.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        cart = getattr(self.request.user, 'cart', None)
        context['cart'] = cart
        context['addresses'] = self.request.user.addresses.all()
        return context


@method_decorator(login_required, name='dispatch')
class OrderCancelView(TemplateView):
    """Скасування замовлення"""
    
    def post(self, request, *args, **kwargs):
        order = get_object_or_404(Order, id=kwargs['pk'], user=request.user)
        
        if order.status in ['pending', 'confirmed']:
            order.status = 'cancelled'
            order.save()
            messages.success(request, 'Замовлення скасовано')
        else:
            messages.error(request, 'Неможливо скасувати це замовлення')
        
        return redirect('orders:order_detail', pk=order.id)


@method_decorator(login_required, name='dispatch')
class CheckoutView(TemplateView):
    """Оформлення замовлення"""
    template_name = 'orders/checkout.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        cart = getattr(self.request.user, 'cart', None)
        context['cart'] = cart
        context['addresses'] = self.request.user.addresses.all()
        return context