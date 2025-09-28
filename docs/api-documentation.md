# 📚 API Документація Ptashka.shop

## 🔗 Swagger/OpenAPI документація

### Доступ до документації:
- **Swagger UI**: `http://localhost:8000/api/docs/`
- **ReDoc**: `http://localhost:8000/api/redoc/`
- **OpenAPI Schema**: `http://localhost:8000/api/schema/`

## 🛠 Налаштування Swagger

### Встановлення залежностей:
```bash
pip install drf-spectacular
```

### Налаштування settings.py:
```python
INSTALLED_APPS = [
    # ... інші додатки
    'drf_spectacular',
]

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Ptashka.shop API',
    'DESCRIPTION': 'API для інтернет-магазину Ptashka.shop',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SORT_OPERATIONS': False,
}
```

### URLs конфігурація:
```python
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    # API endpoints
    path('api/', include('shop.api.urls')),
    path('api/', include('accounts.api.urls')),
    path('api/', include('cart.api.urls')),
    path('api/', include('orders.api.urls')),
    path('api/', include('payments.api.urls')),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
```

## 🛒 API Endpoints

### 🏠 Загальні endpoints

#### `GET /api/`
Отримання інформації про API
```json
{
  "name": "Ptashka.shop API",
  "version": "1.0.0",
  "description": "API для інтернет-магазину Ptashka.shop"
}
```

### 👤 Аутентифікація (`/api/auth/`)

#### `POST /api/auth/register/`
Реєстрація нового користувача
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "password_confirm": "securepassword123",
  "first_name": "Іван",
  "last_name": "Петренко",
  "phone": "+380501234567"
}
```

**Відповідь:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "Іван",
    "last_name": "Петренко",
    "phone": "+380501234567"
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### `POST /api/auth/login/`
Вхід в систему
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### `POST /api/auth/logout/`
Вихід з системи
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### `POST /api/auth/refresh/`
Оновлення access token
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 🛍️ Товари (`/api/products/`)

#### `GET /api/products/`
Отримання списку товарів з фільтрацією та пагінацією

**Параметри запиту:**
- `page` - номер сторінки (default: 1)
- `page_size` - кількість товарів на сторінці (default: 20)
- `category` - ID категорії
- `search` - пошуковий запит
- `min_price` - мінімальна ціна
- `max_price` - максимальна ціна
- `brand` - бренд
- `in_stock` - тільки товари в наявності (true/false)
- `ordering` - сортування (price, -price, name, -name, created_at, -created_at)

**Приклад запиту:**
```
GET /api/products/?category=1&min_price=100&max_price=1000&ordering=price&page=1
```

**Відповідь:**
```json
{
  "count": 150,
  "next": "http://localhost:8000/api/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "description": "Найновіший iPhone з титановим корпусом",
      "price": 999.99,
      "sale_price": 899.99,
      "in_stock": true,
      "stock_quantity": 25,
      "rating": 4.8,
      "reviews_count": 127,
      "category": {
        "id": 1,
        "name": "Смартфони",
        "slug": "smartphones"
      },
      "brand": {
        "id": 1,
        "name": "Apple",
        "slug": "apple"
      },
      "images": [
        {
          "id": 1,
          "image": "https://example.com/images/iphone15pro-1.jpg",
          "alt_text": "iPhone 15 Pro - фронтальний вигляд",
          "is_primary": true
        }
      ],
      "specifications": {
        "display": "6.1 inch Super Retina XDR",
        "processor": "A17 Pro",
        "storage": "128GB",
        "color": "Natural Titanium"
      },
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-20T15:45:00Z"
    }
  ]
}
```

#### `GET /api/products/{id}/`
Отримання детальної інформації про товар

**Відповідь:**
```json
{
  "id": 1,
  "name": "iPhone 15 Pro",
  "slug": "iphone-15-pro",
  "description": "Детальний опис товару...",
  "full_description": "Повний опис з HTML форматуванням...",
  "price": 999.99,
  "sale_price": 899.99,
  "in_stock": true,
  "stock_quantity": 25,
  "rating": 4.8,
  "reviews_count": 127,
  "category": {
    "id": 1,
    "name": "Смартфони",
    "slug": "smartphones",
    "parent": null
  },
  "brand": {
    "id": 1,
    "name": "Apple",
    "slug": "apple",
    "logo": "https://example.com/logos/apple.png"
  },
  "images": [
    {
      "id": 1,
      "image": "https://example.com/images/iphone15pro-1.jpg",
      "alt_text": "iPhone 15 Pro - фронтальний вигляд",
      "is_primary": true,
      "order": 1
    },
    {
      "id": 2,
      "image": "https://example.com/images/iphone15pro-2.jpg",
      "alt_text": "iPhone 15 Pro - задній вигляд",
      "is_primary": false,
      "order": 2
    }
  ],
  "variants": [
    {
      "id": 1,
      "name": "128GB Natural Titanium",
      "sku": "IPH15PRO-128-NT",
      "price": 899.99,
      "in_stock": true,
      "stock_quantity": 15,
      "attributes": {
        "storage": "128GB",
        "color": "Natural Titanium"
      }
    },
    {
      "id": 2,
      "name": "256GB Natural Titanium",
      "sku": "IPH15PRO-256-NT",
      "price": 999.99,
      "in_stock": true,
      "stock_quantity": 10,
      "attributes": {
        "storage": "256GB",
        "color": "Natural Titanium"
      }
    }
  ],
  "specifications": {
    "display": "6.1 inch Super Retina XDR",
    "processor": "A17 Pro",
    "storage": "128GB/256GB/512GB/1TB",
    "color": "Natural Titanium, Blue Titanium, White Titanium, Black Titanium",
    "camera": "48MP Main, 12MP Ultra Wide, 12MP Telephoto",
    "battery": "Up to 23 hours video playback"
  },
  "reviews": {
    "average_rating": 4.8,
    "total_reviews": 127,
    "rating_distribution": {
      "5": 89,
      "4": 28,
      "3": 7,
      "2": 2,
      "1": 1
    }
  },
  "related_products": [
    {
      "id": 2,
      "name": "iPhone 15",
      "slug": "iphone-15",
      "price": 799.99,
      "sale_price": 699.99,
      "rating": 4.6,
      "images": [...]
    }
  ],
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T15:45:00Z"
}
```

### 📂 Категорії (`/api/categories/`)

#### `GET /api/categories/`
Отримання дерева категорій

**Відповідь:**
```json
[
  {
    "id": 1,
    "name": "Смартфони",
    "slug": "smartphones",
    "description": "Мобільні телефони та аксесуари",
    "image": "https://example.com/categories/smartphones.jpg",
    "parent": null,
    "level": 0,
    "children": [
      {
        "id": 2,
        "name": "iPhone",
        "slug": "iphone",
        "description": "Смартфони Apple",
        "image": "https://example.com/categories/iphone.jpg",
        "parent": 1,
        "level": 1,
        "children": []
      },
      {
        "id": 3,
        "name": "Samsung",
        "slug": "samsung",
        "description": "Смартфони Samsung",
        "image": "https://example.com/categories/samsung.jpg",
        "parent": 1,
        "level": 1,
        "children": []
      }
    ],
    "product_count": 45
  },
  {
    "id": 4,
    "name": "Ноутбуки",
    "slug": "laptops",
    "description": "Портативні комп'ютери",
    "image": "https://example.com/categories/laptops.jpg",
    "parent": null,
    "level": 0,
    "children": [],
    "product_count": 23
  }
]
```

### 🛒 Кошик (`/api/cart/`)

#### `GET /api/cart/`
Отримання вмісту кошика

**Відповідь:**
```json
{
  "id": 1,
  "items": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "name": "iPhone 15 Pro",
        "slug": "iphone-15-pro",
        "price": 999.99,
        "sale_price": 899.99,
        "images": [...]
      },
      "variant": {
        "id": 1,
        "name": "128GB Natural Titanium",
        "sku": "IPH15PRO-128-NT",
        "price": 899.99
      },
      "quantity": 2,
      "total_price": 1799.98,
      "added_at": "2024-01-20T10:30:00Z"
    }
  ],
  "subtotal": 1799.98,
  "total_items": 2,
  "created_at": "2024-01-20T10:30:00Z",
  "updated_at": "2024-01-20T15:45:00Z"
}
```

#### `POST /api/cart/add/`
Додавання товару до кошика

**Запит:**
```json
{
  "product_id": 1,
  "variant_id": 1,
  "quantity": 2
}
```

**Відповідь:**
```json
{
  "success": true,
  "message": "Товар додано до кошика",
  "cart_item": {
    "id": 1,
    "product": {...},
    "variant": {...},
    "quantity": 2,
    "total_price": 1799.98
  },
  "cart_total": 1799.98
}
```

#### `PUT /api/cart/items/{id}/`
Оновлення кількості товару в кошику

**Запит:**
```json
{
  "quantity": 3
}
```

#### `DELETE /api/cart/items/{id}/`
Видалення товару з кошика

#### `DELETE /api/cart/clear/`
Очищення кошика

### 📦 Замовлення (`/api/orders/`)

#### `GET /api/orders/`
Отримання списку замовлень користувача

**Відповідь:**
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "order_number": "ORD-2024-001",
      "status": "delivered",
      "total": 1799.98,
      "created_at": "2024-01-15T10:30:00Z",
      "delivery_address": {
        "street": "вул. Хрещатик, 22",
        "city": "Київ",
        "postal_code": "01001",
        "country": "Україна"
      },
      "items_count": 2
    }
  ]
}
```

#### `GET /api/orders/{id}/`
Отримання деталей замовлення

**Відповідь:**
```json
{
  "id": 1,
  "order_number": "ORD-2024-001",
  "status": "delivered",
  "status_display": "Доставлено",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-17T14:20:00Z",
  "delivery_date": "2024-01-17T14:20:00Z",
  "items": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "name": "iPhone 15 Pro",
        "slug": "iphone-15-pro",
        "images": [...]
      },
      "variant": {
        "id": 1,
        "name": "128GB Natural Titanium",
        "sku": "IPH15PRO-128-NT"
      },
      "quantity": 2,
      "price": 899.99,
      "total": 1799.98
    }
  ],
  "subtotal": 1799.98,
  "shipping_cost": 50.00,
  "tax": 0.00,
  "total": 1849.98,
  "delivery_address": {
    "first_name": "Іван",
    "last_name": "Петренко",
    "street": "вул. Хрещатик, 22",
    "apartment": "5",
    "city": "Київ",
    "postal_code": "01001",
    "country": "Україна",
    "phone": "+380501234567"
  },
  "billing_address": {...},
  "payment": {
    "method": "stripe",
    "status": "paid",
    "transaction_id": "pi_1234567890",
    "paid_at": "2024-01-15T10:35:00Z"
  },
  "tracking": {
    "carrier": "Nova Poshta",
    "tracking_number": "1234567890123456",
    "tracking_url": "https://novaposhta.ua/tracking/1234567890123456"
  }
}
```

#### `POST /api/orders/create/`
Створення нового замовлення

**Запит:**
```json
{
  "delivery_address": {
    "first_name": "Іван",
    "last_name": "Петренко",
    "street": "вул. Хрещатик, 22",
    "apartment": "5",
    "city": "Київ",
    "postal_code": "01001",
    "country": "Україна",
    "phone": "+380501234567"
  },
  "billing_address": {
    "same_as_delivery": true
  },
  "shipping_method": "nova_poshta",
  "payment_method": "stripe",
  "notes": "Додаткові примітки до замовлення"
}
```

**Відповідь:**
```json
{
  "success": true,
  "order": {
    "id": 1,
    "order_number": "ORD-2024-001",
    "status": "pending_payment",
    "total": 1849.98,
    "payment_intent": {
      "client_secret": "pi_1234567890_secret_abc123",
      "payment_intent_id": "pi_1234567890"
    }
  }
}
```

### 💳 Платежі (`/api/payments/`)

#### `POST /api/payments/confirm/`
Підтвердження платежу

**Запит:**
```json
{
  "payment_intent_id": "pi_1234567890",
  "order_id": 1
}
```

**Відповідь:**
```json
{
  "success": true,
  "message": "Платіж успішно оброблено",
  "order": {
    "id": 1,
    "order_number": "ORD-2024-001",
    "status": "confirmed",
    "payment": {
      "transaction_id": "pi_1234567890",
      "status": "paid",
      "amount": 1849.98,
      "paid_at": "2024-01-15T10:35:00Z"
    }
  }
}
```

### ⭐ Відгуки (`/api/reviews/`)

#### `GET /api/products/{id}/reviews/`
Отримання відгуків про товар

**Відповідь:**
```json
{
  "count": 127,
  "next": "http://localhost:8000/api/products/1/reviews/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "first_name": "Іван",
        "last_name": "П.",
        "avatar": "https://example.com/avatars/user1.jpg"
      },
      "rating": 5,
      "title": "Відмінний телефон!",
      "comment": "Дуже задоволений покупкою. Якість на висоті.",
      "pros": ["Швидка робота", "Добре камера"],
      "cons": ["Висока ціна"],
      "verified_purchase": true,
      "helpful_count": 12,
      "created_at": "2024-01-18T14:30:00Z"
    }
  ],
  "average_rating": 4.8,
  "rating_distribution": {
    "5": 89,
    "4": 28,
    "3": 7,
    "2": 2,
    "1": 1
  }
}
```

#### `POST /api/products/{id}/reviews/`
Додавання відгуку (тільки для авторизованих користувачів)

**Запит:**
```json
{
  "rating": 5,
  "title": "Відмінний телефон!",
  "comment": "Дуже задоволений покупкою.",
  "pros": ["Швидка робота", "Добре камера"],
  "cons": ["Висока ціна"]
}
```

### 👤 Профіль користувача (`/api/profile/`)

#### `GET /api/profile/`
Отримання профілю користувача

**Відповідь:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "Іван",
  "last_name": "Петренко",
  "phone": "+380501234567",
  "avatar": "https://example.com/avatars/user1.jpg",
  "date_joined": "2024-01-01T10:00:00Z",
  "addresses": [
    {
      "id": 1,
      "type": "delivery",
      "first_name": "Іван",
      "last_name": "Петренко",
      "street": "вул. Хрещатик, 22",
      "apartment": "5",
      "city": "Київ",
      "postal_code": "01001",
      "country": "Україна",
      "phone": "+380501234567",
      "is_default": true
    }
  ],
  "statistics": {
    "total_orders": 5,
    "total_spent": 9249.90,
    "reviews_count": 3,
    "wishlist_count": 7
  }
}
```

#### `PUT /api/profile/`
Оновлення профілю користувача

**Запит:**
```json
{
  "first_name": "Іван",
  "last_name": "Петренко",
  "phone": "+380501234567"
}
```

### 🔍 Пошук (`/api/search/`)

#### `GET /api/search/`
Пошук товарів

**Параметри:**
- `q` - пошуковий запит (обов'язковий)
- `category` - ID категорії
- `min_price` - мінімальна ціна
- `max_price` - максимальна ціна
- `brand` - бренд
- `in_stock` - тільки в наявності
- `ordering` - сортування

**Приклад:**
```
GET /api/search/?q=iphone&min_price=500&max_price=1500&ordering=price
```

### 📊 Аналітика (`/api/analytics/`)

#### `GET /api/analytics/popular-products/`
Найпопулярніші товари

**Відповідь:**
```json
{
  "period": "30_days",
  "products": [
    {
      "product": {
        "id": 1,
        "name": "iPhone 15 Pro",
        "slug": "iphone-15-pro",
        "price": 999.99,
        "images": [...]
      },
      "views": 1250,
      "orders": 45,
      "revenue": 40499.55
    }
  ]
}
```

## 🔐 Аутентифікація

### JWT Токени
API використовує JWT токени для аутентифікації. Токен повинен бути переданий в заголовку:
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Refresh Token
Access токен має термін дії 1 година. Для його оновлення використовуйте refresh token:
```
POST /api/auth/refresh/
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## 📝 Коди помилок

### Стандартні HTTP коди:
- `200` - Успішний запит
- `201` - Ресурс створено
- `400` - Неправильний запит
- `401` - Не авторизовано
- `403` - Доступ заборонено
- `404` - Ресурс не знайдено
- `429` - Перевищено ліміт запитів
- `500` - Внутрішня помилка сервера

### Формат помилки:
```json
{
  "error": "validation_error",
  "message": "Дані не пройшли валідацію",
  "details": {
    "email": ["Це поле обов'язкове"],
    "password": ["Пароль повинен містити мінімум 8 символів"]
  }
}
```

## 🚀 Rate Limiting

API має обмеження на кількість запитів:
- **Загальні endpoints**: 1000 запитів на годину
- **Аутентифікація**: 10 запитів на хвилину
- **Пошук**: 100 запитів на годину
- **Створення замовлень**: 10 запитів на хвилину

При перевищенні ліміту повертається код `429` з заголовками:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 📱 Webhook endpoints

### Stripe Webhooks (`/api/webhooks/stripe/`)
Обробка webhook подій від Stripe

**Підтримувані події:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`

### PayPal Webhooks (`/api/webhooks/paypal/`)
Обробка webhook подій від PayPal

## 🧪 Тестування API

### Використання Postman:
1. Імпортуйте колекцію з `docs/postman/Ptashka.shop API.postman_collection.json`
2. Налаштуйте змінні середовища
3. Запустіть тести

### Використання curl:
```bash
# Реєстрація
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "password_confirm": "testpassword123",
    "first_name": "Test",
    "last_name": "User"
  }'

# Отримання товарів
curl -X GET http://localhost:8000/api/products/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📚 Додаткові ресурси

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **OpenAPI Schema**: http://localhost:8000/api/schema/
- **Postman Collection**: `docs/postman/Ptashka.shop API.postman_collection.json`
