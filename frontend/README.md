# DevLinks Frontend

Professional React-based landing page and dashboard for DevLinks - a link intelligence platform built for India.

## 🎨 Design Features

- **Pure black base** (#000000) with deep charcoal surfaces
- **Signature gradient**: Electric violet to cyan (#7C3AED → #06B6D4)
- **Glassmorphism cards** with backdrop blur and gradient borders
- **Smooth animations** powered by Framer Motion
- **Responsive design** optimized for mobile and desktop

## 🚀 Tech Stack

- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client

## 📦 Getting Started

### Install Dependencies

```bash
npm install
```

### Environment Setup

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Fixed navigation
│   │   ├── Hero.jsx             # Hero section with URL input
│   │   ├── StatsBar.jsx         # Statistics showcase
│   │   ├── Features.jsx         # Feature cards grid
│   │   ├── Analytics.jsx        # Analytics preview
│   │   ├── Pricing.jsx          # Pricing plans
│   │   ├── Footer.jsx           # Footer with links
│   │   ├── CreateLinkModal.jsx  # Modal for creating links
│   │   └── LinkAnalytics.jsx    # Detailed analytics view
│   ├── pages/
│   │   ├── LandingPage.jsx      # Public landing page
│   │   ├── Auth.jsx             # Login/Register page
│   │   └── Dashboard.jsx        # Protected dashboard
│   ├── App.jsx                  # Main app with routing
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles & animations
├── index.html                   # HTML template
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js            # PostCSS configuration
└── package.json                 # Dependencies
```

## 🎯 Pages

### 1. Landing Page (`/`)

**Sections:**
- **Navbar** - Logo, navigation links, CTA button
- **Hero** - Headline, URL input with animated gradient border, demo short link
- **Stats Bar** - 3 stat cards (clicks tracked, creators, countries)
- **Features** - 6 glassmorphism cards showcasing features
- **Analytics Preview** - Fake dashboard with chart and stats
- **Pricing** - Free and Pro plans
- **Footer** - Links and social icons

**Features:**
- Smooth scroll animations
- Floating glow orbs background
- Hover effects on all interactive elements
- Fully responsive design

### 2. Authentication Page (`/auth`)

**Features:**
- Toggle between Login and Register
- Email and password validation
- Show/hide password
- Error and success messages
- JWT token storage
- Redirect to dashboard on success

**Validation:**
- Email format validation
- Minimum 6 character password
- Real-time error feedback

### 3. Dashboard (`/dashboard`)

**Protected Route** - Requires authentication

**Features:**
- User info display with plan badge
- Stats overview (total links, active links, plan limit)
- Create new link button
- Links list with:
  - Copy short URL
  - View analytics
  - Open link in new tab
  - Delete link
- Real-time updates

**Interactions:**
- Create link modal
- Copy to clipboard feedback
- Delete confirmation
- Navigate to analytics view

### 4. Link Analytics (Embedded)

**Features:**
- Time period selector (7, 30, 90 days)
- Stats overview:
  - Total clicks
  - WhatsApp clicks with percentage
  - Top device
  - Top country
- Animated time-series chart
- Detailed breakdowns:
  - Devices with progress bars
  - Browsers with progress bars
  - Traffic sources
  - Top locations

**Interactions:**
- Hover tooltips on chart
- Animated data visualization
- Back to dashboard navigation

## 🎨 Design System

### Colors

```js
colors: {
  'dark-base': '#000000',
  'dark-surface': '#0A0A0A',
  'dark-elevated': '#111111',
}
```

### Gradients

```css
/* Primary gradient */
background: linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%);

/* Text gradient */
.gradient-text {
  background: linear-gradient(to right, #7C3AED, #06B6D4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Glassmorphism

```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}
```

### Animations

```css
/* Floating orbs */
@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, -30px); }
}

/* Gradient rotation */
@keyframes gradient-rotate {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

## 🔐 Authentication Flow

1. User visits `/auth`
2. Enters email and password
3. On login success:
   - Store `access_token` in localStorage
   - Store `refresh_token` in localStorage
   - Redirect to `/dashboard`
4. Protected routes check for token
5. If no token, redirect to `/auth`
6. On logout, clear tokens and redirect to `/auth`

## 📡 API Integration

### Axios Configuration

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Authenticated request
const response = await axios.get(`${API_URL}/links/`, {
  headers: { Authorization: `Bearer ${token}` }
})
```

### Endpoints Used

```
POST   /auth/register     - Create account
POST   /auth/login        - Login
GET    /auth/me           - Get user info
POST   /links/            - Create link
GET    /links/            - Get all links
DELETE /links/{slug}      - Delete link
GET    /analytics/{slug}  - Get analytics
```

## 🎭 Animations

### Page Transitions

```jsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Content */}
</motion.div>
```

### Hover Effects

```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
```

### Scroll Animations

```jsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
>
  {/* Content */}
</motion.div>
```

## 📱 Responsive Design

### Breakpoints

```js
// Tailwind breakpoints
sm: '640px'   // Mobile landscape
md: '768px'   // Tablet
lg: '1024px'  // Desktop
xl: '1280px'  // Large desktop
```

### Mobile Optimizations

- Hamburger menu (if needed)
- Stacked layouts on mobile
- Touch-friendly button sizes
- Optimized font sizes
- Reduced animations on mobile

## 🚀 Performance

- Code splitting with React Router
- Lazy loading for images
- Optimized bundle size with Vite
- Efficient animations with Framer Motion
- Minimal dependencies

## 🧪 Testing

### Manual Testing Checklist

- [ ] Landing page loads correctly
- [ ] All animations work smoothly
- [ ] Registration creates account
- [ ] Login redirects to dashboard
- [ ] Protected routes require auth
- [ ] Create link works
- [ ] Copy link works
- [ ] Delete link works
- [ ] Analytics display correctly
- [ ] Logout clears session
- [ ] Responsive on mobile
- [ ] All links work

## 🐛 Troubleshooting

### API Connection Issues

```bash
# Check if backend is running
curl http://localhost:8000/health

# Verify CORS settings in backend
# Check .env file has correct API_URL
```

### Build Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
```

### Authentication Issues

```bash
# Clear localStorage
localStorage.clear()

# Check token in browser DevTools
localStorage.getItem('access_token')
```

## 📦 Production Build

### Optimize for Production

```bash
# Build with optimizations
npm run build

# Preview production build
npm run preview
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Build
npm run build

# Deploy dist folder to Netlify
```

### Environment Variables

Set in your hosting platform:
```
VITE_API_URL=https://your-api-domain.com
```

## 🎨 Customization

### Change Colors

Edit `tailwind.config.js`:

```js
colors: {
  'dark-base': '#000000',
  'dark-surface': '#0A0A0A',
  'dark-elevated': '#111111',
}
```

### Change Fonts

Edit `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Your+Font&display=swap" rel="stylesheet">
```

Update `tailwind.config.js`:

```js
fontFamily: {
  sans: ['Your Font', 'system-ui', 'sans-serif'],
}
```

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

---

Built with ❤️ using React + Vite + Tailwind CSS
