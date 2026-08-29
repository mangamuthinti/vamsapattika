# Vamsapattika Documentation Index

Complete documentation for the Vamsapattika project. Start here to find what you need.

## 📚 Quick Navigation

### Getting Started
1. **[README.md](README.md)** - **START HERE!** Complete setup guide with:
   - Prerequisites checklist
   - Database setup
   - Backend setup
   - Frontend setup
   - API credentials guide
   - Project structure
   - Troubleshooting

2. **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development workflow guide:
   - Git workflow
   - Code style guidelines
   - Testing guidelines
   - PR submission process
   - Code review process

3. **[DEPLOYMENT.md](DEPLOYMENT.md)** - Platform-as-a-Service deployment:
   - Railway, Vercel, Heroku setup
   - Managed hosting deployment
   - Quick deployment options

4. **[DEPLOYMENT_GODADDY_VPS.md](DEPLOYMENT_GODADDY_VPS.md)** - ⭐ GoDaddy VPS (Ubuntu 22.04):
   - Complete Ubuntu 22.04 server setup
   - PostgreSQL, Python, Node.js, Nginx installation
   - Django + Gunicorn configuration
   - React build deployment
   - SSL with Let's Encrypt
   - Systemd service setup
   - Automated backups & deployment scripts
   - Monitoring & maintenance
   - Troubleshooting guide

5. **[PRODUCTION_ENV_SETUP.md](PRODUCTION_ENV_SETUP.md)** - Production environment variables guide:
   - Backend .env.production configuration
   - Frontend .env.production configuration
   - Google OAuth setup
   - Razorpay LIVE keys setup
   - Email configuration
   - Security best practices
   - Configuration checklist
   - Troubleshooting

6. **[DEPLOYMENT_CHEATSHEET.md](DEPLOYMENT_CHEATSHEET.md)** - Quick command reference:
   - Common deployment commands
   - Service management
   - Log viewing
   - Database operations
   - Troubleshooting fixes

### Automated Setup
- **[setup.sh](setup.sh)** - One-command setup for macOS/Linux
- **[setup.bat](setup.bat)** - One-command setup for Windows

### Component Documentation

#### Backend (Django)
- **[backend/README.md](backend/README.md)** - Backend-specific quick reference:
  - Django commands
  - API endpoints
  - Testing APIs with cURL
  - Database operations
  - Environment variables
  - Troubleshooting

- **[backend/.env.example](backend/.env.example)** - Template for backend environment variables

#### Frontend (React)
- **[frontend/README.md](frontend/README.md)** - Frontend-specific quick reference:
  - Component architecture
  - API modules
  - Context providers
  - Routing
  - Styling guide
  - Testing
  - Deployment

- **[frontend/.env.example](frontend/.env.example)** - Template for frontend environment variables

## 🎯 Common Tasks

### First Time Setup
```bash
# 1. Clone repository
git clone <repository-url>
cd vamsapattika

# 2. Run automated setup
./setup.sh              # macOS/Linux
setup.bat               # Windows

# 3. Get API credentials (see README.md)

# 4. Start development
# Terminal 1: Backend
cd backend && source venv/bin/activate && python manage.py runserver

# Terminal 2: Frontend
cd frontend && npm run dev
```

See: [README.md](README.md)

### Creating a Feature
```bash
# 1. Create branch
git checkout -b feature/your-feature-name

# 2. Make changes

# 3. Test locally

# 4. Commit and push
git add .
git commit -m "Add: Your feature description"
git push origin feature/your-feature-name

# 5. Create Pull Request
```

See: [CONTRIBUTING.md](CONTRIBUTING.md)

### Testing Your Changes

**Backend:**
```bash
cd backend
source venv/bin/activate
python manage.py test
```

**Frontend:**
```bash
cd frontend
npm run test
```

See: [backend/README.md](backend/README.md) | [frontend/README.md](frontend/README.md)

### Database Operations

**Create database:**
```sql
CREATE DATABASE vamsapattika_db;
CREATE USER vamsapattika_user WITH PASSWORD 'SecurePassword123!';
GRANT ALL PRIVILEGES ON DATABASE vamsapattika_db TO vamsapattika_user;
```

**Run migrations:**
```bash
cd backend
python manage.py migrate
```

**Create superuser:**
```bash
python manage.py createsuperuser
```

See: [README.md](README.md) | [backend/README.md](backend/README.md)

### Deployment

**Backend:**
- Set `DEBUG=False`
- Update `ALLOWED_HOSTS`
- Use production database
- Generate strong `SECRET_KEY`
- Use Razorpay LIVE keys
- Deploy to Railway/Heroku/AWS

**Frontend:**
```bash
npm run build
# Deploy dist/ folder to Vercel/Netlify
```

See: [README.md](README.md)

## 📁 File Structure Reference

```
vamsapattika/
├── README.md                     # Main documentation - START HERE
├── CONTRIBUTING.md               # Development workflow guide
├── DOCUMENTATION.md              # This file - documentation index
├── setup.sh                      # Automated setup (macOS/Linux)
├── setup.bat                     # Automated setup (Windows)
├── .gitignore                    # Git ignore rules
│
├── backend/                      # Django Backend
│   ├── README.md                 # Backend quick reference
│   ├── .env.example              # Environment variables template
│   ├── requirements.txt          # Python dependencies
│   ├── manage.py                 # Django management
│   ├── accounts/                 # User authentication
│   ├── family_trees/             # Tree management
│   ├── payments/                 # Razorpay integration
│   └── vamsapattika_backend/     # Django config
│
└── frontend/                     # React Frontend
    ├── README.md                 # Frontend quick reference
    ├── .env.example              # Environment variables template
    ├── package.json              # Node dependencies
    ├── vite.config.js            # Vite configuration
    └── src/
        ├── components/           # React components
        ├── context/              # Context providers
        ├── pages/                # Page components
        ├── api/                  # API client
        ├── styles/               # CSS files
        └── utils/                # Utilities
```

## 🔑 API Documentation

### Authentication Endpoints
```
POST /api/auth/register/          - Register new user
POST /api/auth/login/             - Login with email/password
POST /api/auth/google-login/      - Login with Google OAuth
GET  /api/auth/profile/           - Get user profile
PUT  /api/auth/profile/update/    - Update profile
POST /api/auth/profile/change-password/ - Change password
POST /api/auth/token/refresh/     - Refresh JWT token
```

### Family Tree Endpoints
```
GET    /api/trees/         - List all trees
POST   /api/trees/         - Create tree
GET    /api/trees/:id/     - Get specific tree
PUT    /api/trees/:id/     - Update tree
DELETE /api/trees/:id/     - Delete tree
```

### Payment Endpoints
```
GET  /api/payments/plans/         - List subscription plans
GET  /api/payments/subscription/  - Get user subscription
POST /api/payments/create-order/  - Create Razorpay order
POST /api/payments/verify-payment/ - Verify payment
```

See: [backend/README.md](backend/README.md)

## 🧪 Testing Guide

### Unit Tests
- Backend: `python manage.py test`
- Frontend: `npm run test`

### Integration Tests
- Test full user flows (signup → login → create tree → payment)
- Test API endpoints with cURL or Postman

### Manual Testing Checklist
- [ ] User registration/login
- [ ] Google OAuth login
- [ ] Create/edit/delete family trees
- [ ] Add/edit/remove family members
- [ ] Photo upload
- [ ] Subscription upgrade with Razorpay
- [ ] Export as PNG/PDF
- [ ] Share functionality
- [ ] Mobile responsiveness
- [ ] Browser compatibility (Chrome, Firefox, Safari)

See: [CONTRIBUTING.md](CONTRIBUTING.md)

## 🚨 Troubleshooting

### Common Issues

**Database connection error**
- Check PostgreSQL is running
- Verify credentials in `backend/.env`
- See: [README.md](README.md#troubleshooting)

**CORS errors**
- Check `CORS_ALLOWED_ORIGINS` includes frontend URL
- Restart both servers after .env changes

**Google OAuth not working**
- Verify Client ID in both .env files
- Check authorized origins in Google Console

**Razorpay checkout not opening**
- Check Key ID in both .env files
- Ensure Razorpay script loaded in index.html

See: [README.md](README.md#troubleshooting)

## 📞 Getting Help

1. **Search documentation** - Check this index
2. **Check README** - [README.md](README.md)
3. **Review component docs** - [backend/README.md](backend/README.md) or [frontend/README.md](frontend/README.md)
4. **Check existing issues** - GitHub Issues
5. **Ask the team** - Slack/Discord
6. **Create new issue** - With `question` label

## 🎯 Roadmap

See what's coming next:

### High Priority
- Email verification
- Password reset
- Advanced tree visualization
- Mobile app

### Good First Issues
- UI/UX improvements
- Documentation updates
- Test coverage
- Translation improvements

See: [CONTRIBUTING.md](CONTRIBUTING.md#areas-to-contribute)

## 📝 Quick Reference

### Environment Setup
```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev
```

### Git Workflow
```bash
git checkout -b feature/name
# Make changes
git add .
git commit -m "Add: description"
git push origin feature/name
# Create PR
```

### Common Commands
```bash
# Django
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py test

# React
npm install
npm run dev
npm run build
npm run test
```

---

**Last Updated:** August 2026  
**Powered by:** Provegaa Tech Hub

For the most up-to-date information, always check [README.md](README.md) first.
