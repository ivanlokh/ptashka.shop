# 🛠 Встановлення залежностей для Ptashka.shop

## Необхідні інструменти

Для запуску проекту потрібно встановити наступні інструменти:

### 1. Node.js та npm

#### Варіант 1: Через офіційний репозиторій NodeSource
```bash
# Додавання репозиторію NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Встановлення Node.js
sudo apt-get install -y nodejs

# Перевірка встановлення
node --version
npm --version
```

#### Варіант 2: Через snap (якщо доступний)
```bash
# Встановлення snapd (якщо не встановлений)
sudo apt install snapd

# Встановлення Node.js через snap
sudo snap install node --classic

# Перевірка встановлення
node --version
npm --version
```

#### Варіант 3: Через nvm (Node Version Manager)
```bash
# Завантаження та встановлення nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Перезавантаження терміналу або виконання
source ~/.bashrc

# Встановлення Node.js 18
nvm install 18
nvm use 18

# Перевірка встановлення
node --version
npm --version
```

### 2. Docker та Docker Compose

```bash
# Встановлення Docker
sudo apt update
sudo apt install docker.io docker-compose

# Додавання користувача до групи docker
sudo usermod -aG docker $USER

# Перезавантаження сесії (logout/login) або виконання
newgrp docker

# Перевірка встановлення
docker --version
docker-compose --version
```

### 3. PostgreSQL (опціонально, якщо не використовуєте Docker)

```bash
# Встановлення PostgreSQL
sudo apt install postgresql postgresql-contrib

# Запуск сервісу
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Створення бази даних
sudo -u postgres createdb ptashka_shop
```

## 🚀 Запуск після встановлення

### 1. Встановлення залежностей проекту
```bash
# З кореневої папки проекту
npm install
```

### 2. Налаштування змінних середовища
```bash
# Копіювання файлу з прикладом
cp env.example .env

# Редагування .env файлу (опціонально)
nano .env
```

### 3. Запуск бази даних через Docker
```bash
# Запуск PostgreSQL та Redis
docker-compose up -d postgres redis
```

### 4. Налаштування бази даних
```bash
# Перехід в папку backend
cd backend

# Встановлення залежностей backend
npm install

# Запуск міграцій Prisma
npx prisma migrate dev

# Генерація Prisma клієнта
npx prisma generate
```

### 5. Запуск проекту

#### Варіант 1: Запуск всього проекту одразу
```bash
# З кореневої папки
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

## 🌐 Доступ до додатку

Після успішного запуску:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🔧 Альтернативний запуск через Docker

Якщо встановлення Node.js викликає проблеми, можна запустити весь проект через Docker:

```bash
# Збірка та запуск всіх сервісів
docker-compose up --build

# Запуск в фоновому режимі
docker-compose up -d --build
```

## ❗ Вирішення проблем

### Помилка "npm not found"
- Переконайтеся, що Node.js встановлений: `node --version`
- Перевірте PATH: `echo $PATH`

### Помилка "docker not found"
- Переконайтеся, що Docker встановлений: `docker --version`
- Перезавантажте термінал після додавання до групи docker

### Помилка підключення до БД
- Перевірте, чи запущена PostgreSQL: `docker ps`
- Перевірте налаштування в .env файлі

### Помилки Prisma
- Запустіть: `npx prisma generate`
- Перевірте схему: `npx prisma studio`

---

**Після встановлення всіх залежностей, виконайте команди з [QUICK_START.md](QUICK_START.md)**
