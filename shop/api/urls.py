from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'products', views.ProductViewSet)
router.register(r'brands', views.BrandViewSet)
router.register(r'reviews', views.ReviewViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('products/featured/', views.FeaturedProductsView.as_view(), name='featured-products'),
    path('products/search/', views.ProductSearchAPIView.as_view(), name='product-search'),
]
