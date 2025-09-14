# ⚡ Швидкий старт Ptashka.shop

## 🚀 Запуск за 5 хвилин

### 1. Встановлення залежностей
```bash
npm install
```

### 2. Налаштування змінних середовища
```bash
cp env.example .env
```

### 3. Запуск через Docker
```bash
docker-compose up -d
```

### 4. Налаштування бази даних
```bash
cd backend
npm run migrate
```

### 5. Готово! 🎉
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 📋 Що вже готово

✅ **Структура проекту** - повна архітектура frontend/backend  
✅ **Next.js 14** - сучасний React фреймворк  
✅ **Tailwind CSS** - стилізація з готовими компонентами  
✅ **TypeScript** - типізація для обох частин  
✅ **Prisma** - ORM з повною схемою БД  
✅ **Docker** - контейнеризація  
✅ **API Routes** - базові ендпоінти  
✅ **Компоненти** - Hero, Categories, Products, Features  
✅ **Responsive Design** - адаптивний дизайн  

## 🎯 Наступні кроки

1. **Реалізація API** - додати бізнес-логіку в контролери
2. **Аутентифікація** - JWT токени та middleware
3. **Платіжна система** - Stripe/PayPal інтеграція
4. **Адмін панель** - управління товарами
5. **Тести** - unit та integration тести

## 🔧 Корисні команди

```bash
# Запуск всього проекту
npm run dev

# Тільки frontend
npm run dev:frontend

# Тільки backend  
npm run dev:backend

# Збірка
npm run build

# Тести
npm test

# Лінтинг
npm run lint
```

## 📚 Документація

- [Повна документація](DEVELOPMENT.md)
- [README](README.md)
- [API документація](docs/API.md) - скоро буде

---

**Готово до розробки! 🚀**
