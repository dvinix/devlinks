# DevLinks — Smart URL Shortener with Analytics

> A production-grade URL shortener built with FastAPI, PostgreSQL, MongoDB, and Redis.
> Built as a final-year placement project to demonstrate real-world backend skills.

---

## Table of Contents 

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Phase 1 — Project Setup + PostgreSQL Foundation](#phase-1--project-setup--postgresql-foundation)
- [Phase 2 — Core Link Shortening + Redis Caching](#phase-2--core-link-shortening--redis-caching)
- [Phase 3 — MongoDB Analytics + Background Tasks](#phase-3--mongodb-analytics--background-tasks)
- [Phase 4 — Docker, CI/CD + Production Deploy](#phase-4--docker-cicd--production-deploy)
- [Phase 5 — Production Hardening + Real Users](#phase-5--production-hardening--real-users)
- [Interview Talking Points](#interview-talking-points)
- [Folder Structure](#folder-structure)

---

## Project Overview

DevLinks is a SaaS-style URL shortener where users create short links and get detailed analytics on every click — country, device, browser, referrer, and time. It is designed to attract real users (share in college WhatsApp groups, LinkedIn) so the MongoDB analytics collection contains actual data during interviews.

### What a user can do

- Sign up and log in (JWT with refresh tokens)
- Shorten any URL with an auto-generated or custom slug
- Set an expiry date or password-protect a link
- Share the short link anywhere
- Open a dashboard to see click analytics — total clicks, clicks over time, top countries, top devices

### Why this project for placements

Most students have never used two databases together, never touched Redis, and never set up a CI/CD pipeline. This project forces all three, and each one becomes a 5-minute interview conversation where you can answer from real experience.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| API framework | FastAPI | Async-native, auto OpenAPI docs, Python |
| Relational DB | PostgreSQL + asyncpg | Users, links, plans — ACID, FK constraints |
| Document DB | MongoDB + Motor | Click events — append-heavy, schema-flexible |
| Cache / Rate limit | Redis + aioredis | Hot link cache, per-user quota counters |
| Migrations | Alembic | Version-controlled schema changes |
| Auth | JWT (python-jose) + passlib | Access + refresh tokens |
| Containerisation | Docker + Docker Compose | Identical local and production environments |
| CI/CD | GitHub Actions | Auto-test and deploy on every push |
| Hosting | Railway | Free tier, managed DB add-ons, real URL |
| Logging | loguru | Structured JSON logs, request ID tracing |

---

## Architecture

### Request flow for a redirect

```
User hits /abc123
    |
    ▼
Redis cache check
    |
    ├── HIT  → 307 Redirect  →  Background task: save click to MongoDB
    |
    └── MISS → Query Postgres → Cache result in Redis → 307 Redirect → Background task: save click
```

### Database responsibility split

**PostgreSQL** stores everything relational and consistent:
- `users` — id, email, hashed_password, plan (free/pro), created_at
- `links` — id, user_id (FK), original_url, slug, custom_slug, expires_at, is_active, created_at

**MongoDB** stores every click event:
```json
{
  "slug": "abc123",
  "timestamp": "2025-04-17T10:30:00Z",
  "country": "IN",
  "city": "Jaipur",
  "device": "mobile",
  "browser": "Chrome",
  "referrer": "whatsapp",
  "ip_hash": "sha256_of_ip"
}
```

**Redis** stores:
- `link:{slug}` → original URL (TTL: 24 hours) — hot path cache
- `ratelimit:{user_id}:{window}` → click counter (TTL: 1 minute) — per-user quota

---

## Phase 1 — Project Setup + PostgreSQL Foundation

**Duration:** Week 1  
**Goal:** Working auth system, Postgres running locally via Docker Compose, migrations tracked in Alembic.

### 1.1 Folder structure

```
devlinks/
├── app/
│   ├── core/
│   │   ├── config.py          # Pydantic settings (reads from .env)
│   │   ├── security.py        # JWT helpers, password hashing
│   │   └── dependencies.py    # FastAPI Depends() — db session, current user
│   ├── db/
│   │   ├── postgres.py        # Async SQLAlchemy engine + session factory
│   │   ├── mongo.py           # Motor client setup
│   │   └── redis.py           # aioredis pool setup
│   ├── models/
│   │   ├── user.py            # SQLAlchemy ORM model
│   │   └── link.py            # SQLAlchemy ORM model
│   ├── schemas/
│   │   ├── user.py            # Pydantic request/response schemas
│   │   └── link.py
│   ├── routers/
│   │   ├── auth.py            # /auth/register, /auth/login, /auth/refresh
│   │   ├── links.py           # /links POST, GET, DELETE
│   │   └── analytics.py       # /analytics/{slug}
│   ├── services/
│   │   ├── auth_service.py    # Business logic for auth
│   │   ├── link_service.py    # Slug generation, validation
│   │   └── analytics_service.py
│   └── main.py                # FastAPI app, lifespan, router registration
├── alembic/
│   ├── versions/              # Migration files
│   └── env.py                 # Alembic config
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   └── test_links.py
├── docker-compose.yml
├── Dockerfile
├── alembic.ini
├── requirements.txt
└── .env.example
```

The key principle: routers only handle HTTP, services contain business logic, models are pure DB. This is the layered architecture interviewers expect.

### 1.2 Pydantic settings (`app/core/config.py`)

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # PostgreSQL
    POSTGRES_URL: str
    # MongoDB
    MONGO_URL: str
    MONGO_DB_NAME: str = "devlinks"
    # Redis
    REDIS_URL: str
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    class Config:
        env_file = ".env"

settings = Settings()
```

Never hardcode secrets. All values come from environment variables or a `.env` file that is never committed to Git. Always have a `.env.example` with placeholder values.

### 1.3 Async SQLAlchemy engine (`app/db/postgres.py`)

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

engine = create_async_engine(
    settings.POSTGRES_URL,
    pool_size=10,
    max_overflow=20,
    echo=False,  # Set True in dev to log SQL
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

class Base(DeclarativeBase):
    pass
```

`pool_size=10` and `max_overflow=20` are production-relevant settings. In interviews, explain that a pool keeps connections alive instead of opening a new TCP connection on every request, which is expensive.

### 1.4 SQLAlchemy models

**`app/models/user.py`**
```python
from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.postgres import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    plan = Column(Enum("free", "pro", name="user_plan"), default="free")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

**`app/models/link.py`**
```python
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.postgres import Base

class Link(Base):
    __tablename__ = "links"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    original_url = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    is_custom_slug = Column(Boolean, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

The `index=True` on `slug` is critical — every redirect hits this column. Without an index, Postgres does a full table scan on every click.

### 1.5 Alembic setup and migrations

**Initial setup (run once):**
```bash
alembic init alembic
```

**`alembic/env.py` — connect it to your models:**
```python
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from app.db.postgres import Base
from app.models import user, link  # Import all models so Alembic can detect them
from app.core.config import settings

config = context.config
config.set_main_option("sqlalchemy.url", settings.POSTGRES_URL.replace("+asyncpg", ""))
# Note: Alembic uses the sync driver; strip +asyncpg for migrations

fileConfig(config.config_file_name)
target_metadata = Base.metadata

def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

run_migrations_online()
```

**Generate your first migration:**
```bash
alembic revision --autogenerate -m "create users and links tables"
```

Alembic compares your SQLAlchemy models against the current database state and generates a migration file automatically. Always review the generated file before running it — autogenerate is smart but not perfect.

**Apply migrations:**
```bash
alembic upgrade head
```

**Rollback one migration:**
```bash
alembic downgrade -1
```

**Check current state:**
```bash
alembic current
alembic history
```

### 1.6 Running Alembic in CI

In your GitHub Actions workflow, run migrations before starting the app or running tests:

```yaml
- name: Run database migrations
  run: alembic upgrade head
  env:
    POSTGRES_URL: postgresql://postgres:postgres@localhost:5432/devlinks_test
```

This ensures your CI database schema is always up to date. If a migration fails in CI, the deploy is blocked — which is exactly what you want.

### 1.7 JWT authentication (`app/core/security.py`)

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": user_id, "exp": expire}, settings.SECRET_KEY, settings.ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub": user_id, "exp": expire, "type": "refresh"}, settings.SECRET_KEY, settings.ALGORITHM)
```

### Phase 1 outcome

By end of week 1: register a user, log in, receive a JWT, and hit a protected route. Postgres running locally in Docker Compose. Alembic migration history established. Codebase layered properly from the start.

---

## Phase 2 — Core Link Shortening + Redis Caching

**Duration:** Week 2  
**Goal:** Core product works end-to-end. Share the live URL with friends to start getting real data.

### 2.1 Motor setup (`app/db/mongo.py`)

```python
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client: AsyncIOMotorClient = None

def get_mongo_db():
    return client[settings.MONGO_DB_NAME]

async def connect_mongo():
    global client
    client = AsyncIOMotorClient(settings.MONGO_URL)
    db = client[settings.MONGO_DB_NAME]
    # Create compound index on startup — idempotent
    await db.clicks.create_index([("slug", 1), ("timestamp", -1)])
    await db.clicks.create_index([("slug", 1), ("country", 1)])

async def disconnect_mongo():
    client.close()
```

The compound index `(slug, timestamp)` is what makes analytics queries fast. Without it, MongoDB does a full collection scan for every dashboard load. In interviews, say you verified this with `explain("executionStats")`.

### 2.2 aioredis setup (`app/db/redis.py`)

```python
import aioredis
from app.core.config import settings

redis: aioredis.Redis = None

async def connect_redis():
    global redis
    redis = await aioredis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)

async def disconnect_redis():
    await redis.close()

def get_redis():
    return redis
```

### 2.3 Lifespan (startup/shutdown in `app/main.py`)

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.db.mongo import connect_mongo, disconnect_mongo
from app.db.redis import connect_redis, disconnect_redis

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_mongo()
    await connect_redis()
    yield
    await disconnect_mongo()
    await disconnect_redis()

app = FastAPI(lifespan=lifespan)
```

Using `lifespan` (not the deprecated `on_event`) is the FastAPI-recommended approach as of version 0.93+.

### 2.4 Slug generation (`app/services/link_service.py`)

```python
import random
import string
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.link import Link

ALPHABET = string.ascii_letters + string.digits

async def generate_unique_slug(db: AsyncSession, length: int = 6) -> str:
    while True:
        slug = "".join(random.choices(ALPHABET, k=length))
        result = await db.execute(select(Link).where(Link.slug == slug))
        if not result.scalar_one_or_none():
            return slug
```

### 2.5 Redirect endpoint with Redis cache

```python
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db, get_redis_client
from app.models.link import Link
from sqlalchemy import select
from datetime import datetime

router = APIRouter()

@router.get("/{slug}")
async def redirect(slug: str, db: AsyncSession = Depends(get_db), redis=Depends(get_redis_client)):
    # 1. Check Redis cache
    cached_url = await redis.get(f"link:{slug}")
    if cached_url:
        return RedirectResponse(url=cached_url, status_code=307)

    # 2. Cache miss — query Postgres
    result = await db.execute(
        select(Link).where(Link.slug == slug, Link.is_active == True)
    )
    link = result.scalar_one_or_none()

    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    if link.expires_at and link.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Link has expired")

    # 3. Store in Redis for next time (24 hour TTL)
    await redis.setex(f"link:{slug}", 86400, link.original_url)

    return RedirectResponse(url=link.original_url, status_code=307)
```

307 (Temporary Redirect) is used instead of 301 (Permanent Redirect) so browsers don't cache the redirect locally — which would break analytics and prevent cache invalidation from working correctly.

### 2.6 Per-user rate limiting

```python
from fastapi import HTTPException
import time

async def check_rate_limit(user_id: str, redis, limit: int = 100):
    window = int(time.time() // 60)  # 1-minute sliding window
    key = f"ratelimit:{user_id}:{window}"
    count = await redis.incr(key)
    if count == 1:
        await redis.expire(key, 60)
    if count > limit:
        raise HTTPException(status_code=429, headers={"Retry-After": "60"}, detail="Rate limit exceeded")
```

Use this as a `Depends()` on any endpoint that should be rate-limited. For free users pass `limit=10`, for pro users pass `limit=1000`.

### Phase 2 outcome

By end of week 2: paste a URL, get a short link, click it, get redirected. Redis caching is live. Share the deployed URL with friends — the core product is usable.

---

## Phase 3 — MongoDB Analytics + Background Tasks

**Duration:** Week 3  
**Goal:** Every click is tracked. Analytics API is queryable. Dashboard has real data.

### 3.1 Click event schema

Each document in the `clicks` collection:

```python
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ClickEvent(BaseModel):
    slug: str
    timestamp: datetime
    country: Optional[str] = None
    city: Optional[str] = None
    device: str           # "mobile" | "desktop" | "tablet"
    browser: str          # "Chrome" | "Safari" | "Firefox" | ...
    referrer: Optional[str] = None
    ip_hash: str          # SHA-256 of IP — never store raw IPs
```

Never store raw IP addresses. Hash them with SHA-256 so you can count unique visitors without storing PII.

### 3.2 Background task: record click after redirect

```python
from fastapi import BackgroundTasks, Request
from datetime import datetime
import hashlib
from user_agents import parse as parse_ua
import httpx

async def record_click(slug: str, request: Request, mongo_db):
    ua_string = request.headers.get("user-agent", "")
    ua = parse_ua(ua_string)
    ip = request.client.host
    referrer = request.headers.get("referer", None)

    # Geo lookup (free tier, no API key needed)
    country, city = None, None
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.get(f"http://ip-api.com/json/{ip}?fields=country,city,status")
            data = resp.json()
            if data.get("status") == "success":
                country = data.get("country")
                city = data.get("city")
    except Exception:
        pass  # Never let analytics failure affect the redirect

    event = {
        "slug": slug,
        "timestamp": datetime.utcnow(),
        "country": country,
        "city": city,
        "device": "mobile" if ua.is_mobile else ("tablet" if ua.is_tablet else "desktop"),
        "browser": ua.browser.family,
        "referrer": referrer,
        "ip_hash": hashlib.sha256(ip.encode()).hexdigest(),
    }
    await mongo_db.clicks.insert_one(event)
```

Add this to the redirect endpoint as a background task:

```python
@router.get("/{slug}")
async def redirect(slug: str, request: Request, background_tasks: BackgroundTasks, ...):
    # ... cache check and Postgres query ...
    background_tasks.add_task(record_click, slug, request, get_mongo_db())
    return RedirectResponse(url=original_url, status_code=307)
```

The redirect response is sent immediately. The click is recorded after. The user never waits for analytics.

### 3.3 Analytics query endpoints

```python
@router.get("/analytics/{slug}")
async def get_analytics(slug: str, days: int = 30, current_user=Depends(get_current_user)):
    mongo_db = get_mongo_db()
    since = datetime.utcnow() - timedelta(days=days)

    # Total clicks
    total = await mongo_db.clicks.count_documents({"slug": slug, "timestamp": {"$gte": since}})

    # Clicks per day (aggregation pipeline)
    daily_pipeline = [
        {"$match": {"slug": slug, "timestamp": {"$gte": since}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    daily = await mongo_db.clicks.aggregate(daily_pipeline).to_list(None)

    # Top countries
    country_pipeline = [
        {"$match": {"slug": slug, "timestamp": {"$gte": since}}},
        {"$group": {"_id": "$country", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    countries = await mongo_db.clicks.aggregate(country_pipeline).to_list(None)

    # Top devices
    device_pipeline = [
        {"$match": {"slug": slug}},
        {"$group": {"_id": "$device", "count": {"$sum": 1}}}
    ]
    devices = await mongo_db.clicks.aggregate(device_pipeline).to_list(None)

    return {"total": total, "daily": daily, "countries": countries, "devices": devices}
```

### 3.4 Verifying indexes are used

Run this in a MongoDB shell to confirm your index is being used (not doing a collection scan):

```javascript
db.clicks.find({ slug: "abc123" }).explain("executionStats")
// Look for: "IXSCAN" (index scan) not "COLLSCAN" (collection scan)
// winningPlan.stage should be "IXSCAN"
```

This is the MongoDB equivalent of `EXPLAIN ANALYZE` in PostgreSQL. Knowing this command and what to look for is a strong signal in interviews.

### Phase 3 outcome

By end of week 3: every click is tracked asynchronously. Analytics endpoints return real aggregated data. MongoDB collection has actual documents from real users.

---

## Phase 4 — Docker, CI/CD + Production Deploy

**Duration:** Week 4  
**Goal:** Live URL on Railway. Every push to main auto-deploys. Tests block bad deploys.

### 4.1 Dockerfile (multi-stage)

```dockerfile
# --- Build stage ---
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- Production stage ---
FROM python:3.11-slim AS production
WORKDIR /app

# Non-root user for security
RUN addgroup --system app && adduser --system --group app

COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY . .

USER app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import httpx; httpx.get('http://localhost:8000/health')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

Multi-stage builds keep the final image small — only production dependencies, not build tools. Running as a non-root user is a basic security requirement that interviewers notice.

### 4.2 Docker Compose (local development)

```yaml
version: "3.9"
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - POSTGRES_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/devlinks
      - MONGO_URL=mongodb://mongo:27017
      - REDIS_URL=redis://redis:6379
      - SECRET_KEY=dev_secret_key_change_in_production
    depends_on:
      postgres:
        condition: service_healthy
      mongo:
        condition: service_started
      redis:
        condition: service_started
    volumes:
      - .:/app  # Hot reload in development

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: devlinks
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
  mongo_data:
```

The `depends_on` with `condition: service_healthy` ensures the API container only starts after Postgres is ready to accept connections — a common production bug when omitted.

### 4.3 GitHub Actions CI/CD pipeline

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: devlinks_test
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready
          --health-interval 5s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - run: pip install -r requirements.txt
      - name: Run Alembic migrations
        run: alembic upgrade head
        env:
          POSTGRES_URL: postgresql://postgres:postgres@localhost:5432/devlinks_test
      - name: Run tests
        run: pytest tests/ -v --tb=short
        env:
          POSTGRES_URL: postgresql+asyncpg://postgres:postgres@localhost:5432/devlinks_test
          MONGO_URL: ""   # Mocked in tests
          REDIS_URL: ""   # Mocked in tests
          SECRET_KEY: test_secret

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway
        run: npx @railway/cli up --service devlinks
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

The `needs: test` line is critical — the deploy job only runs if the test job passes. Tests block bad deploys automatically.

### 4.4 pytest integration tests

```python
# tests/conftest.py
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.main import app
from app.db.postgres import Base
from app.core.dependencies import get_db
from unittest.mock import AsyncMock

TEST_DB_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/devlinks_test"

@pytest.fixture(scope="session")
async def db_engine():
    engine = create_async_engine(TEST_DB_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()

@pytest.fixture
async def client(db_engine):
    SessionLocal = async_sessionmaker(db_engine, class_=AsyncSession)
    async def override_get_db():
        async with SessionLocal() as session:
            yield session
    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

# tests/test_auth.py
@pytest.mark.asyncio
async def test_register_and_login(client):
    # Register
    resp = await client.post("/auth/register", json={"email": "test@test.com", "password": "password123"})
    assert resp.status_code == 201

    # Login
    resp = await client.post("/auth/login", data={"username": "test@test.com", "password": "password123"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()

# tests/test_links.py
@pytest.mark.asyncio
async def test_shorten_and_redirect(client):
    # Create a link
    resp = await client.post(
        "/links",
        json={"original_url": "https://google.com"},
        headers={"Authorization": f"Bearer {get_test_token()}"}
    )
    assert resp.status_code == 201
    slug = resp.json()["slug"]

    # Redirect
    resp = await client.get(f"/{slug}", follow_redirects=False)
    assert resp.status_code == 307
    assert resp.headers["location"] == "https://google.com"
```

### Phase 4 outcome

By end of week 4: live URL on Railway. Every push to main runs tests and auto-deploys if they pass. Alembic migrations run automatically in CI. This is the complete CI/CD story for interviews.

---

## Phase 5 — Production Hardening + Real Users

**Duration:** Week 5  
**Goal:** Production-grade observability, graceful shutdown, a visual dashboard, and real users generating real data.

### 5.1 Structured logging with loguru

```python
# app/core/logging.py
import sys
import uuid
from loguru import logger
from fastapi import Request

def setup_logging():
    logger.remove()
    logger.add(
        sys.stdout,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {extra[request_id]} | {message}",
        level="INFO",
        serialize=True  # JSON output in production
    )

# Request ID middleware — add to main.py
@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    with logger.contextualize(request_id=request_id):
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
```

Every log line gets a `request_id`. When something goes wrong in production, you filter logs by `request_id` to trace a single request across all services.

### 5.2 Graceful shutdown

The `lifespan` context manager in `main.py` already handles this. When Railway sends `SIGTERM` (e.g., during a new deploy), FastAPI runs the `yield` cleanup code:

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_mongo()
    await connect_redis()
    logger.info("Services connected")
    yield
    # Shutdown — runs on SIGTERM
    await disconnect_mongo()
    await disconnect_redis()
    await engine.dispose()  # Close asyncpg pool
    logger.info("Services disconnected cleanly")
```

This prevents connection leaks when a new version is deployed. In interviews: "I close all database connections and the asyncpg pool on SIGTERM so in-flight requests finish cleanly before the process exits."

### 5.3 Health check endpoint

```python
@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}
```

Railway uses this to know when the container is ready to receive traffic. Without it, Railway may route traffic to a container that is still starting up.

### 5.4 Simple analytics dashboard (Jinja2 + Chart.js)

```python
# app/routers/dashboard.py
from fastapi import APIRouter, Request, Depends
from fastapi.templating import Jinja2Templates

templates = Jinja2Templates(directory="templates")
router = APIRouter()

@router.get("/dashboard/{slug}")
async def dashboard(slug: str, request: Request, current_user=Depends(get_current_user)):
    # Fetch analytics from MongoDB
    analytics = await get_analytics(slug, days=30)
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "slug": slug,
        "analytics": analytics
    })
```

The dashboard template uses Chart.js (CDN, no build step) to render click trends and a country breakdown. This makes the project feel like a real product rather than just an API, which is important for interviews where you screen-share.

### 5.5 Getting real users

The fastest way to get real users as a final-year student in Jaipur:

1. **College WhatsApp groups** — Post "I built a free URL shortener with analytics, try it out: devlinks.app" in your department group, hostel group, and placement cell group. 50 clicks in the first day is very achievable.

2. **LinkedIn post** — Write a short post: "Built a URL shortener with FastAPI + PostgreSQL + MongoDB as a learning project. Here's what I learned about Redis caching..." Include your GitHub link and the live URL. Tag your college. This gets views from recruiters too.

3. **Developer communities** — Post in Indian developer Discord servers and Telegram groups. Other developers will genuinely try it.

4. **Use it yourself** — Shorten every link you share on any platform. Every click you generate is real data.

Even 100 real users with 500 total clicks means your MongoDB `clicks` collection has real documents, and you can show live aggregated charts during an interview. That is extremely rare for a student project.

### Phase 5 outcome

By end of week 5: structured JSON logs in production, graceful shutdown on deploy, a visual analytics dashboard, real users in the database. GitHub README tells the complete story. Interview-ready.

---

## Interview Talking Points

These are the questions interviewers will ask and the answers this project gives you.

**"Why did you use two databases?"**
> PostgreSQL for users and links — relational data with foreign key constraints between users and their links, ACID guarantees matter here. MongoDB for click events — append-only, potentially millions of documents, schema varies by device type, and I need to query by time range. The access patterns are completely different, so the right tool for each was different.

**"How did you make the redirect fast?"**
> Redis cache. When a link is first created, the slug is not in cache. On first click, we query Postgres and store the result in Redis with a 24-hour TTL. Every subsequent click is a cache hit — no Postgres query. The redirect returns in under 10ms.

**"How do you handle analytics without slowing down the redirect?"**
> FastAPI's BackgroundTasks. The redirect response is sent immediately, and the click event is written to MongoDB after the response is already on the wire. The user experience is unaffected regardless of how long the MongoDB write takes.

**"What do you know about database migrations?"**
> I use Alembic with autogenerate. I define my SQLAlchemy models, run `alembic revision --autogenerate`, review the generated file, and apply with `alembic upgrade head`. In CI, migrations run automatically before tests. If a migration fails, the build fails and the deploy is blocked.

**"What happens when you deploy a new version?"**
> Railway sends SIGTERM. FastAPI's lifespan context manager catches this and runs cleanup code — closes the asyncpg connection pool, closes the Motor MongoDB client, closes the aioredis connection. In-flight requests finish cleanly before the process exits. Then Railway starts the new container and routes traffic to it.

**"How does your CI/CD pipeline work?"**
> Push to main triggers GitHub Actions. It spins up a Postgres service container, runs Alembic migrations, runs pytest. If tests pass, it deploys to Railway using the Railway CLI. The deploy is blocked if any test fails. The whole pipeline takes about 90 seconds.

---

## Folder Structure (final)

```
devlinks/
├── app/
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── logging.py
│   │   └── dependencies.py
│   ├── db/
│   │   ├── postgres.py
│   │   ├── mongo.py
│   │   └── redis.py
│   ├── models/
│   │   ├── user.py
│   │   └── link.py
│   ├── schemas/
│   │   ├── user.py
│   │   └── link.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── links.py
│   │   ├── analytics.py
│   │   └── dashboard.py
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── link_service.py
│   │   └── analytics_service.py
│   └── main.py
├── alembic/
│   ├── versions/
│   └── env.py
├── templates/
│   └── dashboard.html
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   └── test_links.py
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
├── Dockerfile
├── alembic.ini
├── requirements.txt
├── .env.example
└── README.md
```

---

*Built as a final-year placement project. FastAPI + PostgreSQL + MongoDB + Redis + Docker + GitHub Actions + Railway.*
