/**
 * Frontend Deployment Guide
 * 
 * This frontend is optimized for deployment on Vercel
 */

# DevLinks Frontend

Production-ready React frontend for DevLinks URL shortener with analytics.

## Features

- ✅ URL shortening and management
- ✅ Analytics dashboard
- ✅ QR code generation
- ✅ Firebase authentication
- ✅ Responsive design with Tailwind CSS
- ✅ Real-time updates with React Query
- ✅ Type-safe with TypeScript

## Environment Variables

Create a `.env.local` file in the frontend directory with:

```env
VITE_API_BASE_URL=https://your-backend-api.com
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
```

See `.env.example` for all available variables.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Production Build

```bash
npm run build
npm run preview
```

## Deployment on Vercel

### 1. Connect Repository
```
1. Go to vercel.com → New Project
2. Select your GitHub repository
3. Choose "Frontend" as root directory
```

### 2. Environment Variables
In Vercel dashboard:
1. Settings → Environment Variables
2. Add each variable:
   - `VITE_API_BASE_URL` → Your backend API URL
   - `VITE_FIREBASE_API_KEY` → Firebase key
   - `VITE_FIREBASE_AUTH_DOMAIN` → Firebase auth domain
   - `VITE_FIREBASE_PROJECT_ID` → Firebase project ID

### 3. Build Settings
Already configured in `vercel.json`:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 4. Deploy
Push to main branch and Vercel will auto-deploy.

## Project Structure

```
src/
├── components/       # UI components
│   └── ui/          # Reusable UI components
├── config/          # Configuration files
│   ├── env.ts       # Environment variables
│   └── routes.ts    # Route configuration
├── constants/       # App constants
├── hooks/           # Custom React hooks
├── lib/            # Utility functions
│   ├── api.ts      # Axios instance with interceptors
│   ├── errors.ts   # Error handling
│   ├── firebase.ts # Firebase configuration
│   └── storage.ts  # LocalStorage utilities
├── pages/          # Page components
├── services/       # API service layer
├── store/          # Zustand stores
├── types/          # TypeScript types
└── App.jsx         # Main App component
```

## Key Improvements

✅ **API Layer Separation** — All API calls in `services/api.ts`  
✅ **Centralized Config** — Environment variables in `config/env.ts`  
✅ **Constants** — API endpoints in `constants/index.ts`  
✅ **Error Handling** — Proper error handling in `lib/errors.ts`  
✅ **Storage Utilities** — Safe localStorage access in `lib/storage.ts`  
✅ **Router Setup** — Fixed duplicate Router wrapping  
✅ **TypeScript Ready** — Full TypeScript support  
✅ **Production Optimized** — Code splitting & minification  

## Vercel Configuration

See `vercel.json` for:
- Build and output settings
- Environment variable naming
- Rewrite rules for SPA routing
- Cache headers for API requests

## Troubleshooting

**Issue: "Cannot find module"**
- Run `npm install`
- Clear node_modules: `rm -rf node_modules && npm install`

**Issue: API requests failing**
- Verify `VITE_API_BASE_URL` is set correctly
- Check browser console for network errors

**Issue: Firebase auth not working**
- Ensure Firebase config vars are set in Vercel
- Verify Firebase project is configured correctly
