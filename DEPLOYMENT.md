# Vamsapattika Deployment Guide

Complete guide for deploying Vamsapattika to production.

---

## 🎯 Choose Your Deployment Platform

### Option 1: GoDaddy VPS (Ubuntu 22.04) ⭐ **YOUR SETUP**

**You have a GoDaddy VPS with Ubuntu 22.04?**  
👉 **Use this guide: [DEPLOYMENT_GODADDY_VPS.md](DEPLOYMENT_GODADDY_VPS.md)**

Complete step-by-step guide for:
- Ubuntu 22.04 server setup
- PostgreSQL, Python, Node.js, Nginx installation
- Django deployment with Gunicorn
- React build deployment
- SSL setup with Let's Encrypt
- Automated backups
- Deployment update scripts

### Option 2: Platform-as-a-Service (Railway, Vercel, Heroku)

**Prefer managed hosting?**  
Continue reading this guide for Railway/Vercel/Heroku deployment.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] All features tested locally
- [ ] Production database ready (PostgreSQL)
- [ ] Production API credentials (Google OAuth, Razorpay LIVE keys)
- [ ] Domain name (optional but recommended)
- [ ] SSL certificate (handled by most platforms)
- [ ] Backup strategy planned
- [ ] Monitoring setup planned

---

## 🎯 Deployment Overview

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Users/Clients                      │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│          Frontend (React + Vite)                     │
│          Deployed on: Vercel/Netlify                 │
│          URL: https://vamsapattika.com               │
└────────────────────┬────────────────────────────────┘
                     │
                     │ API Requests
                     ▼
┌─────────────────────────────────────────────────────┐
│          Backend (Django + DRF)                      │
│          Deployed on: Railway/Heroku/AWS             │
│          URL: https://api.vamsapattika.com           │
└────────────────────┬────────────────────────────────┘
                     │
                     │ Database Queries
                     ▼
┌─────────────────────────────────────────────────────┐
│          Database (PostgreSQL)                       │
│          Hosted on: Railway/Heroku/AWS RDS           │
└─────────────────────────────────────────────────────┘
```

### Recommended Platforms

| Component | Recommended Platform | Alternative |
|-----------|---------------------|-------------|
| **Frontend** | Vercel | Netlify, AWS S3 + CloudFront |
| **Backend** | Railway | Heroku, AWS EC2, DigitalOcean |
| **Database** | Railway PostgreSQL | Heroku Postgres, AWS RDS |
| **Media Files** | Backend server | AWS S3, Cloudinary |

---

## 🚀 Backend Deployment

### Option 1: Railway (Recommended - Easiest)

Railway provides easy Django deployment with built-in PostgreSQL.

#### Step 1: Prepare Django for Production

1. **Update `settings.py` for production:**

```python
# backend/vamsapattika_backend/settings.py

import os
from pathlib import Path
from decouple import config
import dj_database_url

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=False, cast=bool)

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY')

# Hosts
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost').split(',')

# Database - Use DATABASE_URL for production
DATABASES = {
    'default': dj_database_url.config(
        default=config('DATABASE_URL'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Security Settings (Production only)
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
```

2. **Create `Procfile` in backend directory:**

```bash
cd backend
cat > Procfile << 'EOF'
web: gunicorn vamsapattika_backend.wsgi --log-file -
release: python manage.py migrate && python manage.py create_plans
EOF
```

3. **Create `runtime.txt`:**

```bash
cat > runtime.txt << 'EOF'
python-3.11.5
EOF
```

4. **Update `requirements.txt`:**

```bash
# Make sure these are in requirements.txt
pip install gunicorn whitenoise dj-database-url
pip freeze > requirements.txt
```

#### Step 2: Deploy to Railway

1. **Sign up at [Railway](https://railway.app/)**

2. **Create new project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Add PostgreSQL:**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will create database and set `DATABASE_URL` automatically

4. **Configure environment variables:**
   
   Go to backend service → Variables:
   ```env
   DEBUG=False
   SECRET_KEY=<generate-new-secure-key>
   ALLOWED_HOSTS=your-app.railway.app,vamsapattika.com
   DATABASE_URL=<automatically-set-by-railway>
   
   # CORS - Update after deploying frontend
   CORS_ALLOWED_ORIGINS=https://vamsapattika.com,https://www.vamsapattika.com
   CSRF_TRUSTED_ORIGINS=https://vamsapattika.com,https://www.vamsapattika.com
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # Razorpay LIVE Keys
   RAZORPAY_KEY_ID=rzp_live_xxxxx
   RAZORPAY_KEY_SECRET=your_razorpay_live_secret
   
   # Frontend URL
   FRONTEND_URL=https://vamsapattika.com
   ```

5. **Deploy:**
   - Railway automatically deploys on git push
   - Check logs for any errors
   - Note your backend URL: `https://your-app.railway.app`

6. **Run initial setup commands:**
   
   In Railway dashboard → service → Terminal:
   ```bash
   python manage.py createsuperuser
   python manage.py collectstatic --noinput
   ```

#### Step 3: Configure Custom Domain (Optional)

1. In Railway dashboard → Settings → Domains
2. Add your custom domain (e.g., `api.vamsapattika.com`)
3. Add CNAME record in your DNS:
   ```
   CNAME  api  your-app.railway.app
   ```

---

### Option 2: Heroku

1. **Install Heroku CLI:**
   ```bash
   brew install heroku/brew/heroku  # macOS
   # or download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login and create app:**
   ```bash
   heroku login
   cd backend
   heroku create vamsapattika-api
   ```

3. **Add PostgreSQL:**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

4. **Set environment variables:**
   ```bash
   heroku config:set DEBUG=False
   heroku config:set SECRET_KEY='your-secure-secret-key'
   heroku config:set ALLOWED_HOSTS='vamsapattika-api.herokuapp.com'
   heroku config:set GOOGLE_CLIENT_ID='your_google_client_id'
   heroku config:set RAZORPAY_KEY_ID='rzp_live_xxxxx'
   # ... set all other variables
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

6. **Run migrations:**
   ```bash
   heroku run python manage.py migrate
   heroku run python manage.py createsuperuser
   heroku run python manage.py create_plans
   ```

---

### Option 3: AWS EC2 (Advanced)

See **[AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md)** for detailed AWS setup.

Quick overview:
1. Launch EC2 instance (Ubuntu 22.04)
2. Install Python, PostgreSQL, Nginx
3. Setup application with Gunicorn
4. Configure Nginx as reverse proxy
5. Setup SSL with Let's Encrypt
6. Configure Supervisor for process management

---

## 🎨 Frontend Deployment

### Option 1: Vercel (Recommended - Easiest)

Perfect for React/Vite apps with automatic deployments.

#### Step 1: Prepare Frontend for Production

1. **Update API URL in production:**

Create `frontend/.env.production`:
```env
VITE_API_URL=https://api.vamsapattika.com/api
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

2. **Update Google OAuth authorized origins:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Add production URL to authorized origins:
     - `https://vamsapattika.com`
     - `https://www.vamsapattika.com`

3. **Test production build locally:**
```bash
cd frontend
npm run build
npm run preview
```

#### Step 2: Deploy to Vercel

**Method 1: Using Vercel Dashboard**

1. Sign up at [Vercel](https://vercel.com/)
2. Click "New Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. Add environment variables:
   ```
   VITE_API_URL=https://api.vamsapattika.com/api
   VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

6. Click "Deploy"

**Method 2: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Deploy to production
vercel --prod
```

#### Step 3: Configure Custom Domain

1. Go to Project Settings → Domains
2. Add your domain: `vamsapattika.com`
3. Add DNS records as instructed by Vercel

---

### Option 2: Netlify

1. **Sign up at [Netlify](https://www.netlify.com/)**

2. **Deploy via Git:**
   - New site from Git
   - Connect repository
   - Build settings:
     ```
     Base directory: frontend
     Build command: npm run build
     Publish directory: frontend/dist
     ```

3. **Add environment variables:**
   - Site settings → Environment variables
   - Add all `VITE_*` variables

4. **Deploy**

5. **Configure custom domain:**
   - Domain settings → Add custom domain
   - Update DNS records

---

### Option 3: AWS S3 + CloudFront

For static hosting with CDN:

```bash
cd frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://vamsapattika.com --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

See **[AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md)** for detailed setup.

---

## 🗄️ Database Migration

### From Local to Production

1. **Export local data:**
```bash
pg_dump vamsapattika_db > backup.sql
```

2. **Import to production:**

**Railway:**
```bash
# Get database connection string from Railway dashboard
psql <railway-database-url> < backup.sql
```

**Heroku:**
```bash
heroku pg:psql < backup.sql
```

3. **Verify data:**
```bash
# Connect to production database
psql <production-database-url>
\dt  # List tables
SELECT COUNT(*) FROM accounts_user;
SELECT COUNT(*) FROM family_trees_familytree;
```

---

## 🔐 Security Checklist

Before going live:

### Django Backend
- [ ] `DEBUG=False` in production
- [ ] Strong, unique `SECRET_KEY`
- [ ] Proper `ALLOWED_HOSTS` configuration
- [ ] HTTPS enabled (SSL certificate)
- [ ] Security headers enabled (HSTS, CSP, etc.)
- [ ] CORS properly configured
- [ ] Database credentials secured
- [ ] API rate limiting configured
- [ ] Error logging setup (Sentry)
- [ ] Regular backups scheduled

### React Frontend
- [ ] Environment variables set correctly
- [ ] No sensitive data in client-side code
- [ ] Production build optimized
- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] XSS protection enabled

### Third-party Services
- [ ] Google OAuth using production credentials
- [ ] Razorpay using **LIVE keys** (not test keys)
- [ ] Proper redirect URLs configured
- [ ] Webhook URLs configured (if applicable)

---

## 📊 Post-Deployment Setup

### 1. Django Admin Setup

```bash
# Create superuser on production
# Railway:
railway run python manage.py createsuperuser

# Heroku:
heroku run python manage.py createsuperuser
```

Access admin at: `https://api.vamsapattika.com/admin/`

### 2. Initial Data Setup

```bash
# Create subscription plans
railway run python manage.py create_plans

# Or via Django admin:
# Login → Payments → Subscription Plans → Add
```

### 3. Test Complete Flow

1. **User Registration:**
   - Go to `https://vamsapattika.com`
   - Sign up with email
   - Sign in with Google

2. **Family Tree:**
   - Create new tree
   - Add family members
   - Upload photos
   - Export as PNG/PDF

3. **Payment:**
   - Upgrade to Silver/Gold/Diamond
   - Complete payment with Razorpay
   - Verify subscription activated

4. **API Health:**
   - Test all API endpoints
   - Check response times
   - Monitor error logs

---

## 🔍 Monitoring & Logging

### Backend Monitoring

**Option 1: Sentry (Recommended)**

1. Sign up at [Sentry.io](https://sentry.io/)
2. Create Django project
3. Install SDK:
   ```bash
   pip install sentry-sdk
   ```

4. Configure in `settings.py`:
   ```python
   import sentry_sdk
   from sentry_sdk.integrations.django import DjangoIntegration
   
   sentry_sdk.init(
       dsn=config('SENTRY_DSN'),
       integrations=[DjangoIntegration()],
       traces_sample_rate=1.0,
       send_default_pii=True,
       environment='production' if not DEBUG else 'development',
   )
   ```

**Option 2: Platform Logs**

- **Railway:** Dashboard → Logs
- **Heroku:** `heroku logs --tail`
- **AWS:** CloudWatch Logs

### Frontend Monitoring

**Vercel Analytics:**
- Enabled automatically on Vercel
- View in dashboard → Analytics

**Google Analytics:**
```javascript
// Add to frontend/index.html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 💾 Backup Strategy

### Automated Database Backups

**Railway:**
- Automatic daily backups included
- Manual backup: Database → Backups → Create

**Heroku:**
```bash
# Install backup addon
heroku addons:create heroku-postgresql-backups

# Manual backup
heroku pg:backups:capture
heroku pg:backups:download
```

**Custom Backup Script:**

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_URL="your-production-database-url"

# Create backup
pg_dump $DB_URL > "$BACKUP_DIR/backup_$DATE.sql"

# Upload to S3 (optional)
aws s3 cp "$BACKUP_DIR/backup_$DATE.sql" s3://vamsapattika-backups/

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql"
```

**Schedule with cron:**
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

---

## 🚨 Troubleshooting Production Issues

### Backend Issues

**500 Internal Server Error:**
```bash
# Check logs
railway logs  # Railway
heroku logs --tail  # Heroku

# Common causes:
# - DEBUG=True in production
# - Missing environment variables
# - Database connection issues
# - Static files not collected
```

**Static Files Not Loading:**
```bash
# Collect static files
python manage.py collectstatic --noinput

# Check WhiteNoise configuration in settings.py
```

**Database Connection Error:**
```bash
# Verify DATABASE_URL is set
railway variables  # Railway
heroku config  # Heroku

# Test connection
psql $DATABASE_URL
```

### Frontend Issues

**API Calls Failing (CORS):**
- Check `CORS_ALLOWED_ORIGINS` includes frontend URL
- Verify `VITE_API_URL` is correct
- Check browser console for errors

**Environment Variables Not Working:**
- Redeploy after adding variables
- Check variables start with `VITE_`
- Rebuild: `npm run build`

**404 on Refresh:**
- Add `_redirects` file for Netlify:
  ```
  /* /index.html 200
  ```
- Vercel handles this automatically

---

## 🔄 CI/CD Setup (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  backend-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        run: |
          npm i -g @railway/cli
          railway link ${{ secrets.RAILWAY_TOKEN }}
          railway up

  frontend-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
```

---

## 📈 Performance Optimization

### Backend
- Enable database connection pooling
- Use Redis for caching (optional)
- Optimize database queries
- Enable gzip compression
- Use CDN for static files

### Frontend
- Code splitting (Vite does automatically)
- Image optimization
- Lazy loading
- Browser caching
- CDN for assets

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks

**Weekly:**
- [ ] Check error logs
- [ ] Monitor disk space
- [ ] Review performance metrics

**Monthly:**
- [ ] Update dependencies
- [ ] Review security advisories
- [ ] Verify backups working
- [ ] Check SSL certificate expiry

**Quarterly:**
- [ ] Security audit
- [ ] Performance review
- [ ] Database optimization
- [ ] Cost review

---

## 📚 Additional Resources

- [Django Deployment Checklist](https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/)
- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)

---

**Need help?** Check [README.md](README.md) or create an issue.

**Last Updated:** August 2026  
**Powered by:** Provegaa Tech Hub
