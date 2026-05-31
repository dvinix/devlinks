# DevLinks - Smart Link Management Platform 🔗

<div align="center">

**A modern link shortener with real-time analytics and WhatsApp insights**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat&logo=redis)](https://redis.io/)

[Features](#-features) • [Quick Start](#-quick-start) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture)

</div>

---

## 🌟 Features

### 🔗 Smart Link Management
- ✅ **Instant URL Shortening** - Create short links in seconds
- ✅ **Custom Slugs** - Branded, memorable short URLs
- ✅ **Username-Based Routes** - Each user gets personalized URLs (`/username/links`)
- ✅ **Search & Filter** - Find links instantly with real-time search
- ✅ **QR Code Generation** - Download QR codes for every link
- ✅ **Link Expiration** - Set expiry dates for temporary links
- ✅ **Bulk Management** - Handle multiple links efficiently

### 📊 Real-Time Analytics Dashboard
- ✅ **Live Click Tracking** - Monitor clicks as they happen
- ✅ **WhatsApp Detection** - Know exactly how much traffic comes from WhatsApp (India-focused feature)
- ✅ **Geographic Insights** - Country and city-level data
- ✅ **Device Analytics** - Mobile, Desktop, Tablet breakdown
- ✅ **Browser Statistics** - Track user agents
- ✅ **Referrer Tracking** - See where clicks originate
- ✅ **Time-Series Charts** - Visualize engagement over time (7d, 30d, 90d, 1y)
- ✅ **Per-Link Details** - Dedicated analytics page for each link

### 🎨 Modern UI/UX
- ✅ **Clean Minimal Design** - White background, single blue accent (#2563eb)
- ✅ **Responsive Layout** - Perfect on mobile and desktop
- ✅ **Smooth Animations** - Powered by Framer Motion
- ✅ **Dark Mode Ready** - Easy on the eyes
- ✅ **Glassmorphism Effects** - Modern card designs

### 🔐 Security & Authentication
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Firebase Integration** - Social login support
- ✅ **Password Hashing** - Bcrypt encryption
- ✅ **Protected Routes** - Role-based access control
- ✅ **CORS Configuration** - Secure cross-origin requests

### ⚡ Performance
- ✅ **Redis Caching** - Lightning-fast redirects
- ✅ **Async Operations** - Non-blocking database queries
- ✅ **Connection Pooling** - Optimized database connections
- ✅ **CDN Ready** - Easy deployment to edge networks

---

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** (running)
- **Python 3.10+**
- **Node.js 18+**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/devlinks.git
cd devlinks
```

2. **Start Docker services**
```bash
docker-compose up -d
```

3. **Install backend dependencies**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. **Run database migrations**
```bash
alembic upgrade head
```

5. **Start the backend**
```bash
uvicorn app.main:app --reload --port 8000
```

6. **Install frontend dependencies**
```bash
cd frontend
npm install
```

7. **Start the frontend**
```bash
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5433
- **MongoDB**: localhost:27018
- **Redis**: localhost:6379

### Quick Test

1. Visit http://localhost:5173
2. Click "Get Started" or "Sign Up"
3. Create an account
4. Create your first short link
5. View real-time analytics!

---

## 🏗️ Tech Stack

### Backend
- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern async web framework
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database (users, links)
- **[MongoDB](https://www.mongodb.com/)** - Analytics and time-series data
- **[Redis](https://redis.io/)** - Caching and session management
- **[SQLAlchemy](https://www.sqlalchemy.org/)** - Async ORM with asyncpg
- **[Alembic](https://alembic.sqlalchemy.org/)** - Database migrations
- **[Pydantic](https://docs.pydantic.dev/)** - Data validation
- **[JWT](https://jwt.io/)** - Secure authentication
- **[Firebase Admin](https://firebase.google.com/docs/admin/setup)** - Social authentication

### Frontend
- **[React 18](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Vite](https://vitejs.dev/)** - Fast build tool
- **[React Router](https://reactrouter.com/)** - Client-side routing
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animations
- **[Zustand](https://github.com/pmndrs/zustand)** - State management
- **[Axios](https://axios-http.com/)** - HTTP client
- **[Lucide React](https://lucide.dev/)** - Beautiful icons
- **[QRCode](https://www.npmjs.com/package/qrcode)** - QR code generation

### DevOps & Infrastructure
- **[Docker](https://www.docker.com/)** - Containerization
- **[Docker Compose](https://docs.docker.com/compose/)** - Multi-container orchestration
- **[Nginx](https://www.nginx.com/)** (optional) - Reverse proxy

---

## � Project Structure

```
devlinks/
├── app/                          # Backend FastAPI application
│   ├── core/                    # Core functionality
│   │   ├── config.py           # Configuration settings
│   │   ├── security.py         # JWT & password hashing
│   │   ├── dependencies.py     # Dependency injection
│   │   └── firebase_auth.py    # Firebase integration
│   ├── db/                     # Database connections
│   │   ├── postgres.py         # PostgreSQL async setup
│   │   ├── mongo.py            # MongoDB connection
│   │   └── redis.py            # Redis connection
│   ├── models/                 # SQLAlchemy models
│   │   ├── users.py            # User model
│   │   └── link.py             # Link model
│   ├── schemas/                # Pydantic schemas
│   │   ├── user.py             # User schemas
│   │   └── link.py             # Link schemas
│   ├── router/                 # API endpoints
│   │   ├── auth.py             # Authentication routes
│   │   ├── links.py            # Link CRUD operations
│   │   ├── analytics.py        # Analytics endpoints
│   │   ├── qr.py               # QR code generation
│   │   └── redirect.py         # URL redirection
│   ├── services/               # Business logic
│   │   ├── link_service.py     # Link management
│   │   └── analytics_service.py # Analytics processing
│   └── main.py                 # FastAPI application entry
│
├── frontend/                    # React TypeScript application
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── ui/            # UI primitives (Button, Input, etc)
│   │   │   ├── Navbar.jsx     # Navigation bar
│   │   │   ├── Footer.jsx     # Footer component
│   │   │   ├── CreateLinkModal.jsx
│   │   │   ├── QRModal.jsx
│   │   │   └── LinkAnalytics.jsx
│   │   ├── pages/             # Page components
│   │   │   ├── Landing.tsx    # Landing page
│   │   │   ├── Login.tsx      # Login page
│   │   │   ├── Register.tsx   # Registration page
│   │   │   ├── Home.jsx       # User home dashboard
│   │   │   ├── Dashboard.jsx  # Links management
│   │   │   ├── LinkDetails.jsx # Detailed analytics
│   │   │   ├── QRCodesPage.jsx # QR codes page
│   │   │   └── AnalyticsDashboard.jsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useAuth.ts     # Authentication hook
│   │   │   ├── useLinks.ts    # Links management hook
│   │   │   └── useAnalytics.ts # Analytics hook
│   │   ├── store/             # State management
│   │   │   └── authStore.ts   # Zustand auth store
│   │   ├── lib/               # Utilities
│   │   │   ├── api.ts         # Axios configuration
│   │   │   ├── firebase.ts    # Firebase setup
│   │   │   └── utils.ts       # Helper functions
│   │   ├── types/             # TypeScript types
│   │   │   └── index.ts       # Shared types
│   │   ├── App.tsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── package.json           # Frontend dependencies
│   └── vite.config.js         # Vite configuration
│
├── alembic/                    # Database migrations
│   ├── versions/              # Migration files
│   └── env.py                 # Alembic environment
│
├── docker-compose.yml         # Docker services configuration
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

---

## 🎯 Architecture

### Data Flow

```
┌─────────────┐     HTTPS      ┌─────────────┐
│   Browser   │ ◄─────────────► │   React     │
│  (Client)   │                 │  Frontend   │
└─────────────┘                 └──────┬──────┘
                                       │
                                  REST API
                                       │
                              ┌────────▼────────┐
                              │    FastAPI      │
                              │    Backend      │
                              └────────┬────────┘
                                       │
                ┌──────────────────────┼──────────────────────┐
                │                      │                      │
         ┌──────▼──────┐      ┌───────▼───────┐    ┌────────▼────────┐
         │ PostgreSQL  │      │   MongoDB     │    │     Redis       │
         │  (Users,    │      │  (Analytics)  │    │   (Caching)     │
         │   Links)    │      │               │    │                 │
         └─────────────┘      └───────────────┘    └─────────────────┘
```

### Key Design Decisions

1. **PostgreSQL for Links** - ACID compliance for critical data
2. **MongoDB for Analytics** - Fast writes, flexible schema for time-series data
3. **Redis for Caching** - Sub-millisecond redirects
4. **JWT Authentication** - Stateless, scalable auth
5. **Async Everything** - Non-blocking I/O for high performance

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# PostgreSQL Configuration (Docker)
POSTGRES_URL=postgresql+asyncpg://postgres:postgres@localhost:5433/devlinks

# MongoDB Configuration (Docker)
MONGO_URL=mongodb://localhost:27018/devlinks
MONGO_DB_NAME=devlinks

# Redis Configuration (Docker)
REDIS_URL=redis://localhost:6379/0

# JWT Security (Change these!)
SECRET_KEY=your-super-secret-key-change-this-to-something-long-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Application Configuration
APP_HOST=127.0.0.1
APP_PORT=8000
BASE_URL=http://localhost:8000

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173

# Firebase Admin SDK (Optional - for social login)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
```

### Database Setup

The application uses three databases:

1. **PostgreSQL** - Users and links (port 5433)
2. **MongoDB** - Analytics data (port 27018)
3. **Redis** - Caching (port 6379)

All are configured in `docker-compose.yml` and start automatically.

---

## 📊 API Documentation

### Authentication Endpoints

#### Register
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response: {
  "id": "uuid",
  "username": "Bq56doFJUNU",
  "email": "user@example.com",
  "plan": "free",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response: {
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

### Link Endpoints

#### Create Short Link
```bash
POST /links/
Authorization: Bearer {token}
Content-Type: application/json

{
  "original_url": "https://example.com/very-long-url",
  "custom_slug": "mylink"  // optional
}

Response: {
  "id": "uuid",
  "original_url": "https://example.com/very-long-url",
  "slug": "abc123",
  "short_url": "http://localhost:8000/abc123",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Get All Links
```bash
GET /links/
Authorization: Bearer {token}

Response: [
  {
    "id": "uuid",
    "original_url": "https://example.com",
    "slug": "abc123",
    "short_url": "http://localhost:8000/abc123",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Get Link Analytics
```bash
GET /analytics/{slug}?days=30
Authorization: Bearer {token}

Response: {
  "slug": "abc123",
  "total_clicks": 1250,
  "period_days": 30,
  "daily_clicks": [...],
  "devices": [...],
  "browsers": [...],
  "sources": [...],
  "top_locations": [...]
}
```

#### Get QR Code
```bash
GET /links/{slug}/qr
Authorization: Bearer {token}

Response: PNG image (binary)
```

### Interactive API Docs

Visit http://localhost:8000/docs for Swagger UI with interactive API testing.

---

## 🎯 Key Features Explained

### Username-Based Routes
Every user gets a unique 11-character username (e.g., `Bq56doFJUNU`) automatically generated on registration. All dashboard routes are personalized:
- `/Bq56doFJUNU/home` - Quick link creation
- `/Bq56doFJUNU/links` - Manage all links with search
- `/Bq56doFJUNU/qrcodes` - View and download QR codes
- `/Bq56doFJUNU/analytics` - Aggregate analytics dashboard
- `/Bq56doFJUNU/links/{slug}/details` - Detailed per-link analytics

### Real-Time Analytics
- **Live Click Tracking** - MongoDB stores every click event
- **WhatsApp Detection** - Identifies traffic from WhatsApp (crucial for Indian market)
- **Geographic Data** - Country and city-level insights
- **Device & Browser** - Understand your audience's tech stack
- **Time-Series Charts** - Visualize trends over 7d/30d/90d/1y
- **Referrer Tracking** - Know where your traffic comes from

### QR Code System
- **Auto-Generation** - Every link gets a QR code
- **High Resolution** - PNG format, print-ready
- **Analytics Integration** - Track QR code scans separately
- **Bulk Download** - Download multiple QR codes at once

### Search & Filter
- **Real-Time Search** - Instant filtering as you type
- **Multi-Field Search** - Search by slug, original URL, or short URL
- **Result Count** - Shows how many links match your query
- **Clear Button** - Quick reset to see all links

---

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run all services
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Production Checklist

- [ ] Change `SECRET_KEY` in `.env`
- [ ] Update `BASE_URL` to your domain
- [ ] Configure CORS for your domain
- [ ] Set up SSL/TLS certificates
- [ ] Configure Firebase for social login
- [ ] Set up database backups
- [ ] Configure monitoring (Sentry, etc.)
- [ ] Set up CDN for frontend assets
- [ ] Configure rate limiting
- [ ] Set up logging and error tracking

---

## 🛠️ Development

### Running Tests

```bash
# Backend tests
pytest

# Frontend tests
cd frontend
npm test
```

### Code Quality

```bash
# Backend linting
black app/
flake8 app/

# Frontend linting
cd frontend
npm run lint
```

### Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## 🗺️ Roadmap

### ✅ Completed
- [x] User authentication (JWT + Firebase)
- [x] Link shortening with custom slugs
- [x] Real-time analytics dashboard
- [x] WhatsApp traffic detection
- [x] QR code generation and download
- [x] Search and filter functionality
- [x] Per-link detailed analytics
- [x] Username-based personalized routes
- [x] Responsive UI with modern design
- [x] Redis caching for fast redirects

### 🚧 In Progress
- [ ] Link expiration with automatic cleanup
- [ ] Bulk link operations
- [ ] CSV export for analytics
- [ ] Custom domains support

### 📅 Planned
- [ ] Link-in-bio pages
- [ ] Team collaboration features
- [ ] Webhook notifications
- [ ] API rate limiting
- [ ] Browser extension (Chrome, Firefox)
- [ ] Mobile app (iOS & Android)
- [ ] A/B testing for links
- [ ] UTM parameter builder
- [ ] Password-protected links
- [ ] Link scheduling (future publish)
- [ ] White-label solution
- [ ] Advanced spam protection
- [ ] Click fraud detection
- [ ] Email notifications
- [ ] Slack/Discord integrations

---

## 🤝 Contributing

Contributions are welcome! This project is perfect for adding to your portfolio.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit with clear messages**
   ```bash
   git commit -m 'Add: amazing new feature'
   ```
5. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Contribution Ideas

- Add new analytics visualizations
- Improve UI/UX
- Add more authentication providers
- Implement rate limiting
- Add webhook support
- Write tests
- Improve documentation
- Fix bugs

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- UI inspired by [Linear](https://linear.app/) and [Vercel](https://vercel.com/)
- Icons by [Lucide](https://lucide.dev/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- Database tools: PostgreSQL, MongoDB, Redis

---

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/devlinks/issues)
- **Discussions**: [Ask questions and share ideas](https://github.com/yourusername/devlinks/discussions)
- **Email**: support@devlinks.com

---

## ⭐ Show Your Support

If you find this project useful for learning or your portfolio, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 🔀 Contributing code

---

<div align="center">

**Built with ❤️ for modern web development**

Made by developers, for developers

[⬆ Back to Top](#devlinks---smart-link-management-platform-)

</div>
