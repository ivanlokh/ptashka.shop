from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from ..models import Product, Category, Brand, Review
from ..serializers import (
    ProductSerializer, CategorySerializer, BrandSerializer, 
    ReviewSerializer, ProductDetailSerializer
)
from ..filters import ProductFilter


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """API для категорій"""
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'sort_order', 'created_at']
    ordering = ['sort_order', 'name']


class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    """API для брендів"""
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """API для товарів"""
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'sku']
    ordering_fields = ['name', 'price', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductSerializer
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Отримати рекомендовані товари"""
        limit = request.query_params.get('limit', 8)
        products = self.get_queryset().filter(is_featured=True)[:int(limit)]
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Отримати товари за категорією"""
        category_slug = request.query_params.get('category')
        if category_slug:
            try:
                category = Category.objects.get(slug=category_slug, is_active=True)
                products = self.get_queryset().filter(category=category)
                serializer = self.get_serializer(products, many=True)
                return Response(serializer.data)
            except Category.DoesNotExist:
                return Response({'error': 'Категорія не знайдена'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'error': 'Параметр category обов\'язковий'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def by_brand(self, request):
        """Отримати товари за брендом"""
        brand_slug = request.query_params.get('brand')
        if brand_slug:
            try:
                brand = Brand.objects.get(slug=brand_slug, is_active=True)
                products = self.get_queryset().filter(brand=brand)
                serializer = self.get_serializer(products, many=True)
                return Response(serializer.data)
            except Brand.DoesNotExist:
                return Response({'error': 'Бренд не знайдений'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'error': 'Параметр brand обов\'язковий'}, status=status.HTTP_400_BAD_REQUEST)


class ReviewViewSet(viewsets.ModelViewSet):
    """API для відгуків"""
    queryset = Review.objects.filter(is_active=True)
    serializer_class = ReviewSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['product', 'user', 'rating']
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FeaturedProductsView(APIView):
    """API для отримання рекомендованих товарів"""
    
    def get(self, request):
        limit = request.query_params.get('limit', 8)
        products = Product.objects.filter(
            is_featured=True, 
            is_active=True
        )[:int(limit)]
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)


class ProductSearchAPIView(APIView):
    """API для пошуку товарів"""
    
    def get(self, request):
        query = request.query_params.get('q', '')
        category = request.query_params.get('category')
        brand = request.query_params.get('brand')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        sort_by = request.query_params.get('sort', '-created_at')
        
        queryset = Product.objects.filter(is_active=True)
        
        # Пошук за текстом
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(sku__icontains=query)
            )
        
        # Фільтрація за категорією
        if category:
            queryset = queryset.filter(category__slug=category)
        
        # Фільтрація за брендом
        if brand:
            queryset = queryset.filter(brand__slug=brand)
        
        # Фільтрація за ціною
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        # Сортування
        queryset = queryset.order_by(sort_by)
        
        # Пагінація
        page_size = request.query_params.get('page_size', 20)
        page = request.query_params.get('page', 1)
        
        start = (int(page) - 1) * int(page_size)
        end = start + int(page_size)
        
        products = queryset[start:end]
        total = queryset.count()
        
        serializer = ProductSerializer(products, many=True)
        
        return Response({
            'results': serializer.data,
            'count': total,
            'page': int(page),
            'page_size': int(page_size),
            'total_pages': (total + int(page_size) - 1) // int(page_size)
        })
