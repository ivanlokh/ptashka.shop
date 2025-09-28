# Multi-stage build для оптимізації розміру
FROM python:3.11-slim as base

# Встановлення системних залежностей
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Встановлення робочої директорії
WORKDIR /app

# Копіювання requirements файлів
COPY requirements*.txt ./

# Встановлення Python залежностей
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Development stage
FROM base as development

# Встановлення development залежностей
RUN pip install --no-cache-dir -r requirements-dev.txt

# Копіювання коду
COPY . .

# Створення користувача для безпеки
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

# Expose порт
EXPOSE 8000

# Команда для development
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# Production stage
FROM base as production

# Встановлення production залежностей
RUN pip install --no-cache-dir gunicorn

# Копіювання коду
COPY . .

# Створення користувача для безпеки
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

# Збірка статичних файлів
RUN python manage.py collectstatic --noinput --settings=ptashka_shop.settings.production

# Expose порт
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health/ || exit 1

# Команда для production
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "60", "ptashka_shop.wsgi:application"]
