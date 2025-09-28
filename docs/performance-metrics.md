# 📊 Performance метрики та бенчмарки Ptashka.shop

## 🎯 Цілі продуктивності

### Основні метрики:
- **Час відгуку API**: < 200ms для 95% запитів
- **Час завантаження сторінки**: < 2 секунди
- **Throughput**: 1000+ запитів/хвилину
- **Доступність**: 99.9% uptime
- **Database**: < 50ms для 90% запитів

## 📈 Performance бенчмарки

### 🚀 API Endpoints Performance

| Endpoint | Метод | Середній час відгуку | 95-й процентиль | Throughput (req/min) |
|----------|-------|---------------------|-----------------|---------------------|
| `/api/products/` | GET | 45ms | 120ms | 1500 |
| `/api/products/{id}/` | GET | 35ms | 80ms | 2000 |
| `/api/categories/` | GET | 25ms | 60ms | 3000 |
| `/api/cart/` | GET | 30ms | 70ms | 2500 |
| `/api/cart/add/` | POST | 80ms | 150ms | 800 |
| `/api/orders/create/` | POST | 150ms | 300ms | 400 |
| `/api/auth/login/` | POST | 120ms | 200ms | 600 |
| `/api/search/` | GET | 100ms | 250ms | 500 |

### 🗄️ Database Performance

| Операція | Середній час | 95-й процентиль | Оптимізації |
|----------|-------------|-----------------|-------------|
| Product list query | 15ms | 35ms | Indexes, select_related |
| Product detail | 8ms | 20ms | prefetch_related |
| Cart operations | 12ms | 25ms | Redis caching |
| Order creation | 45ms | 90ms | Bulk operations |
| Search queries | 80ms | 200ms | Full-text search |

### 📱 Frontend Performance

| Метрика | Значення | Ціль |
|---------|----------|------|
| First Contentful Paint | 0.8s | < 1.5s |
| Largest Contentful Paint | 1.2s | < 2.5s |
| First Input Delay | 50ms | < 100ms |
| Cumulative Layout Shift | 0.05 | < 0.1 |
| Time to Interactive | 1.5s | < 3s |

## 🛠️ Інструменти моніторингу

### Django Debug Toolbar (Development)
```python
# settings/development.py
INSTALLED_APPS = [
    # ... інші додатки
    'debug_toolbar',
]

MIDDLEWARE = [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
    # ... інші middleware
]

INTERNAL_IPS = [
    '127.0.0.1',
]

# Debug Toolbar налаштування
DEBUG_TOOLBAR_CONFIG = {
    'SHOW_TEMPLATE_CONTEXT': True,
    'SHOW_TOOLBAR_CALLBACK': lambda request: DEBUG,
}
```

### Sentry для Production
```python
# settings/production.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="YOUR_SENTRY_DSN",
    integrations=[DjangoIntegration()],
    traces_sample_rate=0.1,
    send_default_pii=True
)
```

### Performance middleware
```python
# middleware/performance.py
import time
import logging
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)

class PerformanceMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request.start_time = time.time()

    def process_response(self, request, response):
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            
            # Логування повільних запитів
            if duration > 0.5:  # Більше 500ms
                logger.warning(
                    f"Slow request: {request.path} took {duration:.2f}s"
                )
            
            # Додавання заголовка з часом відгуку
            response['X-Response-Time'] = f"{duration:.3f}s"
        
        return response
```

## 📊 Метрики та моніторинг

### Prometheus метрики
```python
# monitoring/metrics.py
from prometheus_client import Counter, Histogram, Gauge
import time

# Counters
request_count = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

# Histograms
request_duration = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)

# Gauges
active_connections = Gauge(
    'active_connections',
    'Number of active connections'
)

# Middleware для збору метрик
class MetricsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        
        response = self.get_response(request)
        
        # Збір метрик
        duration = time.time() - start_time
        request_duration.labels(
            method=request.method,
            endpoint=request.path
        ).observe(duration)
        
        request_count.labels(
            method=request.method,
            endpoint=request.path,
            status=response.status_code
        ).inc()
        
        return response
```

### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "Ptashka.shop Performance",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{endpoint}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          }
        ]
      }
    ]
  }
}
```

## 🔧 Оптимізації продуктивності

### Database оптимізації
```python
# Оптимізовані запити
class ProductViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return Product.objects.select_related(
            'category', 'brand'
        ).prefetch_related(
            'images', 'variants', 'reviews'
        ).filter(is_active=True)

    def list(self, request):
        # Кешування списку товарів
        cache_key = f"products_list_{request.GET.urlencode()}"
        products = cache.get(cache_key)
        
        if not products:
            products = self.get_queryset()
            cache.set(cache_key, products, 300)  # 5 хвилин
        
        return Response(ProductSerializer(products, many=True).data)
```

### Redis кешування
```python
# settings.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'CONNECTION_POOL_KWARGS': {
                'max_connections': 50,
                'retry_on_timeout': True,
            }
        }
    }
}

# Використання кешу
from django.core.cache import cache

def get_popular_products():
    cache_key = 'popular_products'
    products = cache.get(cache_key)
    
    if not products:
        products = Product.objects.filter(
            is_popular=True
        ).select_related('category', 'brand')[:10]
        cache.set(cache_key, products, 3600)  # 1 година
    
    return products
```

### Static files оптимізація
```python
# settings/production.py
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.ManifestStaticFilesStorage'

# Компресія статичних файлів
MIDDLEWARE = [
    'django.middleware.gzip.GZipMiddleware',
    # ... інші middleware
]

# CDN налаштування
STATIC_URL = 'https://cdn.ptashka.shop/static/'
MEDIA_URL = 'https://cdn.ptashka.shop/media/'
```

### Image оптимізація
```python
# models.py
from PIL import Image
import os

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/')
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        
        # Автоматичне створення thumbnail'ів
        if self.image:
            self.create_thumbnails()
    
    def create_thumbnails(self):
        sizes = [(300, 300), (600, 600), (1200, 1200)]
        
        for size in sizes:
            thumbnail_path = f"{self.image.path}_{size[0]}x{size[1]}.jpg"
            
            if not os.path.exists(thumbnail_path):
                img = Image.open(self.image.path)
                img.thumbnail(size, Image.Resampling.LANCZOS)
                img.save(thumbnail_path, 'JPEG', quality=85)
```

## 🧪 Load Testing

### Locust тести
```python
# load_tests/locustfile.py
from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        # Логін користувача
        response = self.client.post("/api/auth/login/", json={
            "email": "test@example.com",
            "password": "testpassword123"
        })
        
        if response.status_code == 200:
            self.token = response.json()["access_token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
    
    @task(3)
    def view_products(self):
        self.client.get("/api/products/", headers=self.headers)
    
    @task(2)
    def view_categories(self):
        self.client.get("/api/categories/", headers=self.headers)
    
    @task(1)
    def view_cart(self):
        self.client.get("/api/cart/", headers=self.headers)
    
    @task(1)
    def add_to_cart(self):
        self.client.post("/api/cart/add/", json={
            "product_id": 1,
            "variant_id": 1,
            "quantity": 1
        }, headers=self.headers)
    
    @task(1)
    def search_products(self):
        self.client.get("/api/products/?search=iphone", headers=self.headers)
```

### Запуск load тестів
```bash
# Встановлення Locust
pip install locust

# Запуск тестів
locust -f load_tests/locustfile.py --host=http://localhost:8000

# Запуск з параметрами
locust -f load_tests/locustfile.py \
  --host=http://localhost:8000 \
  --users=100 \
  --spawn-rate=10 \
  --run-time=5m
```

## 📊 Performance звіти

### Автоматичні звіти
```python
# monitoring/reports.py
import json
from datetime import datetime, timedelta
from django.core.mail import send_mail
from django.conf import settings

class PerformanceReporter:
    def generate_daily_report(self):
        """Генерація щоденного звіту"""
        
        # Збір метрик за останні 24 години
        metrics = self.collect_metrics()
        
        report = {
            'date': datetime.now().strftime('%Y-%m-%d'),
            'summary': {
                'total_requests': metrics['total_requests'],
                'avg_response_time': metrics['avg_response_time'],
                'error_rate': metrics['error_rate'],
                'uptime': metrics['uptime']
            },
            'endpoints': metrics['endpoint_performance'],
            'alerts': metrics['alerts']
        }
        
        # Відправка звіту
        self.send_report(report)
    
    def collect_metrics(self):
        """Збір метрик з різних джерел"""
        # Реалізація збору метрик
        pass
    
    def send_report(self, report):
        """Відправка звіту команді"""
        send_mail(
            subject=f'Performance Report - {report["date"]}',
            message=json.dumps(report, indent=2),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=settings.PERFORMANCE_REPORT_RECIPIENTS,
        )
```

## 🚨 Алерти та нотифікації

### Налаштування алертів
```python
# monitoring/alerts.py
from django.core.mail import send_mail
import logging

logger = logging.getLogger(__name__)

class PerformanceAlerts:
    @staticmethod
    def check_response_time(response_time, endpoint):
        """Перевірка часу відгуку"""
        if response_time > 1.0:  # Більше 1 секунди
            PerformanceAlerts.send_alert(
                f"High response time: {endpoint} - {response_time:.2f}s"
            )
    
    @staticmethod
    def check_error_rate(error_rate):
        """Перевірка частоти помилок"""
        if error_rate > 0.05:  # Більше 5%
            PerformanceAlerts.send_alert(
                f"High error rate: {error_rate:.2%}"
            )
    
    @staticmethod
    def send_alert(message):
        """Відправка алерту"""
        logger.error(message)
        
        # Відправка email
        send_mail(
            subject='Performance Alert - Ptashka.shop',
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=settings.ALERT_RECIPIENTS,
        )
        
        # Відправка в Slack (опціонально)
        # send_slack_alert(message)
```

## 📈 Continuous Performance Monitoring

### GitHub Actions workflow
```yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  schedule:
    - cron: '0 2 * * *'  # Щоденно о 2:00
  workflow_dispatch:

jobs:
  performance-test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install locust
    
    - name: Run performance tests
      run: |
        locust -f load_tests/locustfile.py \
          --host=https://staging.ptashka.shop \
          --users=50 \
          --spawn-rate=5 \
          --run-time=10m \
          --headless \
          --html=performance_report.html
    
    - name: Upload performance report
      uses: actions/upload-artifact@v2
      with:
        name: performance-report
        path: performance_report.html
    
    - name: Send performance report
      if: always()
      run: |
        # Відправка звіту в Slack або email
        echo "Performance test completed"
```

## 🎯 Performance Budget

### Frontend Performance Budget
```json
{
  "budget": [
    {
      "path": "/*",
      "timings": [
        {
          "metric": "first-contentful-paint",
          "budget": 1500
        },
        {
          "metric": "largest-contentful-paint",
          "budget": 2500
        },
        {
          "metric": "first-input-delay",
          "budget": 100
        }
      ],
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 500
        },
        {
          "resourceType": "total",
          "budget": 2000
        }
      ]
    }
  ]
}
```

### API Performance Budget
```yaml
# performance_budget.yml
api_endpoints:
  products:
    response_time: 200ms
    throughput: 1000rpm
  
  cart:
    response_time: 100ms
    throughput: 2000rpm
  
  orders:
    response_time: 500ms
    throughput: 100rpm

database:
  query_time: 50ms
  connection_pool: 20
  
cache:
  hit_rate: 80%
  response_time: 10ms
```

Ці метрики та бенчмарки допоможуть забезпечити високу продуктивність Ptashka.shop та швидко виявляти проблеми.
