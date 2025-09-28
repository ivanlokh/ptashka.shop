# 🛒 Ptashka.shop - Інтернет-магазин на Django

## 📋 Опис проекту

**Ptashka.shop** - це сучасний інтернет-магазин, розроблений на Django з акцентом на зручність користувача, швидкість роботи та безпеку транзакцій. Проект створений з використанням сучасних веб-технологій та best practices для e-commerce платформ.

### 🎯 Взірець дизайну: Smarty.cz

Проект розробляється з огляду на успішний чеський інтернет-магазин [Smarty.cz](https://www.smarty.cz/), який спеціалізується на споживчій електроніці та технологіях. Ключові особливості, які ми адаптуємо:

- **Яскравий та сучасний дизайн** з помаранчевими акцентами
- **Палітра кольорів Smarty.cz**:
  - Основний: `#ff6b35` (помаранчевий Smarty)
  - Акцентний: `#3498db` (яскравий синій)
  - Вторинний: `#2c3e50` (темно-синій)
  - Текст: `#2c3e50` (темно-синій)
- **Швидка навігація** та інтуїтивний пошук
- **Детальні картки товарів** з великими зображеннями
- **Система фільтрів** за ціною, брендом, характеристиками
- **Мобільна оптимізація** для всіх пристроїв
- **Система рейтингів** та відгуків
- **Швидке оформлення замовлення**
- **Градієнти та тіні** - сучасні візуальні ефекти
- **Анімації** - плавні переходи та hover ефекти

## 🎯 Основні цілі

- Створення зручного та інтуїтивного інтерфейсу для покупців
- Забезпечення швидкої та безпечної оплати товарів
- Реалізація системи управління товарами та замовленнями
- Оптимізація для мобільних пристроїв
- Інтеграція з платіжними системами
- Система рейтингів та відгуків

## 🚀 Функціональність

### Для покупців:
- **Каталог товарів** з фільтрацією та пошуком
- **Детальна інформація** про кожен товар (фото, опис, характеристики)
- **Кошик покупок** з можливістю зміни кількості
- **Процес оформлення замовлення** з різними способами доставки
- **Особистий кабінет** з історією замовлень
- **Система рейтингів** та відгуків про товари
- **Wishlist** - список бажаних товарів
- **Порівняння товарів**

### Для адміністраторів:
- **Панель управління** товарами та замовленнями
- **Управління категоріями** та підкатегоріями
- **Система знижок** та промокодів
- **Аналітика продажів** та статистика
- **Управління користувачами**
- **Налаштування доставки** та оплати

## 🛠 Технологічний стек

### Backend:
- **Django 5.2** - основний веб-фреймворк
- **Django REST Framework** - API для frontend
- **PostgreSQL** - основна база даних
- **Redis** - кешування та сесії
- **Celery** - асинхронні завдання
- **Stripe/PayPal** - платіжні системи

### Frontend:
- **Django Templates** - серверний рендеринг
- **Bootstrap 5** - CSS фреймворк
- **JavaScript (ES6+)** - інтерактивність
- **Alpine.js** - легкий JS фреймворк
- **Chart.js** - графіки та аналітика

### Додаткові сервіси:
- **AWS S3** - зберігання зображень
- **SendGrid** - email розсилки
- **Cloudinary** - оптимізація зображень
- **Google Analytics** - аналітика

## 📁 Структура проекту

```
ptashka.shop/
├── ptashka_shop/           # Основні налаштування Django
│   ├── settings/           # Налаштування для різних середовищ
│   ├── urls.py            # Головні URL маршрути
│   └── wsgi.py            # WSGI конфігурація
├── shop/                   # Додаток магазину
│   ├── models/            # Моделі товарів, категорій
│   ├── views/             # Представлення
│   ├── templates/         # HTML шаблони
│   ├── static/            # CSS, JS, зображення
│   └── api/               # API endpoints
├── accounts/               # Додаток користувачів
│   ├── models.py          # Модель користувача
│   ├── views.py           # Реєстрація, авторизація
│   └── templates/         # Шаблони авторизації
├── cart/                   # Додаток кошика
│   ├── models.py          # Модель кошика
│   ├── views.py           # Логіка кошика
│   └── context_processors.py
├── orders/                 # Додаток замовлень
│   ├── models.py          # Моделі замовлень
│   ├── views.py           # Оформлення замовлень
│   └── templates/         # Шаблони замовлень
├── payments/               # Додаток платежів
│   ├── models.py          # Моделі платежів
│   ├── views.py           # Обробка платежів
│   └── webhooks.py        # Webhook обробники
├── static/                 # Статичні файли
├── media/                  # Медіа файли
├── templates/              # Базові шаблони
├── requirements.txt        # Python залежності
├── docker-compose.yml      # Docker конфігурація
└── manage.py              # Django управління
```

## 🗄 База даних

### Основні моделі:
- **User** - користувачі (розширена модель Django User)
- **Category** - категорії товарів
- **Product** - товари
- **ProductImage** - зображення товарів
- **ProductVariant** - варіанти товарів
- **Cart** - кошик покупок
- **Order** - замовлення
- **OrderItem** - позиції замовлень
- **Payment** - платежі
- **Review** - відгуки
- **Address** - адреси доставки

## 🔐 Безпека

- **Django Allauth** для аутентифікації
- **JWT токени** для API
- **CORS** налаштування
- **Rate limiting** для API
- **Валідація даних** на всіх рівнях
- **HTTPS** для всіх з'єднань
- **Sanitization** вхідних даних

## 📱 Адаптивність

Проект повністю адаптивний та оптимізований для:
- **Desktop** (1920px+)
- **Laptop** (1024px - 1919px)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

## 🚀 Розгортання

### Локальний розвиток:

```bash
# Клонування репозиторію
git clone https://github.com/username/ptashka.shop.git
cd ptashka.shop

# Створення віртуального середовища
python3 -m venv venv
source venv/bin/activate

# Встановлення залежностей
pip install -r requirements.txt

# Налаштування змінних середовища
cp .env.example .env

# Налаштування бази даних PostgreSQL
sudo -u postgres createdb ptashka_shop
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'password';"

# Застосування міграцій
python manage.py migrate

# Створення суперкористувача
python manage.py createsuperuser

# Збірка статичних файлів
python manage.py collectstatic

# Запуск сервера розробки
python manage.py runserver
```

### Швидкий запуск:

```bash
# 1. Встановлення залежностей системи
sudo apt update
sudo apt install -y python3.12-venv python3-pip postgresql postgresql-contrib redis-server

# 2. Клонування та налаштування
git clone https://github.com/username/ptashka.shop.git
cd ptashka.shop
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Налаштування бази даних
sudo -u postgres createdb ptashka_shop
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'password';"

# 4. Запуск проекту
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Доступ до проекту:
- **Головна сторінка**: http://localhost:8000/
- **Адмін панель**: http://localhost:8000/admin/
- **API**: http://localhost:8000/api/

### Docker розгортання:

```bash
# Запуск з Docker Compose
docker-compose up -d

# Запуск міграцій
docker-compose exec web python manage.py migrate

# Створення суперкористувача
docker-compose exec web python manage.py createsuperuser
```

### Продакшн:

```bash
# Збірка статичних файлів
python manage.py collectstatic

# Запуск з Gunicorn
gunicorn ptashka_shop.wsgi:application
```

## 🧪 Тестування

### Локальне тестування:
```bash
# Запуск тестів
python manage.py test

# Тести з покриттям
coverage run --source='.' manage.py test
coverage report
coverage html

# Performance тести
locust -f load_tests/locustfile.py --host=http://localhost:8000
```

### CI/CD Pipeline:
Автоматичне тестування через GitHub Actions включає:
- **Лінтинг**: Black, isort, flake8, mypy
- **Тестування**: pytest з покриттям коду
- **Безпека**: safety, bandit
- **Performance**: load testing з Locust
- **Docker**: збірка та тестування контейнерів

### Pre-commit hooks:
```bash
# Встановлення pre-commit
pip install pre-commit
pre-commit install

# Ручний запуск
pre-commit run --all-files
```

## 🆘 Troubleshooting

### Міграції не застосовуються / помилки БД
- Переконайтесь, що БД створена і доступні креденшали у `.env`.
- Оновіть міграції і застосуйте їх:
```bash
python manage.py makemigrations
python manage.py migrate
```

### Немає стилів або 404 на статичних файлах
- Переконайтесь, що `DEBUG=True` у `.env` в розробці.
- Зберіть статичні файли для продакшну:
```bash
python manage.py collectstatic --noinput
```

### Помилки з Redis (якщо не встановлений)
- Тимчасово відключіть залежності від Redis у налаштуваннях або встановіть локально Redis.
- На Linux/macOS: `brew install redis` або `sudo apt install redis-server`.

### Порт зайнятий (8000)
- Знайдіть і вбийте процес:
```bash
lsof -ti tcp:8000 | xargs -r kill -9
```

### Docker Compose: сервіс не піднімається
- Перевірте логи сервісів:
```bash
docker-compose logs -f --tail=100
```
- Перезапустіть збірку:
```bash
docker-compose down -v
docker-compose up --build -d
```

### Неправильні змінні середовища
- Синхронізуйте `.env` з прикладом:
```bash
cp -n .env.example .env
```

### Тести падають локально
- Очистити кеши і базу (якщо використовується sqlite локально):
```bash
find . -name "__pycache__" -type d -exec rm -rf {} +
python manage.py migrate --run-syncdb
```

## 🏭 Продакшн деплой

### Варіант A: Gunicorn + Nginx (bare metal / VM)

1) Залежності системи (Ubuntu):
```bash
sudo apt update && sudo apt install -y python3.12-venv python3-pip nginx
```

2) Підготовка застосунку:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py collectstatic --noinput
python manage.py migrate --noinput
```

3) Gunicorn (systemd service):
```ini
[Unit]
Description=Ptashka.shop Gunicorn
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/ptashka.shop
Environment="DJANGO_SETTINGS_MODULE=ptashka_shop.settings"
ExecStart=/var/www/ptashka.shop/venv/bin/gunicorn ptashka_shop.wsgi:application \
  --bind 127.0.0.1:8001 --workers 3 --timeout 60
Restart=always

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl daemon-reload
sudo systemctl enable ptashka-gunicorn
sudo systemctl start ptashka-gunicorn
```

4) Nginx (reverse proxy + static):
```nginx
server {
  listen 80;
  server_name ptashka.shop;

  client_max_body_size 20m;

  location /static/ {
    alias /var/www/ptashka.shop/static/;
    access_log off;
    expires 7d;
  }

  location /media/ {
    alias /var/www/ptashka.shop/media/;
    access_log off;
    expires 7d;
  }

  location / {
    proxy_pass http://127.0.0.1:8001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/ptashka.conf /etc/nginx/sites-enabled/ptashka.conf
sudo nginx -t && sudo systemctl reload nginx
```

5) SSL (Let's Encrypt):
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ptashka.shop -m admin@ptashka.shop --agree-tos --redirect
```

### Варіант B: Docker Compose (production)

1) Приклад `docker-compose.prod.yml`:
```yaml
version: '3.9'
services:
  web:
    build: .
    env_file: .env
    command: gunicorn ptashka_shop.wsgi:application --bind 0.0.0.0:8000 --workers 3
    volumes:
      - static_volume:/app/static
      - media_volume:/app/media
    depends_on:
      - db
    restart: always

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: ptashka_shop
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
    volumes:
      - db_data:/var/lib/postgresql/data
    restart: always

  nginx:
    image: nginx:1.25
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - static_volume:/var/www/static:ro
      - media_volume:/var/www/media:ro
    depends_on:
      - web
    restart: always

volumes:
  db_data:
  static_volume:
  media_volume:
```

2) Білд і запуск:
```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

3) Міграції і статика:
```bash
docker compose -f docker-compose.prod.yml exec web python manage.py migrate --noinput
docker compose -f docker-compose.prod.yml exec web python manage.py collectstatic --noinput
```

### Zero-downtime нотатки
- Використовуйте `--graceful-timeout` у Gunicorn або `systemctl reload` для плавних перезапусків.
- У Docker додавайте `healthcheck` і `restart: always`.
- Налаштуйте моніторинг (Sentry/Prometheus) та логування доступів Nginx.

### Systemd: встановлення сервісів (Gunicorn, Celery, Beat)

1) Скопіюйте приклади юнітів у систему (відредагуйте шляхи, якщо потрібно):
```bash
sudo mkdir -p /etc/systemd/system
sudo cp deploy/systemd/ptashka-gunicorn.service /etc/systemd/system/
sudo cp deploy/systemd/ptashka-celery.service /etc/systemd/system/
sudo cp deploy/systemd/ptashka-celery-beat.service /etc/systemd/system/
```

2) Перезавантажте systemd та увімкніть сервіси:
```bash
sudo systemctl daemon-reload
sudo systemctl enable ptashka-gunicorn ptashka-celery ptashka-celery-beat
sudo systemctl start ptashka-gunicorn ptashka-celery ptashka-celery-beat
```

3) Перевірка статусу та логів:
```bash
systemctl status ptashka-gunicorn
journalctl -u ptashka-gunicorn -e --no-pager

systemctl status ptashka-celery
journalctl -u ptashka-celery -e --no-pager

systemctl status ptashka-celery-beat
journalctl -u ptashka-celery-beat -e --no-pager
```

Примітки:
- Файл `.env` очікується за шляхом `/var/www/ptashka.shop/.env` (див. `EnvironmentFile` у прикладах).
- Для Beat створюється рантайм-директорія `/run/celery` автоматично (за допомогою `RuntimeDirectory=celery`).

## 📊 Моніторинг та аналітика

- **Django Debug Toolbar** - відладка в розробці
- **Sentry** - відстеження помилок
- **Google Analytics** - аналіз поведінки користувачів
- **Django Admin** - управління контентом
- **Prometheus + Grafana** - моніторинг системи
- **Performance метрики** - детальні бенчмарки

## 🏗️ Архітектура системи

Детальна діаграма архітектури, компоненти та технічні рішення доступні в [docs/architecture.md](docs/architecture.md).

### Ключові компоненти:
- **Frontend**: Django Templates + Bootstrap 5 + Alpine.js
- **Backend**: Django 5.2 + DRF + PostgreSQL + Redis
- **Background Tasks**: Celery + Redis
- **Monitoring**: Prometheus + Grafana + Sentry
- **CDN**: Cloudflare для статичних файлів
- **Storage**: AWS S3 + Cloudinary для медіа

## 📚 API Документація

Повна API документація з прикладами використання:
- **Swagger UI**: `http://localhost:8000/api/docs/`
- **ReDoc**: `http://localhost:8000/api/redoc/`
- **Документація**: [docs/api-documentation.md](docs/api-documentation.md)
- **Приклади коду**: [docs/api-examples.md](docs/api-examples.md)

### Основні endpoints:
- `GET /api/products/` - список товарів з фільтрацією
- `GET /api/products/{id}/` - деталі товару
- `POST /api/cart/add/` - додавання до кошика
- `POST /api/orders/create/` - створення замовлення
- `POST /api/auth/login/` - аутентифікація

## ⚡ Performance метрики

Детальні метрики продуктивності та бенчмарки в [docs/performance-metrics.md](docs/performance-metrics.md).

### Цілі продуктивності:
- **API відгук**: < 200ms для 95% запитів
- **Час завантаження**: < 2 секунди
- **Throughput**: 1000+ запитів/хвилину
- **Доступність**: 99.9% uptime

### Інструменти моніторингу:
- **Prometheus** - збір метрик
- **Grafana** - візуалізація
- **Sentry** - відстеження помилок
- **Locust** - навантажувальне тестування

## 🔍 Аналіз Kosik.cz - Ключові особливості

### Дизайн та UX:
- **Мінімалістичний хедер** з логотипом, пошуком та кошиком
- **Мега-меню категорій** з підкатегоріями та зображеннями
- **Слайдер акцій** на головній сторінці
- **Картки товарів** з великими зображеннями та швидким додаванням в кошик
- **Бокові фільтри** з можливістю сортування
- **Хлібні крихти** для навігації
- **Адаптивний дизайн** для всіх пристроїв

### Функціональність:
- **Швидкий пошук** з автодоповненням
- **Порівняння товарів** (до 4 товарів)
- **Wishlist** для збереження товарів
- **Система рейтингів** та відгуків
- **Розстрочка** та кредитні програми
- **Викуп старих пристроїв**
- **Сервісне обслуговування**

### Технічні особливості:
- **Швидке завантаження** сторінок
- **Lazy loading** зображень
- **SEO оптимізація**
- **Мікродані** для пошукових систем
- **Кешування** для швидкості

## 🗓 Roadmap

### Phase 1 (MVP) - 2 місяці
- [ ] Базова структура Django проекту
- [ ] Моделі товарів та категорій
- [ ] Головна сторінка зі слайдером
- [ ] Каталог товарів з фільтрами
- [ ] Детальні сторінки товарів
- [ ] Кошик та оформлення замовлення
- [ ] Система користувачів
- [ ] Базова адмін панель

### Phase 2 - 1 місяць
- [ ] Платіжна система (Stripe/PayPal)
- [ ] Система доставки
- [ ] Email нотифікації
- [ ] Мобільна оптимізація
- [ ] Плавна прокрутка
- [ ] Чатбот-помічник
- [ ] Система пошуку з автодоповненням
- [ ] Wishlist функціональність

### Phase 3 - 1 місяць
- [ ] Система відгуків та рейтингів
- [ ] Порівняння товарів
- [ ] Рекомендації товарів
- [ ] Аналітика та статистика
- [ ] SEO оптимізація
- [ ] Розстрочка та кредитні програми

## 🤝 Внесок у проект

1. Fork репозиторію
2. Створіть feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit зміни (`git commit -m 'Add some AmazingFeature'`)
4. Push до branch (`git push origin feature/AmazingFeature`)
5. Відкрийте Pull Request

## 📝 Ліцензія

Цей проект ліцензований під MIT License - дивіться файл [LICENSE](LICENSE) для деталей.

## 👥 Команда

- **Backend Developer** - Django/Python розробка
- **Frontend Developer** - HTML/CSS/JavaScript
- **UI/UX Designer** - дизайн інтерфейсу
- **DevOps Engineer** - інфраструктура та розгортання

## 🚀 CI/CD Pipeline

Проект налаштований з повним CI/CD pipeline через GitHub Actions:

### Автоматичні процеси:
- **Лінтинг та форматування** коду
- **Тестування** з покриттям коду
- **Security scanning** (safety, bandit)
- **Performance тести** з Locust
- **Docker збірка** та push до registry
- **Автоматичний деплой** на staging/production

### Environments:
- **Development**: локальна розробка
- **Staging**: тестування перед продакшном
- **Production**: live сайт

## 📋 Додаткові ресурси

### Документація:
- [Архітектура системи](docs/architecture.md)
- [API документація](docs/api-documentation.md)
- [Приклади використання API](docs/api-examples.md)
- [Performance метрики](docs/performance-metrics.md)
- [Скріншоти інтерфейсу](docs/screenshots.md)

### Конфігурація:
- [Docker Compose](docker-compose.yml) - локальна розробка
- [Production Docker](docker-compose.prod.yml) - продакшн
- [CI/CD Pipeline](.github/workflows/ci.yml) - автоматизація
- [Pre-commit hooks](.pre-commit-config.yaml) - якість коду

## 📞 Контакти

- **Email**: info@ptashka.shop
- **Website**: https://ptashka.shop
- **GitHub**: https://github.com/username/ptashka.shop

---

**Статус проекту**: 🚧 В розробці

*Останнє оновлення: 2025-01-22*
