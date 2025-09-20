from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """Розширена модель користувача"""
    email = models.EmailField(_('email address'), unique=True)
    phone = models.CharField(max_length=20, blank=True, verbose_name='Телефон')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name='Аватар')
    date_of_birth = models.DateField(blank=True, null=True, verbose_name='Дата народження')
    
    # Налаштування
    email_notifications = models.BooleanField(default=True, verbose_name='Email сповіщення')
    sms_notifications = models.BooleanField(default=False, verbose_name='SMS сповіщення')
    newsletter = models.BooleanField(default=True, verbose_name='Розсилка новин')
    
    # Дати
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Створено')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Оновлено')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = 'Користувач'
        verbose_name_plural = 'Користувачі'
        ordering = ['-created_at']

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email

    @property
    def initials(self):
        first = self.first_name[0] if self.first_name else ''
        last = self.last_name[0] if self.last_name else ''
        return (first + last).upper() or self.email[0].upper()


class UserProfile(models.Model):
    """Профіль користувача з додатковою інформацією"""
    GENDER_CHOICES = [
        ('male', 'Чоловік'),
        ('female', 'Жінка'),
        ('other', 'Інше'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', 
                               verbose_name='Користувач')
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, verbose_name='Стать')
    bio = models.TextField(blank=True, verbose_name='Про себе')
    website = models.URLField(blank=True, verbose_name='Веб-сайт')
    location = models.CharField(max_length=100, blank=True, verbose_name='Місцезнаходження')
    
    # Соціальні мережі
    facebook = models.URLField(blank=True, verbose_name='Facebook')
    twitter = models.URLField(blank=True, verbose_name='Twitter')
    instagram = models.URLField(blank=True, verbose_name='Instagram')
    
    # Налаштування приватності
    show_email = models.BooleanField(default=False, verbose_name='Показувати email')
    show_phone = models.BooleanField(default=False, verbose_name='Показувати телефон')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Створено')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Оновлено')

    class Meta:
        verbose_name = 'Профіль користувача'
        verbose_name_plural = 'Профілі користувачів'

    def __str__(self):
        return f"Профіль {self.user.email}"


class UserSession(models.Model):
    """Модель сесії користувача для відстеження активності"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions', 
                            verbose_name='Користувач')
    session_key = models.CharField(max_length=40, verbose_name='Ключ сесії')
    ip_address = models.GenericIPAddressField(verbose_name='IP адреса')
    user_agent = models.TextField(verbose_name='User Agent')
    is_active = models.BooleanField(default=True, verbose_name='Активна')
    last_activity = models.DateTimeField(auto_now=True, verbose_name='Остання активність')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Створено')

    class Meta:
        verbose_name = 'Сесія користувача'
        verbose_name_plural = 'Сесії користувачів'
        ordering = ['-last_activity']

    def __str__(self):
        return f"{self.user.email} - {self.ip_address}"


class Notification(models.Model):
    """Модель сповіщень користувача"""
    NOTIFICATION_TYPES = [
        ('order', 'Замовлення'),
        ('payment', 'Платіж'),
        ('shipping', 'Доставка'),
        ('promotion', 'Акція'),
        ('news', 'Новини'),
        ('system', 'Система'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', 
                            verbose_name='Користувач')
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, verbose_name='Тип')
    title = models.CharField(max_length=200, verbose_name='Заголовок')
    message = models.TextField(verbose_name='Повідомлення')
    is_read = models.BooleanField(default=False, verbose_name='Прочитано')
    is_email_sent = models.BooleanField(default=False, verbose_name='Email відправлено')
    is_sms_sent = models.BooleanField(default=False, verbose_name='SMS відправлено')
    
    # Посилання на об'єкт
    content_type = models.CharField(max_length=100, blank=True, verbose_name='Тип об\'єкта')
    object_id = models.PositiveIntegerField(blank=True, null=True, verbose_name='ID об\'єкта')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Створено')

    class Meta:
        verbose_name = 'Сповіщення'
        verbose_name_plural = 'Сповіщення'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.title}"

    def mark_as_read(self):
        """Позначити як прочитане"""
        self.is_read = True
        self.save()