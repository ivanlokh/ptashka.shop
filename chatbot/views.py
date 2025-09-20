import json
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from django.utils import timezone
from .models import ChatMessage, ChatSession
from .chatbot_logic import ChatbotProcessor

@method_decorator(csrf_exempt, name='dispatch')
class ChatbotAPIView(View):
    """API view для чатбота"""
    
    def post(self, request):
        """Обробка повідомлень від користувача"""
        try:
            data = json.loads(request.body)
            message = data.get('message', '').strip()
            session_id = data.get('session_id', '')
            
            if not message:
                return JsonResponse({
                    'success': False,
                    'error': 'Повідомлення не може бути порожнім'
                })
            
            # Створюємо або отримуємо сесію
            if not session_id:
                session_id = str(uuid.uuid4())
                ChatSession.objects.create(
                    session_id=session_id,
                    user=request.user if request.user.is_authenticated else None
                )
            else:
                try:
                    session = ChatSession.objects.get(session_id=session_id)
                    session.update_activity()
                except ChatSession.DoesNotExist:
                    session_id = str(uuid.uuid4())
                    ChatSession.objects.create(
                        session_id=session_id,
                        user=request.user if request.user.is_authenticated else None
                    )
            
            # Зберігаємо повідомлення користувача
            user_message = ChatMessage.objects.create(
                session_id=session_id,
                user=request.user if request.user.is_authenticated else None,
                message_type='user',
                content=message
            )
            
            # Обробляємо повідомлення чатботом
            chatbot = ChatbotProcessor()
            bot_response = chatbot.process_message(message, session_id)
            
            # Зберігаємо відповідь чатбота
            bot_message = ChatMessage.objects.create(
                session_id=session_id,
                user=None,
                message_type='bot',
                content=bot_response['message'],
                metadata=bot_response.get('metadata', {})
            )
            
            return JsonResponse({
                'success': True,
                'session_id': session_id,
                'bot_response': bot_response['message'],
                'suggestions': bot_response.get('suggestions', []),
                'metadata': bot_response.get('metadata', {})
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Невірний JSON формат'
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Помилка сервера: {str(e)}'
            })
    
    def get(self, request):
        """Отримання історії повідомлень"""
        session_id = request.GET.get('session_id', '')
        
        if not session_id:
            return JsonResponse({
                'success': False,
                'error': 'Session ID не надано'
            })
        
        try:
            messages = ChatMessage.objects.filter(
                session_id=session_id
            ).order_by('timestamp')[:50]  # Останні 50 повідомлень
            
            messages_data = []
            for msg in messages:
                messages_data.append({
                    'id': msg.id,
                    'type': msg.message_type,
                    'content': msg.content,
                    'timestamp': msg.timestamp.isoformat(),
                    'metadata': msg.metadata
                })
            
            return JsonResponse({
                'success': True,
                'messages': messages_data
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Помилка отримання повідомлень: {str(e)}'
            })

@csrf_exempt
@require_http_methods(["POST"])
def send_message(request):
    """Простий endpoint для відправки повідомлень"""
    view = ChatbotAPIView()
    return view.post(request)

@require_http_methods(["GET"])
def get_messages(request):
    """Простий endpoint для отримання повідомлень"""
    view = ChatbotAPIView()
    return view.get(request)
