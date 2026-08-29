# Vamsapattika Setup Checklist

Complete checklist for development and production setup.

---

## 📦 Code & Documentation

### ✅ Completed

- [x] Django backend structure
- [x] React frontend structure
- [x] User authentication (JWT)
- [x] Family tree CRUD operations
- [x] Google OAuth integration (code)
- [x] Razorpay payment integration (code)
- [x] Subscription plans system
- [x] All documentation files
- [x] Deployment guides (GoDaddy VPS)
- [x] Testing guides
- [x] Setup scripts (.sh, .bat)
- [x] Production .env templates

---

## 🔧 Development Environment Setup

### Backend

- [ ] **PostgreSQL Database**
  - [ ] PostgreSQL installed
  - [ ] Database created: `vamsapattika_db`
  - [ ] User created: `vamsapattika_user`
  - [ ] Permissions granted

- [ ] **Python Environment**
  - [ ] Python 3.10+ installed
  - [ ] Virtual environment created
  - [ ] Dependencies installed (`pip install -r requirements.txt`)

- [ ] **Backend Configuration**
  - [ ] `backend/.env` file created (copy from `.env.example`)
  - [ ] `DEBUG=True` for development
  - [ ] `DATABASE_URL` configured
  - [ ] `SECRET_KEY` set (any value for dev)
  - [x] `RAZORPAY_KEY_ID` = `rzp_live_TTYsoLLExJH7va` (✅ DONE)
  - [x] `RAZORPAY_KEY_SECRET` = configured (✅ DONE)
  - [ ] `GOOGLE_CLIENT_ID` (need from Google Cloud Console)
  - [ ] `GOOGLE_CLIENT_SECRET` (need from Google Cloud Console)

- [ ] **Database Initialization**
  - [ ] Migrations run: `python manage.py migrate`
  - [ ] Superuser created: `python manage.py createsuperuser`
  - [ ] Subscription plans created: `python manage.py create_plans`

- [ ] **Backend Running**
  - [ ] Server starts: `python manage.py runserver`
  - [ ] Admin accessible: `http://localhost:8000/admin/`
  - [ ] API accessible: `http://localhost:8000/api/`

### Frontend

- [ ] **Node.js Environment**
  - [ ] Node.js 18+ installed
  - [ ] Dependencies installed (`npm install`)

- [ ] **Frontend Configuration**
  - [ ] `frontend/.env` file created (copy from `.env.example`)
  - [x] `VITE_API_URL` = `http://localhost:8000/api` (✅ in your .env)
  - [x] `VITE_RAZORPAY_KEY_ID` = `rzp_live_TTYsoLLExJH7va` (✅ DONE)
  - [ ] `VITE_GOOGLE_CLIENT_ID` (need from Google Cloud Console)

- [ ] **Frontend Running**
  - [ ] Server starts: `npm run dev`
  - [ ] App accessible: `http://localhost:5173`
  - [ ] No console errors

---

## 🔑 API Credentials Setup

### Google OAuth

- [ ] **Google Cloud Console Setup**
  - [ ] Project created
  - [ ] OAuth consent screen configured
  - [ ] OAuth 2.0 Client ID created
  - [ ] **Authorized JavaScript origins added:**
    - [ ] `http://localhost:5173` (development)
    - [ ] Your production domain (when deploying)
  - [ ] **Authorized redirect URIs added:**
    - [ ] `http://localhost:5173` (development)
    - [ ] `http://localhost:8000` (development)
    - [ ] Your production domains (when deploying)

- [ ] **Credentials Added to .env**
  - [ ] `GOOGLE_CLIENT_ID` in `backend/.env`
  - [ ] `GOOGLE_CLIENT_SECRET` in `backend/.env`
  - [ ] `VITE_GOOGLE_CLIENT_ID` in `frontend/.env`

### Razorpay Payment Gateway

- [x] **Razorpay Dashboard**
  - [x] Account created
  - [x] **LIVE Mode Keys generated** (✅ DONE)
  - [x] Keys added to both backend and frontend .env files

- [ ] **Additional Razorpay Setup**
  - [ ] KYC verification completed (required for live payments)
  - [ ] Payment methods configured
  - [ ] Webhook URL configured (optional): `https://api.yourdomain.com/api/payments/webhook/`

---

## 🧪 Testing Checklist

### Local Testing (Before Production)

- [ ] **User Authentication**
  - [ ] Register new user works
  - [ ] Login with email/password works
  - [ ] JWT tokens working
  - [ ] Protected routes working

- [ ] **Google OAuth** (needs Google credentials)
  - [ ] "Sign in with Google" button appears
  - [ ] Google login flow works
  - [ ] User created/logged in successfully

- [ ] **Family Tree Features**
  - [ ] Create new tree
  - [ ] Add family members
  - [ ] Edit family members
  - [ ] Delete family members
  - [ ] Upload photos
  - [ ] Export as PNG
  - [ ] Export as PDF
  - [ ] Share functionality

- [ ] **Payment & Subscription**
  - [ ] Pricing modal displays
  - [ ] Plans show ₹1 for testing (Silver, Gold, Diamond)
  - [ ] Razorpay checkout opens
  - [ ] Payment with ₹1 succeeds
  - [ ] Subscription updates after payment
  - [ ] Card limit increases
  - [ ] Can add more family members

- [ ] **Database Records**
  - [ ] User accounts created
  - [ ] Family trees saved
  - [ ] Payment transactions recorded
  - [ ] User subscriptions updated

---

## 🚀 Production Deployment (GoDaddy VPS)

### Server Preparation

- [ ] **GoDaddy VPS Access**
  - [ ] SSH access working
  - [ ] Root or sudo access available
  - [ ] Domain pointed to VPS IP

- [ ] **Server Software Installation**
  - [ ] Ubuntu 22.04 confirmed
  - [ ] System updated: `apt update && apt upgrade`
  - [ ] Python 3.11 installed
  - [ ] PostgreSQL 14 installed
  - [ ] Node.js 18 installed
  - [ ] Nginx installed
  - [ ] Certbot installed

### Production Configuration

- [ ] **Backend Production Setup**
  - [ ] Code deployed to `/home/vamsapattika/app/backend`
  - [ ] `backend/.env.production` configured with:
    - [ ] Strong `SECRET_KEY` (generated, not development key)
    - [ ] `DEBUG=False` ⚠️ CRITICAL
    - [ ] Production `DATABASE_URL`
    - [ ] Production `ALLOWED_HOSTS` (your domain)
    - [ ] Production `CORS_ALLOWED_ORIGINS`
    - [x] `RAZORPAY_KEY_ID` (LIVE) - ✅ DONE
    - [x] `RAZORPAY_KEY_SECRET` (LIVE) - ✅ DONE
    - [ ] `GOOGLE_CLIENT_ID` (production)
    - [ ] `GOOGLE_CLIENT_SECRET` (production)
    - [ ] `FRONTEND_URL` (production domain)

- [ ] **Frontend Production Setup**
  - [ ] `frontend/.env.production` configured with:
    - [ ] Production `VITE_API_URL` (https://api.yourdomain.com/api)
    - [x] `VITE_RAZORPAY_KEY_ID` (LIVE) - ✅ DONE
    - [ ] `VITE_GOOGLE_CLIENT_ID` (production)
  - [ ] Production build created: `npm run build`
  - [ ] Build deployed to `/var/www/vamsapattika/`

### Production Services

- [ ] **Gunicorn Service**
  - [ ] Systemd service file created
  - [ ] Service started and enabled
  - [ ] Socket file created
  - [ ] Logs accessible

- [ ] **Nginx Configuration**
  - [ ] Site config created
  - [ ] Reverse proxy for API configured
  - [ ] Static files serving configured
  - [ ] Frontend routing configured
  - [ ] Configuration tested: `nginx -t`
  - [ ] Service restarted

- [ ] **SSL/HTTPS**
  - [ ] Certbot certificates obtained
  - [ ] HTTPS working for all domains
  - [ ] HTTP redirects to HTTPS
  - [ ] Auto-renewal configured

- [ ] **Database Production**
  - [ ] PostgreSQL database created
  - [ ] Migrations run
  - [ ] Superuser created
  - [ ] Subscription plans created (with production prices!)

### Production Testing

- [ ] **Deployment Verification**
  - [ ] Frontend loads: `https://yourdomain.com`
  - [ ] Backend API works: `https://api.yourdomain.com/api/`
  - [ ] Admin panel works: `https://api.yourdomain.com/admin/`
  - [ ] SSL certificates valid
  - [ ] No mixed content warnings

- [ ] **Full Flow Testing**
  - [ ] User registration works
  - [ ] Email/password login works
  - [ ] Google OAuth works (production credentials)
  - [ ] Create family tree works
  - [ ] Payment gateway works (LIVE keys, real money!)
  - [ ] Subscription upgrades correctly
  - [ ] Export features work
  - [ ] Share features work

### Production Monitoring

- [ ] **Backups**
  - [ ] Backup script created
  - [ ] Cron job scheduled (daily backups)
  - [ ] Backup tested successfully
  - [ ] Restore tested successfully

- [ ] **Monitoring**
  - [ ] Log rotation configured
  - [ ] Error monitoring (Sentry optional)
  - [ ] Uptime monitoring
  - [ ] Disk space monitoring
  - [ ] SSL expiry monitoring

---

## 📊 Current Status Summary

### ✅ What's Done

1. **Code Complete:**
   - All features implemented
   - Google OAuth integrated (code ready)
   - Razorpay payment integrated (code ready)
   - Full documentation created

2. **Razorpay Configured:**
   - LIVE keys in backend `.env.production`
   - LIVE keys in frontend `.env.production`
   - LIVE keys in development `.env` files
   - Test prices set to ₹1

3. **Documentation:**
   - Complete setup guides
   - Deployment guides (GoDaddy VPS)
   - Testing guides
   - Troubleshooting guides

### ⚠️ What's Pending

1. **Google OAuth Credentials:**
   - Need to create in Google Cloud Console
   - Need to add to .env files
   - Need to configure authorized origins

2. **Production Environment Variables:**
   - Need actual domain name
   - Need to generate production SECRET_KEY
   - Need to update all `yourdomain.com` placeholders

3. **Local Development Setup:**
   - Need to run database migrations
   - Need to create superuser
   - Need to create subscription plans
   - Need to test all features

4. **Production Deployment:**
   - Need to follow GoDaddy VPS deployment guide
   - Need to configure server
   - Need to deploy code
   - Need to test production

---

## 🎯 Next Steps (Priority Order)

### Immediate (For Local Testing)

1. **Setup Local Database**
   ```bash
   # Create PostgreSQL database
   createdb vamsapattika_db
   createuser vamsapattika_user
   ```

2. **Run Backend Setup**
   ```bash
   cd backend
   source venv/bin/activate
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py create_plans  # Creates plans with ₹1 prices
   python manage.py runserver
   ```

3. **Test Payment Gateway (₹1)**
   - Start frontend: `npm run dev`
   - Test signup/login
   - Test payment with ₹1
   - Follow: [TESTING_PAYMENT_GATEWAY.md](TESTING_PAYMENT_GATEWAY.md)

4. **Get Google OAuth Credentials**
   - Create in Google Cloud Console
   - Add to .env files
   - Test Google login

### Before Production Deployment

1. **Update Prices to Production Values**
   - Edit `create_plans.py` (₹499, ₹999, ₹1499)
   - Run `python manage.py create_plans` again

2. **Configure Production .env Files**
   - Generate new SECRET_KEY
   - Add your actual domain
   - Add Google OAuth production credentials

3. **Complete Razorpay Production Setup**
   - Ensure KYC completed
   - Configure webhooks
   - Test with small real payment

4. **Follow Deployment Guide**
   - [DEPLOYMENT_GODADDY_VPS.md](DEPLOYMENT_GODADDY_VPS.md)
   - Complete all 12 parts
   - Test thoroughly

---

## 📚 Quick Reference

### Documentation Files

- **[README.md](README.md)** - Main project documentation
- **[DEPLOYMENT_GODADDY_VPS.md](DEPLOYMENT_GODADDY_VPS.md)** - Full VPS deployment guide
- **[PRODUCTION_ENV_SETUP.md](PRODUCTION_ENV_SETUP.md)** - Environment variables guide
- **[TESTING_PAYMENT_GATEWAY.md](TESTING_PAYMENT_GATEWAY.md)** - Payment testing guide
- **[DEPLOYMENT_CHEATSHEET.md](DEPLOYMENT_CHEATSHEET.md)** - Quick commands
- **[ENV_FILES_README.md](ENV_FILES_README.md)** - .env files explained

### Important Commands

```bash
# Backend
python manage.py migrate
python manage.py createsuperuser
python manage.py create_plans
python manage.py runserver

# Frontend
npm install
npm run dev
npm run build

# Deployment
./deploy.sh
./backup.sh
```

---

**Current Progress: ~60% Complete**

- ✅ Code: 100%
- ✅ Documentation: 100%
- ⚠️ Configuration: 70% (Razorpay done, Google OAuth pending)
- ⚠️ Local Testing: 0% (ready to test)
- ⚠️ Production: 0% (ready to deploy)

**Last Updated:** August 2026
