from django.shortcuts import render, get_object_or_404
from django.views.generic import ListView, DetailView, TemplateView
from django.db.models import Q, Count
from django.core.paginator import Paginator
from django.http import JsonResponse
from .models import Product, Category, Brand, Review
from .forms import ProductSearchForm, ReviewForm


class HomeView(TemplateView):
    """Головна сторінка"""
    template_name = 'shop/home.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['featured_products'] = Product.objects.filter(
            is_featured=True, 
            is_active=True
        )[:8]
        context['categories'] = Category.objects.filter(
            is_active=True, 
            parent__isnull=True
        )[:6]
        context['latest_products'] = Product.objects.filter(
            is_active=True
        ).order_by('-created_at')[:8]
        return context


class CategoryListView(ListView):
    """Список категорій"""
    model = Category
    template_name = 'shop/category_list.html'
    context_object_name = 'categories'
    paginate_by = 20
    
    def get_queryset(self):
        return Category.objects.filter(
            is_active=True, 
            parent__isnull=True
        ).order_by('sort_order', 'name')


class CategoryDetailView(DetailView):
    """Детальна сторінка категорії"""
    model = Category
    template_name = 'shop/category_detail.html'
    context_object_name = 'category'
    slug_field = 'slug'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        category = self.get_object()
        
        # Отримуємо товари категорії
        products = Product.objects.filter(
            category=category, 
            is_active=True
        ).order_by('-created_at')
        
        # Пагінація
        paginator = Paginator(products, 12)
        page_number = self.request.GET.get('page')
        context['products'] = paginator.get_page(page_number)
        
        # Підкатегорії
        context['subcategories'] = category.children.filter(is_active=True)
        
        return context


class ProductListView(ListView):
    """Список товарів"""
    model = Product
    template_name = 'shop/product_list.html'
    context_object_name = 'products'
    paginate_by = 12
    
    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        
        # Фільтрація за категорією
        category_slug = self.kwargs.get('category_slug')
        if category_slug:
            category = get_object_or_404(Category, slug=category_slug, is_active=True)
            queryset = queryset.filter(category=category)
        
        # Фільтрація за брендом
        brand_slug = self.kwargs.get('brand_slug')
        if brand_slug:
            brand = get_object_or_404(Brand, slug=brand_slug, is_active=True)
            queryset = queryset.filter(brand=brand)
        
        # Пошук
        search_query = self.request.GET.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(sku__icontains=search_query)
            )
        
        # Сортування
        sort_by = self.request.GET.get('sort')
        if sort_by == 'price_asc':
            queryset = queryset.order_by('price')
        elif sort_by == 'price_desc':
            queryset = queryset.order_by('-price')
        elif sort_by == 'name':
            queryset = queryset.order_by('name')
        elif sort_by == 'newest':
            queryset = queryset.order_by('-created_at')
        else:
            queryset = queryset.order_by('-created_at')
        
        return queryset
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories'] = Category.objects.filter(is_active=True, parent__isnull=True)
        context['brands'] = Brand.objects.filter(is_active=True)
        context['search_form'] = ProductSearchForm(self.request.GET)
        return context


class ProductDetailView(DetailView):
    """Детальна сторінка товару"""
    model = Product
    template_name = 'shop/product_detail.html'
    context_object_name = 'product'
    slug_field = 'slug'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        product = self.get_object()
        
        # Відгуки
        context['reviews'] = product.reviews.filter(is_active=True).order_by('-created_at')
        context['review_form'] = ReviewForm()
        
        # Похожі товари
        context['related_products'] = Product.objects.filter(
            category=product.category,
            is_active=True
        ).exclude(id=product.id)[:4]
        
        # Статистика відгуків
        reviews = product.reviews.filter(is_active=True)
        if reviews.exists():
            context['avg_rating'] = reviews.aggregate(
                avg_rating=models.Avg('rating')
            )['avg_rating']
            context['rating_counts'] = reviews.values('rating').annotate(
                count=Count('rating')
            ).order_by('rating')
        
        return context


class ProductSearchView(ListView):
    """Пошук товарів"""
    model = Product
    template_name = 'shop/product_search.html'
    context_object_name = 'products'
    paginate_by = 12
    
    def get_queryset(self):
        query = self.request.GET.get('q', '')
        if query:
            return Product.objects.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(sku__icontains=query),
                is_active=True
            ).order_by('-created_at')
        return Product.objects.none()
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['query'] = self.request.GET.get('q', '')
        context['search_form'] = ProductSearchForm(self.request.GET)
        return context


class BrandListView(ListView):
    """Список брендів"""
    model = Brand
    template_name = 'shop/brand_list.html'
    context_object_name = 'brands'
    paginate_by = 20
    
    def get_queryset(self):
        return Brand.objects.filter(is_active=True).order_by('name')


class BrandDetailView(DetailView):
    """Детальна сторінка бренду"""
    model = Brand
    template_name = 'shop/brand_detail.html'
    context_object_name = 'brand'
    slug_field = 'slug'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        brand = self.get_object()
        
        # Товари бренду
        products = Product.objects.filter(
            brand=brand, 
            is_active=True
        ).order_by('-created_at')
        
        # Пагінація
        paginator = Paginator(products, 12)
        page_number = self.request.GET.get('page')
        context['products'] = paginator.get_page(page_number)
        
        return context


class ProductReviewView(DetailView):
    """Додавання відгуку про товар"""
    model = Product
    template_name = 'shop/product_review.html'
    context_object_name = 'product'
    slug_field = 'slug'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['review_form'] = ReviewForm()
        return context
    
    def post(self, request, *args, **kwargs):
        product = self.get_object()
        form = ReviewForm(request.POST)
        
        if form.is_valid() and request.user.is_authenticated:
            review = form.save(commit=False)
            review.product = product
            review.user = request.user
            review.save()
            return JsonResponse({'success': True, 'message': 'Відгук додано успішно'})
        
        return JsonResponse({'success': False, 'errors': form.errors})