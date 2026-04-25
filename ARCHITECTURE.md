# DevLinks - System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │    Mobile    │  │   Desktop    │          │
│  │  (React App) │  │   (Future)   │  │   (Future)   │          │
│  └──────┬───────┘  └──────────────┘  └──────────────┘          │
│         │                                                         │
│         │ HTTP/HTTPS                                             │
│         │                                                         │
└─────────┼─────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    FastAPI Backend                         │  │
│  │                                                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │  │
│  │  │   Auth   │  │  Links   │  │ Redirect │  │Analytics │ │  │
│  │  │  Router  │  │  Router  │  │  Router  │  │  Router  │ │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │  │
│  │       │             │             │             │        │  │
│  │       └─────────────┴─────────────┴─────────────┘        │  │
│  │                          │                                │  │
│  │                          ▼                                │  │
│  │              ┌───────────────────────┐                   │  │
│  │              │   Business Logic      │                   │  │
│  │              │   (Services Layer)    │                   │  │
│  │              └───────────────────────┘                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │   MongoDB    │  │    Redis     │          │
│  │              │  │              │  │              │          │
│  │   Users &    │  │   Click      │  │   Caching    │          │
│  │   Links      │  │  Analytics   │  │   Layer      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow

### 1. User Registration Flow

```
User → Frontend → POST /auth/register → FastAPI
                                          │
                                          ▼
                                    Validate Input
                                          │
                                          ▼
                                    Hash Password
                                          │
                                          ▼
                                    PostgreSQL
                                          │
                                          ▼
                                    Return User Data
                                          │
                                          ▼
                                    Frontend → Dashboard
```

### 2. Link Creation Flow

```
User → Dashboard → POST /links/ → FastAPI
                                     │
                                     ▼
                              Verify JWT Token
                                     │
                                     ▼
                              Generate Slug
                                     │
                                     ▼
                              Save to PostgreSQL
                                     │
                                     ▼
                              Return Short URL
                                     │
                                     ▼
                              Display in Dashboard
```

### 3. URL Redirect Flow (Fast Path)

```
User Clicks Short Link → GET /{slug} → FastAPI
                                          │
                                          ▼
                                    Check Redis Cache
                                          │
                                    ┌─────┴─────┐
                                    │           │
                                  HIT         MISS
                                    │           │
                                    │           ▼
                                    │    Query PostgreSQL
                                    │           │
                                    │           ▼
                                    │    Cache in Redis
                                    │           │
                                    └─────┬─────┘
                                          │
                                          ▼
                              Background: Track Click
                                          │
                                          ▼
                                    Save to MongoDB
                                          │
                                          ▼
                                    Redirect to URL
```

### 4. Analytics Query Flow

```
User → Dashboard → GET /analytics/{slug} → FastAPI
                                              │
                                              ▼
                                       Verify Ownership
                                              │
                                              ▼
                                       Query MongoDB
                                              │
                                              ▼
                                    Aggregate Data:
                                    - Daily clicks
                                    - Devices
                                    - Browsers
                                    - Sources
                                    - Locations
                                              │
                                              ▼
                                       Return JSON
                                              │
                                              ▼
                                    Display Charts
```

## 📊 Database Schema

### PostgreSQL (Relational Data)

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    plan VARCHAR DEFAULT 'free',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Links Table
CREATE TABLE links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    original_url VARCHAR NOT NULL,
    slug VARCHAR UNIQUE NOT NULL,
    is_custom_slug BOOLEAN DEFAULT false,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_links_slug ON links(slug);
CREATE INDEX idx_users_email ON users(email);
```

### MongoDB (Analytics Data)

```javascript
// Clicks Collection
{
  _id: ObjectId,
  slug: "abc123",
  timestamp: ISODate("2026-04-26T10:30:00Z"),
  ip: "192.168.1.1",
  user_agent: "Mozilla/5.0...",
  referer: "https://wa.me/...",
  device: "mobile",
  browser: "chrome",
  os: "android",
  source: "whatsapp",
  country: "India",
  city: "Mumbai"
}

// Indexes
db.clicks.createIndex({ slug: 1, timestamp: -1 })
db.clicks.createIndex({ slug: 1, source: 1 })
db.clicks.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 }) // 90 days
```

### Redis (Cache)

```
Key Pattern: link:{slug}
Value: original_url
TTL: 86400 seconds (24 hours)

Example:
link:abc123 → "https://example.com/long-url"
```

## 🔐 Security Architecture

### Authentication Flow

```
┌──────────────────────────────────────────────────────────┐
│                    Authentication                         │
└──────────────────────────────────────────────────────────┘

1. User Login
   ↓
2. Verify Password (bcrypt)
   ↓
3. Generate JWT Tokens
   ├─ Access Token (30 min)
   └─ Refresh Token (7 days)
   ↓
4. Store in localStorage
   ↓
5. Include in Authorization Header
   ↓
6. Verify on Each Request
   ↓
7. Decode & Validate Token
   ↓
8. Extract User ID
   ↓
9. Fetch User from DB
   ↓
10. Process Request
```

### Security Layers

```
┌─────────────────────────────────────────┐
│         Security Layers                  │
├─────────────────────────────────────────┤
│                                          │
│  1. HTTPS (Production)                  │
│     └─ Encrypted transport              │
│                                          │
│  2. CORS                                │
│     └─ Allowed origins only             │
│                                          │
│  3. JWT Authentication                  │
│     └─ Signed tokens                    │
│                                          │
│  4. Password Hashing                    │
│     └─ bcrypt with salt                 │
│                                          │
│  5. Input Validation                    │
│     └─ Pydantic schemas                 │
│                                          │
│  6. SQL Injection Prevention            │
│     └─ SQLAlchemy ORM                   │
│                                          │
│  7. Rate Limiting (Future)              │
│     └─ Redis-based throttling           │
│                                          │
└─────────────────────────────────────────┘
```

## ⚡ Performance Optimizations

### Caching Strategy

```
┌─────────────────────────────────────────────────────────┐
│                   Caching Layers                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Layer 1: Redis Cache                                   │
│  ├─ Short URL → Original URL mapping                    │
│  ├─ TTL: 24 hours                                       │
│  └─ Hit Rate: ~95%                                      │
│                                                          │
│  Layer 2: Database Connection Pool                      │
│  ├─ Reuse connections                                   │
│  └─ Async operations                                    │
│                                                          │
│  Layer 3: Frontend State Management                     │
│  ├─ React state caching                                 │
│  └─ Avoid unnecessary re-renders                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Async Processing

```
┌─────────────────────────────────────────────────────────┐
│              Async Request Handling                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Main Thread                  Background Tasks          │
│  ───────────                  ─────────────────         │
│                                                          │
│  1. Receive Request                                     │
│  2. Validate Input                                      │
│  3. Check Cache                                         │
│  4. Return Response ────────→ 5. Track Analytics        │
│                                6. Update Stats          │
│                                7. Log Event             │
│                                                          │
│  Fast Response (< 50ms)       Async Processing          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Diagram

### Complete User Journey

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Visit Landing Page
       ▼
┌─────────────┐
│  React App  │
└──────┬──────┘
       │
       │ 2. Click "Get Started"
       ▼
┌─────────────┐
│  Auth Page  │
└──────┬──────┘
       │
       │ 3. Register/Login
       ▼
┌─────────────┐
│   FastAPI   │◄──────┐
└──────┬──────┘       │
       │              │
       │ 4. Return JWT Token
       ▼              │
┌─────────────┐       │
│  Dashboard  │       │
└──────┬──────┘       │
       │              │
       │ 5. Create Link
       ├──────────────┘
       │
       │ 6. Display Short URL
       ▼
┌─────────────┐
│  Share Link │
└──────┬──────┘
       │
       │ 7. User Clicks Link
       ▼
┌─────────────┐
│  Redirect   │◄──────┐
└──────┬──────┘       │
       │              │
       │ 8. Track Click
       ├──────────────┘
       │
       │ 9. View Analytics
       ▼
┌─────────────┐
│  Analytics  │
│  Dashboard  │
└─────────────┘
```

## 🌐 Deployment Architecture

### Production Setup (Recommended)

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                         │
│                    (Nginx/Cloudflare)                    │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌───────────────┐
│  Frontend     │         │   Backend     │
│  (Vercel/     │         │   (Docker/    │
│   Netlify)    │         │    AWS/GCP)   │
└───────────────┘         └───────┬───────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
            ┌──────────┐  ┌──────────┐  ┌──────────┐
            │PostgreSQL│  │ MongoDB  │  │  Redis   │
            │  (RDS)   │  │ (Atlas)  │  │(ElastiC) │
            └──────────┘  └──────────┘  └──────────┘
```

## 📈 Scalability Considerations

### Horizontal Scaling

```
┌─────────────────────────────────────────────────────────┐
│                  Current Architecture                    │
│                  (Single Instance)                       │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Scale Up
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Future Architecture                         │
│              (Multiple Instances)                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Backend  │  │ Backend  │  │ Backend  │             │
│  │Instance 1│  │Instance 2│  │Instance 3│             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
│       │             │             │                     │
│       └─────────────┴─────────────┘                     │
│                     │                                    │
│                     ▼                                    │
│         ┌───────────────────────┐                       │
│         │   Shared Resources    │                       │
│         │  - PostgreSQL         │                       │
│         │  - MongoDB            │                       │
│         │  - Redis              │                       │
│         └───────────────────────┘                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🔍 Monitoring & Logging

### Observability Stack (Future)

```
┌─────────────────────────────────────────────────────────┐
│                   Application                            │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   ┌────────┐  ┌────────┐  ┌────────┐
   │  Logs  │  │Metrics │  │Traces  │
   │(Loki)  │  │(Prom.) │  │(Jaeger)│
   └────┬───┘  └────┬───┘  └────┬───┘
        │           │           │
        └───────────┴───────────┘
                    │
                    ▼
            ┌───────────────┐
            │   Grafana     │
            │  (Dashboard)  │
            └───────────────┘
```

## 🎯 Technology Decisions

### Why FastAPI?
- ✅ Async support (high performance)
- ✅ Automatic API documentation
- ✅ Type hints & validation
- ✅ Modern Python features

### Why PostgreSQL?
- ✅ ACID compliance
- ✅ Relational data (users, links)
- ✅ Strong consistency
- ✅ Mature ecosystem

### Why MongoDB?
- ✅ Flexible schema for analytics
- ✅ Time-series data
- ✅ Aggregation pipelines
- ✅ Horizontal scaling

### Why Redis?
- ✅ In-memory speed
- ✅ Simple key-value store
- ✅ TTL support
- ✅ Pub/sub capabilities

### Why React?
- ✅ Component-based
- ✅ Large ecosystem
- ✅ Virtual DOM performance
- ✅ Developer experience

---

## 📚 Additional Resources

- [API Documentation](API_DOCUMENTATION.md)
- [Setup Guide](SETUP.md)
- [Quick Start](QUICKSTART.md)
- [Project Summary](PROJECT_SUMMARY.md)

---

Built with ❤️ for scalability and performance
