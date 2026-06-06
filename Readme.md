# DevLinks - Link Intelligence Platform 🔗

**A professional URL shortener with WhatsApp-first analytics built for modern developers**

By Dvinix ❤️

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat&logo=redis)](https://redis.io/)

🌐 **Live Demo**: [https://devlinks-delta-fawn.vercel.app](https://devlinks-delta-fawn.vercel.app)  
🔧 **API**: [https://devlinks-backend-y2in.onrender.com](https://devlinks-backend-y2in.onrender.com)  
📚 **Documentation**: [Full Index](DOCUMENTATION_INDEX.md) | [Start Here](START_HERE.md) | [Quick Deploy](DEPLOYMENT_ONE_PAGER.md)

---

## 🚀 Quick Deployment

> **New to deployment?** → Start with **[START_HERE.md](START_HERE.md)** 👈

### Choose Your Path:

| Path | Time | Use When | Guide |
|------|------|----------|-------|
| 🔥 **Quick Fix** | 5 min | "Just make it work!" | [QUICK_FIX.md](QUICK_FIX.md) |
| ✅ **Complete Setup** | 20 min | Proper production deployment | [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) |
| 🧪 **Automated Test** | 2 min | Verify everything works | Run `python test_deployment.py` |
| 📚 **Learn First** | 10 min | Understand the architecture | [DEPLOYMENT_ARCHITECTURE.md](DEPLOYMENT_ARCHITECTURE.md) |

### All Documentation:

- 📍 **[START_HERE.md](START_HERE.md)** - Main entry point (read this first!)
- 🔧 **[QUICK_FIX.md](QUICK_FIX.md)** - Fast CORS fix
- ✅ **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Complete guide
- 📊 **[DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md)** - Current status
- 🏗️ **[DEPLOYMENT_ARCHITECTURE.md](DEPLOYMENT_ARCHITECTURE.md)** - System design
- 🎯 **[COMMANDS_CHEATSHEET.md](COMMANDS_CHEATSHEET.md)** - Command reference
- 🔑 **[RENDER_ENV_CHECKLIST.md](RENDER_ENV_CHECKLIST.md)** - Backend env vars
- 🎨 **[VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md)** - Frontend env vars

---

## ✨ Features

### 🔗 Smart Link Management
- ✅ Instant URL shortening with custom slugs
- ✅ User-specific routing (`/Bq56doFJUNU/`)
- ✅ Expiring links with countdown timers
- ✅ QR code generation with analytics
- ✅ Real-time search and filtering

### 📊 Advanced Analytics
- ✅ **WhatsApp traffic detection** - Know exactly how many clicks came from WhatsApp
- ✅ Engagement over time charts
- ✅ Geographic insights (Country, City)
- ✅ Device breakdown (Mobile, Desktop, Tablet)
- ✅ Top referrers analysis
- ✅ Click tracking with unique visitors

### 🎨 Modern UI/UX
- ✅ Clean, minimalist design
- ✅ Dark mode optimized
- ✅ Fully responsive (Mobile + Desktop)
- ✅ Smooth animations
- ✅ Intuitive navigation

### 🔐 Security & Performance
- ✅ Firebase Authentication + JWT
- ✅ Redis caching for fast redirects
- ✅ Async database operations
- ✅ Protected API routes
- ✅ SQL injection prevention

---

## 🏗️ Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework
- **PostgreSQL** - User and link data (Supabase)
- **MongoDB** - Analytics storage (MongoDB Atlas)
- **Redis** - Caching layer (Upstash)
- **SQLAlchemy** - Async ORM
- **Alembic** - Database migrations

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **Recharts** - Data visualization

### DevOps
- **Render** - Backend hosting
- **Vercel** - Frontend hosting
- **Docker** - Local development

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [QUICK_FIX.md](QUICK_FIX.md) | Fast CORS fix for production |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Step-by-step deployment guide |
| [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md) | Current deployment status |
| [RENDER_ENV_CHECKLIST.md](RENDER_ENV_CHECKLIST.md) | Backend environment variables |
| [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md) | Frontend environment variables |
| [test_deployment.py](test_deployment.py) | Automated deployment tests |

---

## 🚀 Local Development

### Prerequisites
- Docker Desktop (running)
- Python 3.10+
- Node.js 18+

### Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd devlinks

# Start all services with Docker
docker-compose up -d

# Install backend dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload

# In another terminal, start frontend
cd frontend
npm install
npm run dev
```

**Access**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🧪 Testing Deployment

After deploying, run the automated test suite:

```bash
python test_deployment.py
```

This tests:
- ✅ Backend health
- ✅ CORS configuration
- ✅ User registration/login
- ✅ Link creation
- ✅ Redirects
- ✅ Analytics tracking

---

## 📊 Project Structure

```
devlinks/
├── app/                    # Backend application
│   ├── core/              # Config & security
│   ├── db/                # Database connections
│   ├── models/            # SQLAlchemy models
│   ├── schemas/           # Pydantic schemas
│   ├── router/            # API endpoints
│   ├── services/          # Business logic
│   └── main.py            # FastAPI app
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities
│   │   └── config/       # Configuration
│   └── package.json
├── alembic/              # Database migrations
├── docker-compose.yml    # Docker services
└── requirements.txt      # Python dependencies
```

---

## 🎯 Key Features Showcase

### Username-Based Routing
Every user gets a unique 11-character username like `/Bq56doFJUNU/` for personalized link management.

### WhatsApp Analytics
First-class support for tracking WhatsApp traffic - essential for the Indian market where WhatsApp dominates.

### Link Details Analytics
Deep dive into each link with:
- Engagement over time charts
- Geographic distribution
- Device breakdown
- Top referrers

### QR Code Management
Dedicated QR codes page with:
- Grid view of all QR codes
- Download functionality
- Per-code analytics
- Search and filtering

---

## 🌐 API Endpoints

### Authentication
```
POST /auth/register        # Register new user
POST /auth/login           # Login user
POST /auth/firebase        # Firebase auth
POST /auth/refresh         # Refresh token
```

### Links
```
POST   /links/             # Create short link
GET    /links/             # Get user's links
GET    /links/{slug}       # Get link details
DELETE /links/{slug}       # Delete link
GET    /links/{slug}/qr    # Get QR code
```

### Analytics
```
GET /analytics/{slug}              # Get link analytics
GET /analytics/{slug}/details      # Detailed analytics
GET /analytics/summary             # User summary
```

### Redirect
```
GET /{slug}                # Redirect to original URL
```

---

## 🔧 Environment Configuration

### Backend (Render)
```env
POSTGRES_URL=postgresql+asyncpg://...
MONGO_URL=mongodb+srv://...
REDIS_URL=redis://...
SECRET_KEY=your-secret-key
CORS_ORIGINS=https://devlinks-delta-fawn.vercel.app
BASE_URL=https://devlinks-backend-y2in.onrender.com
```

### Frontend (Vercel)
```env
VITE_API_BASE_URL=https://devlinks-backend-y2in.onrender.com
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

See detailed setup in:
- [RENDER_ENV_CHECKLIST.md](RENDER_ENV_CHECKLIST.md)
- [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md)

---

## 🐛 Troubleshooting

### CORS Error
**Error**: `Access-Control-Allow-Origin header is not present`

**Fix**: Update `CORS_ORIGINS` on Render to match your Vercel URL exactly.

See: [QUICK_FIX.md](QUICK_FIX.md)

### Database Connection Failed
**Error**: `gaierror: [Errno -2] Name or service not known`

**Fix**: Verify database URLs in environment variables.

### Firebase Auth Not Working
**Error**: `auth/configuration-not-found`

**Fix**: Check Firebase environment variables on both Render and Vercel.

See: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

---

## 📈 Roadmap

### Completed ✅
- [x] User authentication with Firebase
- [x] Username-based routing
- [x] Link shortening with custom slugs
- [x] QR code generation
- [x] WhatsApp traffic detection
- [x] Advanced analytics dashboard
- [x] Link details page
- [x] QR codes management page
- [x] Modern login/register UI
- [x] Production deployment

### In Progress 🚧
- [ ] Custom domains
- [ ] Link-in-bio pages
- [ ] Bulk link operations
- [ ] Export analytics data

### Planned 🎯
- [ ] Team collaboration
- [ ] Webhook notifications
- [ ] A/B testing
- [ ] Mobile app (iOS & Android)
- [ ] Browser extension
- [ ] API rate limiting

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- UI inspired by modern design trends
- Icons by [Lucide](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)

---

## 📞 Contact

**Developer**: Dvinix  
**Portfolio**: Coming soon  
**GitHub**: [Your GitHub](https://github.com/yourusername)

---

<div align="center">

**Built with ❤️ for the modern web**

⭐ Star this repo if you find it useful!

</div>
