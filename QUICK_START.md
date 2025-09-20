# 🚀 Швидкий старт Ptashka.shop

## Що створено

✅ **Повнофункціональний інтернет-магазин на Django** зі стилем максимально наближеним до [Kosik.cz](https://www.kosik.cz/)

### Основні компоненти:
- **Backend**: Django 5.2 + Django REST Framework
- **База даних**: PostgreSQL
- **Кешування**: Redis
- **Frontend**: Django Templates + Bootstrap 5 + Alpine.js
- **Платіжі**: Stripe (готово до інтеграції)
- **Аутентифікація**: Django Allauth
- **Docker**: Повна конфігурація для розгортання

### Функціональність:
- 🛍️ **Каталог товарів** з фільтрами та пошуком
- 🛒 **Кошик покупок** з AJAX оновленнями
- 👤 **Система користувачів** з профілями
- 📦 **Управління замовленнями**
- 💳 **Платіжна система** (Stripe)
- ⭐ **Система відгуків** та рейтингів
- ❤️ **Список бажаних товарів**
- 📱 **Адаптивний дизайн**

## 🏃‍♂️ Запуск за 5 хвилин

### 1. Встановлення залежностей
```bash
sudo apt update
sudo apt install -y python3.12-venv python3-pip postgresql postgresql-contrib redis-server
```

### 2. Клонування та налаштування
```bash
cd /home/ivanlokh/Стільниця/ptashka.shop
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Налаштування бази даних
```bash
sudo -u postgres createdb ptashka_shop
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'password';"
```

### 4. Запуск проекту
```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 5. Доступ до проекту
- **Головна сторінка**: http://localhost:8000/
- **Адмін панель**: http://localhost:8000/admin/
- **API**: http://localhost:8000/api/

## 📁 Структура проекту

```
ptashka.shop/
├── ptashka_shop/          # Основні налаштування Django
├── shop/                  # Додаток магазину (товари, категорії)
├── accounts/              # Додаток користувачів
├── cart/                  # Додаток кошика
├── orders/                # Додаток замовлень
├── payments/              # Додаток платежів
├── templates/             # HTML шаблони
├── static/                # CSS, JS, зображення
├── requirements.txt       # Python залежності
├── docker-compose.yml     # Docker конфігурація
└── README.md             # Повна документація
```

## 🎨 Дизайн та стиль

Проект створений з огляду на успішний чеський інтернет-магазин **Kosik.cz**:

### Ключові особливості дизайну:
- **Мінімалістичний хедер** з логотипом, пошуком та кошиком
- **Мега-меню категорій** з підкатегоріями
- **Картки товарів** з великими зображеннями
- **Бокові фільтри** з можливістю сортування
- **Адаптивний дизайн** для всіх пристроїв
- **Сучасна кольорова схема** (синій + білий)

### Технічні особливості:
- **Швидке завантаження** сторінок
- **AJAX оновлення** кошика без перезавантаження
- **Lazy loading** зображень
- **SEO оптимізація**
- **Мобільна оптимізація**

## 🔧 Налаштування

### Змінні середовища (.env):
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=ptashka_shop
DB_USER=postgres
DB_PASSWORD=password
REDIS_URL=redis://localhost:6379/0
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Адмін панель:
- URL: http://localhost:8000/admin/
- Логін: admin@ptashka.shop
- Пароль: (встановлений при створенні)

## 🚀 Розгортання в продакшн

### Docker (рекомендовано):
```bash
docker-compose up -d
```

### Мануальне розгортання:
```bash
python manage.py collectstatic
gunicorn ptashka_shop.wsgi:application
```

## 📊 Моніторинг

- **Логи**: `/logs/django.log`
- **Статичні файли**: `/staticfiles/`
- **Медіа файли**: `/media/`

## 🛠 Розробка

### Додавання нових товарів:
1. Зайти в адмін панель
2. Створити категорії та бренди
3. Додати товари з зображеннями
4. Налаштувати ціни та наявність

### Кастомізація дизайну:
- **CSS**: `/static/shop/css/style.css`
- **JavaScript**: `/static/shop/js/main.js`
- **Шаблони**: `/templates/`

## 📞 Підтримка

- **Документація**: README.md
- **Issues**: GitHub Issues
- **Email**: info@ptashka.shop

---

**Статус**: ✅ Готово до використання
**Версія**: 1.0.0
**Останнє оновлення**: ${new Date().toLocaleDateString('uk-UA')}
