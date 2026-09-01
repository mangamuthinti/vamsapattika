# 🚀 Vamsapattika - Complete Production Deployment Guide

**Complete step-by-step guide for deploying Vamsapattika to GoDaddy VPS (Ubuntu 22.04)**

**Date:** August 31, 2026  
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Database Configuration](#database-configuration)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Nginx Configuration](#nginx-configuration)
7. [SSL Setup](#ssl-setup)
8. [Verification & Testing](#verification--testing)
9. [Future Updates](#future-updates)
10. [Troubleshooting](#troubleshooting)
11. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### What You Need Before Starting:

- ✅ **GoDaddy VPS** running Ubuntu 22.04
- ✅ **VPS IP Address** (e.g., 148.66.156.201)
- ✅ **Root/SSH Access** to VPS
- ✅ **Domain Name** (vamsapattika.com)
- ✅ **DNS Configured** (A records pointing to VPS IP)
- ✅ **GitHub Repository** (https://github.com/mangamuthinti/vamsapattika.git)
- ✅ **Production Credentials:**
  - Database password: `vamsapattika@123`
  - Email password: `Vamsapattika@2025`
  - Razorpay LIVE keys
  - Django SECRET_KEY

### Software Versions:

| Software | Version |
|----------|---------|
| Ubuntu | 22.04 LTS |
| Python | 3.11.15 |
| Node.js | 20.20.2 |
| PostgreSQL | 14.24 |
| Nginx | 1.18+ |
| Django | 4.2+ |
| React | 18+ |

---

## 🖥️ Server Setup

### Step 1: Connect to VPS

**From Windows PowerShell:**

```powershell
# Connect via SSH as root
ssh root@148.66.156.201
# Enter root password when prompted
```

**You should see:**
```
root@201:~#
```

### Step 2: Update System & Install Essential Tools

```bash
# Update system packages
apt update && apt upgrade -y

# Install essential tools
apt install -y build-essential git curl wget vim software-properties-common ufw

# Setup firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Verify firewall
ufw status
```

**Expected output:**
```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
Nginx Full                 ALLOW       Anywhere
```

### Step 3: Install Python 3.11

```bash
# Add Python repository
add-apt-repository ppa:deadsnakes/ppa -y
apt update

# Install Python 3.11
apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Verify installation
python3.11 --version
# Output: Python 3.11.15
```

### Step 4: Install PostgreSQL

```bash
# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Verify PostgreSQL is running
systemctl status postgresql
```

### Step 5: Install Node.js

```bash
# Install Node.js 18.x (or 20.x will be installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 6: Install Nginx

```bash
# Install Nginx
apt install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Verify Nginx is running
systemctl status nginx
```

---

## 🗄️ Database Configuration

### Step 1: Create PostgreSQL Database

```bash
# Connect to PostgreSQL as postgres user
sudo -u postgres psql
```

### Step 2: Run Database Setup Commands

**In PostgreSQL shell (postgres=#):**

```sql
-- Create database
CREATE DATABASE vamsapattika_db;

-- Create user with password
CREATE USER vamsapattika_user WITH PASSWORD 'vamsapattika@123';

-- Configure user
ALTER ROLE vamsapattika_user SET client_encoding TO 'utf8';
ALTER ROLE vamsapattika_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE vamsapattika_user SET timezone TO 'UTC';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE vamsapattika_db TO vamsapattika_user;
ALTER DATABASE vamsapattika_db OWNER TO vamsapattika_user;

-- Connect to database and grant schema permissions
\c vamsapattika_db
GRANT ALL ON SCHEMA public TO vamsapattika_user;

-- Exit PostgreSQL
\q
```

### Step 3: Test Database Connection

```bash
# Test connection
sudo -u postgres psql -d vamsapattika_db -c "SELECT version();"
```

**Expected:** PostgreSQL version information

---

## 🐍 Backend Deployment

### Step 1: Clone Repository

```bash
# Create /var/www directory
mkdir -p /var/www

# Navigate to /var/www
cd /var/www

# Clone repository
git clone https://github.com/mangamuthinti/vamsapattika.git

# Verify clone
ls -la vamsapattika/
```

**Project structure:**
```
/var/www/vamsapattika/
├── backend/
├── frontend/
├── README.md
└── ...
```

### Step 2: Create Backend .env.production

```bash
# Navigate to backend
cd /var/www/vamsapattika/backend

# Create .env.production file
nano .env.production
```

**Paste this content:**

```bash
# Django Configuration
SECRET_KEY=z6j0&b6u@vq1)20efzxxxva3_0&hv49t-qzi+iq6wmcy#+!p7%
DEBUG=False
ALLOWED_HOSTS=vamsapattika.com,www.vamsapattika.com,api.vamsapattika.com

# Database
DATABASE_URL=postgresql://vamsapattika_user:vamsapattika@123@localhost:5432/vamsapattika_db

# CORS Settings
CORS_ALLOWED_ORIGINS=https://vamsapattika.com,https://www.vamsapattika.com
CSRF_TRUSTED_ORIGINS=https://vamsapattika.com,https://www.vamsapattika.com

# Razorpay (LIVE MODE)
RAZORPAY_KEY_ID=rzp_live_TTYsoLLExJH7va
RAZORPAY_KEY_SECRET=xEUHopD5WW3KkfTc2PWO9L5q

# Email (GoDaddy SMTP)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtpout.secureserver.net
EMAIL_PORT=465
EMAIL_USE_SSL=True
EMAIL_HOST_USER=support@vamsapattika.com
EMAIL_HOST_PASSWORD=Vamsapattika@2025
DEFAULT_FROM_EMAIL=support@vamsapattika.com

# Frontend URL
FRONTEND_URL=https://vamsapattika.com

# Logging
DJANGO_LOG_LEVEL=INFO
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

### Step 3: Copy to .env

```bash
# Copy production settings to .env
cp .env.production .env

# Verify
head -10 .env
```

### Step 4: Setup Python Virtual Environment

```bash
# Create virtual environment
python3.11 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies (takes 3-5 minutes)
pip install -r requirements.txt
```

### Step 5: Run Database Migrations

```bash
# Run migrations
python manage.py migrate

# Create subscription plans
python manage.py create_plans

# Collect static files
python manage.py collectstatic --noinput

# Create superuser
python manage.py createsuperuser
# Enter username, email, and password when prompted
```

**Expected output from create_plans:**
```
✓ Created plan: Free (₹0, max 4 cards)
✓ Created plan: Silver (₹499, max 10 cards)
✓ Created plan: Gold (₹999, max 18 cards)
✓ Created plan: Diamond (₹1499, unlimited cards)
```

### Step 6: Configure Gunicorn Service

```bash
# Exit virtual environment
deactivate

# Create systemd service file
nano /etc/systemd/system/gunicorn.service
```

**Paste this content:**

```ini
[Unit]
Description=Gunicorn daemon for Vamsapattika
After=network.target

[Service]
User=root
Group=www-data
WorkingDirectory=/var/www/vamsapattika/backend
ExecStart=/var/www/vamsapattika/backend/venv/bin/gunicorn \
    --workers 3 \
    --bind unix:/var/www/vamsapattika/backend/gunicorn.sock \
    config.wsgi:application

[Install]
WantedBy=multi-user.target
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

### Step 7: Start Gunicorn

```bash
# Reload systemd
systemctl daemon-reload

# Start Gunicorn
systemctl start gunicorn

# Enable on boot
systemctl enable gunicorn

# Check status
systemctl status gunicorn
```

**Expected:** `Active: active (running)`

---

## ⚛️ Frontend Deployment

### Step 1: Create Frontend .env.production

```bash
# Navigate to frontend
cd /var/www/vamsapattika/frontend

# Create .env.production file
nano .env.production
```

**Paste this content:**

```bash
# Backend API URL (Production)
VITE_API_URL=https://api.vamsapattika.com/api

# Razorpay LIVE Key
VITE_RAZORPAY_KEY_ID=rzp_live_TTYsoLLExJH7va
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

### Step 2: Copy to .env

```bash
# Copy production settings
cp .env.production .env

# Verify
cat .env
```

### Step 3: Install Dependencies & Build

```bash
# Install npm packages (takes 2-3 minutes)
npm install

# Build production bundle (takes 1-2 minutes)
npm run build

# Verify dist folder was created
ls -la dist/
```

**Expected:** You should see `dist/` folder with `index.html` and `assets/`

---

## 🌐 Nginx Configuration

### Step 1: Remove Default Site

```bash
# Remove default Nginx configuration
rm -f /etc/nginx/sites-enabled/default
```

### Step 2: Create Vamsapattika Configuration

```bash
# Create new configuration
nano /etc/nginx/sites-available/vamsapattika
```

**Paste this content:**

```nginx
# Frontend (vamsapattika.com)
server {
    listen 80;
    server_name vamsapattika.com www.vamsapattika.com;
    
    root /var/www/vamsapattika/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /static/ {
        alias /var/www/vamsapattika/frontend/dist/;
    }
}

# Backend API (api.vamsapattika.com)
server {
    listen 80;
    server_name api.vamsapattika.com;
    
    client_max_body_size 10M;
    
    location /static/ {
        alias /var/www/vamsapattika/backend/staticfiles/;
    }
    
    location /media/ {
        alias /var/www/vamsapattika/backend/media/;
    }
    
    location / {
        proxy_pass http://unix:/var/www/vamsapattika/backend/gunicorn.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

### Step 3: Enable Site

```bash
# Create symbolic link
ln -sf /etc/nginx/sites-available/vamsapattika /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Expected: "test is successful"

# Restart Nginx
systemctl restart nginx

# Check status
systemctl status nginx
```

---

## 🔒 SSL Setup (HTTPS)

### Step 1: Verify DNS Configuration

Before installing SSL certificates, verify your DNS records:

**Run from VPS:**

```bash
# Test DNS resolution
nslookup vamsapattika.com
nslookup www.vamsapattika.com
nslookup api.vamsapattika.com
```

**All three should return your VPS IP: 148.66.156.201**

### DNS Records Required in GoDaddy:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 148.66.156.201 | 600 |
| A | www | 148.66.156.201 | 600 |
| A | api | 148.66.156.201 | 600 |

### Step 2: Install Certbot

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx
```

### Step 3: Get SSL Certificates

```bash
# Request SSL certificates for all domains
certbot --nginx -d vamsapattika.com -d www.vamsapattika.com -d api.vamsapattika.com
```

**You'll be prompted:**

1. **Email address:** Enter your email for renewal notifications
2. **Terms of Service:** Type `Y` to agree
3. **Share email with EFF:** Type `N` (optional)
4. **Expand certificate:** Type `E` if prompted (to add api subdomain)

**Expected output:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/vamsapattika.com/fullchain.pem
Key is saved at: /etc/letsencrypt/live/vamsapattika.com/privkey.pem
This certificate expires on 2026-11-29.
```

### Step 4: Verify SSL Configuration

```bash
# Restart Nginx
systemctl restart nginx

# Check Nginx status
systemctl status nginx
```

**Certbot automatically:**
- ✅ Updates Nginx configuration
- ✅ Adds HTTPS redirects
- ✅ Sets up auto-renewal

---

## ✅ Verification & Testing

### Step 1: Check Service Status

```bash
# Check all services
systemctl status nginx
systemctl status gunicorn
systemctl status postgresql

# Verify Gunicorn socket exists
ls -la /var/www/vamsapattika/backend/gunicorn.sock

# Check logs if needed
journalctl -u gunicorn -n 50
tail -30 /var/log/nginx/error.log
```

### Step 2: Test URLs in Browser

**1. Frontend (React App):**
- https://vamsapattika.com
- Should show: React application homepage ✅

**2. Backend Admin:**
- https://api.vamsapattika.com/admin/
- Should show: Django admin login page ✅

**3. API Endpoints:**
- https://api.vamsapattika.com/api/auth/register/
- Should show: `{"detail":"Method \"GET\" not allowed."}` ✅ (This is correct - POST only)

### Step 3: Test Application Functionality

**Create a test user:**

1. Go to https://vamsapattika.com
2. Click "Sign Up"
3. Register a new account
4. Login with credentials
5. Create a family tree
6. Test subscription upgrade (Razorpay payment)
7. Test feedback form (sends email to support@vamsapattika.com)

**All features should work!** ✅

---

## 🔄 Future Updates

### Updating Code from Git

When you push new code to GitHub, deploy updates like this:

```bash
# 1. Connect to VPS
ssh root@148.66.156.201

# 2. Pull latest code
cd /var/www/vamsapattika
git pull origin main

# 3. Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
deactivate

# 4. Update frontend
cd ../frontend
npm install
npm run build

# 5. Restart services
systemctl restart gunicorn
systemctl restart nginx

# 6. Verify
systemctl status gunicorn
systemctl status nginx
```

### Rolling Back Changes

If something breaks after an update:

```bash
# Revert to previous commit
cd /var/www/vamsapattika
git log --oneline
git reset --hard <commit-hash>

# Rebuild
cd backend
source venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
deactivate

cd ../frontend
npm run build

# Restart services
systemctl restart gunicorn nginx
```

---

## 🚨 Troubleshooting

### Issue 1: Gunicorn Not Starting

**Check logs:**
```bash
journalctl -u gunicorn -n 100
```

**Common causes:**
- Wrong path in service file
- Python dependencies missing
- Database connection error
- Permission issues

**Fix:**
```bash
# Check gunicorn.sock permissions
ls -la /var/www/vamsapattika/backend/gunicorn.sock

# Restart service
systemctl restart gunicorn
```

### Issue 2: Backend API 404 Errors

**Check Nginx configuration:**
```bash
nginx -t
tail -50 /var/log/nginx/error.log
```

**Verify socket connection:**
```bash
ls -la /var/www/vamsapattika/backend/gunicorn.sock
systemctl status gunicorn
```

### Issue 3: Database Connection Errors

**Reset database password:**
```bash
sudo -u postgres psql
ALTER USER vamsapattika_user WITH PASSWORD 'vamsapattika@123';
GRANT ALL PRIVILEGES ON DATABASE vamsapattika_db TO vamsapattika_user;
\q
```

**Test connection:**
```bash
cd /var/www/vamsapattika/backend
source venv/bin/activate
python manage.py dbshell
```

### Issue 4: Frontend Not Loading

**Check build:**
```bash
cd /var/www/vamsapattika/frontend
ls -la dist/
```

**Rebuild if needed:**
```bash
npm run build
systemctl restart nginx
```

### Issue 5: SSL Certificate Errors

**Check certificate status:**
```bash
certbot certificates
```

**Renew manually if needed:**
```bash
certbot renew
systemctl restart nginx
```

### Issue 6: Static Files Not Loading

**Collect static files again:**
```bash
cd /var/www/vamsapattika/backend
source venv/bin/activate
python manage.py collectstatic --noinput
systemctl restart gunicorn nginx
```

---

## 📊 Monitoring & Maintenance

### Daily Monitoring

**Check service status:**
```bash
systemctl status nginx gunicorn postgresql
```

**Check disk space:**
```bash
df -h
```

**Check memory:**
```bash
free -h
```

### Weekly Maintenance

**Check logs for errors:**
```bash
# Gunicorn logs
journalctl -u gunicorn --since "7 days ago" | grep ERROR

# Nginx error logs
tail -100 /var/log/nginx/error.log

# PostgreSQL logs
tail -100 /var/log/postgresql/postgresql-14-main.log
```

**Backup database:**
```bash
# Create backup
sudo -u postgres pg_dump vamsapattika_db > /backup/vamsapattika_db_$(date +%Y%m%d).sql

# List backups
ls -lh /backup/
```

### Monthly Maintenance

**Update system packages:**
```bash
apt update
apt upgrade -y
apt autoremove -y
```

**Check SSL certificate expiration:**
```bash
certbot certificates
```

**Review application metrics:**
- User registrations
- Payment transactions
- API response times
- Error rates

### Log Rotation

Logs are automatically rotated by Ubuntu's logrotate. Configuration at:
- `/etc/logrotate.d/nginx`
- `/etc/logrotate.d/rsyslog`

---

## 📞 Support & Contact

### Key Files & Locations

| Item | Location |
|------|----------|
| **Project Root** | `/var/www/vamsapattika/` |
| **Backend** | `/var/www/vamsapattika/backend/` |
| **Frontend** | `/var/www/vamsapattika/frontend/` |
| **Backend .env** | `/var/www/vamsapattika/backend/.env` |
| **Frontend .env** | `/var/www/vamsapattika/frontend/.env` |
| **Gunicorn Service** | `/etc/systemd/system/gunicorn.service` |
| **Nginx Config** | `/etc/nginx/sites-available/vamsapattika` |
| **SSL Certificates** | `/etc/letsencrypt/live/vamsapattika.com/` |
| **Gunicorn Logs** | `journalctl -u gunicorn` |
| **Nginx Error Log** | `/var/log/nginx/error.log` |
| **Nginx Access Log** | `/var/log/nginx/access.log` |

### Important Credentials

**⚠️ Keep these secure - never commit to Git!**

| Service | Username | Password/Key |
|---------|----------|--------------|
| **Database** | vamsapattika_user | vamsapattika@123 |
| **Email SMTP** | support@vamsapattika.com | Vamsapattika@2025 |
| **Razorpay** | - | rzp_live_TTYsoLLExJH7va (Key ID) |
| **Django Admin** | (created during setup) | (your superuser password) |

### Service URLs

| Service | URL |
|---------|-----|
| **Frontend** | https://vamsapattika.com |
| **Backend API** | https://api.vamsapattika.com/api/ |
| **Admin Panel** | https://api.vamsapattika.com/admin/ |
| **Payment Gateway** | https://dashboard.razorpay.com |

### Email Configuration

| Setting | Value |
|---------|-------|
| **SMTP Host** | smtpout.secureserver.net |
| **Port** | 465 |
| **Use SSL** | Yes |
| **Username** | support@vamsapattika.com |
| **Password** | Vamsapattika@2025 |

---

## 🎯 Quick Reference Commands

### Start/Stop/Restart Services

```bash
# Restart all services
systemctl restart gunicorn nginx postgresql

# Stop all services
systemctl stop gunicorn nginx

# Check status
systemctl status gunicorn nginx postgresql
```

### View Logs

```bash
# Gunicorn logs (last 50 lines)
journalctl -u gunicorn -n 50

# Follow Gunicorn logs in real-time
journalctl -u gunicorn -f

# Nginx error log
tail -f /var/log/nginx/error.log

# Nginx access log
tail -f /var/log/nginx/access.log
```

### Django Management Commands

```bash
cd /var/www/vamsapattika/backend
source venv/bin/activate

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic

# Create subscription plans
python manage.py create_plans

# Django shell
python manage.py shell

# Database shell
python manage.py dbshell

deactivate
```

### Database Commands

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Connect to vamsapattika database
sudo -u postgres psql -d vamsapattika_db

# Backup database
sudo -u postgres pg_dump vamsapattika_db > backup.sql

# Restore database
sudo -u postgres psql vamsapattika_db < backup.sql
```

---

## ✅ Deployment Checklist

Use this checklist for future deployments:

### Pre-Deployment
- [ ] VPS provisioned and accessible
- [ ] DNS records configured (A records for @, www, api)
- [ ] Domain propagated (test with nslookup)
- [ ] Production credentials ready (.env files)
- [ ] Code pushed to GitHub main branch

### Server Setup
- [ ] System updated (apt update && apt upgrade)
- [ ] Firewall configured (UFW)
- [ ] Python 3.11 installed
- [ ] Node.js installed
- [ ] PostgreSQL installed and running
- [ ] Nginx installed and running

### Database Setup
- [ ] PostgreSQL database created
- [ ] Database user created with correct password
- [ ] Permissions granted
- [ ] Connection tested

### Backend Deployment
- [ ] Repository cloned to /var/www/vamsapattika
- [ ] Backend .env.production created
- [ ] Virtual environment created
- [ ] Dependencies installed (pip install -r requirements.txt)
- [ ] Migrations run (python manage.py migrate)
- [ ] Subscription plans created (python manage.py create_plans)
- [ ] Static files collected (python manage.py collectstatic)
- [ ] Superuser created (python manage.py createsuperuser)
- [ ] Gunicorn service configured
- [ ] Gunicorn running and enabled

### Frontend Deployment
- [ ] Frontend .env.production created
- [ ] Dependencies installed (npm install)
- [ ] Production build created (npm run build)
- [ ] dist/ folder verified

### Nginx Configuration
- [ ] Default site removed
- [ ] Vamsapattika config created
- [ ] Site enabled (symbolic link)
- [ ] Configuration tested (nginx -t)
- [ ] Nginx restarted

### SSL Setup
- [ ] DNS verified for all domains
- [ ] Certbot installed
- [ ] SSL certificates obtained
- [ ] HTTPS working for all domains
- [ ] Auto-renewal configured

### Final Verification
- [ ] Frontend loads (https://vamsapattika.com)
- [ ] Admin panel accessible (https://api.vamsapattika.com/admin/)
- [ ] User registration works
- [ ] Login works
- [ ] Family tree creation works
- [ ] Payment integration works (Razorpay)
- [ ] Feedback form works (email sent)
- [ ] All services running (nginx, gunicorn, postgresql)

---

## 🎉 Deployment Complete!

**Your Vamsapattika application is now live at:**

- 🌐 **Frontend:** https://vamsapattika.com
- 🔌 **Backend API:** https://api.vamsapattika.com
- 👤 **Admin Panel:** https://api.vamsapattika.com/admin/

**Next Steps:**

1. ✅ Test all features thoroughly
2. ✅ Monitor logs for any errors
3. ✅ Set up regular backups
4. ✅ Share access with team members
5. ✅ Document any custom configurations
6. ✅ Plan for scaling (if needed)

---

**Document Version:** 1.0  
**Last Updated:** August 31, 2026  
**Deployed By:** Deployment Team  
**VPS Provider:** GoDaddy  
**VPS IP:** 148.66.156.201  
**Domains:** vamsapattika.com, www.vamsapattika.com, api.vamsapattika.com

---

**Questions or Issues?**

- 📧 Email: support@vamsapattika.com
- 💻 GitHub: https://github.com/mangamuthinti/vamsapattika
- 📝 Check troubleshooting section above

**Good luck with your application! 🚀**
