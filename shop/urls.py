from django.urls import path
from . import views

app_name = 'shop'

urlpatterns = [
    # Home page
    path('', views.HomeView.as_view(), name='home'),
    
    # Categories
    path('categories/', views.CategoryListView.as_view(), name='category_list'),
    path('category/<slug:slug>/', views.CategoryDetailView.as_view(), name='category_detail'),
    
    # Products
    path('products/', views.ProductListView.as_view(), name='product_list'),
    path('product/<slug:slug>/', views.ProductDetailView.as_view(), name='product_detail'),
    path('search/', views.ProductSearchView.as_view(), name='product_search'),
    
    # Brands
    path('brands/', views.BrandListView.as_view(), name='brand_list'),
    path('brand/<slug:slug>/', views.BrandDetailView.as_view(), name='brand_detail'),
    
    # Reviews
    path('product/<slug:slug>/review/', views.ProductReviewView.as_view(), name='product_review'),
]
