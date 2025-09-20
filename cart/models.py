from django.db import models
from django.contrib.auth import get_user_model
from shop.models import Product

User = get_user_model()


class Cart(models.Model):
    """Модель кошика покупок"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart', 
                               verbose_name='Користувач')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Створено')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Оновлено')

    class Meta:
        verbose_name = 'Кошик'
        verbose_name_plural = 'Кошики'
        ordering = ['-created_at']

    def __str__(self):
        return f"Кошик {self.user.email}"

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def total_price(self):
        return sum(item.total_price for item in self.items.all())

    def add_item(self, product, quantity=1):
        """Додати товар до кошика"""
        cart_item, created = self.items.get_or_create(
            product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        return cart_item

    def remove_item(self, product):
        """Видалити товар з кошика"""
        try:
            cart_item = self.items.get(product=product)
            cart_item.delete()
        except CartItem.DoesNotExist:
            pass

    def clear(self):
        """Очистити кошик"""
        self.items.all().delete()


class CartItem(models.Model):
    """Модель позиції в кошику"""
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items', 
                            verbose_name='Кошик')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='cart_items', 
                               verbose_name='Товар')
    quantity = models.PositiveIntegerField(default=1, verbose_name='Кількість')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Створено')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Оновлено')

    class Meta:
        verbose_name = 'Позиція кошика'
        verbose_name_plural = 'Позиції кошика'
        unique_together = ['cart', 'product']
        ordering = ['created_at']

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"

    @property
    def total_price(self):
        return self.product.price * self.quantity

    def save(self, *args, **kwargs):
        if self.quantity <= 0:
            self.delete()
        else:
            super().save(*args, **kwargs)