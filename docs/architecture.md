# 🏗️ Архітектура системи Ptashka.shop

## 📊 Діаграма архітектури

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Browser/SPA] --> B[Nginx Reverse Proxy]
        B --> C[Django Templates]
        C --> D[Static Files CSS/JS]
    end
    
    subgraph "Application Layer"
        E[Django Application] --> F[Django REST Framework]
        F --> G[Views & Serializers]
        G --> H[Business Logic]
    end
    
    subgraph "Data Layer"
        I[PostgreSQL Database] --> J[Redis Cache]
        K[Media Files S3/Cloudinary] --> L[Static Files]
    end
    
    subgraph "External Services"
        M[Stripe Payment] --> N[PayPal Payment]
        O[SendGrid Email] --> P[Google Analytics]
        Q[AWS S3] --> R[Cloudinary CDN]
    end
    
    subgraph "Background Tasks"
        S[Celery Workers] --> T[Celery Beat Scheduler]
        T --> U[Task Queue Redis]
    end
    
    A --> E
    E --> I
    E --> J
    E --> K
    E --> M
    E --> O
    E --> Q
    E --> S
    
    style A fill:#ff6b35,color:#fff
    style E fill:#3498db,color:#fff
    style I fill:#2c3e50,color:#fff
    style M fill:#635bff,color:#fff
```

## 🔄 Потік даних

```mermaid
sequenceDiagram
    participant U as User
    participant N as Nginx
    participant D as Django
    participant R as Redis
    participant P as PostgreSQL
    participant S as Stripe
    
    U->>N: HTTP Request
    N->>D: Forward Request
    D->>R: Check Cache
    alt Cache Miss
        D->>P: Query Database
        P-->>D: Return Data
        D->>R: Store in Cache
    else Cache Hit
        R-->>D: Return Cached Data
    end
    D-->>N: HTTP Response
    N-->>U: Return Response
    
    Note over U,S: Payment Flow
    U->>D: Initiate Payment
    D->>S: Create Payment Intent
    S-->>D: Payment Intent ID
    D-->>U: Redirect to Stripe
    U->>S: Complete Payment
    S-->>D: Webhook Notification
    D->>P: Update Order Status
```

## 🏛️ Мікросервісна архітектура (майбутнє)

```mermaid
graph TB
    subgraph "API Gateway"
        AG[Nginx + Load Balancer]
    end
    
    subgraph "Core Services"
        AS[Auth Service] --> US[User Service]
        PS[Product Service] --> CS[Catalog Service]
        OS[Order Service] --> PS2[Payment Service]
        NS[Notification Service]
    end
    
    subgraph "Data Services"
        UDB[(User DB)] --> PDB[(Product DB)]
        ODB[(Order DB)] --> CDB[(Cache Redis)]
    end
    
    subgraph "External Services"
        STRIPE[Stripe API] --> PAYPAL[PayPal API]
        EMAIL[SendGrid] --> SMS[Twilio SMS]
    end
    
    AG --> AS
    AG --> PS
    AG --> OS
    AG --> NS
    
    AS --> UDB
    PS --> PDB
    OS --> ODB
    NS --> CDB
    
    PS2 --> STRIPE
    NS --> EMAIL
```

## 📱 Компонентна архітектура

```mermaid
graph TB
    subgraph "Django Apps"
        SHOP[shop/] --> ACCOUNTS[accounts/]
        CART[cart/] --> ORDERS[orders/]
        PAYMENTS[payments/] --> REVIEWS[reviews/]
    end
    
    subgraph "Core Models"
        USER[User Model] --> PRODUCT[Product Model]
        CATEGORY[Category Model] --> ORDER[Order Model]
        CART_ITEM[CartItem Model] --> PAYMENT[Payment Model]
    end
    
    subgraph "Services"
        EMAIL_SERVICE[Email Service] --> PAYMENT_SERVICE[Payment Service]
        CACHE_SERVICE[Cache Service] --> SEARCH_SERVICE[Search Service]
    end
    
    SHOP --> USER
    CART --> CART_ITEM
    ORDERS --> ORDER
    PAYMENTS --> PAYMENT
    
    ACCOUNTS --> EMAIL_SERVICE
    PAYMENTS --> PAYMENT_SERVICE
    SHOP --> CACHE_SERVICE
```

## 🔐 Безпека та аутентифікація

```mermaid
graph LR
    A[User Login] --> B[Django Allauth]
    B --> C[JWT Token]
    C --> D[API Access]
    D --> E[Rate Limiting]
    E --> F[CSRF Protection]
    F --> G[Secure Headers]
    
    H[Admin Panel] --> I[Django Admin]
    I --> J[Permission System]
    J --> K[Audit Logs]
    
    style B fill:#ff6b35,color:#fff
    style C fill:#3498db,color:#fff
    style E fill:#e74c3c,color:#fff
```

## 📊 Моніторинг та логування

```mermaid
graph TB
    subgraph "Application Monitoring"
        SENTRY[Sentry Error Tracking] --> LOGS[Application Logs]
        METRICS[Performance Metrics] --> HEALTH[Health Checks]
    end
    
    subgraph "Infrastructure Monitoring"
        NGINX[Nginx Access Logs] --> POSTGRES[Database Metrics]
        REDIS[Redis Metrics] --> CELERY[Celery Metrics]
    end
    
    subgraph "Business Analytics"
        GA[Google Analytics] --> MIXPANEL[Mixpanel Events]
        SALES[Sales Dashboard] --> REPORTS[Custom Reports]
    end
    
    SENTRY --> METRICS
    NGINX --> GA
    POSTGRES --> SALES
```

## 🚀 Deployment архітектура

```mermaid
graph TB
    subgraph "Production Environment"
        LB[Load Balancer] --> NGINX1[Nginx Server 1]
        LB --> NGINX2[Nginx Server 2]
        
        NGINX1 --> DJANGO1[Django App 1]
        NGINX2 --> DJANGO2[Django App 2]
        
        DJANGO1 --> POSTGRES[(PostgreSQL Master)]
        DJANGO2 --> POSTGRES
        
        POSTGRES --> REPLICA[(PostgreSQL Replica)]
        
        REDIS_CLUSTER[(Redis Cluster)] --> CELERY1[Celery Worker 1]
        REDIS_CLUSTER --> CELERY2[Celery Worker 2]
    end
    
    subgraph "CDN & Storage"
        CLOUDFLARE[Cloudflare CDN] --> S3[AWS S3]
        CLOUDFLARE --> CLOUDINARY[Cloudinary Images]
    end
    
    subgraph "Monitoring"
        PROMETHEUS[Prometheus] --> GRAFANA[Grafana Dashboard]
        ALERTMANAGER[AlertManager] --> SLACK[Slack Notifications]
    end
```

## 🔄 CI/CD Pipeline

```mermaid
graph LR
    A[Git Push] --> B[GitHub Actions]
    B --> C[Run Tests]
    C --> D[Security Scan]
    D --> E[Build Docker Image]
    E --> F[Push to Registry]
    F --> G[Deploy to Staging]
    G --> H[E2E Tests]
    H --> I[Deploy to Production]
    I --> J[Health Check]
    J --> K[Notify Team]
    
    style A fill:#28a745,color:#fff
    style B fill:#007bff,color:#fff
    style I fill:#ff6b35,color:#fff
    style K fill:#6f42c1,color:#fff
```

## 📈 Масштабування

### Горизонтальне масштабування:
- **Django Apps**: Load balancer + multiple instances
- **Database**: Read replicas + connection pooling
- **Cache**: Redis cluster with sharding
- **Static Files**: CDN distribution

### Вертикальне масштабування:
- **CPU**: Multi-core processors for Django workers
- **RAM**: Sufficient memory for cache and database
- **Storage**: SSD for database performance
- **Network**: High bandwidth for media delivery

## 🔧 Технічні рішення

### Performance Optimization:
- **Database**: Indexing, query optimization, connection pooling
- **Cache**: Redis for sessions, query results, static data
- **CDN**: Cloudflare for static assets and images
- **Compression**: Gzip/Brotli for responses

### Reliability:
- **Health Checks**: Application and infrastructure monitoring
- **Circuit Breakers**: External service failure handling
- **Retry Logic**: Transient failure recovery
- **Backup Strategy**: Database and media backups

### Security:
- **HTTPS**: SSL/TLS encryption
- **Headers**: Security headers (HSTS, CSP, etc.)
- **Authentication**: JWT tokens with refresh mechanism
- **Authorization**: Role-based access control (RBAC)
