# DevLinks - Link Intelligence Platform 🔗

<div align="center">

![DevLinks Banner](https://via.placeholder.com/1200x300/000000/7C3AED?text=DevLinks+-+Your+Links.+Smarter.+Built+for+WhatsApp.)

**A professional link shortener with WhatsApp-first analytics built for India**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat&logo=redis)](https://redis.io/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Tech Stack](#-tech-stack) • [Screenshots](#-screenshots)

</div>

---

## 🌟 Features

### 🔗 Link Management
- ✅ Create shortened URLs instantly
- ✅ Custom slugs support
- ✅ Expiring links with countdown
- ✅ Bulk link management
- ✅ QR code generation (coming soon)

### 📊 Advanced Analytics
- ✅ Real-time click tracking
- ✅ **WhatsApp traffic detection** - Know exactly how many clicks came from WhatsApp
- ✅ Device breakdown (Mobile, Desktop, Tablet)
- ✅ Browser statistics
- ✅ Geographic insights (Country, City)
- ✅ Traffic source identification
- ✅ Time-series visualization

### 🎨 Beautiful UI
- ✅ Pure black gradient design (#000000 → #7C3AED → #06B6D4)
- ✅ Glassmorphism cards with backdrop blur
- ✅ Smooth animations with Framer Motion
- ✅ Fully responsive (Mobile + Desktop)
- ✅ Dark theme optimized

### 🔐 Security
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Protected API routes
- ✅ CORS configuration
- ✅ SQL injection prevention

### ⚡ Performance
- ✅ Redis caching for fast redirects
- ✅ Async database operations
- ✅ Background analytics processing
- ✅ Optimized bundle size

---

## 🚀 Quick Start

### ✅ All Issues Fixed!

All dependencies are installed and configured. The application is ready to run!

See [FIXED_ISSUES.md](FIXED_ISSUES.md) for details on resolved setup issues.

### Prerequisites

- Docker Desktop (running)
- Python 3.10+
- Node.js 18+

### One-Command Start

**Linux/Mac:**
```bash
chmod +x start.sh && ./start.sh
```

**Windows:**
```bash
start.bat
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### First Steps

1. Register an account at http://localhost:3000
2. Click "Create New Link"
3. Paste your long URL
4. Share your short link!
5. View analytics by clicking the chart icon

---

## 📚 Documentation

- **[Quick Start Guide](QUICKSTART.md)** - Get up and running in 5 minutes
- **[Setup Guide](SETUP.md)** - Detailed installation and configuration
- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference
- **[Frontend README](frontend/README.md)** - Frontend architecture and customization

---

## 🏗️ Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework
- **PostgreSQL** - Relational database for users and links
- **MongoDB** - NoSQL database for analytics
- **Redis** - Caching layer for fast redirects
- **SQLAlchemy** - Async ORM
- **Alembic** - Database migrations
- **JWT** - Secure authentication

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

---

## 📸 Screenshots

### Landing Page
![Landing Page](https://via.placeholder.com/1200x600/000000/7C3AED?text=Landing+Page)

### Dashboard
![Dashboard](https://via.placeholder.com/1200x600/0A0A0A/06B6D4?text=Dashboard)

### Analytics
![Analytics](https://via.placeholder.com/1200x600/111111/7C3AED?text=Analytics+Dashboard)

---

## 📁 Project Structure

```
devlinks/
├── app/                    # Backend application
│   ├── core/              # Configuration & security
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
│   │   ├── App.jsx       # Main app
│   │   └── index.css     # Global styles
│   └── package.json
├── alembic/              # Database migrations
├── docker-compose.yml    # Docker services
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables
└── README.md            # This file
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# PostgreSQL
POSTGRES_URL=postgresql+asyncpg://devlinks:devlinks123@localhost:5432/devlinks

# MongoDB
MONGO_URL=mongodb://devlinks:devlinks123@localhost:27017
MONGO_DB_NAME=devlinks

# Redis
REDIS_URL=redis://localhost:6379

# JWT Security
SECRET_KEY=your-super-secret-key-min-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Application
APP_HOST=0.0.0.0
APP_PORT=8000
BASE_URL=http://localhost:8000

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 🧪 API Examples

### Register & Login

```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Create Short Link

```bash
curl -X POST http://localhost:8000/links/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"original_url": "https://example.com/very-long-url"}'
```

### Get Analytics

```bash
curl -X GET http://localhost:8000/analytics/abc123?days=7 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 Use Cases

### For Creators
- Share content on Instagram, WhatsApp, YouTube
- Track which platform drives the most traffic
- Understand your audience demographics

### For Businesses
- Marketing campaign tracking
- QR codes for offline marketing
- Customer behavior analysis
- A/B testing different channels

### For Developers
- API integration for custom applications
- Webhook support (coming soon)
- White-label solution (coming soon)

---

## 🗺️ Roadmap

- [ ] QR code generation with analytics
- [ ] Link-in-bio pages
- [ ] Custom domains
- [ ] Webhook notifications
- [ ] Team collaboration
- [ ] API rate limiting
- [ ] Advanced filtering & search
- [ ] Export analytics data
- [ ] Mobile app (iOS & Android)
- [ ] Browser extension

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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- UI inspired by modern design trends
- Icons by [Lucide](https://lucide.dev/)
- Animations by [Framer Motion](https://www.framer.com/motion/)

---

## 📞 Support

- 📧 Email: support@devlinks.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/devlinks/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/devlinks/discussions)

---

## ⭐ Star History

If you find this project useful, please consider giving it a star! ⭐

---

<div align="center">

**Built with ❤️ for the Indian digital ecosystem**

[Website](https://devlinks.com) • [Documentation](SETUP.md) • [API Docs](http://localhost:8000/docs)

</div>
