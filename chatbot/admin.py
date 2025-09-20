from django.contrib import admin
from .models import ChatMessage, ChatSession

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['session_id', 'message_type', 'content_preview', 'user', 'timestamp', 'is_read']
    list_filter = ['message_type', 'is_read', 'timestamp', 'user']
    search_fields = ['content', 'session_id', 'user__username', 'user__email']
    readonly_fields = ['timestamp']
    list_per_page = 50
    
    def content_preview(self, obj):
        return obj.content[:100] + "..." if len(obj.content) > 100 else obj.content
    content_preview.short_description = "Попередній перегляд"

@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ['session_id', 'user', 'created_at', 'last_activity', 'is_active']
    list_filter = ['is_active', 'created_at', 'last_activity']
    search_fields = ['session_id', 'user__username', 'user__email']
    readonly_fields = ['created_at', 'last_activity']
    list_per_page = 50
