# 💡 Приклади використання API Ptashka.shop

## 🚀 Швидкий старт

### 1. Реєстрація та аутентифікація

```bash
# Реєстрація нового користувача
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ivan.petrenko@example.com",
    "password": "securepassword123",
    "password_confirm": "securepassword123",
    "first_name": "Іван",
    "last_name": "Петренко",
    "phone": "+380501234567"
  }'
```

**Відповідь:**
```json
{
  "user": {
    "id": 1,
    "email": "ivan.petrenko@example.com",
    "first_name": "Іван",
    "last_name": "Петренко",
    "phone": "+380501234567"
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

```bash
# Вхід в систему
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ivan.petrenko@example.com",
    "password": "securepassword123"
  }'
```

### 2. Пошук та перегляд товарів

```bash
# Пошук товарів
curl -X GET "http://localhost:8000/api/products/?search=iphone&min_price=500&max_price=1500" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

```bash
# Отримання деталей товару
curl -X GET http://localhost:8000/api/products/1/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

```bash
# Отримання категорій
curl -X GET http://localhost:8000/api/categories/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Робота з кошиком

```bash
# Додавання товару до кошика
curl -X POST http://localhost:8000/api/cart/add/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "product_id": 1,
    "variant_id": 1,
    "quantity": 2
  }'
```

```bash
# Перегляд кошика
curl -X GET http://localhost:8000/api/cart/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

```bash
# Оновлення кількості товару
curl -X PUT http://localhost:8000/api/cart/items/1/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "quantity": 3
  }'
```

## 🛍️ Повний цикл покупки

### JavaScript/Node.js приклад

```javascript
class PtashkaShopAPI {
  constructor(baseURL = 'http://localhost:8000/api') {
    this.baseURL = baseURL;
    this.accessToken = null;
    this.refreshToken = null;
  }

  // Аутентифікація
  async login(email, password) {
    const response = await fetch(`${this.baseURL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      return data;
    }
    throw new Error('Помилка входу');
  }

  // Заголовки з токеном
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`,
    };
  }

  // Пошук товарів
  async searchProducts(query, filters = {}) {
    const params = new URLSearchParams({
      search: query,
      ...filters,
    });

    const response = await fetch(`${this.baseURL}/products/?${params}`, {
      headers: this.getAuthHeaders(),
    });

    return response.json();
  }

  // Додавання до кошика
  async addToCart(productId, variantId, quantity = 1) {
    const response = await fetch(`${this.baseURL}/cart/add/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        product_id: productId,
        variant_id: variantId,
        quantity,
      }),
    });

    return response.json();
  }

  // Отримання кошика
  async getCart() {
    const response = await fetch(`${this.baseURL}/cart/`, {
      headers: this.getAuthHeaders(),
    });

    return response.json();
  }

  // Створення замовлення
  async createOrder(orderData) {
    const response = await fetch(`${this.baseURL}/orders/create/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(orderData),
    });

    return response.json();
  }

  // Підтвердження платежу
  async confirmPayment(paymentIntentId, orderId) {
    const response = await fetch(`${this.baseURL}/payments/confirm/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        payment_intent_id: paymentIntentId,
        order_id: orderId,
      }),
    });

    return response.json();
  }
}

// Приклад використання
async function completePurchase() {
  const api = new PtashkaShopAPI();

  try {
    // 1. Вхід в систему
    await api.login('ivan.petrenko@example.com', 'securepassword123');
    console.log('✅ Успішно увійшли в систему');

    // 2. Пошук товару
    const products = await api.searchProducts('iphone', {
      min_price: 500,
      max_price: 1500,
      ordering: 'price'
    });
    console.log('📱 Знайдено товарів:', products.count);

    // 3. Додавання до кошика
    if (products.results.length > 0) {
      const product = products.results[0];
      await api.addToCart(product.id, product.variants[0].id, 1);
      console.log('🛒 Товар додано до кошика');

      // 4. Перегляд кошика
      const cart = await api.getCart();
      console.log('📦 Вміст кошика:', cart.total_items, 'товарів');

      // 5. Створення замовлення
      const orderData = {
        delivery_address: {
          first_name: 'Іван',
          last_name: 'Петренко',
          street: 'вул. Хрещатик, 22',
          apartment: '5',
          city: 'Київ',
          postal_code: '01001',
          country: 'Україна',
          phone: '+380501234567'
        },
        billing_address: {
          same_as_delivery: true
        },
        shipping_method: 'nova_poshta',
        payment_method: 'stripe',
        notes: 'Будь ласка, доставте в робочий час'
      };

      const order = await api.createOrder(orderData);
      console.log('📋 Замовлення створено:', order.order.order_number);

      // 6. Підтвердження платежу (симуляція)
      const paymentResult = await api.confirmPayment(
        order.order.payment_intent.payment_intent_id,
        order.order.id
      );
      console.log('💳 Платіж підтверджено:', paymentResult.order.status);

    }
  } catch (error) {
    console.error('❌ Помилка:', error.message);
  }
}

// Запуск прикладу
completePurchase();
```

## 🐍 Python приклад

```python
import requests
import json
from typing import Dict, Any, Optional

class PtashkaShopAPI:
    def __init__(self, base_url: str = "http://localhost:8000/api"):
        self.base_url = base_url
        self.access_token: Optional[str] = None
        self.refresh_token: Optional[str] = None
        self.session = requests.Session()

    def login(self, email: str, password: str) -> Dict[str, Any]:
        """Вхід в систему"""
        response = self.session.post(
            f"{self.base_url}/auth/login/",
            json={"email": email, "password": password}
        )
        response.raise_for_status()
        
        data = response.json()
        self.access_token = data["access_token"]
        self.refresh_token = data["refresh_token"]
        
        # Додаємо токен до всіх подальших запитів
        self.session.headers.update({
            "Authorization": f"Bearer {self.access_token}"
        })
        
        return data

    def register(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Реєстрація нового користувача"""
        response = self.session.post(
            f"{self.base_url}/auth/register/",
            json=user_data
        )
        response.raise_for_status()
        return response.json()

    def search_products(self, query: str, **filters) -> Dict[str, Any]:
        """Пошук товарів"""
        params = {"search": query, **filters}
        response = self.session.get(f"{self.base_url}/products/", params=params)
        response.raise_for_status()
        return response.json()

    def get_product(self, product_id: int) -> Dict[str, Any]:
        """Отримання деталей товару"""
        response = self.session.get(f"{self.base_url}/products/{product_id}/")
        response.raise_for_status()
        return response.json()

    def add_to_cart(self, product_id: int, variant_id: int, quantity: int = 1) -> Dict[str, Any]:
        """Додавання товару до кошика"""
        response = self.session.post(
            f"{self.baseURL}/cart/add/",
            json={
                "product_id": product_id,
                "variant_id": variant_id,
                "quantity": quantity
            }
        )
        response.raise_for_status()
        return response.json()

    def get_cart(self) -> Dict[str, Any]:
        """Отримання вмісту кошика"""
        response = self.session.get(f"{self.base_url}/cart/")
        response.raise_for_status()
        return response.json()

    def create_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Створення замовлення"""
        response = self.session.post(
            f"{self.base_url}/orders/create/",
            json=order_data
        )
        response.raise_for_status()
        return response.json()

    def get_orders(self) -> Dict[str, Any]:
        """Отримання списку замовлень"""
        response = self.session.get(f"{self.base_url}/orders/")
        response.raise_for_status()
        return response.json()

    def add_review(self, product_id: int, review_data: Dict[str, Any]) -> Dict[str, Any]:
        """Додавання відгуку"""
        response = self.session.post(
            f"{self.base_url}/products/{product_id}/reviews/",
            json=review_data
        )
        response.raise_for_status()
        return response.json()

# Приклад використання
def main():
    api = PtashkaShopAPI()

    try:
        # Реєстрація користувача
        user_data = {
            "email": "test@example.com",
            "password": "testpassword123",
            "password_confirm": "testpassword123",
            "first_name": "Тест",
            "last_name": "Користувач",
            "phone": "+380501234567"
        }
        
        registration_result = api.register(user_data)
        print(f"✅ Користувач зареєстрований: {registration_result['user']['email']}")

        # Вхід в систему
        login_result = api.login("test@example.com", "testpassword123")
        print(f"🔐 Успішно увійшли в систему")

        # Пошук товарів
        products = api.search_products("iphone", min_price=500, max_price=1500)
        print(f"📱 Знайдено товарів: {products['count']}")

        if products["results"]:
            # Отримання деталей першого товару
            product = products["results"][0]
            product_details = api.get_product(product["id"])
            print(f"📋 Деталі товару: {product_details['name']}")

            # Додавання до кошика
            if product_details["variants"]:
                variant = product_details["variants"][0]
                cart_result = api.add_to_cart(
                    product["id"], 
                    variant["id"], 
                    quantity=1
                )
                print(f"🛒 Товар додано до кошика")

                # Перегляд кошика
                cart = api.get_cart()
                print(f"📦 В кошику: {cart['total_items']} товарів")

                # Створення замовлення
                order_data = {
                    "delivery_address": {
                        "first_name": "Тест",
                        "last_name": "Користувач",
                        "street": "вул. Тестова, 1",
                        "city": "Київ",
                        "postal_code": "01001",
                        "country": "Україна",
                        "phone": "+380501234567"
                    },
                    "billing_address": {"same_as_delivery": True},
                    "shipping_method": "nova_poshta",
                    "payment_method": "stripe"
                }

                order = api.create_order(order_data)
                print(f"📋 Замовлення створено: {order['order']['order_number']}")

        # Отримання списку замовлень
        orders = api.get_orders()
        print(f"📊 Всього замовлень: {orders['count']}")

        # Додавання відгуку
        if products["results"]:
            product_id = products["results"][0]["id"]
            review_data = {
                "rating": 5,
                "title": "Відмінний товар!",
                "comment": "Дуже задоволений покупкою",
                "pros": ["Швидка робота", "Добра якість"],
                "cons": ["Висока ціна"]
            }
            
            review = api.add_review(product_id, review_data)
            print(f"⭐ Відгук додано: {review['title']}")

    except requests.exceptions.RequestException as e:
        print(f"❌ Помилка API: {e}")
    except Exception as e:
        print(f"❌ Загальна помилка: {e}")

if __name__ == "__main__":
    main()
```

## 🔧 Postman колекція

Створюємо файл Postman колекції:

```json
{
  "info": {
    "name": "Ptashka.shop API",
    "description": "API для інтернет-магазину Ptashka.shop",
    "version": "1.0.0"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8000/api"
    },
    {
      "key": "access_token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"testpassword123\",\n  \"password_confirm\": \"testpassword123\",\n  \"first_name\": \"Тест\",\n  \"last_name\": \"Користувач\",\n  \"phone\": \"+380501234567\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/register/",
              "host": ["{{base_url}}"],
              "path": ["auth", "register", ""]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"testpassword123\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/login/",
              "host": ["{{base_url}}"],
              "path": ["auth", "login", ""]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    const response = pm.response.json();",
                  "    pm.collectionVariables.set('access_token', response.access_token);",
                  "}"
                ]
              }
            }
          ]
        }
      ]
    },
    {
      "name": "Products",
      "item": [
        {
          "name": "Get Products",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/products/?search=iphone&min_price=500&max_price=1500",
              "host": ["{{base_url}}"],
              "path": ["products", ""],
              "query": [
                {
                  "key": "search",
                  "value": "iphone"
                },
                {
                  "key": "min_price",
                  "value": "500"
                },
                {
                  "key": "max_price",
                  "value": "1500"
                }
              ]
            }
          }
        },
        {
          "name": "Get Product Details",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/products/1/",
              "host": ["{{base_url}}"],
              "path": ["products", "1", ""]
            }
          }
        }
      ]
    },
    {
      "name": "Cart",
      "item": [
        {
          "name": "Add to Cart",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"product_id\": 1,\n  \"variant_id\": 1,\n  \"quantity\": 2\n}"
            },
            "url": {
              "raw": "{{base_url}}/cart/add/",
              "host": ["{{base_url}}"],
              "path": ["cart", "add", ""]
            }
          }
        },
        {
          "name": "Get Cart",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/cart/",
              "host": ["{{base_url}}"],
              "path": ["cart", ""]
            }
          }
        }
      ]
    }
  ]
}
```

## 🧪 Тестування з Jest (JavaScript)

```javascript
// api.test.js
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api';

describe('Ptashka.shop API Tests', () => {
  let accessToken;
  let testUserId;

  beforeAll(async () => {
    // Реєстрація тестового користувача
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register/`, {
      email: 'test@example.com',
      password: 'testpassword123',
      password_confirm: 'testpassword123',
      first_name: 'Тест',
      last_name: 'Користувач',
      phone: '+380501234567'
    });

    accessToken = registerResponse.data.access_token;
    testUserId = registerResponse.data.user.id;
  });

  describe('Authentication', () => {
    test('should register new user', async () => {
      const response = await axios.post(`${API_BASE_URL}/auth/register/`, {
        email: 'newuser@example.com',
        password: 'newpassword123',
        password_confirm: 'newpassword123',
        first_name: 'Новий',
        last_name: 'Користувач'
      });

      expect(response.status).toBe(201);
      expect(response.data.user).toHaveProperty('email', 'newuser@example.com');
      expect(response.data).toHaveProperty('access_token');
    });

    test('should login existing user', async () => {
      const response = await axios.post(`${API_BASE_URL}/auth/login/`, {
        email: 'test@example.com',
        password: 'testpassword123'
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('access_token');
    });
  });

  describe('Products', () => {
    test('should get products list', async () => {
      const response = await axios.get(`${API_BASE_URL}/products/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('results');
      expect(Array.isArray(response.data.results)).toBe(true);
    });

    test('should search products', async () => {
      const response = await axios.get(
        `${API_BASE_URL}/products/?search=iphone&min_price=500`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('count');
    });
  });

  describe('Cart', () => {
    test('should add product to cart', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/cart/add/`,
        {
          product_id: 1,
          variant_id: 1,
          quantity: 2
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('success', true);
    });

    test('should get cart contents', async () => {
      const response = await axios.get(`${API_BASE_URL}/cart/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('items');
      expect(response.data).toHaveProperty('total_items');
    });
  });

  describe('Orders', () => {
    test('should create order', async () => {
      const orderData = {
        delivery_address: {
          first_name: 'Тест',
          last_name: 'Користувач',
          street: 'вул. Тестова, 1',
          city: 'Київ',
          postal_code: '01001',
          country: 'Україна',
          phone: '+380501234567'
        },
        billing_address: { same_as_delivery: true },
        shipping_method: 'nova_poshta',
        payment_method: 'stripe'
      };

      const response = await axios.post(
        `${API_BASE_URL}/orders/create/`,
        orderData,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data.order).toHaveProperty('order_number');
    });
  });
});
```

## 🔄 Webhook тестування

```javascript
// webhook.test.js
const axios = require('axios');

describe('Webhook Tests', () => {
  test('should handle Stripe payment success webhook', async () => {
    const webhookPayload = {
      id: 'evt_test_webhook',
      object: 'event',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_payment_intent',
          amount: 184998,
          currency: 'uah',
          status: 'succeeded'
        }
      }
    };

    const response = await axios.post(
      'http://localhost:8000/api/webhooks/stripe/',
      webhookPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Stripe-Signature': 'test_signature'
        }
      }
    );

    expect(response.status).toBe(200);
  });
});
```

## 📊 Моніторинг API

```javascript
// api-monitoring.js
class APIMonitor {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.metrics = {
      requests: 0,
      errors: 0,
      avgResponseTime: 0,
      responseTimes: []
    };
  }

  async makeRequest(endpoint, options = {}) {
    const startTime = Date.now();
    this.metrics.requests++;

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, options);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      this.metrics.responseTimes.push(responseTime);
      this.metrics.avgResponseTime = 
        this.metrics.responseTimes.reduce((a, b) => a + b, 0) / 
        this.metrics.responseTimes.length;

      if (!response.ok) {
        this.metrics.errors++;
      }

      return response;
    } catch (error) {
      this.metrics.errors++;
      throw error;
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      errorRate: this.metrics.errors / this.metrics.requests,
      maxResponseTime: Math.max(...this.metrics.responseTimes),
      minResponseTime: Math.min(...this.metrics.responseTimes)
    };
  }
}

// Використання
const monitor = new APIMonitor('http://localhost:8000/api');

// Тестування API
async function testAPI() {
  const endpoints = [
    '/products/',
    '/categories/',
    '/cart/',
    '/orders/'
  ];

  for (const endpoint of endpoints) {
    try {
      await monitor.makeRequest(endpoint, {
        headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
      });
    } catch (error) {
      console.error(`Помилка на ${endpoint}:`, error.message);
    }
  }

  console.log('Метрики API:', monitor.getMetrics());
}
```

Ці приклади покривають всі основні сценарії використання API Ptashka.shop і допоможуть розробникам швидко інтегруватися з системою.
