# GoDaddy VPS Deployment Cheat Sheet

Quick reference for common deployment commands on GoDaddy VPS (Ubuntu 22.04).

## 🔌 Connect to Server

```bash
ssh vamsapattika@your.vps.ip.address
# or
ssh root@your.vps.ip.address
```

## 🔄 Deploy Updates

### Quick Update (Backend + Frontend)

```bash
# Run deployment script
cd /home/vamsapattika
./deploy.sh
```

### Manual Backend Update

```bash
cd /home/vamsapattika/app/backend

# Pull latest code
git pull origin main

# Activate virtual environment
source venv/bin/activate

# Install new dependencies
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

### Manual Frontend Update

```bash
cd /home/vamsapattika/app/frontend

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build for production
npm run build

# Copy to web directory
sudo cp -r dist/* /var/www/vamsapattika/
```

## 📊 Service Management

### Gunicorn (Django Backend)

```bash
# Status
sudo systemctl status gunicorn

# Start
sudo systemctl start gunicorn

# Stop
sudo systemctl stop gunicorn

# Restart
sudo systemctl restart gunicorn

# Enable on boot
sudo systemctl enable gunicorn

# View logs
sudo journalctl -u gunicorn -f
sudo tail -f /home/vamsapattika/app/backend/logs/gunicorn-error.log
```

### Nginx (Web Server)

```bash
# Status
sudo systemctl status nginx

# Start
sudo systemctl start nginx

# Stop
sudo systemctl stop nginx

# Restart
sudo systemctl restart nginx

# Reload config (no downtime)
sudo systemctl reload nginx

# Test configuration
sudo nginx -t

# View logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### PostgreSQL (Database)

```bash
# Status
sudo systemctl status postgresql

# Start
sudo systemctl start postgresql

# Restart
sudo systemctl restart postgresql

# Connect to database
sudo -u postgres psql vamsapattika_db

# Or with app user
PGPASSWORD='YourPassword' psql -U vamsapattika_user -d vamsapattika_db -h localhost
```

## 🗄️ Database Operations

### Backup Database

```bash
# Manual backup
cd /home/vamsapattika
./backup.sh

# Or manually
PGPASSWORD='YourPassword' pg_dump -U vamsapattika_user -h localhost vamsapattika_db > backup_$(date +%Y%m%d).sql

# Compress
gzip backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
# Decompress
gunzip backup_20260829.sql.gz

# Restore
PGPASSWORD='YourPassword' psql -U vamsapattika_user -h localhost vamsapattika_db < backup_20260829.sql
```

### Django Database Commands

```bash
cd /home/vamsapattika/app/backend
source venv/bin/activate

# Create migrations
python manage.py makemigrations

# Run migrations
python manage.py migrate

# Show migrations
python manage.py showmigrations

# Django shell
python manage.py shell

# Database shell
python manage.py dbshell
```

## 🔐 SSL Certificate Management

### Check Certificate Status

```bash
sudo certbot certificates
```

### Renew Certificates

```bash
# Auto-renew (runs automatically via cron)
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run

# Force renew
sudo certbot renew --force-renewal
```

### Add New Domain to Certificate

```bash
sudo certbot --nginx -d newdomain.com
```

## 📝 Logs & Debugging

### View Logs

```bash
# Gunicorn logs
sudo tail -f /home/vamsapattika/app/backend/logs/gunicorn-error.log
sudo tail -f /home/vamsapattika/app/backend/logs/gunicorn-access.log

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# System logs
sudo journalctl -u gunicorn -f
sudo journalctl -u nginx -f

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Follow all errors
sudo tail -f /var/log/nginx/error.log -f /home/vamsapattika/app/backend/logs/gunicorn-error.log
```

### Check Last 50 Log Entries

```bash
sudo journalctl -u gunicorn -n 50
sudo journalctl -u nginx -n 50
```

### Clear Logs (if too large)

```bash
# Clear journal logs
sudo journalctl --vacuum-time=7d

# Clear Nginx logs
sudo truncate -s 0 /var/log/nginx/error.log
sudo truncate -s 0 /var/log/nginx/access.log
```

## 🔧 Common Fixes

### 502 Bad Gateway

```bash
# Check Gunicorn is running
sudo systemctl status gunicorn

# Restart Gunicorn
sudo systemctl restart gunicorn

# Check socket file exists
ls -la /home/vamsapattika/app/backend/gunicorn.sock

# Fix permissions if needed
sudo chown vamsapattika:www-data /home/vamsapattika/app/backend/gunicorn.sock
```

### Static Files Not Loading

```bash
cd /home/vamsapattika/app/backend
source venv/bin/activate

# Collect static files
python manage.py collectstatic --noinput

# Fix permissions
sudo chown -R vamsapattika:www-data /home/vamsapattika/app/backend/staticfiles
sudo chmod -R 755 /home/vamsapattika/app/backend/staticfiles

# Restart services
sudo systemctl restart gunicorn
sudo systemctl restart nginx
```

### Database Connection Error

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Test connection
PGPASSWORD='YourPassword' psql -U vamsapattika_user -d vamsapattika_db -h localhost -c "SELECT 1;"
```

### Restart Everything

```bash
# Nuclear option - restart all services
sudo systemctl restart postgresql
sudo systemctl restart gunicorn
sudo systemctl restart nginx

# Check all statuses
sudo systemctl status postgresql
sudo systemctl status gunicorn
sudo systemctl status nginx
```

## 💻 System Monitoring

### Check Disk Space

```bash
df -h
du -sh /home/vamsapattika/*
```

### Check Memory Usage

```bash
free -m
```

### Check CPU Usage

```bash
top
# Press 'q' to quit

# Or use htop (if installed)
htop
```

### Check Running Processes

```bash
ps aux | grep gunicorn
ps aux | grep nginx
ps aux | grep postgres
```

### Check Open Files/Connections

```bash
# Check ports
sudo netstat -tulpn | grep LISTEN

# Or use ss
sudo ss -tulpn | grep LISTEN

# Check what's using port 80
sudo lsof -i :80

# Check what's using port 443
sudo lsof -i :443
```

## 🔥 Firewall Management

### Check Firewall Status

```bash
sudo ufw status verbose
```

### Allow/Deny Ports

```bash
# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Allow SSH
sudo ufw allow 22/tcp

# Deny a port
sudo ufw deny 8000/tcp

# Reload firewall
sudo ufw reload
```

## 👤 User Management

### Switch Users

```bash
# Switch to vamsapattika user
sudo su - vamsapattika

# Switch to postgres user
sudo su - postgres

# Return to previous user
exit
```

## 📦 Package Management

### Update System

```bash
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y
```

### Install Package

```bash
sudo apt install package-name
```

### Python Packages

```bash
cd /home/vamsapattika/app/backend
source venv/bin/activate
pip install package-name
pip freeze > requirements.txt
```

### Node Packages

```bash
cd /home/vamsapattika/app/frontend
npm install package-name
```

## 🎯 Django Management Commands

```bash
cd /home/vamsapattika/app/backend
source venv/bin/activate

# Create superuser
python manage.py createsuperuser

# Create subscription plans
python manage.py create_plans

# Collect static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate

# Create migrations
python manage.py makemigrations

# Check for issues
python manage.py check

# Django shell
python manage.py shell

# Clear sessions
python manage.py clearsessions
```

## 🔑 Environment Variables

### View Current Environment Variables

```bash
cd /home/vamsapattika/app/backend
cat .env
```

### Edit Environment Variables

```bash
cd /home/vamsapattika/app/backend
vim .env
# Make changes, then save and exit (:wq)

# Restart Gunicorn to apply changes
sudo systemctl restart gunicorn
```

## 📊 Performance Monitoring

### Check System Load

```bash
uptime
```

### Check Network Stats

```bash
# Network connections
sudo netstat -an | grep ESTABLISHED | wc -l

# Bandwidth usage (if iftop installed)
sudo iftop
```

### Database Size

```bash
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('vamsapattika_db'));"
```

## 🔄 Git Operations

### Check Current Branch

```bash
cd /home/vamsapattika/app
git branch
git status
```

### Pull Latest Changes

```bash
git pull origin main
```

### View Commit History

```bash
git log --oneline -10
```

### Discard Local Changes

```bash
# Careful! This will delete local changes
git reset --hard origin/main
```

## 📞 Emergency Contacts

### Services Not Working?

1. Check logs first
2. Restart affected service
3. Check firewall
4. Restart all services
5. Reboot server (last resort)

### Reboot Server

```bash
sudo reboot
```

### Check Server Uptime

```bash
uptime
```

---

## 📚 More Information

For detailed explanations, see:
- [DEPLOYMENT_GODADDY_VPS.md](DEPLOYMENT_GODADDY_VPS.md) - Full deployment guide
- [README.md](README.md) - Development setup
- [DOCUMENTATION.md](DOCUMENTATION.md) - Complete documentation index

---

**Save this file for quick reference!**

**Last Updated:** August 2026
