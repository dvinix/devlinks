# DevLinks - Render Deployment Guide

## 🚨 Current Issues & Solutions

### Issue 1: CORS Error ✅ FIXED IN CODE
**Error:** `No 'Access-Control-Allow-Origin' header is present on the requested resource`

**Solution:** Updated CORS middleware to include `expose_headers` and added logging.

### Issue 2: Database Connection Error 🔴 NEEDS FIXING
**Error:** `socket.gaierror: [Errno -2] Name or service not known`

**Root Cause:** Backend is trying to connect to `localhost:5433` which doesn't exist on Render.

**Solution:** Set up cloud databases and update environment variables.

---

## 📋 Step-by-Step Deployment Checklist

### Step 1: Set Up Cloud Databases

#### Option A: PostgreSQL on Render (Recommended - Free)
1. Go to Render Dashboard → "New" → "PostgreSQL"
2. Name: `devlinks-postgres`
3. Database: `devlinks`
4. User: `devlinks`
5. Region: Same as your web service
6. Plan: **Free**
7. Click "Create Database"
8. **Copy the Internal Database URL** (starts with `postgresql://`)

#### Option B: Neon.tech PostgreSQL (Alternative - Free)
1. Go to https://neon.tech
2. Sign up and create new project
3. Copy the connection string
4. Format: `postgresql://user:pass@host/dbname?sslmode=require`

---

#### MongoDB Atlas (Required)
1. Go to https://cloud.mongodb.com
2. Sign up / Log in
3. Create new project: "DevLinks"
4. Build a Database → **M0 Free** tier
5. Create cluster (choose closest region to your Render service)
6. Database Access: Create user
   - Username: `devlinks`
   - Password: (generate strong password)
   - Database User Privileges: **Read and write to any database**
7. Network Access: Add IP
   - Click "Allow access from anywhere" → `0.0.0.0/0`
   - (MongoDB Atlas allows this for serverless/cloud deployments)
8. Connect → "Connect your application"
9. Copy connection string:
   ```
   mongodb+srv://devlinks:<password>@cluster0.xxxxx.mongodb.net/devlinks?retryWrites=true&w=majority
   ```
10. Replace `<password>` with your actual password

---

#### Redis (Required)
**Option A: Upstash Redis (Recommended - Free)**
1. Go to https://upstash.com
2. Sign up and create new Redis database
3. Name: `devlinks-redis`
4. Region: Same as your Render service
5. Copy the connection URL (starts with `redis://` or `rediss://`)

**Option B: Render Redis**
1. Render Dashboard → "New" → "Redis"
2. Name: `devlinks-redis`
3. Plan: **Free**
4. Copy the Internal Redis URL

---

### Step 2: Configure Render Environment Variables

Go to your Render Web Service → "Environment" tab

Add these environment variables:

```bash
# PostgreSQL (Use Internal Database URL from Step 1)
POSTGRES_URL=postgresql+asyncpg://user:password@hostname/devlinks

# MongoDB (From MongoDB Atlas)
MONGO_URL=mongodb+srv://devlinks:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/devlinks?retryWrites=true&w=majority
MONGO_DB_NAME=devlinks

# Redis (From Upstash or Render Redis)
REDIS_URL=redis://default:password@hostname:port
# OR for Upstash with TLS:
# REDIS_URL=rediss://default:password@hostname:port

# JWT Security (GENERATE NEW SECRET!)
SECRET_KEY=your-super-secret-key-min-32-characters-long-CHANGE-THIS
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Application
APP_HOST=0.0.0.0
APP_PORT=8000
BASE_URL=https://devlinks-backend-y2in.onrender.com

# CORS (Your Vercel frontend URL)
CORS_ORIGINS=https://devlinks-delta-fawn.vercel.app,https://devlinks-delta-fawn.vercel.app/

# Firebase (Optional - if using Firebase auth)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
```

**Important Notes:**
- For `POSTGRES_URL`: If using Render PostgreSQL, replace `postgresql://` with `postgresql+asyncpg://`
- For `SECRET_KEY`: Generate a new one using: `openssl rand -hex 32`
- For `CORS_ORIGINS`: Add both with and without trailing slash
- For `FIREBASE_SERVICE_ACCOUNT_JSON`: Paste the entire JSON as a single line

---

### Step 3: Run Database Migrations on Render

After setting environment variables:

1. Go to your Render Web Service
2. Click "Shell" tab (top right)
3. Run these commands:

```bash
# Install dependencies (if needed)
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Verify
alembic current
```

Expected output:
```
INFO  [alembic.runtime.migration] Running upgrade  -> 531c33bf5433, initial migration
INFO  [alembic.runtime.migration] Running upgrade 531c33bf5433 -> a8f2e1c4b9d0, add username to users
```

---

### Step 4: Redeploy

1. Click "Manual Deploy" → "Deploy latest commit"
2. Or push new changes to trigger auto-deploy

---

### Step 5: Verify Deployment

#### Check Backend Health
```bash
curl https://devlinks-backend-y2in.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy"
}
```

#### Check CORS Headers
```bash
curl -I -X OPTIONS https://devlinks-backend-y2in.onrender.com/auth/login \
  -H "Origin: https://devlinks-delta-fawn.vercel.app" \
  -H "Access-Control-Request-Method: POST"
```

Expected headers:
```
access-control-allow-origin: https://devlinks-delta-fawn.vercel.app
access-control-allow-credentials: true
```

#### Check Logs
1. Render Dashboard → Your service → "Logs"
2. Look for:
   - ✅ `🔒 CORS enabled for origins: ['https://devlinks-delta-fawn.vercel.app']`
   - ✅ `🚀 Backend starting with BASE_URL: https://devlinks-backend-y2in.onrender.com`
   - ✅ `:) Services Connected...`
   - ❌ Any errors about database connections

---

### Step 6: Update Frontend (if needed)

Check `frontend/src/lib/api.ts` has correct backend URL:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://devlinks-backend-y2in.onrender.com';
```

Ensure `.env` in frontend has:
```bash
VITE_API_URL=https://devlinks-backend-y2in.onrender.com
```

Redeploy frontend on Vercel if needed.

---

## 🐛 Troubleshooting

### CORS still not working?

1. **Check logs** on Render for the CORS debug message
2. **Verify CORS_ORIGINS** environment variable is set correctly
3. **Try with trailing slash** in CORS_ORIGINS: `https://devlinks-delta-fawn.vercel.app/`
4. **Check for typos** in the Vercel URL

### Database connection errors?

1. **Test connection locally** with the cloud database URLs
2. **Verify IP whitelist** on MongoDB Atlas (should be `0.0.0.0/0`)
3. **Check credentials** - copy-paste to avoid typos
4. **Verify SSL mode** for PostgreSQL (might need `?sslmode=require`)

### Redis connection errors?

1. **Check Redis URL format** - should start with `redis://` or `rediss://`
2. **Verify credentials** in the URL
3. **Check port** - usually 6379 for Redis, custom for Upstash
4. **Test with redis-cli** if possible

### Firebase auth not working?

1. **Verify FIREBASE_SERVICE_ACCOUNT_JSON** is valid JSON
2. **Check Firebase project settings** match the credentials
3. **Ensure service account has correct permissions**

---

## 📊 Cost Breakdown (Free Tier)

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| Render Web Service | Free | $0 | 750 hours/month, spins down after 15min idle |
| Render PostgreSQL | Free | $0 | 1GB storage, 90 days retention |
| MongoDB Atlas | M0 | $0 | 512MB storage |
| Upstash Redis | Free | $0 | 10K commands/day |
| Vercel | Hobby | $0 | 100GB bandwidth/month |

**Total: $0/month** for hobby projects 🎉

---

## 🚀 Production Checklist

Before going to production:

- [ ] Generate new `SECRET_KEY` (don't use default)
- [ ] Set up proper MongoDB user with limited permissions
- [ ] Enable MongoDB Atlas IP whitelist for specific IPs (not 0.0.0.0/0)
- [ ] Set up database backups
- [ ] Configure custom domain
- [ ] Set up monitoring and alerts
- [ ] Add rate limiting to API
- [ ] Enable HTTPS everywhere
- [ ] Review and test all environment variables
- [ ] Set up CI/CD pipeline
- [ ] Add health check endpoints
- [ ] Configure logging and error tracking (Sentry, etc.)

---

## 📞 Support

If you encounter issues:

1. Check Render logs: Dashboard → Service → Logs
2. Check MongoDB Atlas logs: Cluster → Metrics
3. Test database connections locally first
4. Verify all environment variables are set correctly
5. Check CORS headers with curl commands above

---

## 🎯 Quick Commands Reference

### Generate Secret Key
```bash
openssl rand -hex 32
```

### Test Backend Locally with Cloud DBs
```bash
# Update .env with cloud database URLs
python -m uvicorn app.main:app --reload
```

### Run Migrations
```bash
alembic upgrade head
```

### Create New Migration
```bash
alembic revision --autogenerate -m "description"
```

---

Good luck with your deployment! 🚀
