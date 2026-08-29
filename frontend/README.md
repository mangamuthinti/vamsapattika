# Vamsapattika Frontend (React)

React + Vite frontend for Vamsapattika family tree application.

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env` file with these variables:
```env
VITE_API_URL=http://localhost:8000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Start Development Server
```bash
npm run dev
```

App runs at `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
```

Production files will be in `dist/` directory.

## Available Scripts

```bash
npm run dev          # Start development server with HMR
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
```

## Project Structure

```
frontend/
├── src/
│   ├── api/                    # API client modules
│   │   ├── axios.js           # Axios instance with interceptors
│   │   ├── auth.js            # Authentication APIs
│   │   ├── trees.js           # Family tree APIs
│   │   └── payments.js        # Payment APIs
│   │
│   ├── components/            # Reusable components
│   │   ├── Auth.jsx           # Login/Register form
│   │   ├── FamilyTree.jsx     # Main tree visualization
│   │   ├── PersonCard.jsx     # Individual person card
│   │   ├── PersonModal.jsx    # Add/Edit person modal
│   │   ├── PropertiesPanel.jsx # Person properties editor
│   │   ├── PricingModal.jsx   # Subscription plans
│   │   ├── Toolbar.jsx        # Top navigation bar
│   │   └── WelcomeModal.jsx   # Welcome popup
│   │
│   ├── context/               # React Context providers
│   │   ├── AuthContext.jsx    # Auth state & functions
│   │   └── LanguageContext.jsx # i18n translations
│   │
│   ├── pages/                 # Page components
│   │   ├── FamilyTree/        # Family tree page
│   │   ├── Landing/           # Landing page (Home, Vision, Process, etc)
│   │   └── Profile/           # User profile page
│   │
│   ├── styles/                # CSS files
│   │   ├── FamilyTree.css
│   │   ├── Auth.css
│   │   ├── Profile.css
│   │   ├── Landing.css
│   │   └── ...
│   │
│   ├── utils/                 # Utility functions
│   │   └── exportUtils.js     # PNG/PDF export functions
│   │
│   ├── App.jsx                # Root component with routing
│   └── main.jsx               # Entry point
│
├── public/                    # Static assets
│   ├── favicon.jpeg
│   └── images/
│
├── index.html                 # HTML template
├── vite.config.js            # Vite configuration
├── package.json              # Dependencies & scripts
└── .env                      # Environment variables (not in git)
```

## Key Features

### Authentication
- Email/password registration and login
- Google OAuth integration
- JWT token management with auto-refresh
- Protected routes

### Family Tree Management
- Create unlimited trees (based on subscription)
- Add/edit/remove family members
- Add spouses and children
- Photo upload
- Custom styling (colors, shapes, fonts)
- Real-time auto-save

### Subscription & Payments
- Free, Silver, Gold, Diamond plans
- Razorpay payment integration
- Instant plan activation
- Card limit enforcement

### Export & Share
- Export as high-resolution PNG
- Export as PDF
- Direct print
- Share on WhatsApp, Facebook, Twitter
- Copy shareable link

### Multi-language Support
- English
- Hindi (हिंदी)
- Telugu (తెలుగు)
- Instant language switching

## Component Architecture

### Context Providers

**AuthContext** (`src/context/AuthContext.jsx`)
```javascript
const { 
  currentUser,           // Current logged-in user
  signup,                // Register new user
  login,                 // Email/password login
  signInWithGoogle,      // Google OAuth login
  logout,                // Logout and clear tokens
  saveFamilyTree,        // Save tree to backend
  loadFamilyTree,        // Load tree from backend
  getAllTrees,           // Get all user's trees
  createNewTree,         // Create new tree
  deleteTree,            // Delete tree
  renameTree,            // Rename tree
  getUserProfile,        // Get user profile
  updateUserProfile      // Update profile
} = useAuth();
```

**LanguageContext** (`src/context/LanguageContext.jsx`)
```javascript
const { 
  language,              // Current language code
  changeLanguage,        // Switch language
  t                      // Translation function
} = useLanguage();

// Usage: t('Welcome') => 'Welcome' | 'स्वागत' | 'స్వాగతం'
```

### API Modules

All API calls use the centralized axios instance with automatic JWT token handling.

**Auth API** (`src/api/auth.js`)
- `register(email, password, displayName, mobileNumber)`
- `login(email, password)`
- `googleLogin(googleToken)`
- `getProfile()`
- `updateProfile(profileData)`
- `changePassword(oldPassword, newPassword)`
- `refreshToken(refreshToken)`

**Trees API** (`src/api/trees.js`)
- `getAllTrees()` - Get all user's trees
- `getTree(treeId)` - Get specific tree
- `createTree(treeData)` - Create new tree
- `updateTree(treeId, treeData)` - Update tree
- `deleteTree(treeId)` - Delete tree

**Payments API** (`src/api/payments.js`)
- `getPlans()` - Get subscription plans
- `getUserSubscription()` - Get user's subscription
- `createPaymentOrder(planId)` - Create Razorpay order
- `verifyPayment(paymentData)` - Verify payment signature

### Routing

```javascript
// Public routes
/                    → Landing page
/login               → Login/Register
/vision              → Vision page
/process             → Process page
/why                 → Why Us page
/privacy-policy      → Privacy Policy

// Protected routes (require auth)
/family-tree         → Family tree editor
/profile             → User profile & settings
```

## Styling Guide

### CSS Architecture
- Component-specific CSS files
- BEM-like naming convention
- CSS variables for theming
- Responsive breakpoints: 768px, 480px

### Color Palette
```css
--primary: #3498db
--secondary: #2ecc71
--danger: #e74c3c
--warning: #f39c12
--dark: #2c3e50
--light: #ecf0f1
```

### Typography
- Headings: 'Poppins', sans-serif
- Body: 'Roboto', sans-serif
- Monospace: 'Fira Code', monospace

## State Management

Uses React Context API (no Redux):
- **AuthContext** - User auth, trees, profile
- **LanguageContext** - i18n translations
- **Component State** - Local UI state (modals, forms)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL | Yes |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key | Yes |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |

**Note:** All Vite env vars must start with `VITE_` prefix.

## Development Tips

### Hot Module Replacement (HMR)
Vite provides instant HMR. Changes reflect immediately without full reload.

### Browser DevTools
- React DevTools - Inspect component tree
- Redux DevTools - Not needed (using Context)
- Network tab - Monitor API calls
- Console - Check for errors/warnings

### Debugging API Calls
```javascript
// Enable axios logging in development
// See src/api/axios.js for interceptors
```

### Testing Login
```javascript
// Test account
Email: test@example.com
Password: Test123!
```

### Testing Razorpay (Test Mode)
```javascript
// Test card
Card: 4111 1111 1111 1111
Expiry: Any future date
CVV: Any 3 digits
```

## Common Issues & Fixes

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### CORS Errors
- Check backend CORS settings allow `http://localhost:5173`
- Verify `VITE_API_URL` is correct
- Check backend is running

### 401 Unauthorized
- Token expired - logout and login again
- Backend not running
- Check token in localStorage

### Build Errors
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

### Google OAuth Not Working
- Check `VITE_GOOGLE_CLIENT_ID` is set
- Verify authorized origins in Google Console
- Check browser console for errors
- Ensure Google Sign-In script is loaded

### Razorpay Checkout Not Opening
- Check `VITE_RAZORPAY_KEY_ID` is set
- Ensure Razorpay script loaded in `index.html`
- Check browser console for errors
- Verify backend created order successfully

## Performance Optimization

### Code Splitting
Vite automatically splits code by routes. Use dynamic imports for large components:
```javascript
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
```

### Image Optimization
- Use WebP format when possible
- Compress images before upload
- Lazy load images below fold

### Bundle Analysis
```bash
npm run build -- --analyze
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: 13+
- Mobile: iOS Safari 12+, Chrome Android

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Netlify
```bash
# Build command
npm run build

# Publish directory
dist
```

### Environment Variables in Production
Set these in your hosting platform:
- `VITE_API_URL` - Production backend URL
- `VITE_RAZORPAY_KEY_ID` - Razorpay **Live** Key ID
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth Client ID

---

For full documentation, see [main README.md](../README.md)
