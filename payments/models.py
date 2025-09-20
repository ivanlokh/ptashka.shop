from django.db import models
from django.contrib.auth import get_user_model
from orders.models import Order

User = get_user_model()


class Payment(models.Model):
    """Модель платежу"""
    PAYMENT_METHODS = [
        ('cash', 'Готівка'),
        ('card', 'Банківська карта'),
        ('bank_transfer', 'Банківський переказ'),
        ('stripe', 'Stripe'),
        ('paypal', 'PayPal'),
        ('apple_pay', 'Apple Pay'),
        ('google_pay', 'Google Pay'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Очікує'),
        ('processing', 'Обробляється'),
        ('completed', 'Завершено'),
        ('failed', 'Не вдалося'),
        ('cancelled', 'Скасовано'),
        ('refunded', 'Повернено'),
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments', 
                             verbose_name='Замовлення')
    method = models.CharField(max_length=20, choices=PAYMENT_METHODS, verbose_name='Спосіб оплати')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', 
                             verbose_name='Статус')
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Сума')
    currency = models.CharField(max_length=3, default='UAH', verbose_name='Валюта')
    
    # ID транзакції від платіжного провайдера
    transaction_id = models.CharField(max_length=200, blank=True, verbose_name='ID транзакції')
    
    # Відповідь від платіжного провайдера (JSON)
    gateway_response = models.JSONField(blank=True, null=True, verbose_name='Відповідь шлюзу')
    
    # Дати
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Створено')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Оновлено')

    class Meta:
        verbose_name = 'Платіж'
        verbose_name_plural = 'Платежі'
        ordering = ['-created_at']

    def __str__(self):
        return f"Платіж #{self.id} - {self.get_method_display()} - {self.amount} {self.currency}"


class Refund(models.Model):
    """Модель повернення коштів"""
    STATUS_CHOICES = [
        ('pending', 'Очікує'),
        ('processing', 'Обробляється'),
        ('completed', 'Завершено'),
        ('failed', 'Не вдалося'),
        ('cancelled', 'Скасовано'),
    ]

    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='refunds', 
                               verbose_name='Платіж')
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Сума повернення')
    reason = models.TextField(verbose_name='Причина повернення')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', 
                             verbose_name='Статус')
    transaction_id = models.CharField(max_length=200, blank=True, verbose_name='ID транзакції')
    gateway_response = models.JSONField(blank=True, null=True, verbose_name='Відповідь шлюзу')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Створено')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Оновлено')

    class Meta:
        verbose_name = 'Повернення'
        verbose_name_plural = 'Повернення'
        ordering = ['-created_at']

    def __str__(self):
        return f"Повернення #{self.id} - {self.amount} {self.payment.currency}"


class PaymentMethod(models.Model):
    """Модель збережених способів оплати"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_methods', 
                            verbose_name='Користувач')
    method_type = models.CharField(max_length=20, choices=Payment.PAYMENT_METHODS, 
                                  verbose_name='Тип способу оплати')
    is_default = models.BooleanField(default=False, verbose_name='За замовчуванням')
    
    # Дані для Stripe
    stripe_payment_method_id = models.CharField(max_length=200, blank=True, 
                                               verbose_name='ID способу оплати Stripe')
    stripe_customer_id = models.CharField(max_length=200, blank=True, 
                                         verbose_name='ID клієнта Stripe')
    
    # Метадані
    metadata = models.JSONField(blank=True, null=True, verbose_name='Метадані')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Створено')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Оновлено')

    class Meta:
        verbose_name = 'Спосіб оплати'
        verbose_name_plural = 'Способи оплати'
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.get_method_type_display()}"

    def save(self, *args, **kwargs):
        if self.is_default:
            # Зробити всі інші способи оплати цього користувача не за замовчуванням
            PaymentMethod.objects.filter(user=self.user).exclude(id=self.id).update(is_default=False)
        super().save(*args, **kwargs)