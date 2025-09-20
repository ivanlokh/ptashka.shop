import django_filters
from .models import Product, Category, Brand


class ProductFilter(django_filters.FilterSet):
    """Фільтр для товарів"""
    name = django_filters.CharFilter(lookup_expr='icontains')
    price_min = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    price_max = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    category = django_filters.ModelChoiceFilter(queryset=Category.objects.filter(is_active=True))
    brand = django_filters.ModelChoiceFilter(queryset=Brand.objects.filter(is_active=True))
    is_featured = django_filters.BooleanFilter()
    is_in_stock = django_filters.BooleanFilter(method='filter_in_stock')
    
    class Meta:
        model = Product
        fields = ['name', 'price_min', 'price_max', 'category', 'brand', 'is_featured', 'is_in_stock']
    
    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock__gt=0)
        return queryset
