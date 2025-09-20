from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Cart, CartItem
from shop.models import Product
import json


@method_decorator(login_required, name='dispatch')
class CartView(TemplateView):
    """Кошик покупок"""
    template_name = 'cart/cart.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        context['cart'] = cart
        context['cart_items'] = cart.items.all()
        return context


@method_decorator(login_required, name='dispatch')
class CartAddView(TemplateView):
    """Додавання товару до кошика"""
    
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            product_id = data.get('product_id')
            quantity = int(data.get('quantity', 1))
            
            product = get_object_or_404(Product, id=product_id, is_active=True)
            cart, created = Cart.objects.get_or_create(user=request.user)
            
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={'quantity': quantity}
            )
            
            if not created:
                cart_item.quantity += quantity
                cart_item.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Товар додано до кошика',
                'cart_total': cart.total_price,
                'cart_items_count': cart.total_items
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Помилка: {str(e)}'
            })


@method_decorator(login_required, name='dispatch')
class CartUpdateView(TemplateView):
    """Оновлення кількості товару в кошику"""
    
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            cart_item_id = data.get('cart_item_id')
            quantity = int(data.get('quantity', 1))
            
            cart_item = get_object_or_404(CartItem, id=cart_item_id, cart__user=request.user)
            
            if quantity <= 0:
                cart_item.delete()
            else:
                cart_item.quantity = quantity
                cart_item.save()
            
            cart = cart_item.cart
            return JsonResponse({
                'success': True,
                'message': 'Кількість оновлено',
                'cart_total': cart.total_price,
                'cart_items_count': cart.total_items
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Помилка: {str(e)}'
            })


@method_decorator(login_required, name='dispatch')
class CartRemoveView(TemplateView):
    """Видалення товару з кошика"""
    
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            cart_item_id = data.get('cart_item_id')
            
            cart_item = get_object_or_404(CartItem, id=cart_item_id, cart__user=request.user)
            cart = cart_item.cart
            cart_item.delete()
            
            return JsonResponse({
                'success': True,
                'message': 'Товар видалено з кошика',
                'cart_total': cart.total_price,
                'cart_items_count': cart.total_items
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Помилка: {str(e)}'
            })


@method_decorator(login_required, name='dispatch')
class CartClearView(TemplateView):
    """Очищення кошика"""
    
    def post(self, request, *args, **kwargs):
        try:
            cart = get_object_or_404(Cart, user=request.user)
            cart.clear()
            
            return JsonResponse({
                'success': True,
                'message': 'Кошик очищено',
                'cart_total': 0,
                'cart_items_count': 0
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Помилка: {str(e)}'
            })