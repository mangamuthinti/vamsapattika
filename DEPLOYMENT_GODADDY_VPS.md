# Vamsapattika Deployment on GoDaddy VPS (Ubuntu 22.04)

Complete step-by-step guide for deploying Vamsapattika on GoDaddy VPS with Ubuntu 22.04.

## 📋 Prerequisites

Before starting, ensure you have:

- [ ] GoDaddy VPS with Ubuntu 22.04 installed
- [ ] Root or sudo access to the VPS
- [ ] Domain name pointed to VPS IP address
- [ ] SSH access configured
- [ ] Basic knowledge of Linux commands

### Domain Setup

In GoDaddy DNS Management, add these records:

```
Type    Name    Value               TTL
A       @       your.vps.ip.address 600
A       www     your.vps.ip.address 600
A       api     your.vps.ip.address 600
```

Wait 10-15 minutes for DNS propagation.

---

## 🚀 Part 1: Server Initial Setup

### Step 1: Connect to Your VPS

```bash
ssh root@your.vps.ip.address
# or if you have a non-root user:
ssh username@your.vps.ip.address
```

### Step 2: Update System

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y build-essential git curl wget vim software-properties-common
```

### Step 3: Create Application User

```bash
# Create a dedicated user for the application
sudo adduser vamsapattika
sudo usermod -aG sudo vamsapattika

# Switch to the new user
su - vamsapattika
```

### Step 4: Setup Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## 🐍 Part 2: Install Required Software

### Step 1: Install Python 3.11

```bash
# Add deadsnakes PPA for latest Python
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Verify installation
python3.11 --version
```

### Step 2: Install PostgreSQL

```bash
# Install PostgreSQL 14
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
sudo systemctl status postgresql
```

### Step 3: Install Node.js & npm

```bash
# Install Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v18.x
npm --version
```

### Step 4: Install Nginx

```bash
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify
sudo systemctl status nginx
```

### Step 5: Install Certbot (for SSL)

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## 🗄️ Part 3: Setup Database

### Step 1: Create PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Run these commands in psql:
CREATE DATABASE vamsapattika_db;
CREATE USER vamsapattika_user WITH PASSWORD 'YourSecurePasswordHere123!';
ALTER ROLE vamsapattika_user SET client_encoding TO 'utf8';
ALTER ROLE vamsapattika_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE vamsapattika_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE vamsapattika_db TO vamsapattika_user;
\q
```

### Step 2: Configure PostgreSQL for Remote Access (Optional)

```bash
# Edit postgresql.conf
sudo vim /etc/postgresql/14/main/postgresql.conf
# Change: listen_addresses = 'localhost'

# Edit pg_hba.conf
sudo vim /etc/postgresql/14/main/pg_hba.conf
# Add: host all all 127.0.0.1/32 md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## 📦 Part 4: Deploy Backend (Django)

### Step 1: Clone Repository

```bash
cd /home/vamsapattika
git clone <your-repository-url> app
cd app
```

### Step 2: Setup Python Virtual Environment

```bash
cd backend

# Create virtual environment
python3.11 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn
```

### Step 3: Configure Environment Variables

```bash
# Create production .env file
vim .env
```

Add the following (press `i` to insert, `Esc` then `:wq` to save):

```env
# Django Configuration
SECRET_KEY=generate-a-new-secure-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,api.yourdomain.com,your.vps.ip.address

# Database
DATABASE_URL=postgresql://vamsapattika_user:YourSecurePasswordHere123!@localhost:5432/vamsapattika_db

# CORS Settings
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Razorpay LIVE Keys (Important: Use LIVE keys, not TEST keys)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_live_secret_here

# Email Configuration (Optional)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Logging
DJANGO_LOG_LEVEL=INFO
```

**Generate a secure SECRET_KEY:**

```bash
python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

### Step 4: Run Migrations

```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Create subscription plans
python manage.py create_plans

# Collect static files
python manage.py collectstatic --noinput
```

### Step 5: Test Django with Gunicorn

```bash
# Test Gunicorn
gunicorn --bind 0.0.0.0:8000 vamsapattika_backend.wsgi:application

# If successful, press Ctrl+C to stop
```

### Step 6: Create Gunicorn Systemd Service

```bash
# Create systemd service file
sudo vim /etc/systemd/system/gunicorn.service
```

Add this content:

```ini
[Unit]
Description=Gunicorn daemon for Vamsapattika Django Backend
After=network.target

[Service]
User=vamsapattika
Group=www-data
WorkingDirectory=/home/vamsapattika/app/backend
Environment="PATH=/home/vamsapattika/app/backend/venv/bin"
ExecStart=/home/vamsapattika/app/backend/venv/bin/gunicorn \
    --workers 3 \
    --bind unix:/home/vamsapattika/app/backend/gunicorn.sock \
    --timeout 120 \
    --access-logfile /home/vamsapattika/app/backend/logs/gunicorn-access.log \
    --error-logfile /home/vamsapattika/app/backend/logs/gunicorn-error.log \
    vamsapattika_backend.wsgi:application

[Install]
WantedBy=multi-user.target
```

### Step 7: Create Log Directory

```bash
mkdir -p /home/vamsapattika/app/backend/logs
```

### Step 8: Start and Enable Gunicorn

```bash
# Reload systemd
sudo systemctl daemon-reload

# Start Gunicorn
sudo systemctl start gunicorn

# Enable on boot
sudo systemctl enable gunicorn

# Check status
sudo systemctl status gunicorn

# If there are issues, check logs:
sudo journalctl -u gunicorn
```

---

## 🎨 Part 5: Deploy Frontend (React)

### Step 1: Build React Application

```bash
cd /home/vamsapattika/app/frontend

# Create production .env file
vim .env.production
```

Add:

```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

```bash
# Install dependencies
npm install

# Build for production
npm run build

# The build will be in the 'dist' folder
ls -la dist/
```

### Step 2: Move Build to Web Directory

```bash
# Create web directory
sudo mkdir -p /var/www/vamsapattika

# Copy build files
sudo cp -r dist/* /var/www/vamsapattika/

# Set permissions
sudo chown -R www-data:www-data /var/www/vamsapattika
sudo chmod -R 755 /var/www/vamsapattika
```

---

## 🌐 Part 6: Configure Nginx

### Step 1: Create Nginx Configuration

```bash
sudo vim /etc/nginx/sites-available/vamsapattika
```

Add this configuration:

```nginx
# Frontend (Main Site)
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/vamsapattika;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}

# Backend API
server {
    listen 80;
    listen [::]:80;
    server_name api.yourdomain.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://unix:/home/vamsapattika/app/backend/gunicorn.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 120s;
        proxy_read_timeout 120s;
    }

    location /static/ {
        alias /home/vamsapattika/app/backend/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /home/vamsapattika/app/backend/media/;
        expires 30d;
    }
}
```

### Step 2: Enable Site and Test Configuration

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/vamsapattika /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If successful, restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

### Step 3: Test HTTP Access

Open in browser:
- `http://yourdomain.com` - Should show React app
- `http://api.yourdomain.com/admin/` - Should show Django admin

---

## 🔒 Part 7: Setup SSL with Let's Encrypt

### Step 1: Obtain SSL Certificates

```bash
# Get certificates for all domains
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Follow prompts:
# - Enter email address
# - Agree to Terms of Service
# - Choose to redirect HTTP to HTTPS (recommended)
```

### Step 2: Verify SSL Configuration

```bash
# Check Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 3: Test HTTPS Access

Open in browser:
- `https://yourdomain.com` - Should show React app with SSL
- `https://api.yourdomain.com/admin/` - Should show Django admin with SSL

### Step 4: Setup Auto-Renewal

```bash
# Certbot auto-renewal is enabled by default
# Test renewal process
sudo certbot renew --dry-run

# Check renewal timer
sudo systemctl status certbot.timer
```

---

## 🔧 Part 8: Post-Deployment Configuration

### Step 1: Create Django Superuser (if not done)

```bash
cd /home/vamsapattika/app/backend
source venv/bin/activate
python manage.py createsuperuser
```

### Step 2: Update Google OAuth Settings

Go to [Google Cloud Console](https://console.cloud.google.com/):

1. Select your project
2. Go to **APIs & Services** → **Credentials**
3. Edit OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins:**
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`
5. Add to **Authorized redirect URIs:**
   - `https://yourdomain.com`
   - `https://api.yourdomain.com`

### Step 3: Update Razorpay Settings

Go to [Razorpay Dashboard](https://dashboard.razorpay.com/):

1. Switch to **Live Mode**
2. Go to **Settings** → **API Keys**
3. Generate Live Keys (if not already done)
4. Update `.env` file with live keys
5. Go to **Settings** → **Webhooks**
6. Add webhook URL: `https://api.yourdomain.com/api/payments/webhook/`

### Step 4: Test Complete Flow

1. **User Registration:**
   - Go to `https://yourdomain.com`
   - Sign up with email
   - Test Google OAuth login

2. **Family Tree:**
   - Create new tree
   - Add family members
   - Upload photos
   - Export as PNG/PDF

3. **Payment Flow:**
   - Upgrade to paid plan
   - Complete payment (use real card in live mode)
   - Verify subscription activated

---

## 📊 Part 9: Monitoring & Maintenance

### Setup Log Rotation

```bash
# Create logrotate config
sudo vim /etc/logrotate.d/vamsapattika
```

Add:

```
/home/vamsapattika/app/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 vamsapattika www-data
    sharedscripts
    postrotate
        systemctl reload gunicorn > /dev/null 2>&1
    endscript
}
```

### View Application Logs

```bash
# Gunicorn logs
sudo tail -f /home/vamsapattika/app/backend/logs/gunicorn-error.log
sudo tail -f /home/vamsapattika/app/backend/logs/gunicorn-access.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u gunicorn -f
sudo journalctl -u nginx -f
```

### Monitor System Resources

```bash
# Check disk space
df -h

# Check memory usage
free -m

# Check CPU usage
top

# Check running processes
ps aux | grep gunicorn
ps aux | grep nginx
```

---

## 💾 Part 10: Backup Strategy

### Automated Database Backup Script

```bash
# Create backup directory
mkdir -p /home/vamsapattika/backups

# Create backup script
vim /home/vamsapattika/backup.sh
```

Add:

```bash
#!/bin/bash

# Configuration
DB_NAME="vamsapattika_db"
DB_USER="vamsapattika_user"
BACKUP_DIR="/home/vamsapattika/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/vamsapattika_backup_$DATE.sql"

# Create backup
PGPASSWORD="YourSecurePasswordHere123!" pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "vamsapattika_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

```bash
# Make script executable
chmod +x /home/vamsapattika/backup.sh

# Test backup
./backup.sh
```

### Schedule Daily Backups with Cron

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * /home/vamsapattika/backup.sh >> /home/vamsapattika/backups/backup.log 2>&1
```

### Restore from Backup

```bash
# Uncompress backup
gunzip vamsapattika_backup_20260829_020000.sql.gz

# Restore database
PGPASSWORD="YourSecurePasswordHere123!" psql -U vamsapattika_user -h localhost vamsapattika_db < vamsapattika_backup_20260829_020000.sql
```

---

## 🔄 Part 11: Deployment Updates

### Update Backend Code

```bash
cd /home/vamsapattika/app/backend

# Pull latest code
git pull origin main

# Activate virtual environment
source venv/bin/activate

# Install new dependencies (if any)
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Restart Gunicorn
sudo systemctl restart gunicorn

# Check status
sudo systemctl status gunicorn
```

### Update Frontend Code

```bash
cd /home/vamsapattika/app/frontend

# Pull latest code
git pull origin main

# Install new dependencies (if any)
npm install

# Build
npm run build

# Copy to web directory
sudo cp -r dist/* /var/www/vamsapattika/

# Clear browser cache or use Ctrl+F5
```

### Deployment Update Script

Create a deployment script for easy updates:

```bash
vim /home/vamsapattika/deploy.sh
```

Add:

```bash
#!/bin/bash

echo "Starting deployment..."

# Backend update
echo "Updating backend..."
cd /home/vamsapattika/app/backend
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn
echo "Backend updated ✓"

# Frontend update
echo "Updating frontend..."
cd /home/vamsapattika/app/frontend
git pull origin main
npm install
npm run build
sudo cp -r dist/* /var/www/vamsapattika/
echo "Frontend updated ✓"

echo "Deployment completed successfully!"
```

```bash
# Make executable
chmod +x /home/vamsapattika/deploy.sh

# Run deployment
./deploy.sh
```

---

## 🚨 Part 12: Troubleshooting

### Gunicorn Not Starting

```bash
# Check logs
sudo journalctl -u gunicorn -n 50

# Common issues:
# 1. Socket file permission issue
sudo chown vamsapattika:www-data /home/vamsapattika/app/backend/gunicorn.sock

# 2. Python path issue - verify in service file
sudo systemctl cat gunicorn

# 3. Restart service
sudo systemctl restart gunicorn
```

### 502 Bad Gateway

```bash
# Check if Gunicorn is running
sudo systemctl status gunicorn

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check socket connection
ls -la /home/vamsapattika/app/backend/gunicorn.sock

# Restart services
sudo systemctl restart gunicorn
sudo systemctl restart nginx
```

### Static Files Not Loading

```bash
# Collect static files again
cd /home/vamsapattika/app/backend
source venv/bin/activate
python manage.py collectstatic --noinput

# Check permissions
sudo chown -R vamsapattika:www-data /home/vamsapattika/app/backend/staticfiles
sudo chmod -R 755 /home/vamsapattika/app/backend/staticfiles

# Restart Gunicorn
sudo systemctl restart gunicorn
```

### Database Connection Issues

```bash
# Test database connection
cd /home/vamsapattika/app/backend
source venv/bin/activate
python manage.py dbshell

# If connection fails, check:
# 1. PostgreSQL is running
sudo systemctl status postgresql

# 2. Database credentials in .env are correct
cat .env | grep DATABASE_URL

# 3. PostgreSQL allows connections
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificates manually
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run

# Check Nginx SSL configuration
sudo nginx -t
```

### High Memory Usage

```bash
# Check memory
free -m

# Restart Gunicorn with fewer workers
# Edit /etc/systemd/system/gunicorn.service
# Change --workers from 3 to 2

sudo systemctl daemon-reload
sudo systemctl restart gunicorn
```

---

## 🔐 Security Checklist

### Before Going Live

- [ ] `DEBUG=False` in production
- [ ] Strong `SECRET_KEY` generated
- [ ] Firewall (UFW) enabled and configured
- [ ] SSH key authentication enabled (disable password auth)
- [ ] PostgreSQL only accepts local connections
- [ ] SSL/HTTPS enabled for all domains
- [ ] Security headers configured in Nginx
- [ ] Razorpay LIVE keys (not test keys)
- [ ] Google OAuth production credentials
- [ ] Regular automated backups scheduled
- [ ] Log rotation configured
- [ ] Strong database password
- [ ] File permissions set correctly
- [ ] CORS properly configured
- [ ] CSRF protection enabled

### Additional Security Measures

```bash
# Disable SSH password authentication
sudo vim /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart ssh

# Install fail2ban (optional but recommended)
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Keep system updated
sudo apt update && sudo apt upgrade -y
```

---

## 📈 Performance Optimization

### Enable Gzip Compression

Already configured in Nginx config above.

### Setup Redis for Caching (Optional)

```bash
# Install Redis
sudo apt install redis-server

# Configure Redis
sudo vim /etc/redis/redis.conf
# Set: supervised systemd

sudo systemctl restart redis
sudo systemctl enable redis

# Install Python Redis
cd /home/vamsapattika/app/backend
source venv/bin/activate
pip install redis django-redis

# Update settings.py to use Redis for caching
```

### Database Performance

```bash
# Create indexes for frequently queried fields
# Add to Django models and run migrations

# Tune PostgreSQL
sudo vim /etc/postgresql/14/main/postgresql.conf
# Adjust: shared_buffers, effective_cache_size, work_mem

sudo systemctl restart postgresql
```

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks

**Daily:**
- Monitor error logs
- Check disk space
- Verify backups completed

**Weekly:**
- Review access logs
- Check for security updates
- Monitor resource usage

**Monthly:**
- Update dependencies
- Review and rotate logs
- Test backup restoration
- Security audit

### Useful Commands Reference

```bash
# Service Management
sudo systemctl status gunicorn
sudo systemctl restart gunicorn
sudo systemctl status nginx
sudo systemctl restart nginx

# View Logs
sudo journalctl -u gunicorn -f
sudo tail -f /var/log/nginx/error.log
sudo tail -f /home/vamsapattika/app/backend/logs/gunicorn-error.log

# Database
sudo -u postgres psql vamsapattika_db
python manage.py dbshell

# Deployment
./deploy.sh
./backup.sh

# SSL
sudo certbot certificates
sudo certbot renew
```

---

## 🎉 Deployment Complete!

Your Vamsapattika application is now live on GoDaddy VPS!

**Access your application:**
- Frontend: https://yourdomain.com
- Backend API: https://api.yourdomain.com/api/
- Django Admin: https://api.yourdomain.com/admin/

**Next steps:**
1. Test all features thoroughly
2. Monitor logs for any errors
3. Setup monitoring alerts
4. Document any custom configurations
5. Train team on deployment update process

---

**For issues or questions, see [README.md](README.md) or [DEPLOYMENT.md](DEPLOYMENT.md)**

**Last Updated:** August 2026  
**Powered by:** Provegaa Tech Hub
