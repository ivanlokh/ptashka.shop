from django.urls import path, include
from . import views

app_name = 'accounts'

urlpatterns = [
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/edit/', views.ProfileEditView.as_view(), name='profile_edit'),
    path('orders/', views.OrderHistoryView.as_view(), name='order_history'),
    path('wishlist/', views.WishlistView.as_view(), name='wishlist'),
    path('notifications/', views.NotificationsView.as_view(), name='notifications'),
    path('', include('allauth.urls')),
]
