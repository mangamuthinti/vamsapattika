# 🔄 Vamsapattika - Future Deployment & Updates Guide

**Quick reference guide for deploying updates after initial production setup**

**Last Updated:** August 31, 2026  
**For:** Ongoing deployments and updates

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Standard Deployment Workflow](#standard-deployment-workflow)
3. [Deployment Scenarios](#deployment-scenarios)
4. [One-Command Deployments](#one-command-deployments)
5. [Deployment Script](#deployment-script)
6. [Troubleshooting](#troubleshooting)
7. [Rollback Procedure](#rollback-procedure)
8. [Best Practices](#best-practices)

---

## 🚀 Quick Start

### **5-Minute Deployment Process**

```bash
# 1. Local: Push your changes to GitHub
git add .
git commit -m "Your change description"
git push origin main

# 2. VPS: Connect via SSH
ssh root@148.66.156.201

# 3. VPS: Run deployment commands
cd /var/www/vamsapattika
git pull origin main

# Backend (if changed)
cd backend
source venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
deactivate

# Frontend (if changed)
cd ../frontend
npm run build

# 4. Restart services
systemctl restart gunicorn nginx

# 5. Verify
systemctl status gunicorn nginx
```

**Done!** Visit https://vamsapattika.com to see your changes.

---

## 🔄 Standard Deployment Workflow

### **Phase 1: Local Development**

#### **Step 1: Create Feature Branch (Optional but Recommended)**

```bash
# Create new branch for your feature
git checkout -b feature/your-feature-name

# OR for bug fixes
git checkout -b fix/bug-description
```

#### **Step 2: Make Your Changes**

- Edit code in your IDE (VS Code, PyCharm, etc.)
- Make changes to backend (`backend/`) or frontend (`frontend/`)

#### **Step 3: Test Locally**

**Test Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python manage.py runserver

# Test at: http://localhost:8000
deactivate
```

**Test Frontend:**
```bash
cd frontend
npm run dev

# Test at: http://localhost:5173
```

#### **Step 4: Commit and Push**

```bash
# Add your changes
git add .

# Commit with descriptive message
git commit -m "Add feature: user profile editing"

# Push to GitHub
git push origin feature/your-feature-name

# If working on main branch directly:
git push origin main
```

#### **Step 5: Merge to Main (If Using Branches)**

**Option A: Via GitHub (Recommended)**
1. Go to GitHub repository
2. Create Pull Request
3. Review changes
4. Merge to main branch

**Option B: Via Command Line**
```bash
git checkout main
git merge feature/your-feature-name
git push origin main
```

---

### **Phase 2: Production Deployment**

#### **Step 1: Connect to VPS**

**From Windows PowerShell:**
```powershell
ssh root@148.66.156.201
```

**You should see:**
```
root@201:~#
```

#### **Step 2: Navigate to Project**

```bash
cd /var/www/vamsapattika
```

#### **Step 3: Pull Latest Code**

```bash
git pull origin main
```

**Expected output:**
```
Updating abc1234..def5678
Fast-forward
 backend/accounts/views.py | 10 ++++++++--
 frontend/src/App.jsx      |  5 +++--
 2 files changed, 11 insertions(+), 4 deletions(-)
```

#### **Step 4: Update Backend (If Backend Changed)**

```bash
cd backend

# Activate virtual environment
source venv/bin/activate

# Install any new dependencies (if requirements.txt changed)
pip install -r requirements.txt

# Run database migrations (if models changed)
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Deactivate virtual environment
deactivate
```

#### **Step 5: Update Frontend (If Frontend Changed)**

```bash
cd /var/www/vamsapattika/frontend

# Install any new dependencies (if package.json changed)
npm install

# Build production bundle
npm run build
```

**Expected output:**
```
✓ built in 1234ms
```

#### **Step 6: Restart Services**

```bash
# Restart Gunicorn (backend server)
systemctl restart gunicorn

# Restart Nginx (web server)
systemctl restart nginx
```

#### **Step 7: Verify Deployment**

```bash
# Check service status
systemctl status gunicorn
systemctl status nginx

# Check for errors in logs
journalctl -u gunicorn -n 20
tail -20 /var/log/nginx/error.log
```

**Expected:** Both services show `Active: active (running)`

#### **Step 8: Test in Browser**

1. **Frontend:** https://vamsapattika.com
2. **Backend API:** https://api.vamsapattika.com/api/auth/login/
3. **Admin Panel:** https://api.vamsapattika.com/admin/

**Test Key Features:**
- User registration
- Login/logout
- Create family tree
- Payment flow (if changed)
- Any new features you added

---

## 📦 Deployment Scenarios

### **Scenario 1: Frontend-Only Changes** ⚛️

**When:** You changed React components, CSS, or frontend logic

```bash
# Connect to VPS
ssh root@148.66.156.201

# Pull code
cd /var/www/vamsapattika
git pull origin main

# Rebuild frontend
cd frontend
npm install  # Only if package.json changed
npm run build

# Restart Nginx
systemctl restart nginx

# Test
# Visit: https://vamsapattika.com
```

**Time Required:** ~2 minutes  
**Downtime:** None (build happens before restart)

---

### **Scenario 2: Backend-Only Changes** 🐍

**When:** You changed Django views, models, API endpoints, or backend logic

```bash
# Connect to VPS
ssh root@148.66.156.201

# Pull code
cd /var/www/vamsapattika
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt  # Only if requirements.txt changed
python manage.py migrate         # Only if models changed
python manage.py collectstatic --noinput
deactivate

# Restart Gunicorn
systemctl restart gunicorn

# Test
# Visit: https://api.vamsapattika.com/admin/
```

**Time Required:** ~3 minutes  
**Downtime:** ~2 seconds (during Gunicorn restart)

---

### **Scenario 3: Full-Stack Changes** 🔄

**When:** You changed both frontend and backend

```bash
# Connect to VPS
ssh root@148.66.156.201

# Pull code
cd /var/www/vamsapattika
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
deactivate

# Update frontend
cd ../frontend
npm install
npm run build

# Restart both services
systemctl restart gunicorn nginx

# Test both
# Frontend: https://vamsapattika.com
# Backend: https://api.vamsapattika.com/admin/
```

**Time Required:** ~5 minutes  
**Downtime:** ~5 seconds (during service restarts)

---

### **Scenario 4: Database Model Changes** 🗄️

**When:** You added/modified Django models

```bash
# Connect to VPS
ssh root@148.66.156.201
cd /var/www/vamsapattika
git pull origin main

# Update backend
cd backend
source venv/bin/activate

# IMPORTANT: Backup database first
sudo -u postgres pg_dump vamsapattika_db > /tmp/backup_$(date +%Y%m%d_%H%M%S).sql

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Verify migration succeeded
python manage.py showmigrations

deactivate

# Restart Gunicorn
systemctl restart gunicorn
```

**Time Required:** ~3-5 minutes  
**Risk Level:** Medium (always backup first!)

---

### **Scenario 5: New Python Dependencies** 📚

**When:** You added new packages to `requirements.txt`

```bash
# Connect to VPS
ssh root@148.66.156.201
cd /var/www/vamsapattika
git pull origin main

cd backend
source venv/bin/activate

# Install new dependencies
pip install -r requirements.txt

# Collect static files (in case new packages have static files)
python manage.py collectstatic --noinput

deactivate

# Restart Gunicorn
systemctl restart gunicorn
```

---

### **Scenario 6: New npm Packages** 📦

**When:** You added new packages to `package.json`

```bash
# Connect to VPS
ssh root@148.66.156.201
cd /var/www/vamsapattika
git pull origin main

cd frontend

# Install new dependencies
npm install

# Rebuild
npm run build

# Restart Nginx
systemctl restart nginx
```

---

### **Scenario 7: Environment Variable Changes** 🔐

**When:** You need to update `.env` configuration

```bash
# Connect to VPS
ssh root@148.66.156.201

# Edit backend .env
nano /var/www/vamsapattika/backend/.env
# Make your changes
# Save: Ctrl+X, Y, Enter

# OR edit frontend .env
nano /var/www/vamsapattika/frontend/.env
# Make your changes
# Save: Ctrl+X, Y, Enter

# If frontend .env changed, rebuild
cd /var/www/vamsapattika/frontend
npm run build

# Restart services
systemctl restart gunicorn nginx
```

---

### **Scenario 8: Static Files Changes** 🎨

**When:** You changed CSS, images, or other static files

```bash
# Connect to VPS
ssh root@148.66.156.201
cd /var/www/vamsapattika
git pull origin main

# Collect static files
cd backend
source venv/bin/activate
python manage.py collectstatic --noinput
deactivate

# Rebuild frontend
cd ../frontend
npm run build

# Restart services
systemctl restart gunicorn nginx
```

---

## ⚡ One-Command Deployments

### **Save Time with Single Commands**

#### **Frontend-Only Deployment**

```bash
ssh root@148.66.156.201 "cd /var/www/vamsapattika && git pull && cd frontend && npm run build && systemctl restart nginx"
```

#### **Backend-Only Deployment**

```bash
ssh root@148.66.156.201 "cd /var/www/vamsapattika && git pull && cd backend && source venv/bin/activate && python manage.py migrate && python manage.py collectstatic --noinput && deactivate && systemctl restart gunicorn"
```

#### **Full Deployment**

```bash
ssh root@148.66.156.201 "cd /var/www/vamsapattika && git pull && cd backend && source venv/bin/activate && pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput && deactivate && cd ../frontend && npm install && npm run build && systemctl restart gunicorn nginx && echo '✅ Deployment complete!'"
```

**Usage:**
- Copy the command
- Paste into PowerShell
- Press Enter
- Wait for completion
- Test the application

---

## 🤖 Deployment Script (Recommended)

### **Create Automated Deployment Script**

**Step 1: Create Script on VPS**

```bash
# Connect to VPS
ssh root@148.66.156.201

# Create script
nano /root/deploy-vamsapattika.sh
```

**Step 2: Paste This Content**

```bash
#!/bin/bash

# Vamsapattika Deployment Script
# Usage: ./deploy-vamsapattika.sh [frontend|backend|full]

set -e  # Exit on any error

echo "=========================================="
echo "🚀 Vamsapattika Deployment Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project directory
PROJECT_DIR="/var/www/vamsapattika"

# Deployment type (default: full)
DEPLOY_TYPE=${1:-full}

echo -e "${YELLOW}📋 Deployment Type: ${DEPLOY_TYPE}${NC}"
echo ""

# Function to check service status
check_service() {
    local service=$1
    if systemctl is-active --quiet $service; then
        echo -e "${GREEN}✅ $service: Running${NC}"
    else
        echo -e "${RED}❌ $service: Failed${NC}"
        exit 1
    fi
}

# Navigate to project
cd $PROJECT_DIR || exit 1

# Pull latest code
echo -e "${YELLOW}📥 Pulling latest code from GitHub...${NC}"
git pull origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git pull failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Code updated${NC}"
echo ""

# Backend deployment
if [ "$DEPLOY_TYPE" = "backend" ] || [ "$DEPLOY_TYPE" = "full" ]; then
    echo -e "${YELLOW}🔧 Updating Backend...${NC}"
    
    cd $PROJECT_DIR/backend
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    echo "  📦 Installing Python dependencies..."
    pip install -r requirements.txt -q
    
    # Run migrations
    echo "  🗄️  Running database migrations..."
    python manage.py migrate
    
    # Collect static files
    echo "  📁 Collecting static files..."
    python manage.py collectstatic --noinput -q
    
    # Deactivate virtual environment
    deactivate
    
    echo -e "${GREEN}✅ Backend updated${NC}"
    echo ""
fi

# Frontend deployment
if [ "$DEPLOY_TYPE" = "frontend" ] || [ "$DEPLOY_TYPE" = "full" ]; then
    echo -e "${YELLOW}⚛️  Building Frontend...${NC}"
    
    cd $PROJECT_DIR/frontend
    
    # Install dependencies
    echo "  📦 Installing npm dependencies..."
    npm install --silent
    
    # Build production bundle
    echo "  🏗️  Building production bundle..."
    npm run build
    
    echo -e "${GREEN}✅ Frontend built${NC}"
    echo ""
fi

# Restart services
echo -e "${YELLOW}🔄 Restarting services...${NC}"

if [ "$DEPLOY_TYPE" = "backend" ] || [ "$DEPLOY_TYPE" = "full" ]; then
    systemctl restart gunicorn
    echo "  🔄 Gunicorn restarted"
fi

if [ "$DEPLOY_TYPE" = "frontend" ] || [ "$DEPLOY_TYPE" = "full" ]; then
    systemctl restart nginx
    echo "  🔄 Nginx restarted"
fi

echo ""

# Check service status
echo -e "${YELLOW}🔍 Checking service status...${NC}"
if [ "$DEPLOY_TYPE" = "backend" ] || [ "$DEPLOY_TYPE" = "full" ]; then
    check_service gunicorn
fi

if [ "$DEPLOY_TYPE" = "frontend" ] || [ "$DEPLOY_TYPE" = "full" ]; then
    check_service nginx
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "🌐 Test your application:"
echo "   Frontend: https://vamsapattika.com"
echo "   Backend:  https://api.vamsapattika.com/admin/"
echo ""
echo "📊 Check logs if needed:"
echo "   journalctl -u gunicorn -n 20"
echo "   tail -20 /var/log/nginx/error.log"
echo ""
```

**Step 3: Make Script Executable**

```bash
chmod +x /root/deploy-vamsapattika.sh
```

**Step 4: Use the Script**

```bash
# Deploy everything (frontend + backend)
/root/deploy-vamsapattika.sh full

# Deploy frontend only
/root/deploy-vamsapattika.sh frontend

# Deploy backend only
/root/deploy-vamsapattika.sh backend
```

---

## 🚨 Troubleshooting

### **Issue 1: Git Pull Fails**

**Error:** `Your local changes would be overwritten by merge`

**Solution:**
```bash
cd /var/www/vamsapattika

# See what files changed
git status

# If you want to keep local changes:
git stash
git pull origin main
git stash pop

# If you want to discard local changes:
git reset --hard HEAD
git pull origin main
```

---

### **Issue 2: Migration Fails**

**Error:** `django.db.utils.OperationalError`

**Solution:**
```bash
# Check database connection
cd /var/www/vamsapattika/backend
source venv/bin/activate
python manage.py check --database default

# If database is down
systemctl status postgresql
systemctl restart postgresql

# Try migration again
python manage.py migrate
```

---

### **Issue 3: Gunicorn Won't Start**

**Check logs:**
```bash
journalctl -u gunicorn -n 100
```

**Common causes and fixes:**

**A. Python import errors:**
```bash
cd /var/www/vamsapattika/backend
source venv/bin/activate
pip install -r requirements.txt
deactivate
systemctl restart gunicorn
```

**B. Socket permission issues:**
```bash
ls -la /var/www/vamsapattika/backend/gunicorn.sock
chown root:www-data /var/www/vamsapattika/backend/gunicorn.sock
systemctl restart gunicorn
```

**C. Port already in use:**
```bash
# Check what's using the socket
lsof /var/www/vamsapattika/backend/gunicorn.sock

# Kill old process if needed
killall gunicorn
systemctl restart gunicorn
```

---

### **Issue 4: Frontend Build Fails**

**Error:** `npm ERR!`

**Solution:**
```bash
cd /var/www/vamsapattika/frontend

# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

---

### **Issue 5: Static Files Not Loading**

**Solution:**
```bash
cd /var/www/vamsapattika/backend
source venv/bin/activate

# Collect static files
python manage.py collectstatic --noinput

# Check permissions
ls -la staticfiles/

# If permission issues:
chown -R root:www-data staticfiles/
chmod -R 755 staticfiles/

deactivate
systemctl restart gunicorn nginx
```

---

### **Issue 6: 502 Bad Gateway**

**Causes:** Gunicorn not running or socket connection issue

**Solution:**
```bash
# Check Gunicorn status
systemctl status gunicorn

# Check socket exists
ls -la /var/www/vamsapattika/backend/gunicorn.sock

# Check Nginx error logs
tail -50 /var/log/nginx/error.log

# Restart services
systemctl restart gunicorn
sleep 2
systemctl restart nginx
```

---

### **Issue 7: Database Connection Error**

**Error:** `FATAL: password authentication failed for user`

**Solution:**
```bash
# Reset database password
sudo -u postgres psql
ALTER USER vamsapattika_user WITH PASSWORD 'vamsapattika@123';
GRANT ALL PRIVILEGES ON DATABASE vamsapattika_db TO vamsapattika_user;
\q

# Restart Gunicorn
systemctl restart gunicorn
```

---

## ⏮️ Rollback Procedure

### **When to Rollback:**
- New deployment causes errors
- Application not working as expected
- Critical bug introduced

### **Quick Rollback Steps:**

#### **Step 1: Check Git History**

```bash
cd /var/www/vamsapattika

# View recent commits
git log --oneline -10
```

**Output example:**
```
abc1234 (HEAD -> main) Add new feature
def5678 Fix login bug
ghi9012 Update dependencies
```

#### **Step 2: Rollback to Previous Commit**

```bash
# Rollback to previous commit
git reset --hard HEAD~1

# OR rollback to specific commit
git reset --hard def5678
```

#### **Step 3: Rebuild and Restart**

```bash
# Backend
cd backend
source venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
deactivate

# Frontend
cd ../frontend
npm run build

# Restart services
systemctl restart gunicorn nginx
```

#### **Step 4: Verify**

```bash
# Check services
systemctl status gunicorn nginx

# Check logs
journalctl -u gunicorn -n 20

# Test application
# Visit: https://vamsapattika.com
```

### **Alternative: Rollback Database Migration**

**If a migration caused the issue:**

```bash
cd /var/www/vamsapattika/backend
source venv/bin/activate

# See migration history
python manage.py showmigrations

# Rollback to specific migration
python manage.py migrate accounts 0001  # Replace with your migration number

deactivate
systemctl restart gunicorn
```

---

## ✅ Best Practices

### **1. Pre-Deployment Checklist**

Before every deployment:

- [ ] Code tested locally
- [ ] All tests passing (`python manage.py test`)
- [ ] No errors in console/terminal
- [ ] Committed with clear message
- [ ] Pushed to GitHub
- [ ] Backed up database (for major changes)

### **2. Deployment Best Practices**

**DO:**
- ✅ Deploy during low-traffic hours (if possible)
- ✅ Test locally before deploying
- ✅ Read the git diff before pulling (`git diff HEAD origin/main`)
- ✅ Backup database before major migrations
- ✅ Check logs after deployment
- ✅ Test key features after deployment
- ✅ Keep deployment commands in a script
- ✅ Document any manual configuration changes

**DON'T:**
- ❌ Deploy on Friday evenings
- ❌ Edit code directly on production server
- ❌ Skip testing locally
- ❌ Deploy multiple major changes at once
- ❌ Ignore warning messages
- ❌ Forget to restart services
- ❌ Deploy without version control (git)

### **3. Git Workflow Best Practices**

**Use Feature Branches:**
```bash
# Create feature branch
git checkout -b feature/new-dashboard

# Make changes, commit
git add .
git commit -m "Add dashboard feature"

# Push feature branch
git push origin feature/new-dashboard

# Merge to main via Pull Request on GitHub
# Then deploy main branch to production
```

**Commit Message Best Practices:**
```bash
# Good commit messages:
git commit -m "Fix: Payment gateway timeout issue"
git commit -m "Feature: Add user profile editing"
git commit -m "Update: Razorpay integration to v2"
git commit -m "Refactor: Simplify tree rendering logic"

# Bad commit messages:
git commit -m "fixed stuff"
git commit -m "updates"
git commit -m "asdf"
```

### **4. Monitoring After Deployment**

**Check these within 5 minutes of deployment:**

```bash
# 1. Service status
systemctl status gunicorn nginx

# 2. Recent errors
journalctl -u gunicorn --since "5 minutes ago" | grep ERROR
tail -50 /var/log/nginx/error.log | grep error

# 3. Response time test
curl -w "@curl-format.txt" -o /dev/null -s "https://vamsapattika.com"

# 4. Database connections
sudo -u postgres psql -d vamsapattika_db -c "SELECT count(*) FROM pg_stat_activity;"
```

**Browser Testing:**
1. Open https://vamsapattika.com
2. Test user registration
3. Test login
4. Test main feature you changed
5. Check browser console for JS errors (F12)

### **5. Database Migration Best Practices**

**Before running migrations in production:**

```bash
# 1. Backup database
sudo -u postgres pg_dump vamsapattika_db > /backup/db_$(date +%Y%m%d_%H%M%S).sql

# 2. Check migration plan
cd /var/www/vamsapattika/backend
source venv/bin/activate
python manage.py sqlmigrate app_name migration_number

# 3. Run migration
python manage.py migrate

# 4. Verify data
python manage.py shell
# Test your models to ensure data is intact

deactivate
```

**For large database changes:**
- Schedule maintenance window
- Notify users in advance
- Consider using Django's `RunPython` for data migrations
- Test migration on database backup first

### **6. Security Best Practices**

**Regular Security Checks:**

```bash
# Check for failed login attempts
journalctl -u sshd | grep "Failed password"

# Check open ports
ss -tulpn

# Update security patches
apt update
apt upgrade

# Check SSL certificate expiration
certbot certificates

# Review firewall rules
ufw status
```

### **7. Performance Optimization**

**After deployment, monitor:**

```bash
# Check memory usage
free -h

# Check disk space
df -h

# Check active connections
ss -s

# Check Gunicorn workers
ps aux | grep gunicorn
```

**If performance issues:**
- Increase Gunicorn workers in `/etc/systemd/system/gunicorn.service`
- Enable Django caching
- Optimize database queries
- Use CDN for static files

---

## 📅 Maintenance Schedule

### **Daily**
- [ ] Check application is accessible
- [ ] Check for critical errors in logs

### **Weekly**
- [ ] Review application logs for warnings
- [ ] Check disk space usage
- [ ] Backup database
- [ ] Deploy bug fixes and minor updates

### **Monthly**
- [ ] Update system packages (`apt update && apt upgrade`)
- [ ] Update Python dependencies (check for security updates)
- [ ] Update npm packages (check for security updates)
- [ ] Review SSL certificate expiration
- [ ] Review and clean old log files
- [ ] Deploy major features and improvements

### **Quarterly**
- [ ] Full security audit
- [ ] Performance review and optimization
- [ ] Database cleanup (old data, logs)
- [ ] Review backup and recovery procedures
- [ ] Update documentation

---

## 📊 Deployment Checklist

**Print this and use for each deployment:**

### Pre-Deployment
- [ ] Changes tested locally
- [ ] Tests passing
- [ ] Code committed with clear message
- [ ] Code pushed to GitHub main branch
- [ ] Database backup created (if needed)
- [ ] Team notified (if large change)

### Deployment
- [ ] Connected to VPS via SSH
- [ ] Navigated to project directory
- [ ] Git pull successful
- [ ] Backend updated (if needed)
- [ ] Frontend rebuilt (if needed)
- [ ] Services restarted
- [ ] No errors in service status

### Post-Deployment
- [ ] Services running (gunicorn, nginx)
- [ ] No errors in logs
- [ ] Frontend loads (https://vamsapattika.com)
- [ ] Backend API working (https://api.vamsapattika.com/admin/)
- [ ] User registration works
- [ ] Login works
- [ ] New feature works (if applicable)
- [ ] Payment integration works (if changed)
- [ ] Browser console has no errors

### Communication
- [ ] Team notified of successful deployment
- [ ] Deployment notes documented (if major changes)
- [ ] Known issues documented (if any)

---

## 🎯 Quick Reference Commands

### **Essential Commands**

```bash
# Connect to VPS
ssh root@148.66.156.201

# Navigate to project
cd /var/www/vamsapattika

# Pull latest code
git pull origin main

# Backend update
cd backend && source venv/bin/activate && python manage.py migrate && python manage.py collectstatic --noinput && deactivate

# Frontend update
cd frontend && npm run build

# Restart services
systemctl restart gunicorn nginx

# Check status
systemctl status gunicorn nginx

# View logs
journalctl -u gunicorn -n 20
tail -20 /var/log/nginx/error.log
```

### **Service Management**

```bash
# Start
systemctl start gunicorn
systemctl start nginx

# Stop
systemctl stop gunicorn
systemctl stop nginx

# Restart
systemctl restart gunicorn
systemctl restart nginx

# Status
systemctl status gunicorn
systemctl status nginx

# Enable on boot
systemctl enable gunicorn
systemctl enable nginx
```

### **Log Commands**

```bash
# Gunicorn logs
journalctl -u gunicorn -n 50          # Last 50 lines
journalctl -u gunicorn -f             # Follow in real-time
journalctl -u gunicorn --since today  # Today's logs

# Nginx logs
tail -f /var/log/nginx/error.log      # Follow error log
tail -f /var/log/nginx/access.log     # Follow access log
tail -100 /var/log/nginx/error.log | grep ERROR  # Last 100 errors
```

### **Git Commands**

```bash
# Check status
git status

# View recent commits
git log --oneline -10

# View changes before pulling
git diff HEAD origin/main

# Pull latest
git pull origin main

# Rollback
git reset --hard HEAD~1
git reset --hard <commit-hash>

# View current branch
git branch
```

---

## 📞 Support & Resources

### **Key Files on VPS**

| File/Directory | Path |
|----------------|------|
| Project Root | `/var/www/vamsapattika/` |
| Backend | `/var/www/vamsapattika/backend/` |
| Frontend | `/var/www/vamsapattika/frontend/` |
| Backend .env | `/var/www/vamsapattika/backend/.env` |
| Frontend .env | `/var/www/vamsapattika/frontend/.env` |
| Gunicorn Service | `/etc/systemd/system/gunicorn.service` |
| Nginx Config | `/etc/nginx/sites-available/vamsapattika` |
| Deploy Script | `/root/deploy-vamsapattika.sh` |

### **Important URLs**

| Service | URL |
|---------|-----|
| Frontend | https://vamsapattika.com |
| Backend API | https://api.vamsapattika.com/api/ |
| Admin Panel | https://api.vamsapattika.com/admin/ |
| GitHub Repo | https://github.com/mangamuthinti/vamsapattika |

### **Contact Information**

- **Support Email:** support@vamsapattika.com
- **VPS Provider:** GoDaddy
- **VPS IP:** 148.66.156.201

---

## 🎉 Summary

**Your deployment workflow in 3 steps:**

1. **Local:** Make changes, test, commit, push to GitHub
2. **VPS:** Pull code, rebuild, restart services
3. **Verify:** Test live application

**Average deployment time:** 5 minutes  
**Downtime:** < 10 seconds

**Remember:**
- Always test locally first
- Check logs after deployment
- Use the deployment script for consistency
- Keep this guide handy for reference

---

**Document Version:** 1.0  
**Last Updated:** August 31, 2026  
**Next Review:** September 30, 2026

**Happy Deploying! 🚀**
