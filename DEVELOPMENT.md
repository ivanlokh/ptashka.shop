8# 🚀 Інструкції для розробки Ptashka.shop

## Передумови

Перед початком роботи переконайтеся, що у вас встановлено:

- **Node.js** (версія 18 або новіша)
- **npm** або **yarn**
- **Docker** та **Docker Compose**
- **PostgreSQL** (якщо запускаєте локально)
- **Redis** (якщо запускаєте локально)

## Швидкий старт

### 1. Клонування репозиторію
```bash
git clone https://github.com/username/ptashka.shop.git
cd ptashka.shop
```

### 2. Встановлення залежностей
```bash
# Встановлення залежностей для всього проекту
npm install

# Або встановлення для кожної частини окремо
cd frontend && npm install
cd ../backend && npm install
```

### 3. Налаштування змінних середовища
```bash
# Копіювання файлу з прикладом змінних
cp env.example .env

# Редагування .env файлу з вашими налаштуваннями
nano .env
```

### 4. Запуск бази даних
```bash
# Запуск PostgreSQL та Redis через Docker
docker-compose up -d postgres redis

# Або запуск всього проекту
docker-compose up -d
```

### 5. Налаштування бази даних
```bash
# Перехід в папку backend
cd backend

# Запуск міграцій
npm run migrate

# Заповнення бази тестовими даними (опціонально)
npm run seed
```

### 6. Запуск проекту

#### Варіант 1: Запуск всього проекту одразу
```bash
# З кореневої папки проекту
npm run dev
```

#### Варіант 2: Запуск кожної частини окремо
```bash
# Термінал 1 - Backend
cd backend
npm run dev

# Термінал 2 - Frontend
cd frontend
npm run dev
```

## Доступ до додатку

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health
- **Prisma Studio**: http://localhost:5555 (після запуску `npm run db:studio`)

## Структура проекту

```
ptashka.shop/
├── frontend/                 # Next.js додаток
│   ├── src/
│   │   ├── app/             # App Router (Next.js 13+)
│   │   ├── components/      # React компоненти
│   │   ├── hooks/           # Custom hooks
│   │   ├── store/           # Redux store
│   │   ├── styles/          # CSS стилі
│   │   └── utils/           # Утиліти
│   ├── public/              # Статичні файли
│   └── package.json
├── backend/                  # Node.js API
│   ├── src/
│   │   ├── controllers/     # Контролери
│   │   ├── models/          # Моделі даних
│   │   ├── routes/          # API маршрути
│   │   ├── middleware/      # Middleware
│   │   ├── services/        # Бізнес логіка
│   │   └── utils/           # Утиліти
│   ├── prisma/              # Prisma схема та міграції
│   └── package.json
├── database/                 # Скрипти БД
├── docs/                     # Документація
├── tests/                    # Тести
└── docker/                   # Docker конфігурація
```

## Корисні команди

### Frontend
```bash
cd frontend

# Запуск в режимі розробки
npm run dev

# Збірка для продакшну
npm run build

# Запуск продакшн версії
npm start

# Лінтинг
npm run lint

# Перевірка типів TypeScript
npm run type-check
```

### Backend
```bash
cd backend

# Запуск в режимі розробки
npm run dev

# Збірка для продакшну
npm run build

# Запуск продакшн версії
npm start

# Лінтинг
npm run lint

# Запуск тестів
npm test

# Запуск тестів з покриттям
npm run test:coverage

# Робота з базою даних
npm run migrate          # Запуск міграцій
npm run seed            # Заповнення тестовими даними
npm run db:generate     # Генерація Prisma клієнта
npm run db:studio       # Відкриття Prisma Studio
```

### Docker
```bash
# Запуск всіх сервісів
docker-compose up -d

# Перегляд логів
docker-compose logs -f

# Зупинка всіх сервісів
docker-compose down

# Перебудова контейнерів
docker-compose up --build

# Очищення всіх контейнерів та томів
docker-compose down -v
```

## Налаштування IDE

### VS Code
Рекомендовані розширення:
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **Prisma**
- **TypeScript Importer**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**

### Налаштування .vscode/settings.json
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html"
  }
}
```

## Робота з Git

### Встановлення pre-commit hooks
```bash
# Встановлення husky
npm install --save-dev husky

# Налаштування pre-commit
npx husky install
npx husky add .husky/pre-commit "npm run lint"
```

### Коміти
Використовуйте конвенцію [Conventional Commits](https://www.conventionalcommits.org/):
```bash
feat: додано нову функцію
fix: виправлено помилку
docs: оновлено документацію
style: зміни стилів
refactor: рефакторинг коду
test: додано тести
chore: оновлення залежностей
```

## Налагодження

### Frontend
- Використовуйте React Developer Tools
- Перевірте консоль браузера на помилки
- Використовуйте Next.js вбудований дебагер

### Backend
- Використовуйте Node.js вбудований дебагер
- Перевірте логи сервера
- Використовуйте Prisma Studio для перегляду БД

### База даних
```bash
# Підключення до PostgreSQL
docker exec -it ptashka_postgres psql -U postgres -d ptashka_shop

# Підключення до Redis
docker exec -it ptashka_redis redis-cli
```

## Тестування

### Запуск тестів
```bash
# Всі тести
npm test

# Тільки frontend тести
cd frontend && npm test

# Тільки backend тести
cd backend && npm test

# E2E тести
npm run test:e2e
```

### Покриття коду
```bash
# Генерація звіту покриття
npm run test:coverage

# Відкриття звіту в браузері
open coverage/lcov-report/index.html
```

## Розгортання

### Локальне тестування
```bash
# Збірка проекту
npm run build

# Запуск продакшн версії
npm start
```

### Docker
```bash
# Збірка образів
docker-compose build

# Запуск в продакшн режимі
docker-compose -f docker-compose.prod.yml up -d
```

## Вирішення проблем

### Часті проблеми

1. **Помилка підключення до БД**
   - Перевірте, чи запущена PostgreSQL
   - Перевірте налаштування в .env файлі

2. **Помилки TypeScript**
   - Запустіть `npm run type-check`
   - Перевірте налаштування tsconfig.json

3. **Помилки Prisma**
   - Запустіть `npm run db:generate`
   - Перевірте схему в prisma/schema.prisma

4. **Проблеми з Docker**
   - Перевірте, чи запущений Docker
   - Очистіть контейнери: `docker-compose down -v`

### Отримання допомоги
- Перевірте [README.md](README.md)
- Створіть issue в GitHub
- Зверніться до команди розробки

---

**Приємної розробки! 🚀**
