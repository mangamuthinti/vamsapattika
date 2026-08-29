# Vamsapattika - Family Tree Application

A full-stack family tree management application with React frontend and Django backend. Create, visualize, and share your family heritage with interactive family trees.

## 🌟 Features

### Core Features
- ✅ **Interactive Family Trees** - Create unlimited family levels with drag-and-drop
- ✅ **User Authentication** - JWT-based auth with Google OAuth support
- ✅ **Multi-Tree Management** - Create and manage multiple family trees
- ✅ **Photo Upload** - Add photos to family members
- ✅ **Subscription Plans** - Tiered pricing with Razorpay payment integration
- ✅ **Export & Share** - Export as PNG/PDF, share on social media
- ✅ **Responsive Design** - Works seamlessly on desktop and mobile
- ✅ **Multi-language Support** - English, Hindi, Telugu

### Advanced Features
- Custom styling for cards and relationships
- Spouse and marriage date tracking
- Family statistics and analytics
- Real-time auto-save
- Profile management

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Context API** for state management
- **Axios** for API calls
- **html2canvas** & **jsPDF** for exports

### Backend
- **Django 4.2** with Django REST Framework
- **PostgreSQL** database
- **JWT Authentication** (djangorestframework-simplejwt)
- **Google OAuth 2.0** integration
- **Razorpay** payment gateway
- **WhiteNoise** for static files

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.10+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** and npm ([Download](https://nodejs.org/))
- **PostgreSQL 14+** ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd vamsapattika
```

### 2. Database Setup

#### Start PostgreSQL
```bash
# macOS (with Homebrew)
brew services start postgresql@14

# Linux
sudo systemctl start postgresql

# Windows
# Start PostgreSQL service from Services app
```

#### Create Database
```bash
# Access PostgreSQL
# macOS/Linux:
psql postgres

# Windows (PowerShell):
# PostgreSQL is usually installed in C:\Program Files\PostgreSQL\<version>\bin
# Replace 18 below with your installed version if different
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres

# Run these commands in psql:
CREATE DATABASE vamsapattika_db;
CREATE USER vamsapattika_user WITH PASSWORD 'vamsapattika@123';
ALTER ROLE vamsapattika_user SET client_encoding TO 'utf8';
ALTER ROLE vamsapattika_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE vamsapattika_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE vamsapattika_db TO vamsapattika_user;
GRANT USAGE, CREATE ON SCHEMA public TO vamsapattika_user;
ALTER SCHEMA public OWNER TO vamsapattika_user;
\q
```

### 3. Backend Setup

```bash
cd backend
```

#### Create Virtual Environment
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Configure Environment Variables
Create or edit `.env` file in the `backend` directory:

```env
# Django Configuration
SECRET_KEY=django-insecure-vamsapattika-2024-change-this-in-production-abc123xyz789
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://vamsapattika_user:vamsapattika@123@localhost:5432/vamsapattika_db

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://localhost:3000

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Razorpay (Get from Razorpay Dashboard)
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
DEFAULT_FROM_EMAIL=noreply@vamsapattika.com

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Logging
DJANGO_LOG_LEVEL=DEBUG
```

#### Run Migrations
```bash
python manage.py migrate
```

#### Create Superuser (Admin)
```bash
python manage.py createsuperuser
```

#### Create Subscription Plans
```bash
python manage.py create_plans
```

#### Start Backend Server
```bash
python manage.py runserver
```

Backend will run at `http://localhost:8000`

### 4. Frontend Setup

Open a new terminal window:

```bash
cd frontend
```

#### Install Dependencies
```bash
npm install
```

#### Configure Environment Variables
Create or edit `.env` file in the `frontend` directory:

```env
# Django Backend API URL
VITE_API_URL=http://localhost:8000/api

# Razorpay Key ID (for payment integration)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here

# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

#### Start Frontend Development Server
```bash
npm run dev
```

Frontend will run at `http://localhost:5173`

---

## 🔑 Getting API Credentials

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:5173`
   - `http://localhost:8000` (for backend verification)
7. Copy the **Client ID** and **Client Secret**
8. Add to both `.env` files

### Razorpay Setup

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or log in
3. Go to **Settings** → **API Keys**
4. Generate **Test Keys** (for development)
5. Copy **Key ID** and **Key Secret**
6. Add to both `.env` files
7. For production, generate and use **Live Keys**

---

## 📁 Project Structure

```
vamsapattika/
├── backend/                      # Django Backend
│   ├── accounts/                 # User authentication & profiles
│   │   ├── models.py            # User model
│   │   ├── serializers.py       # API serializers
│   │   ├── views.py             # Auth endpoints
│   │   └── urls.py              # URL routing
│   ├── family_trees/            # Family tree management
│   │   ├── models.py            # FamilyTree model
│   │   ├── serializers.py       # Tree serializers
│   │   ├── views.py             # Tree CRUD endpoints
│   │   └── urls.py              # URL routing
│   ├── payments/                # Payment processing
│   │   ├── models.py            # Payment & Subscription models
│   │   ├── views.py             # Razorpay integration
│   │   └── urls.py              # Payment endpoints
│   ├── vamsapattika_backend/   # Main Django config
│   │   ├── settings.py          # Django settings
│   │   ├── urls.py              # Root URL config
│   │   └── wsgi.py              # WSGI config
│   ├── manage.py                # Django management script
│   ├── requirements.txt         # Python dependencies
│   └── .env                     # Backend environment variables
│
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Auth.jsx         # Login/Register
│   │   │   ├── FamilyTree.jsx   # Main tree component
│   │   │   ├── PersonCard.jsx   # Individual card
│   │   │   ├── PersonModal.jsx  # Add/Edit modal
│   │   │   ├── PricingModal.jsx # Subscription plans
│   │   │   └── Toolbar.jsx      # Top navigation
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # Auth state management
│   │   │   └── LanguageContext.jsx # i18n support
│   │   ├── pages/
│   │   │   ├── FamilyTree/      # Family tree pages
│   │   │   ├── Profile/         # User profile
│   │   │   └── Landing/         # Landing page
│   │   ├── api/                 # API client
│   │   │   ├── axios.js         # Axios instance
│   │   │   ├── auth.js          # Auth APIs
│   │   │   ├── trees.js         # Tree APIs
│   │   │   └── payments.js      # Payment APIs
│   │   ├── styles/              # CSS files
│   │   ├── App.jsx              # Root component
│   │   └── main.jsx             # Entry point
│   ├── public/                  # Static assets
│   ├── index.html               # HTML template
│   ├── package.json             # Node dependencies
│   ├── vite.config.js           # Vite configuration
│   └── .env                     # Frontend environment variables
│
└── README.md                    # This file
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login with email/password
- `POST /api/auth/google-login/` - Login with Google OAuth
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `GET /api/auth/profile/` - Get current user profile
- `PUT /api/auth/profile/update/` - Update user profile
- `POST /api/auth/profile/change-password/` - Change password

### Family Trees
- `GET /api/trees/` - List all user's trees
- `POST /api/trees/` - Create new tree
- `GET /api/trees/:id/` - Get specific tree
- `PUT /api/trees/:id/` - Update tree
- `PATCH /api/trees/:id/` - Partial update
- `DELETE /api/trees/:id/` - Delete tree

### Payments
- `GET /api/payments/plans/` - List subscription plans
- `POST /api/payments/create-order/` - Create Razorpay order
- `POST /api/payments/verify-payment/` - Verify payment signature
- `GET /api/payments/subscription/` - Get user subscription

---

## 🎮 Usage Guide

### First Time Setup
1. Open browser to `http://localhost:5173`
2. Click **Sign Up** or **Continue with Google**
3. Complete registration
4. Start with Free plan (4 cards limit)

### Creating a Family Tree
1. Click **"+ New Tree"** in sidebar
2. Enter tree name
3. Start adding family members
4. Click **"Add Child"** or **"Add Spouse"** from person card menu

### Upgrading Plan
1. Click **"Upgrade Plan"** in toolbar
2. Select a plan (Silver/Gold/Diamond)
3. Complete payment with Razorpay
4. Plan activates immediately

### Exporting Tree
1. Click **"Export"** in toolbar
2. Choose format:
   - **PNG** - High-resolution image
   - **PDF** - Print-ready document
   - **Print** - Direct to printer

### Sharing
1. Click **"Share"** in toolbar
2. Select platform (WhatsApp, Facebook, Twitter)
3. Or copy link to clipboard

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
source venv/bin/activate
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Google OAuth login
- [ ] Create/edit/delete family tree
- [ ] Add/edit/remove family members
- [ ] Upload photos
- [ ] Payment flow (use Razorpay test mode)
- [ ] Export as PNG/PDF
- [ ] Share on social media
- [ ] Profile update
- [ ] Password change

---

## 🔧 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
brew services list  # macOS
sudo systemctl status postgresql  # Linux

# Windows PowerShell:
# Replace 18 with your installed PostgreSQL version if different
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U vamsapattika_user -d vamsapattika_db

# Verify credentials in backend/.env
# Test connection:
psql -U vamsapattika_user -d vamsapattika_db
```

### Backend Won't Start
```bash
# Check Python version
python3 --version  # Should be 3.10+

# Reinstall dependencies
pip install --upgrade -r requirements.txt

# Check for port conflicts
lsof -i :8000
```

### Frontend Won't Start
```bash
# Check Node version
node --version  # Should be 18+

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for port conflicts
lsof -i :5173
```

### CORS Errors
- Verify `CORS_ALLOWED_ORIGINS` in `backend/.env` includes frontend URL
- Check frontend is using correct API URL in `frontend/.env`
- Restart both servers after changing .env files

### Payment Integration Issues
- Verify Razorpay keys are correct in both .env files
- Use **Test Mode** keys during development
- Check browser console for Razorpay errors
- Ensure Razorpay script is loaded in `index.html`

### Google OAuth Not Working
- Verify Google Client ID in both .env files
- Check authorized redirect URIs in Google Console
- Ensure Google Sign-In script is loaded in `index.html`
- Check browser console for errors

---

## 🚀 Deployment

### Choose Your Deployment Platform

#### Option 1: GoDaddy VPS (Ubuntu 22.04) ⭐

**For GoDaddy VPS deployment:**  
See **[DEPLOYMENT_GODADDY_VPS.md](DEPLOYMENT_GODADDY_VPS.md)** - Complete Ubuntu 22.04 setup guide

Includes:
- Full server setup (PostgreSQL, Python, Node.js, Nginx)
- Django + Gunicorn configuration
- React build deployment
- SSL with Let's Encrypt
- Automated backups & deployment scripts

#### Option 2: Platform-as-a-Service (Railway, Vercel, Heroku)

**For managed hosting:**  
See **[DEPLOYMENT.md](DEPLOYMENT.md)** - Railway/Vercel/Heroku guide

### Recommended Platforms

| Component | Platform | Why |
|-----------|----------|-----|
| Backend | Railway | Easy setup, built-in PostgreSQL, auto-deploy |
| Frontend | Vercel | Zero-config for Vite, automatic HTTPS |
| Database | Railway PostgreSQL | Automatic backups, easy scaling |

### Quick Start

1. **Deploy Backend to Railway:**
   - Sign up at [railway.app](https://railway.app)
   - Connect GitHub repository
   - Add PostgreSQL database
   - Set environment variables
   - Deploy automatically

2. **Deploy Frontend to Vercel:**
   - Sign up at [vercel.com](https://vercel.com)
   - Import repository
   - Set `frontend` as root directory
   - Add environment variables
   - Deploy with one click

3. **Configure:**
   - Update CORS settings in backend
   - Update API URL in frontend
   - Add custom domains (optional)
   - Test complete flow

**Full deployment guide:** [DEPLOYMENT.md](DEPLOYMENT.md)  
**Includes:** Security checklist, monitoring setup, backup strategy, CI/CD, troubleshooting

---

## 📝 Development Workflow

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add: your feature description"

# Push and create PR
git push origin feature/your-feature-name
```

### Database Migrations
```bash
# After model changes
python manage.py makemigrations
python manage.py migrate

# Check migration status
python manage.py showmigrations
```

### Adding New Dependencies

**Backend:**
```bash
pip install package-name
pip freeze > requirements.txt
```

**Frontend:**
```bash
npm install package-name
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add: Amazing Feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- **Python**: Follow PEP 8
- **JavaScript**: Use ESLint rules
- **Components**: Use functional components with hooks
- **Naming**: Use descriptive names (camelCase for JS, snake_case for Python)

---

## 📜 License

This project is proprietary. All rights reserved.

---

## 👥 Team

**Powered by Provegaa Tech Hub**

---

## 📞 Support

For issues or questions:
1. Check this README
2. Review API documentation
3. Check browser/server console logs
4. Contact development team

---

## 🎯 Roadmap

### Upcoming Features
- [ ] Email verification
- [ ] Password reset via email
- [ ] Advanced tree visualization options
- [ ] Family tree collaboration (multi-user)
- [ ] Import/Export GEDCOM format
- [ ] Mobile app (React Native)
- [ ] AI-powered relationship suggestions
- [ ] Family timeline view
- [ ] Dark mode
- [ ] More payment gateway options (Stripe, PayPal)

---

**Built with ❤️ using Django + React**

Last Updated: August 2026
