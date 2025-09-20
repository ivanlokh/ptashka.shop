from rest_framework import serializers
from .models import Product, Category, Brand, Review, ProductImage, ProductVariant, ProductAttribute


class CategorySerializer(serializers.ModelSerializer):
    """Серіалізатор категорії"""
    children = serializers.SerializerMethodField()
    products_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'image', 
            'parent', 'is_active', 'sort_order', 'created_at',
            'children', 'products_count'
        ]
    
    def get_children(self, obj):
        children = obj.children.filter(is_active=True)
        return CategorySerializer(children, many=True).data
    
    def get_products_count(self, obj):
        return obj.products.filter(is_active=True).count()


class BrandSerializer(serializers.ModelSerializer):
    """Серіалізатор бренду"""
    products_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Brand
        fields = [
            'id', 'name', 'slug', 'description', 'logo', 
            'website', 'is_active', 'created_at', 'products_count'
        ]
    
    def get_products_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductImageSerializer(serializers.ModelSerializer):
    """Серіалізатор зображення товару"""
    
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'sort_order', 'is_primary']


class ProductVariantSerializer(serializers.ModelSerializer):
    """Серіалізатор варіанту товару"""
    
    class Meta:
        model = ProductVariant
        fields = ['id', 'name', 'sku', 'price', 'stock', 'is_active']


class ProductAttributeSerializer(serializers.ModelSerializer):
    """Серіалізатор атрибуту товару"""
    
    class Meta:
        model = ProductAttribute
        fields = ['id', 'name', 'value']


class ProductSerializer(serializers.ModelSerializer):
    """Серіалізатор товару (список)"""
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    discount_percentage = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'short_description', 'sku',
            'price', 'compare_price', 'discount_percentage',
            'stock', 'is_in_stock', 'is_featured',
            'category', 'brand', 'primary_image', 'created_at'
        ]
    
    def get_primary_image(self, obj):
        primary_image = obj.primary_image
        if primary_image:
            return ProductImageSerializer(primary_image).data
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    """Серіалізатор товару (детальний)"""
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    attributes = ProductAttributeSerializer(many=True, read_only=True)
    reviews = serializers.SerializerMethodField()
    discount_percentage = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    avg_rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'short_description', 'sku',
            'price', 'compare_price', 'cost_price', 'discount_percentage',
            'stock', 'track_stock', 'is_in_stock', 'is_featured',
            'weight', 'length', 'width', 'height',
            'meta_title', 'meta_description',
            'category', 'brand', 'images', 'variants', 'attributes',
            'reviews', 'avg_rating', 'reviews_count',
            'created_at', 'updated_at'
        ]
    
    def get_reviews(self, obj):
        reviews = obj.reviews.filter(is_active=True).order_by('-created_at')[:5]
        return ReviewSerializer(reviews, many=True).data
    
    def get_avg_rating(self, obj):
        reviews = obj.reviews.filter(is_active=True)
        if reviews.exists():
            return round(reviews.aggregate(avg_rating=models.Avg('rating'))['avg_rating'], 1)
        return 0
    
    def get_reviews_count(self, obj):
        return obj.reviews.filter(is_active=True).count()


class ReviewSerializer(serializers.ModelSerializer):
    """Серіалізатор відгуку"""
    user_name = serializers.SerializerMethodField()
    user_avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id', 'rating', 'title', 'comment', 'is_verified',
            'user_name', 'user_avatar', 'created_at'
        ]
        read_only_fields = ['user', 'is_verified', 'created_at']
    
    def get_user_name(self, obj):
        return obj.user.full_name or obj.user.email
    
    def get_user_avatar(self, obj):
        if obj.user.avatar:
            return obj.user.avatar.url
        return None
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
