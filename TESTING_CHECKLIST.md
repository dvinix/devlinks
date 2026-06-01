# DevLinks Dashboard - Testing Checklist

## 🚀 Pre-Testing Setup

### 1. Start Services
- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend running on `http://localhost:5173`
- [ ] Docker services running (PostgreSQL, MongoDB, Redis)
- [ ] No console errors on startup

### 2. Verify Environment
- [ ] `.env` file exists in root
- [ ] `frontend/.env` file exists
- [ ] Database migrations completed
- [ ] All dependencies installed

---

## 🎨 Visual Testing

### Dashboard Layout
- [ ] Sidebar is 200px wide
- [ ] Sidebar has DevLinks logo at top
- [ ] Navigation items visible (Links, Analytics, QR Codes)
- [ ] Links tab is active by default (highlighted)
- [ ] Plan usage bar shows at bottom of sidebar
- [ ] User email displays at bottom
- [ ] Logout button visible

### Top Bar
- [ ] Page title shows "Links"
- [ ] "New link" button visible on right
- [ ] Button is dark (gray-900) with white text
- [ ] Plus icon shows in button

### Stats Cards
- [ ] 3 cards in a row
- [ ] Cards have light gray background (#f9fafb)
- [ ] Cards have subtle border (#e5e7eb)
- [ ] Icons show in each card (TrendingUp, MessageCircle, Globe)
- [ ] Numbers display correctly
- [ ] Cards have 8px border radius

### Links Table
- [ ] Table has white background
- [ ] Table has border (#e5e7eb)
- [ ] Header row has gray background
- [ ] Columns: Slug, Original URL, Clicks, Status, Actions
- [ ] Slug is blue monospace font
- [ ] URL is truncated if too long
- [ ] Status badge shows (Active/Inactive)
- [ ] Action icons visible (Copy, Analytics, Open, Delete)

### Empty State (if no links)
- [ ] Icon shows (Link2 icon in gray circle)
- [ ] Heading: "No links yet"
- [ ] Description text visible
- [ ] "Create your first link" button shows
- [ ] Button is dark with white text

### Colors
- [ ] Background is white (#ffffff)
- [ ] No gradients visible
- [ ] No blur effects
- [ ] No glow effects
- [ ] Blue accent only on links and active states (#2563eb)
- [ ] Text is dark gray (#111827, #6b7280)

### Typography
- [ ] Font is system-ui (native)
- [ ] Text is readable
- [ ] Headings are bold
- [ ] Body text is regular weight

---

## 🖱️ Interaction Testing

### Navigation
- [ ] Click "Links" tab - stays on links view
- [ ] Click "Analytics" tab - shows "Coming soon" message
- [ ] Click "QR Codes" tab - shows "Coming soon" message
- [ ] Active tab is highlighted
- [ ] Hover on tabs shows background change

### Create Link
- [ ] Click "New link" button - modal opens
- [ ] Modal has white background
- [ ] Modal has "Create Short Link" title
- [ ] URL input field visible
- [ ] Close button (X) works
- [ ] Click outside modal - modal closes
- [ ] Enter invalid URL - shows error
- [ ] Enter valid URL - link creates successfully
- [ ] Success state shows (green checkmark)
- [ ] Modal closes after success
- [ ] New link appears in table

### Copy Link
- [ ] Click copy icon on a link
- [ ] Icon changes to checkmark (green)
- [ ] Link copied to clipboard (verify with paste)
- [ ] Checkmark disappears after 2 seconds
- [ ] Copy icon returns

### View Analytics
- [ ] Click analytics icon (chart) on a link
- [ ] Analytics page loads
- [ ] Back button shows at top
- [ ] Link slug and URL display
- [ ] Time period buttons show (7/30/90 days)
- [ ] Stats cards show (4 cards)
- [ ] Clicks chart displays
- [ ] Device breakdown shows
- [ ] Browser breakdown shows
- [ ] Traffic sources show
- [ ] Top locations show
- [ ] Click "Back to Dashboard" - returns to dashboard

### Delete Link
- [ ] Click delete icon (trash) on a link
- [ ] Confirmation dialog appears
- [ ] Click "Cancel" - nothing happens
- [ ] Click delete again
- [ ] Click "OK" - link deletes
- [ ] Link removes from table
- [ ] If last link deleted, empty state shows

### Logout
- [ ] Click "Logout" button in sidebar
- [ ] Redirects to auth page
- [ ] Token removed from localStorage
- [ ] Cannot access dashboard without login

---

## 📱 Responsive Testing

### Desktop (1920x1080)
- [ ] Sidebar visible
- [ ] Stats cards in one row
- [ ] Table columns all visible
- [ ] No horizontal scroll
- [ ] Proper spacing

### Laptop (1366x768)
- [ ] Layout still works
- [ ] Stats cards in one row
- [ ] Table readable
- [ ] No overflow issues

### Tablet (768px)
- [ ] Sidebar still visible (or collapses)
- [ ] Stats cards stack (2 columns)
- [ ] Table scrolls horizontally
- [ ] Touch targets adequate

### Mobile (375px)
- [ ] Sidebar hidden or collapsed
- [ ] Stats cards stack vertically
- [ ] Table scrolls horizontally
- [ ] Buttons are tappable
- [ ] Text is readable

---

## ⚡ Performance Testing

### Load Time
- [ ] Dashboard loads in < 2 seconds
- [ ] No flash of unstyled content
- [ ] Smooth page transitions
- [ ] No layout shift

### Animations
- [ ] Stats cards fade in smoothly
- [ ] Table rows fade in with stagger
- [ ] Modal opens/closes smoothly
- [ ] Hover effects are smooth
- [ ] No janky animations

### API Calls
- [ ] Links fetch on mount
- [ ] User data fetches on mount
- [ ] Create link calls API
- [ ] Delete link calls API
- [ ] Analytics fetch on view
- [ ] No duplicate calls
- [ ] Loading states show

---

## 🐛 Error Handling

### Network Errors
- [ ] Backend offline - shows error
- [ ] API timeout - shows error
- [ ] Invalid response - shows error
- [ ] 401 error - redirects to auth
- [ ] 500 error - shows error message

### Form Validation
- [ ] Empty URL - shows error
- [ ] Invalid URL - shows error
- [ ] URL without http:// - shows error
- [ ] Error message is red
- [ ] Error clears on fix

### Edge Cases
- [ ] No links - empty state shows
- [ ] 100+ links - pagination needed (future)
- [ ] Very long URL - truncates properly
- [ ] Special characters in URL - handles correctly
- [ ] Expired token - redirects to auth

---

## 🔒 Security Testing

### Authentication
- [ ] Cannot access dashboard without token
- [ ] Token stored in localStorage
- [ ] Token sent in Authorization header
- [ ] Expired token redirects to auth
- [ ] Logout clears token

### Authorization
- [ ] Can only see own links
- [ ] Cannot delete others' links
- [ ] Cannot view others' analytics
- [ ] API enforces user ownership

---

## ♿ Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Focus visible on all elements
- [ ] Enter key works on buttons
- [ ] Escape closes modal
- [ ] Arrow keys work in table (future)

### Screen Reader
- [ ] Page title announced
- [ ] Buttons have labels
- [ ] Links have labels
- [ ] Table has proper headers
- [ ] Status messages announced

### Contrast
- [ ] Text contrast ratio > 4.5:1
- [ ] Button contrast ratio > 3:1
- [ ] Focus indicators visible
- [ ] Color not sole indicator

---

## 🎯 Feature Completeness

### Core Features
- [x] User authentication
- [x] Create short links
- [x] View all links
- [x] Copy links
- [x] Delete links
- [x] View analytics
- [x] Plan usage tracking
- [x] Logout

### Missing Features (Future)
- [ ] Edit links
- [ ] Custom slugs
- [ ] Link expiration
- [ ] QR code generation
- [ ] Global analytics
- [ ] Search/filter links
- [ ] Bulk actions
- [ ] Export data

---

## 📊 Analytics Testing

### Analytics Page
- [ ] Loads for any link
- [ ] Shows correct slug
- [ ] Shows correct URL
- [ ] Time period selector works
- [ ] Clicking 7 days - fetches 7 days data
- [ ] Clicking 30 days - fetches 30 days data
- [ ] Clicking 90 days - fetches 90 days data
- [ ] Stats cards show numbers
- [ ] Chart displays bars
- [ ] Hover on bars shows tooltip
- [ ] Device breakdown shows percentages
- [ ] Browser breakdown shows percentages
- [ ] Sources breakdown shows percentages
- [ ] Locations show city + country

---

## 🎨 Design Consistency

### Spacing
- [ ] Consistent padding in cards (24px)
- [ ] Consistent gap between elements (16px)
- [ ] Consistent margin around sections (32px)
- [ ] No awkward spacing

### Colors
- [ ] Only blue accent used (#2563eb)
- [ ] Gray scale consistent
- [ ] No random colors
- [ ] Borders all same color (#e5e7eb)

### Typography
- [ ] All text uses system-ui
- [ ] Headings are semibold (600)
- [ ] Body text is regular (400)
- [ ] Consistent font sizes

### Components
- [ ] All cards have 8px radius
- [ ] All buttons have 6px radius
- [ ] All icons are 16px or 20px
- [ ] All borders are 1px

---

## ✅ Final Checks

### Code Quality
- [ ] No console errors
- [ ] No console warnings
- [ ] No React warnings
- [ ] No TypeScript errors (if applicable)
- [ ] No unused imports
- [ ] No commented code

### Documentation
- [ ] README updated
- [ ] API docs accurate
- [ ] Component docs exist
- [ ] Setup guide works

### Deployment Ready
- [ ] Build succeeds (`npm run build`)
- [ ] Production build works
- [ ] Environment variables set
- [ ] No hardcoded values

---

## 📝 Test Results

### Date: _______________
### Tester: _______________

### Summary
- Total Tests: 150+
- Passed: _____
- Failed: _____
- Skipped: _____

### Critical Issues Found
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Minor Issues Found
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Notes
_______________________________________________
_______________________________________________
_______________________________________________

---

## 🎉 Sign-Off

- [ ] All critical tests passed
- [ ] All visual tests passed
- [ ] All interaction tests passed
- [ ] All responsive tests passed
- [ ] All performance tests passed
- [ ] All accessibility tests passed
- [ ] Ready for production

**Approved by**: _______________
**Date**: _______________
**Signature**: _______________

---

## 📞 Support

If any test fails:
1. Check console for errors
2. Check network tab for failed requests
3. Verify backend is running
4. Verify database is connected
5. Clear browser cache
6. Try in incognito mode
7. Check documentation

**Good luck testing!** 🚀
