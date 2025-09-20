from django.db import models
from django.urls import reverse
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth import get_user_model

User = get_user_model()


class Category(models.Model):
    """Модель категорії товарів"""
    name = models.CharField(max_length=200, verbose_name='Назва')
    slug = models.SlugField(max_length=200, unique=True, verbose_name='URL')
    description = models.TextField(blank=True, verbose_name='Опис')
    image = models.ImageField(upload_to='categories/', blank=True, null=True, verbose_name='Зображення')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, 
                              related_name='children', verbose_name='Батьківська категорія')
    is_active = models.BooleanField(default=True, verbose_name='Активна')
    sort_order = models.PositiveIntegerField(default=0, verbose_name='Порядок сортування')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Створено')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Оновлено')

    class Meta:
        verbose_name = 'Категорія'
        verbose_name_plural = 'Категорії'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('shop:category_detail', kwargs={'slug': self.slug})


class Brand(models.Model):
    """Модель бренду"""
    name = models.CharField(max_length=100, unique=True, verbose_name='Назва')
    slug = models.SlugField(max_length=100, unique=True, verbose_name='URL')
    description = models.TextField(blank=True, verbose_name='Опис')
    logo = models.ImageField(upload_to='brands/', blank=True, null=True, verbose_name='Логотип')
    website = models.URLField(blank=True, verbose_name='Веб-сайт')
    is_active = models.BooleanField(default=True, verbose_name='Активний')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Створено')

    class Meta:
        verbose_name = 'Бренд'
        verbose_name_plural = 'Бренди'
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(models.Model):
    """Модель товару"""
    name = models.CharField(max_length=200, verbose_name='Назва')
    slug = models.SlugField(max_length=200, unique=True, verbose_name='URL')
    description = models.TextField(verbose_name='Опис')
    short_description = models.CharField(max_length=300, blank=True, verbose_name='Короткий опис')
    sku = models.CharField(max_length=100, unique=True, verbose_name='Артикул')
    
    # Ціни
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Ціна')
    compare_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, 
                                       verbose_name='Ціна для порівняння')
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, 
                                    verbose_name='Собівартість')
    
    # Наявність
    stock = models.PositiveIntegerField(default=0, verbose_name='Кількість на складі')
    track_stock = models.BooleanField(default=True, verbose_name='Відстежувати залишки')
    
    # Фізичні характеристики
    weight = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True, 
                                verbose_name='Вага (кг)')
    length = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True, 
                                verbose_name='Довжина (см)')
    width = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True, 
                               verbose_name='Ширина (см)')
    height = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True, 
                                verbose_name='Висота (см)')
    
    # Статуси
    is_active = models.BooleanField(default=True, verbose_name='Активний')
    is_digital = models.BooleanField(default=False, verbose_name='Цифровий товар')
    is_featured = models.BooleanField(default=False, verbose_name='Рекомендований')
    
    # Сортування та SEO
    sort_order = models.PositiveIntegerField(default=0, verbose_name='Порядок сортування')
    meta_title = models.CharField(max_length=200, blank=True, verbose_name='Meta заголовок')
    meta_description = models.CharField(max_length=300, blank=True, verbose_name='Meta опис')
    
    # Зв'язки
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products', 
                                verbose_name='Категорія')
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, blank=True, null=True, 
                             related_name='products', verbose_name='Бренд')
    
    # Дати
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Створено')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Оновлено')

    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = 'Товари'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('shop:product_detail', kwargs={'slug': self.slug})

    @property
    def is_in_stock(self):
        return self.stock > 0 if self.track_stock else True

    @property
    def discount_percentage(self):
        if self.compare_price and self.compare_price > self.price:
            return round((self.compare_price - self.price) / self.compare_price * 100)
        return 0

    @property
    def primary_image(self):
        return self.images.filter(is_primary=True).first() or self.images.first()


class ProductImage(models.Model):
    """Модель зображення товару"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images', 
                               verbose_name='Товар')
    image = models.ImageField(upload_to='products/', verbose_name='Зображення')
    alt_text = models.CharField(max_length=200, blank=True, verbose_name='Альтернативний текст')
    sort_order = models.PositiveIntegerField(default=0, verbose_name='Порядок сортування')
    is_primary = models.BooleanField(default=False, verbose_name='Основне зображення')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Створено')

    class Meta:
        verbose_name = 'Зображення товару'
        verbose_name_plural = 'Зображення товарів'
        ordering = ['sort_order', 'created_at']

    def __str__(self):
        return f"{self.product.name} - {self.alt_text or 'Зображення'}"


class ProductVariant(models.Model):
    """Модель варіанту товару (розмір, колір тощо)"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants', 
                               verbose_name='Товар')
    name = models.CharField(max_length=100, verbose_name='Назва варіанту')
    sku = models.CharField(max_length=100, unique=True, verbose_name='Артикул')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Ціна')
    stock = models.PositiveIntegerField(default=0, verbose_name='Кількість на складі')
    is_active = models.BooleanField(default=True, verbose_name='Активний')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Створено')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Оновлено')

    class Meta:
        verbose_name = 'Варіант товару'
        verbose_name_plural = 'Варіанти товарів'
        ordering = ['name']

    def __str__(self):
        return f"{self.product.name} - {self.name}"


class ProductAttribute(models.Model):
    """Модель атрибуту товару (характеристики)"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='attributes', 
                               verbose_name='Товар')
    name = models.CharField(max_length=100, verbose_name='Назва атрибуту')
    value = models.CharField(max_length=200, verbose_name='Значення')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Створено')

    class Meta:
        verbose_name = 'Атрибут товару'
        verbose_name_plural = 'Атрибути товарів'
        ordering = ['name']

    def __str__(self):
        return f"{self.product.name} - {self.name}: {self.value}"


class Review(models.Model):
    """Модель відгуку про товар"""
    RATING_CHOICES = [
        (1, '1 зірка'),
        (2, '2 зірки'),
        (3, '3 зірки'),
        (4, '4 зірки'),
        (5, '5 зірок'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews', 
                               verbose_name='Товар')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews', 
                            verbose_name='Користувач')
    rating = models.PositiveIntegerField(choices=RATING_CHOICES, 
                                        validators=[MinValueValidator(1), MaxValueValidator(5)],
                                        verbose_name='Рейтинг')
    title = models.CharField(max_length=200, blank=True, verbose_name='Заголовок')
    comment = models.TextField(verbose_name='Коментар')
    is_verified = models.BooleanField(default=False, verbose_name='Підтверджений покупець')
    is_active = models.BooleanField(default=True, verbose_name='Активний')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Створено')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Оновлено')

    class Meta:
        verbose_name = 'Відгук'
        verbose_name_plural = 'Відгуки'
        ordering = ['-created_at']
        unique_together = ['product', 'user']

    def __str__(self):
        return f"{self.product.name} - {self.user.email} ({self.rating} зірок)"


class Wishlist(models.Model):
    """Модель списку бажаних товарів"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist', 
                            verbose_name='Користувач')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlist', 
                               verbose_name='Товар')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Створено')

    class Meta:
        verbose_name = 'Список бажаних товарів'
        verbose_name_plural = 'Списки бажаних товарів'
        unique_together = ['user', 'product']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.product.name}"