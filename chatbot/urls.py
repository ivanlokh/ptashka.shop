from django.urls import path
from . import views

app_name = 'chatbot'

urlpatterns = [
    path('api/send/', views.ChatbotAPIView.as_view(), name='send_message'),
    path('api/messages/', views.ChatbotAPIView.as_view(), name='get_messages'),
    path('api/send-message/', views.send_message, name='send_message_simple'),
    path('api/get-messages/', views.get_messages, name='get_messages_simple'),
]
