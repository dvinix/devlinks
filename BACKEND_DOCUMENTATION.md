# DevLinks Backend Documentation

**Last Updated:** May 2, 2026  
**Version:** 1.0.0  
**Framework:** FastAPI 0.115.12  
**Language:** Python 3.10+

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Authentication System](#authentication-system)
7. [Services](#services)
8. [Configuration](#configuration)
9. [Setup & Deployment](#setup--deployment)

---

## 🌍 Project Overview

**DevLinks** is a professional URL shortener platform with advanced analytics built specifically for WhatsApp traffic detection. The backend is built with FastAPI, providing async endpoints for link creation, management, redirection, and comprehensive analytics tracking.

### Key Features

- 🔗 URL Shortening with auto-generated or custom slugs
- 📊 Real-time analytics with WhatsApp traffic detection
- 🔐 Secure authentication (JWT + Firebase)
- ⚡ Redis caching for fast redirects
- 📈 MongoDB-based analytics storage
- 🗄️ PostgreSQL for relational data
- 🚀 Fully async with FastAPI

---

## 🛠️ Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **API Framework** | FastAPI | 0.115.12 |
| **Web Server** | Uvicorn | 0.35.0 |
| **Primary Database** | PostgreSQL | 16 |
| **Analytics DB** | MongoDB | 7 |
| **Cache Layer** | Redis | 7 |
| **ORM** | SQLAlchemy | 2.0.35 |
| **Async Driver** | asyncpg | 0.31.0 |
| **Migrations** | Alembic | 1.13.0 |
| **Auth** | Python-jose | 3.3.0 |
| **Password Hashing** | Argon2-cffi | 23.1.0 |
| **Config Management** | Pydantic Settings | 2.2.0 |
| **Environment Variables** | python-dotenv | 1.1.0 |
| **Firebase** | firebase-admin | 6.6.0 |
| **User Agent Parsing** | user-agents | 2.2.0 |
| **Logging** | loguru | 0.7.3 |

---

## 📁 Project Structure

```
app/
├── __init__.py
├── main.py                          # FastAPI app initialization
│
├── core/
│   ├── __init__.py
│   ├── config.py                    # Settings & configuration
│   ├── dependencies.py              # Dependency injection
│   ├── firebase_auth.py             # Firebase authentication
│   └── security.py                  # Password & JWT operations
│
├── db/
│   ├── __init__.py
│   ├── postgres.py                  # PostgreSQL connection
│   ├── mongo.py                     # MongoDB connection
│   └── redis.py                     # Redis connection
│
├── models/
│   ├── __init__.py
│   ├── link.py                      # Link model (PostgreSQL)
│   └── users.py                     # User model (PostgreSQL)
│
├── router/
│   ├── __init__.py
│   ├── auth.py                      # Authentication endpoints
│   ├── links.py                     # Link management endpoints
│   ├── redirect.py                  # Redirect & tracking endpoint
│   └── analytics.py                 # Analytics endpoints
│
├── schemas/
│   ├── __init__.py
│   ├── link.py                      # Link Pydantic schemas
│   └── user.py                      # User Pydantic schemas
│
└── services/
    ├── analytics_service.py         # Analytics tracking logic
    └── link_service.py              # Link utility functions

alembic/
├── env.py                           # Migration environment
├── script.py.mako                   # Migration template
└── versions/
    └── 531c33bf5433_initial_migration.py

requirements.txt                     # Python dependencies
alembic.ini                          # Alembic configuration
docker-compose.yml                  # Container orchestration
```

---

## 🗄️ Database Schema

### PostgreSQL Tables

#### **users** Table
Stores user account information with UUID primary keys for security.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NO | Primary key, auto-generated |
| `email` | String | NO | Unique email address (indexed) |
| `hashed_password` | String | NO | Argon2-hashed password |
| `plan` | Enum | YES | User subscription: `free`, `pro` (default: free) |
| `is_active` | Boolean | NO | Account active status (default: true) |
| `created_at` | DateTime | NO | Account creation timestamp (server-default) |

**Key Constraints:**
- Email must be unique (UNIQUE constraint)
- Email is indexed for fast lookups
- UUID prevents ID enumeration attacks

---

#### **links** Table
Stores shortened URL mappings and metadata.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NO | Primary key, auto-generated |
| `user_id` | UUID | NO | Foreign key to `users.id` (indexed) |
| `original_url` | String | NO | Full original URL |
| `slug` | String | NO | Unique short slug for routing |
| `is_custom_slug` | Boolean | NO | Whether slug was user-provided (default: false) |
| `expires_at` | DateTime | YES | Optional expiration timestamp |
| `is_active` | Boolean | NO | Link active status (default: true) |
| `created_at` | DateTime | NO | Link creation timestamp (server-default) |

**Key Constraints:**
- Slug must be unique (UNIQUE constraint, indexed)
- user_id is indexed for efficient user queries
- Foreign key relationship with users table

---

### MongoDB Collections

#### **clicks** Collection
Stores analytics data for each link click event.

```javascript
{
  _id: ObjectId,
  slug: String,              // Link slug
  timestamp: Date,           // Click timestamp (UTC)
  device: String,            // Device type (mobile, desktop, tablet)
  browser: String,           // Browser name
  os: String,                // Operating system
  source: String,            // Traffic source (whatsapp, direct, etc.)
  country: String,           // Geographic country
  city: String,              // Geographic city
  user_agent: String,        // Full User-Agent string
  referrer: String,          // HTTP referer
  ip_address: String         // Client IP address
}
```

---

## 🔌 API Endpoints

### Base URL
- **Development**: `http://localhost:8000`
- **Documentation**: `http://localhost:8000/docs` (Swagger UI)
- **Alternative Docs**: `http://localhost:8000/redoc` (ReDoc)

---

### System Endpoints

#### `GET /`
Root endpoint - Welcome message.

**Response:**
```json
{
  "message": "Welcome to devlinks API",
  "docs": "/docs",
  "status": "operational"
}
```

---

#### `GET /health`
Health check endpoint - Returns API status.

**Response:**
```json
{
  "status": "healthy"
}
```

---

### Authentication Endpoints (`/auth`)

#### `POST /auth/register`
Register a new user account with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "strongpassword123"
}
```

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "plan": "free",
  "is_active": true,
  "created_at": "2026-05-02T10:30:00Z"
}
```

**Status Codes:**
- `201 Created` - User registered successfully
- `400 Bad Request` - Email already registered or validation error
- `422 Unprocessable Entity` - Invalid email format or password too short

**Validation Rules:**
- Email must be valid (RFC 5322 compliant)
- Password minimum 6 characters
- Email must be unique

---

#### `POST /auth/login`
Authenticate user and return JWT tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "strongpassword123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Status Codes:**
- `200 OK` - Login successful
- `401 Unauthorized` - Invalid email/password
- `403 Forbidden` - User account is inactive

**Token Details:**
- `access_token`: Valid for 30 minutes (configurable)
- `refresh_token`: Valid for 7 days (configurable)
- Both tokens are JWT with HS256 algorithm

---

#### `POST /auth/firebase`
Authenticate using Firebase ID token (OAuth/Social login).

**Request:**
```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ..."
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Status Codes:**
- `200 OK` - Firebase authentication successful
- `401 Unauthorized` - Invalid/expired token or email not verified
- `403 Forbidden` - User account is inactive
- `503 Service Unavailable` - Firebase service unavailable

**Features:**
- Auto-creates user if first-time login
- Requires email verification from Firebase
- Generates random secure password for Firebase users

---

#### `GET /auth/me`
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "plan": "free",
  "is_active": true,
  "created_at": "2026-05-02T10:30:00Z"
}
```

**Status Codes:**
- `200 OK` - User info retrieved
- `401 Unauthorized` - Invalid or missing token

---

### Link Management Endpoints (`/links`)

#### `POST /links`
Create a new shortened URL.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "original_url": "https://github.com/yourusername/your-long-repo-name",
  "custom_slug": "my-project",
  "expires_at": "2026-06-02T10:30:00Z"
}
```

**Response:** `201 Created`
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "original_url": "https://github.com/yourusername/your-long-repo-name",
  "slug": "my-project",
  "short_url": "http://localhost:8000/my-project",
  "is_active": true,
  "created_at": "2026-05-02T10:30:00Z"
}
```

**Status Codes:**
- `201 Created` - Link created successfully
- `401 Unauthorized` - Invalid or missing token
- `422 Unprocessable Entity` - Invalid URL format

**Features:**
- Auto-generates 6-character alphanumeric slug if not provided
- Slug must be unique across all links
- Optional expiration date support
- Validates URL format using Pydantic's `HttpUrl`

---

#### `GET /links`
List all shortened links created by the authenticated user.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `skip` | int | 0 | Number of results to skip (pagination) |
| `limit` | int | 100 | Maximum results to return |

**Response:** `200 OK`
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "original_url": "https://github.com/yourusername/your-long-repo-name",
    "slug": "my-project",
    "short_url": "http://localhost:8000/my-project",
    "is_active": true,
    "created_at": "2026-05-02T10:30:00Z"
  },
  {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "original_url": "https://example.com",
    "slug": "a1b2c3",
    "short_url": "http://localhost:8000/a1b2c3",
    "is_active": true,
    "created_at": "2026-05-01T15:45:00Z"
  }
]
```

**Status Codes:**
- `200 OK` - Links retrieved successfully
- `401 Unauthorized` - Invalid or missing token

---

#### `DELETE /links/{slug}`
Delete a shortened link by slug.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | The short slug to delete |

**Response:** `204 No Content`

**Status Codes:**
- `204 No Content` - Link deleted successfully
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Link not found or user doesn't own it

---

### Redirect & Tracking Endpoint

#### `GET /{slug}`
Redirect to original URL and track analytics.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | The short slug to redirect |

**Response:** `307 Temporary Redirect`
```
Location: https://github.com/yourusername/your-long-repo-name
```

**Status Codes:**
- `307 Temporary Redirect` - Successful redirect
- `404 Not Found` - Slug doesn't exist
- `410 Gone` - Link has expired

**Features:**
- **Redis Caching**: First 24 hours cached in Redis for sub-millisecond redirects
- **Analytics Tracking**: Records click data in MongoDB (background task)
- **User-Agent Parsing**: Extracts device, browser, OS information
- **Referrer Tracking**: Captures HTTP referer header
- **Performance Optimized**: Tracks performance metrics

**Background Tasks:**
- Records click to MongoDB collection
- Parses user-agent for device/browser info
- Tracks traffic source (WhatsApp, direct, etc.)
- Geographic location tracking (if available)

---

### Analytics Endpoints (`/analytics`)

#### `GET /analytics/{slug}`
Retrieve comprehensive analytics for a shortened link.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | The short slug to analyze |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | int | 30 | Number of days to retrieve data for |

**Response:** `200 OK`
```json
{
  "slug": "my-project",
  "total_clicks": 1523,
  "period_days": 30,
  "daily_clicks": [
    {
      "_id": "2026-05-01",
      "count": 45
    },
    {
      "_id": "2026-05-02",
      "count": 87
    }
  ],
  "devices": [
    {
      "_id": "mobile",
      "count": 1200
    },
    {
      "_id": "desktop",
      "count": 300
    },
    {
      "_id": "tablet",
      "count": 23
    }
  ],
  "browsers": [
    {
      "_id": "Chrome",
      "count": 892
    },
    {
      "_id": "Safari",
      "count": 456
    },
    {
      "_id": "Firefox",
      "count": 123
    },
    {
      "_id": "Samsung Internet",
      "count": 52
    }
  ],
  "sources": [
    {
      "_id": "whatsapp",
      "count": 1100
    },
    {
      "_id": "direct",
      "count": 300
    },
    {
      "_id": "google",
      "count": 123
    }
  ],
  "top_locations": [
    {
      "_id": {
        "country": "India",
        "city": "Mumbai"
      },
      "count": 450
    },
    {
      "_id": {
        "country": "India",
        "city": "Bangalore"
      },
      "count": 380
    },
    {
      "_id": {
        "country": "United States",
        "city": "New York"
      },
      "count": 200
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Analytics retrieved successfully
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Link not found or user doesn't own it

**Analytics Tracked:**
- **Total Clicks**: Sum of all clicks for the period
- **Daily Breakdown**: Clicks grouped by date
- **Device Analytics**: Mobile, Desktop, Tablet distribution
- **Browser Analytics**: Top 5 browsers used
- **Traffic Source**: WhatsApp, direct, referral sources (Top 5)
- **Geographic Data**: Top 10 locations (country + city)

---

## 🔐 Authentication System

### JWT Implementation

The backend uses JWT (JSON Web Tokens) with HS256 algorithm for stateless authentication.

**Token Structure:**
```
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "sub": "user_id",  // User UUID
  "exp": 1234567890, // Expiration time
  "iat": 1234567800  // Issued at
}

Signature: HMACSHA256(base64(header) + "." + base64(payload), secret_key)
```

**Token Duration:**
- **Access Token**: 30 minutes (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`)
- **Refresh Token**: 7 days (configurable via `REFRESH_TOKEN_EXPIRE_DAYS`)

### Password Security

Passwords are hashed using **Argon2** algorithm:
- Memory cost: 19 (65,536 KiB)
- Time cost: 2 iterations
- Parallelism: 1 thread

### Protected Routes

All endpoints except the following require Bearer token authentication:
- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /{slug}` - Redirect endpoint (public)
- `POST /auth/register` - Registration
- `POST /auth/login` - Login
- `POST /auth/firebase` - Firebase login

### Firebase Authentication

Firebase integration allows OAuth/Social login:
- Auto-creates users on first login
- Verifies email from Firebase
- Generates secure random password for Firebase users
- Falls back to standard JWT tokens

---

## 🔧 Services

### `link_service.py`

#### `generate_unique_slug(db: AsyncSession, length: int = 6) -> str`

Generates a unique alphanumeric slug for new links.

**Parameters:**
- `db`: AsyncSession for database queries
- `length`: Slug length (default: 6 characters)

**Algorithm:**
- Generates random string from `[a-zA-Z0-9]`
- Verifies uniqueness in PostgreSQL
- Retries if collision occurs

**Example Output:**
```
"a1b2c3"
"AbCdEf"
"9xY8zW"
```

---

### `analytics_service.py`

#### `record_click(slug: str, request: Request, ip_address: str, user_agent: str, referrer: str)`

Records analytics data for each link click to MongoDB.

**Data Collected:**
- Slug
- Timestamp (UTC)
- Device type (parsed from user-agent)
- Browser name
- Operating system
- Traffic source detection (WhatsApp, direct, etc.)
- Geographic location
- IP address
- User-Agent string
- HTTP referer

**Processing:**
- Async background task
- User-agent parsing with `user-agents` library
- Traffic source detection from referrer
- Stores to MongoDB `clicks` collection

---

## ⚙️ Configuration

Configuration is managed via environment variables using Pydantic Settings.

### Required Environment Variables

```env
# Database Connections
POSTGRES_URL=postgresql+asyncpg://user:password@localhost:5432/devlinks
MONGO_URL=mongodb://localhost:27017
MONGO_DB_NAME=devlinks
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-very-secret-key-with-at-least-32-characters
ALGORITHM=HS256

# Token Expiration
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Application
APP_HOST=127.0.0.1
APP_PORT=8000
BASE_URL=http://localhost:8000

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8000

# Firebase (Optional for OAuth)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_SERVICE_ACCOUNT_JSON={"type": "service_account", ...}
```

### Configuration Class

Located in `app/core/config.py`:

```python
class Settings(BaseSettings):
    postgres_url: str
    mongo_url: str
    redis_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    app_host: str = "127.0.0.1"
    app_port: int = 8000
    base_url: str = "http://localhost:8000"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    firebase_project_id: str = ""
    firebase_client_email: str = ""
    firebase_private_key: str = ""
    firebase_service_account_json: str = ""
```

**CORS Configuration:**
- Default origins: `localhost:5173`, `localhost:3000`, `localhost:8000`
- Configurable via comma-separated list
- Credentials enabled for all origins
- All methods and headers allowed

---

## 🚀 Setup & Deployment

### Local Development Setup

#### 1. **Install Dependencies**
```bash
pip install -r requirements.txt
```

#### 2. **Set Up Environment Variables**
Create `.env` file in project root:
```env
POSTGRES_URL=postgresql+asyncpg://postgres:password@localhost:5432/devlinks
MONGO_URL=mongodb://localhost:27017
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-minimum-32-chars-long
BASE_URL=http://localhost:8000
```

#### 3. **Start Services with Docker Compose**
```bash
docker-compose up -d
```

This starts:
- PostgreSQL database
- MongoDB for analytics
- Redis cache
- PgAdmin (optional)

#### 4. **Run Database Migrations**
```bash
alembic upgrade head
```

#### 5. **Start FastAPI Server**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server runs on: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Docker Deployment

#### Build Docker Image
```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Docker Compose Configuration
```yaml
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - POSTGRES_URL=postgresql+asyncpg://postgres:password@db:5432/devlinks
      - MONGO_URL=mongodb://mongo:27017
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - mongo
      - redis
```

### Production Deployment Checklist

- [ ] Set strong `SECRET_KEY` (minimum 32 characters, random)
- [ ] Configure production database URLs
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Set `CORS_ORIGINS` to your domain only
- [ ] Use production-grade ASGI server (Gunicorn + Uvicorn)
- [ ] Enable rate limiting on auth endpoints
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for PostgreSQL
- [ ] Enable persistence for Redis
- [ ] Set up log rotation
- [ ] Use environment variables for all secrets

### Performance Optimization

**Implemented:**
- ✅ Redis caching (24-hour TTL on redirects)
- ✅ PostgreSQL connection pooling (async)
- ✅ MongoDB aggregation pipelines for analytics
- ✅ Background tasks for analytics recording
- ✅ Indexed database columns

**Recommendations:**
- Use CDN for static content
- Enable HTTP caching headers
- Implement rate limiting (use `slowapi`)
- Monitor query performance
- Set up database query logging
- Use connection pooling for production

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (React)                       │
│                  http://localhost:3000                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 FastAPI Backend                              │
│              http://localhost:8000                           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Auth Router  │  │ Links Router │  │Analytics Rtr │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            ▼                                 │
│              ┌──────────────────────────┐                    │
│              │  Dependency Injection    │                    │
│              │  (Auth, DB, Cache)       │                    │
│              └──────────────────────────┘                    │
└─────────┬──────────────────┬──────────────────┬──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ PostgreSQL   │  │  MongoDB     │  │   Redis      │
    │ (Users,      │  │  (Analytics/ │  │  (Cache)     │
    │  Links)      │  │   Clicks)    │  │              │
    └──────────────┘  └──────────────┘  └──────────────┘
         Port 5432        Port 27017       Port 6379
```

---

## 🐛 Common Issues & Solutions

### Issue 1: PostgreSQL Connection Error
**Problem:** `asyncpg` connection refused
**Solution:**
```bash
# Start PostgreSQL service
docker-compose up -d db

# Verify connection string format
POSTGRES_URL=postgresql+asyncpg://user:password@host:5432/dbname
```

### Issue 2: Redis Connection Timeout
**Problem:** Connection timeout on redirect
**Solution:**
```bash
# Check Redis is running
docker-compose ps

# Test Redis connection
redis-cli ping  # Should return PONG
```

### Issue 3: Alembic Migration Issues
**Problem:** `Target database is not up to date`
**Solution:**
```bash
# View migration status
alembic current
alembic history

# Downgrade and upgrade
alembic downgrade base
alembic upgrade head
```

### Issue 4: CORS Errors
**Problem:** Preflight request fails
**Solution:**
```env
# Ensure frontend URL is in CORS_ORIGINS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8000
```

---

## 📚 Additional Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **SQLAlchemy 2.0 Docs**: https://docs.sqlalchemy.org/
- **Alembic Migration Guide**: https://alembic.sqlalchemy.org/
- **JWT Best Practices**: https://tools.ietf.org/html/rfc7519
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **MongoDB Docs**: https://docs.mongodb.com/
- **Redis Docs**: https://redis.io/docs/

---

## 📝 Summary of Completed Work

### ✅ Authentication System
- Email/password registration with Argon2 hashing
- JWT-based login with access + refresh tokens
- Firebase OAuth integration
- Protected routes with dependency injection

### ✅ Link Management
- Create shortened URLs with auto-generated slugs
- Custom slug support
- Link expiration support
- List user's links with pagination
- Delete links

### ✅ Redirect & Tracking
- Fast redirect with Redis caching (24-hour TTL)
- Automatic analytics recording (background task)
- Device/Browser detection
- Traffic source identification (WhatsApp detection)

### ✅ Analytics Engine
- Real-time click tracking to MongoDB
- Daily click breakdown
- Device distribution analytics
- Browser statistics (Top 5)
- Traffic source tracking (Top 5)
- Geographic analytics (Top 10 locations)
- Configurable time-range queries (default 30 days)

### ✅ Database Architecture
- PostgreSQL for relational data (Users, Links)
- MongoDB for analytics (Clicks collection)
- Redis for caching (1-day TTL)
- Alembic migrations for schema versioning

### ✅ API Documentation
- OpenAPI/Swagger UI at `/docs`
- ReDoc documentation at `/redoc`
- Comprehensive endpoint descriptions

---

**Version:** 1.0.0  
**Last Updated:** May 2, 2026  
**Status:** ✅ Production Ready
