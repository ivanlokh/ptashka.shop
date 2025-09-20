from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class ChatMessage(models.Model):
    """Модель для зберігання повідомлень чатбота"""
    
    MESSAGE_TYPES = [
        ('user', 'Користувач'),
        ('bot', 'Бот'),
        ('system', 'Система'),
    ]
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        verbose_name="Користувач"
    )
    session_id = models.CharField(
        max_length=100, 
        verbose_name="ID сесії",
        help_text="Унікальний ідентифікатор сесії чату"
    )
    message_type = models.CharField(
        max_length=10,
        choices=MESSAGE_TYPES,
        default='user',
        verbose_name="Тип повідомлення"
    )
    content = models.TextField(verbose_name="Текст повідомлення")
    timestamp = models.DateTimeField(
        default=timezone.now,
        verbose_name="Час створення"
    )
    is_read = models.BooleanField(
        default=False,
        verbose_name="Прочитано"
    )
    metadata = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Додаткові дані",
        help_text="JSON з додатковою інформацією про повідомлення"
    )
    
    class Meta:
        verbose_name = "Повідомлення чатбота"
        verbose_name_plural = "Повідомлення чатбота"
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['session_id', 'timestamp']),
            models.Index(fields=['user', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.get_message_type_display()}: {self.content[:50]}..."

class ChatSession(models.Model):
    """Модель для зберігання сесій чату"""
    
    session_id = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="ID сесії"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name="Користувач"
    )
    created_at = models.DateTimeField(
        default=timezone.now,
        verbose_name="Час створення"
    )
    last_activity = models.DateTimeField(
        default=timezone.now,
        verbose_name="Остання активність"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Активна сесія"
    )
    context = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Контекст сесії",
        help_text="JSON з контекстом розмови"
    )
    
    class Meta:
        verbose_name = "Сесія чату"
        verbose_name_plural = "Сесії чату"
        ordering = ['-last_activity']
    
    def __str__(self):
        user_info = f"User: {self.user}" if self.user else "Anonymous"
        return f"Session {self.session_id} - {user_info}"
    
    def update_activity(self):
        """Оновити час останньої активності"""
        self.last_activity = timezone.now()
        self.save(update_fields=['last_activity'])
