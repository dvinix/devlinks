# DevLinks - Quick Start Guide

Get DevLinks up and running in 5 minutes! 🚀

## Prerequisites

Make sure you have these installed:
- ✅ Docker Desktop (running)
- ✅ Python 3.10+
- ✅ Node.js 18+

## 🚀 Option 1: Automated Start (Recommended)

### On Linux/Mac:

```bash
chmod +x start.sh
./start.sh
```

### On Windows:

```bash
start.bat
```

That's it! The script will:
1. Start Docker services (PostgreSQL, MongoDB, Redis)
2. Create Python virtual environment
3. Install dependencies
4. Run database migrations
5. Start backend server
6. Start frontend development server

## 🔧 Option 2: Manual Start

### Step 1: Start Docker Services

```bash
docker-compose up -d
```

### Step 2: Setup Backend

```bash
# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 3: Setup Frontend (New Terminal)

```bash
cd frontend
npm install
npm run dev
```

## 🌐 Access the Application

Once everything is running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🎯 First Steps

### 1. Create an Account

1. Go to http://localhost:3000
2. Click "Get Started Free"
3. Register with your email and password
4. You'll be redirected to the dashboard

### 2. Create Your First Short Link

1. Click "Create New Link" button
2. Paste a long URL
3. Click "Create Link"
4. Copy and share your short link!

### 3. View Analytics

1. Click the chart icon on any link
2. See detailed analytics:
   - Total clicks
   - WhatsApp traffic
   - Device breakdown
   - Geographic data
   - And more!

## 🧪 Test with Sample Data

### Using the API Directly

```bash
# Register a user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@devlinks.com", "password": "demo123"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@devlinks.com", "password": "demo123"}'

# Copy the access_token from the response and use it below
TOKEN="your_access_token_here"

# Create a short link
curl -X POST http://localhost:8000/links/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"original_url": "https://github.com/yourusername/devlinks"}'
```

## 📊 Features to Try

### ✨ Landing Page
- Beautiful gradient design
- Animated hero section
- Feature showcase
- Pricing plans

### 🔐 Authentication
- Secure JWT-based auth
- Login/Register flow
- Protected routes

### 📈 Dashboard
- Create unlimited links (free plan: 10 links)
- Copy short URLs
- Delete links
- View quick stats

### 📊 Analytics
- Real-time click tracking
- WhatsApp traffic detection
- Device & browser breakdown
- Geographic insights
- Time-series charts

## 🛠️ Troubleshooting

### Docker Services Not Starting

```bash
# Check Docker status
docker-compose ps

# View logs
docker-compose logs

# Restart services
docker-compose restart
```

### Backend Won't Start

```bash
# Check if port 8000 is in use
# On Windows:
netstat -ano | findstr :8000
# On Linux/Mac:
lsof -i :8000

# Make sure .env file exists
cp .env.example .env

# Check database connection
docker-compose logs postgres
```

### Frontend Won't Start

```bash
# Clear node modules
cd frontend
rm -rf node_modules package-lock.json
npm install

# Check if port 3000 is in use
# On Windows:
netstat -ano | findstr :3000
# On Linux/Mac:
lsof -i :3000
```

### Database Migration Issues

```bash
# Reset database (WARNING: Deletes all data)
alembic downgrade base
alembic upgrade head
```

## 🔒 Security Note

**IMPORTANT**: Before deploying to production:

1. Change `SECRET_KEY` in `.env` to a strong random value:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. Update `BASE_URL` to your production domain

3. Configure `CORS_ORIGINS` for your frontend domain

4. Use HTTPS in production

5. Set strong database passwords

## 📚 Next Steps

- Read [SETUP.md](SETUP.md) for detailed setup instructions
- Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API reference
- Review [frontend/README.md](frontend/README.md) for frontend details

## 🆘 Need Help?

1. Check the logs:
   ```bash
   # Backend logs
   docker-compose logs -f

   # Frontend logs (in the terminal where npm run dev is running)
   ```

2. Verify all services are running:
   ```bash
   docker-compose ps
   ```

3. Check the API health:
   ```bash
   curl http://localhost:8000/health
   ```

4. Visit the interactive API docs:
   http://localhost:8000/docs

## 🎉 You're All Set!

DevLinks is now running on your machine. Start creating short links and tracking analytics!

### Quick Links:
- 🌐 Frontend: http://localhost:3000
- 🔌 API: http://localhost:8000
- 📖 Docs: http://localhost:8000/docs

---

Happy link shortening! 🔗✨
