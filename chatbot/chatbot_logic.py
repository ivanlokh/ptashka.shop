import re
import random
from typing import Dict, List, Any
from .models import ChatSession

class ChatbotProcessor:
    """Клас для обробки повідомлень чатбота"""
    
    def __init__(self):
        self.greetings = [
            "Привіт! Я допоможу вам з вибором товарів. Що вас цікавить?",
            "Вітаю! Я ваш персональний помічник. Як можу допомогти?",
            "Привіт! Готовий допомогти з покупками. Що шукаєте?",
            "Вітаю в Ptashka.shop! Я допоможу знайти найкращі товари."
        ]
        
        self.goodbyes = [
            "До побачення! Звертайтеся, якщо виникнуть питання!",
            "Було приємно спілкуватися! Повертайтеся до нас!",
            "До зустрічі! Удачних покупок!",
            "Побачимося! Якщо потрібна допомога - я тут!"
        ]
        
        self.help_responses = [
            "Я можу допомогти вам з:\n• Пошуком товарів\n• Інформацією про доставку\n• Статусом замовлення\n• Технічними питаннями\n• Рекомендаціями товарів",
            "Ось що я можу зробити:\n• Знайти товари за назвою або категорією\n• Розповісти про акції та знижки\n• Допомогти з оформленням замовлення\n• Відповісти на питання про доставку"
        ]
        
        self.product_keywords = {
            'телефон': ['телефон', 'смартфон', 'мобільний', 'айфон', 'самсунг'],
            'ноутбук': ['ноутбук', 'лаптоп', 'комп\'ютер', 'macbook'],
            'навушники': ['навушники', 'гарнітура', 'airpods', 'бездротові'],
            'камера': ['камера', 'фотоапарат', 'відеокамера', 'зеркалка'],
            'телевізор': ['телевізор', 'тв', 'монітор', 'екран']
        }
        
        self.delivery_keywords = ['доставка', 'доставити', 'коли', 'швидко', 'термін']
        self.payment_keywords = ['оплата', 'платіж', 'гроші', 'ціна', 'коштує']
        self.return_keywords = ['повернення', 'обмін', 'гарантія', 'не підійшов']
    
    def process_message(self, message: str, session_id: str) -> Dict[str, Any]:
        """Обробка повідомлення користувача"""
        message_lower = message.lower().strip()
        
        # Отримуємо контекст сесії
        context = self._get_session_context(session_id)
        
        # Визначаємо тип запиту
        intent = self._classify_intent(message_lower)
        
        # Генеруємо відповідь
        response = self._generate_response(message_lower, intent, context)
        
        return response
    
    def _get_session_context(self, session_id: str) -> Dict[str, Any]:
        """Отримання контексту сесії"""
        try:
            session = ChatSession.objects.get(session_id=session_id)
            return session.context
        except ChatSession.DoesNotExist:
            return {}
    
    def _classify_intent(self, message: str) -> str:
        """Класифікація наміру користувача"""
        if any(word in message for word in ['привіт', 'вітаю', 'добрий день', 'доброго ранку', 'доброго вечора']):
            return 'greeting'
        elif any(word in message for word in ['допомога', 'допоможи', 'що можеш', 'функції']):
            return 'help'
        elif any(word in message for word in ['до побачення', 'бувай', 'пока', 'спасибі']):
            return 'goodbye'
        elif any(word in message for word in self.delivery_keywords):
            return 'delivery'
        elif any(word in message for word in self.payment_keywords):
            return 'payment'
        elif any(word in message for word in self.return_keywords):
            return 'return'
        elif any(word in message for word in ['товар', 'продукт', 'купити', 'замовити']):
            return 'product'
        elif self._detect_product_category(message):
            return 'product'
        else:
            return 'general'
    
    def _generate_response(self, message: str, intent: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Генерація відповіді на основі наміру"""
        
        if intent == 'greeting':
            return {
                'message': random.choice(self.greetings),
                'suggestions': ['Показати категорії', 'Акції та знижки', 'Допомога з замовленням'],
                'metadata': {'intent': 'greeting'}
            }
        
        elif intent == 'help':
            return {
                'message': random.choice(self.help_responses),
                'suggestions': ['Пошук товарів', 'Доставка', 'Оплата', 'Повернення'],
                'metadata': {'intent': 'help'}
            }
        
        elif intent == 'goodbye':
            return {
                'message': random.choice(self.goodbyes),
                'suggestions': [],
                'metadata': {'intent': 'goodbye'}
            }
        
        elif intent == 'delivery':
            return {
                'message': "🚚 **Доставка в Ptashka.shop:**\n\n• **Безкоштовна доставка** при замовленні від 1000 грн\n• **Швидка доставка** 1-2 дні по Києву\n• **Нова Пошта** - по всій Україні\n• **Самовивіз** з наших магазинів\n\nХочете дізнатися більше про конкретне замовлення?",
                'suggestions': ['Відстежити замовлення', 'Замовити доставку', 'Самовивіз'],
                'metadata': {'intent': 'delivery'}
            }
        
        elif intent == 'payment':
            return {
                'message': "💳 **Способи оплати:**\n\n• **Картою онлайн** - Visa, Mastercard\n• **Накладений платіж** - оплата при отриманні\n• **Банківський переказ**\n• **Розстрочка** - 0% на 6 місяців\n\nВсі платежі захищені!",
                'suggestions': ['Оформити замовлення', 'Розстрочка', 'Безпека платежів'],
                'metadata': {'intent': 'payment'}
            }
        
        elif intent == 'return':
            return {
                'message': "🔄 **Повернення та обмін:**\n\n• **14 днів** на повернення\n• **Безкоштовний** обмін розміру\n• **Гарантія** на всі товари\n• **Швидка** обробка заявок\n\nПотрібна допомога з поверненням?",
                'suggestions': ['Оформити повернення', 'Гарантія', 'Обмін товару'],
                'metadata': {'intent': 'return'}
            }
        
        elif intent == 'product':
            # Спроба визначити категорію товару
            category = self._detect_product_category(message)
            if category:
                return {
                    'message': f"🔍 Знайшов категорію: **{category}**\n\nОсь популярні товари в цій категорії:\n• Топові моделі\n• Акційні пропозиції\n• Новинки\n\nХочете подивитися конкретні товари?",
                    'suggestions': [f'Показати {category}', 'Акції', 'Новинки', 'Порівняти'],
                    'metadata': {'intent': 'product', 'category': category}
                }
            else:
                return {
                    'message': "🛍️ **Пошук товарів:**\n\nЯ можу допомогти знайти:\n• За назвою товару\n• За категорією\n• За брендом\n• За ціною\n\nЩо саме вас цікавить?",
                    'suggestions': ['Телефони', 'Ноутбуки', 'Навушники', 'Камери', 'Телевізори'],
                    'metadata': {'intent': 'product'}
                }
        
        else:
            return {
                'message': "🤔 Не зовсім зрозумів ваш запит.\n\nСпробуйте переформулювати або виберіть одну з опцій нижче:",
                'suggestions': ['Допомога', 'Пошук товарів', 'Доставка', 'Оплата', 'Повернення'],
                'metadata': {'intent': 'general'}
            }
    
    def _detect_product_category(self, message: str) -> str:
        """Визначення категорії товару з повідомлення"""
        for category, keywords in self.product_keywords.items():
            if any(keyword in message for keyword in keywords):
                return category.title()
        return None
