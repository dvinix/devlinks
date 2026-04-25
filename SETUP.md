# DevLinks - Complete Setup Guide

A professional link intelligence platform built for India with WhatsApp-first analytics.

## 🏗️ Architecture

- **Backend**: FastAPI + PostgreSQL + MongoDB + Redis
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **Authentication**: JWT tokens
- **Analytics**: Real-time tracking with MongoDB aggregation

## 📋 Prerequisites

- Python 3.10+
- Node.js 18+
- Docker & Docker Compose
- Git

## 🚀 Quick Start

### 1. Clone & Setup Environment

```bash
# Clone the repository
git clone <your-repo-url>
cd devlinks

# Copy environment file
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` file:

```env
# PostgreSQL
POSTGRES_URL=postgresql+asyncpg://devlinks:devlinks123@localhost:5432/devlinks

# MongoDB
MONGO_URL=mongodb://devlinks:devlinks123@localhost:27017
MONGO_DB_NAME=devlinks

# Redis
REDIS_URL=redis://localhost:6379

# JWT Security (CHANGE THIS!)
SECRET_KEY=your-super-secret-key-min-32-characters-long-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Application
APP_HOST=0.0.0.0
APP_PORT=8000
BASE_URL=http://localhost:8000

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8000
```

### 3. Start Services with Docker

```bash
# Start PostgreSQL, MongoDB, and Redis
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 4. Setup Backend

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### 5. Setup Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## 📁 Project Structure

```
devlinks/
├── app/
│   ├── core/              # Configuration & security
│   │   ├── config.py      # Settings management
│   │   ├── security.py    # JWT & password hashing
│   │   └── dependencies.py # Auth dependencies
│   ├── db/                # Database connections
│   │   ├── postgres.py    # PostgreSQL async setup
│   │   ├── mongo.py       # MongoDB connection
│   │   └── redis.py       # Redis connection
│   ├── models/            # SQLAlchemy models
│   │   ├── users.py       # User model
│   │   └── link.py        # Link model
│   ├── schemas/           # Pydantic schemas
│   │   ├── user.py        # User schemas
│   │   └── link.py        # Link schemas
│   ├── router/            # API endpoints
│   │   ├── auth.py        # Authentication routes
│   │   ├── links.py       # Link CRUD operations
│   │   ├── analytics.py   # Analytics endpoints
│   │   └── redirect.py    # URL redirection
│   ├── services/          # Business logic
│   │   ├── link_service.py      # Link operations
│   │   └── analytics_service.py # Analytics tracking
│   └── main.py            # FastAPI application
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Features.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Pricing.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── CreateLinkModal.jsx
│   │   │   └── LinkAnalytics.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Auth.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx        # Main app with routing
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── alembic/               # Database migrations
├── docker-compose.yml     # Docker services
├── requirements.txt       # Python dependencies
└── .env                   # Environment variables
```

## 🔑 API Endpoints

### Authentication

```
POST   /auth/register     - Create new account
POST   /auth/login        - Login and get tokens
GET    /auth/me           - Get current user info
```

### Links

```
POST   /links/            - Create short link
GET    /links/            - Get all user links
DELETE /links/{slug}      - Delete a link
GET    /{slug}            - Redirect to original URL
```

### Analytics

```
GET    /analytics/{slug}?days=30  - Get link analytics
```

## 🎨 Frontend Pages

### 1. Landing Page (`/`)
- Hero section with URL shortener demo
- Features showcase
- Analytics preview
- Pricing plans
- Responsive design with glassmorphism

### 2. Authentication (`/auth`)
- Login/Register toggle
- Email & password validation
- JWT token management
- Error handling

### 3. Dashboard (`/dashboard`)
- Protected route (requires authentication)
- Link management (create, view, delete)
- Quick stats overview
- Copy short URLs
- Navigate to analytics

### 4. Link Analytics (embedded in Dashboard)
- Total clicks tracking
- WhatsApp traffic detection
- Time-series chart
- Device breakdown
- Browser statistics
- Traffic sources
- Geographic data

## 🔐 Security Features

- Password hashing with bcrypt
- JWT access & refresh tokens
- Protected API routes
- CORS configuration
- SQL injection prevention (SQLAlchemy ORM)
- Input validation (Pydantic)

## 📊 Analytics Features

- Real-time click tracking
- WhatsApp traffic detection
- Device & browser tracking
- Geographic location tracking
- Traffic source identification
- Time-series data visualization

## 🎯 Key Features

### Backend
- ✅ Async FastAPI for high performance
- ✅ PostgreSQL for relational data
- ✅ MongoDB for analytics data
- ✅ Redis caching for fast redirects
- ✅ JWT authentication
- ✅ Alembic migrations
- ✅ Background task processing

### Frontend
- ✅ React 18 with hooks
- ✅ React Router for navigation
- ✅ Framer Motion animations
- ✅ Tailwind CSS styling
- ✅ Axios for API calls
- ✅ Protected routes
- ✅ Responsive design
- ✅ Dark theme with gradients

## 🧪 Testing the Application

### 1. Register a New User

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'
```

### 2. Login

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'
```

### 3. Create a Short Link

```bash
curl -X POST http://localhost:8000/links/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"original_url": "https://example.com/very-long-url"}'
```

### 4. Access Short Link

```bash
curl -L http://localhost:8000/abc123
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if services are running
docker-compose ps

# View logs
docker-compose logs postgres
docker-compose logs mongodb
docker-compose logs redis

# Restart services
docker-compose restart
```

### Migration Issues

```bash
# Reset database (WARNING: Deletes all data)
alembic downgrade base
alembic upgrade head
```

### Frontend Build Issues

```bash
# Clear node modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 📦 Production Deployment

### Backend

```bash
# Install production dependencies
pip install gunicorn

# Run with Gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend

```bash
cd frontend
npm run build

# Serve with nginx or any static file server
```

### Environment Variables for Production

- Change `SECRET_KEY` to a strong random value
- Update `BASE_URL` to your production domain
- Configure `CORS_ORIGINS` for your frontend domain
- Use production database URLs
- Enable HTTPS

## 🔄 Database Migrations

### Create a New Migration

```bash
alembic revision --autogenerate -m "Description of changes"
```

### Apply Migrations

```bash
alembic upgrade head
```

### Rollback Migration

```bash
alembic downgrade -1
```

## 📈 Monitoring

- Check API health: `GET /health`
- View API docs: `http://localhost:8000/docs`
- Monitor Redis: `redis-cli monitor`
- Check MongoDB: `mongosh mongodb://localhost:27017`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🆘 Support

For issues or questions:
- Check the API documentation at `/docs`
- Review this setup guide
- Check Docker logs for service issues
- Verify environment variables are set correctly

---

Built with ❤️ for the Indian digital ecosystem
