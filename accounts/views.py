from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView, ListView
from django.contrib import messages
from django.urls import reverse_lazy
from .models import UserProfile, Notification


@method_decorator(login_required, name='dispatch')
class ProfileView(TemplateView):
    """Профіль користувача"""
    template_name = 'accounts/profile.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['profile'] = getattr(self.request.user, 'profile', None)
        return context


@method_decorator(login_required, name='dispatch')
class ProfileEditView(TemplateView):
    """Редагування профілю"""
    template_name = 'accounts/profile_edit.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['profile'] = getattr(self.request.user, 'profile', None)
        return context


@method_decorator(login_required, name='dispatch')
class OrderHistoryView(ListView):
    """Історія замовлень"""
    template_name = 'accounts/order_history.html'
    context_object_name = 'orders'
    paginate_by = 10
    
    def get_queryset(self):
        return self.request.user.orders.all().order_by('-created_at')


@method_decorator(login_required, name='dispatch')
class WishlistView(ListView):
    """Список бажаних товарів"""
    template_name = 'accounts/wishlist.html'
    context_object_name = 'wishlist_items'
    paginate_by = 12
    
    def get_queryset(self):
        return self.request.user.wishlist.all().order_by('-created_at')


@method_decorator(login_required, name='dispatch')
class NotificationsView(ListView):
    """Сповіщення користувача"""
    template_name = 'accounts/notifications.html'
    context_object_name = 'notifications'
    paginate_by = 20
    
    def get_queryset(self):
        return self.request.user.notifications.all().order_by('-created_at')