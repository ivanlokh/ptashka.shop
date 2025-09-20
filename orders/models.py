from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from shop.models import Product

User = get_user_model()


class Address(models.Model):
    """Модель адреси доставки"""
    ADDRESS_TYPES = [
        ('shipping', 'Доставка'),
        ('billing', 'Оплата'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses', 
                            verbose_name='Користувач')
    type = models.CharField(max_length=20, choices=ADDRESS_TYPES, default='shipping', 
                           verbose_name='Тип адреси')
    first_name = models.CharField(max_length=50, verbose_name='Ім\'я')
    last_name = models.CharField(max_length=50, verbose_name='Прізвище')
    company = models.CharField(max_length=100, blank=True, verbose_name='Компанія')
    address1 = models.CharField(max_length=200, verbose_name='Адреса 1')
    address2 = models.CharField(max_length=200, blank=True, verbose_name='Адреса 2')
    city = models.CharField(max_length=100, verbose_name='Місто')
    state = models.CharField(max_length=100, blank=True, verbose_name='Область')
    postal_code = models.CharField(max_length=20, verbose_name='Поштовий індекс')
    country = models.CharField(max_length=100, default='Україна', verbose_name='Країна')
    phone = models.CharField(max_length=20, blank=True, verbose_name='Телефон')
    is_default = models.BooleanField(default=False, verbose_name='За замовчуванням')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Створено')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Оновлено')

    class Meta:
        verbose_name = 'Адреса'
        verbose_name_plural = 'Адреси'
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name}, {self.city}"

    def save(self, *args, **kwargs):
        if self.is_default:
            # Зробити всі інші адреси цього користувача не за замовчуванням
            Address.objects.filter(user=self.user, type=self.type).exclude(id=self.id).update(is_default=False)
        super().save(*args, **kwargs)


class Order(models.Model):
    """Модель замовлення"""
    STATUS_CHOICES = [
        ('pending', 'Очікує підтвердження'),
        ('confirmed', 'Підтверджено'),
        ('processing', 'Обробляється'),
        ('shipped', 'Відправлено'),
        ('delivered', 'Доставлено'),
        ('cancelled', 'Скасовано'),
        ('refunded', 'Повернено'),
    ]

    order_number = models.CharField(max_length=20, unique=True, verbose_name='Номер замовлення')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders', 
                            verbose_name='Користувач')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', 
                             verbose_name='Статус')
    
    # Адреса доставки
    shipping_address = models.ForeignKey(Address, on_delete=models.PROTECT, 
                                        related_name='shipping_orders', verbose_name='Адреса доставки')
    billing_address = models.ForeignKey(Address, on_delete=models.PROTECT, 
                                       related_name='billing_orders', verbose_name='Адреса оплати')
    
    # Ціни
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, 
                                  validators=[MinValueValidator(0)], verbose_name='Сума товарів')
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0, 
                             validators=[MinValueValidator(0)], verbose_name='Податок')
    shipping = models.DecimalField(max_digits=10, decimal_places=2, default=0, 
                                  validators=[MinValueValidator(0)], verbose_name='Доставка')
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0, 
                                  validators=[MinValueValidator(0)], verbose_name='Знижка')
    total = models.DecimalField(max_digits=10, decimal_places=2, 
                               validators=[MinValueValidator(0)], verbose_name='Загальна сума')
    
    # Валюта та примітки
    currency = models.CharField(max_length=3, default='UAH', verbose_name='Валюта')
    notes = models.TextField(blank=True, verbose_name='Примітки')
    
    # Дати
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Створено')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Оновлено')

    class Meta:
        verbose_name = 'Замовлення'
        verbose_name_plural = 'Замовлення'
        ordering = ['-created_at']

    def __str__(self):
        return f"Замовлення #{self.order_number}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self.generate_order_number()
        super().save(*args, **kwargs)

    def generate_order_number(self):
        """Генерація номера замовлення"""
        import uuid
        return f"ORD-{uuid.uuid4().hex[:8].upper()}"

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    def calculate_totals(self):
        """Розрахунок загальної суми"""
        self.subtotal = sum(item.total_price for item in self.items.all())
        self.total = self.subtotal + self.tax + self.shipping - self.discount
        self.save()


class OrderItem(models.Model):
    """Модель позиції замовлення"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', 
                             verbose_name='Замовлення')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='order_items', 
                               verbose_name='Товар')
    quantity = models.PositiveIntegerField(verbose_name='Кількість')
    price = models.DecimalField(max_digits=10, decimal_places=2, 
                               validators=[MinValueValidator(0)], verbose_name='Ціна за одиницю')
    total = models.DecimalField(max_digits=10, decimal_places=2, 
                               validators=[MinValueValidator(0)], verbose_name='Загальна ціна')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Створено')

    class Meta:
        verbose_name = 'Позиція замовлення'
        verbose_name_plural = 'Позиції замовлення'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"

    def save(self, *args, **kwargs):
        self.total = self.price * self.quantity
        super().save(*args, **kwargs)


class Coupon(models.Model):
    """Модель купона знижки"""
    code = models.CharField(max_length=50, unique=True, verbose_name='Код купона')
    description = models.CharField(max_length=200, verbose_name='Опис')
    discount_type = models.CharField(max_length=20, choices=[
        ('percentage', 'Відсоток'),
        ('fixed', 'Фіксована сума'),
    ], verbose_name='Тип знижки')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, 
                                        validators=[MinValueValidator(0)], verbose_name='Значення знижки')
    minimum_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, 
                                        validators=[MinValueValidator(0)], verbose_name='Мінімальна сума замовлення')
    maximum_discount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, 
                                          validators=[MinValueValidator(0)], verbose_name='Максимальна знижка')
    usage_limit = models.PositiveIntegerField(blank=True, null=True, verbose_name='Ліміт використання')
    used_count = models.PositiveIntegerField(default=0, verbose_name='Кількість використань')
    is_active = models.BooleanField(default=True, verbose_name='Активний')
    valid_from = models.DateTimeField(verbose_name='Дійсний з')
    valid_until = models.DateTimeField(verbose_name='Дійсний до')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Створено')

    class Meta:
        verbose_name = 'Купон'
        verbose_name_plural = 'Купони'
        ordering = ['-created_at']

    def __str__(self):
        return self.code

    def is_valid(self):
        """Перевірка чи дійсний купон"""
        from django.utils import timezone
        now = timezone.now()
        return (self.is_active and 
                self.valid_from <= now <= self.valid_until and
                (not self.usage_limit or self.used_count < self.usage_limit))

    def calculate_discount(self, amount):
        """Розрахунок знижки"""
        if not self.is_valid() or amount < self.minimum_amount:
            return 0
        
        if self.discount_type == 'percentage':
            discount = amount * (self.discount_value / 100)
        else:
            discount = self.discount_value
        
        if self.maximum_discount:
            discount = min(discount, self.maximum_discount)
        
        return min(discount, amount)