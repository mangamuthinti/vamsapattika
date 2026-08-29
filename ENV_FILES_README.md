# Environment Files Quick Reference

This project uses multiple environment files for different purposes. Here's what each file is for:

## 📁 Environment Files Overview

```
vamsapattika/
├── backend/
│   ├── .env                    # Your current development settings (gitignored)
│   ├── .env.example           # Template with placeholders
│   └── .env.production        # Production settings template (gitignored)
│
└── frontend/
    ├── .env                    # Your current development settings (gitignored)
    ├── .env.example           # Template with placeholders
    └── .env.production        # Production settings template (gitignored)
```

---

## 🔵 Development Files (Local Development)

### `backend/.env`
**Purpose:** Your local development environment  
**Contains:** Local database, test API keys  
**Committed to git:** ❌ NO (in .gitignore)

**Example:**
```env
DEBUG=True
DATABASE_URL=postgresql://user:pass@localhost:5432/vamsapattika_db
RAZORPAY_KEY_ID=rzp_test_xxxxx  # Test key
```

### `frontend/.env`
**Purpose:** Your local frontend development  
**Contains:** Local API URL, test keys  
**Committed to git:** ❌ NO (in .gitignore)

**Example:**
```env
VITE_API_URL=http://localhost:8000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx  # Test key
```

---

## 📘 Template Files (For New Team Members)

### `backend/.env.example`
**Purpose:** Template for new developers  
**Contains:** Placeholder values, documentation  
**Committed to git:** ✅ YES

**Usage:**
```bash
# New team member setup
cp .env.example .env
# Then edit .env with actual values
```

### `frontend/.env.example`
**Purpose:** Template for new developers  
**Contains:** Placeholder values, documentation  
**Committed to git:** ✅ YES

**Usage:**
```bash
# New team member setup
cp .env.example .env
# Then edit .env with actual values
```

---

## 🔴 Production Files (Production Deployment)

### `backend/.env.production`
**Purpose:** Production deployment on GoDaddy VPS  
**Contains:** Production database, LIVE API keys  
**Committed to git:** ❌ NO (in .gitignore)

**Key Differences from Development:**
- `DEBUG=False` (CRITICAL!)
- Production database URL
- Razorpay **LIVE** keys (not test)
- Google OAuth production credentials
- Production domain URLs

**Usage on Server:**
```bash
# On production server
cd /home/vamsapattika/app/backend
cp .env.production .env
vim .env  # Edit with actual credentials
```

### `frontend/.env.production`
**Purpose:** Production build configuration  
**Contains:** Production API URL, LIVE keys  
**Committed to git:** ❌ NO (in .gitignore)

**Key Differences from Development:**
- Production API URL (https://api.yourdomain.com)
- Razorpay **LIVE** Key ID
- Google OAuth production Client ID

**Usage:**
```bash
# Build with production env
npm run build  # Automatically uses .env.production
```

---

## 🎯 Quick Guide: Which File Do I Edit?

### I'm setting up local development
➡️ Edit: `backend/.env` and `frontend/.env`  
📝 Copy from: `.env.example` files

### I'm deploying to production
➡️ Edit: `backend/.env.production` and `frontend/.env.production`  
📝 See: [PRODUCTION_ENV_SETUP.md](PRODUCTION_ENV_SETUP.md)

### I'm onboarding a new team member
➡️ Share: `.env.example` files  
📝 They copy and rename to `.env`

---

## 🔐 Security Rules

### ❌ NEVER Commit These Files:
- `backend/.env`
- `backend/.env.production`
- `frontend/.env`
- `frontend/.env.production`

**Why?** They contain sensitive credentials (passwords, API keys, secrets)

### ✅ SAFE to Commit:
- `backend/.env.example`
- `frontend/.env.example`

**Why?** They only have placeholders, no real credentials

### ⚠️ If You Accidentally Commit Sensitive Files:

1. **Remove from git history:**
   ```bash
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch backend/.env' \
     --prune-empty --tag-name-filter cat -- --all
   ```

2. **Rotate all credentials immediately:**
   - Generate new SECRET_KEY
   - Change database password
   - Regenerate Razorpay keys
   - Regenerate Google OAuth credentials

3. **Force push (coordinate with team):**
   ```bash
   git push origin --force --all
   ```

---

## 📊 Environment Variables Comparison

| Variable | Development (.env) | Production (.env.production) |
|----------|-------------------|------------------------------|
| `DEBUG` | `True` | `False` ⚠️ |
| `API URL` | `http://localhost:8000` | `https://api.yourdomain.com` |
| `Database` | Local PostgreSQL | Production PostgreSQL |
| `Razorpay Keys` | Test (`rzp_test_xxx`) | LIVE (`rzp_live_xxx`) ⚠️ |
| `Google OAuth` | Test credentials | Production credentials |
| `ALLOWED_HOSTS` | `localhost` | Production domains |
| `CORS_ORIGINS` | `http://localhost:5173` | `https://yourdomain.com` |

⚠️ = Critical differences that MUST be changed for production

---

## 🚀 Common Tasks

### Setup Local Development
```bash
# Backend
cd backend
cp .env.example .env
vim .env  # Add your local settings

# Frontend
cd frontend
cp .env.example .env
vim .env  # Add your local settings
```

### Prepare for Production Deployment
```bash
# Backend
cd backend
cp .env.example .env.production
vim .env.production  # Add production settings
# See: PRODUCTION_ENV_SETUP.md for details

# Frontend
cd frontend
cp .env.example .env.production
vim .env.production  # Add production settings
```

### Test Production Build Locally
```bash
# Backend
cd backend
cp .env.production .env.local
python manage.py runserver --settings=vamsapattika_backend.settings

# Frontend
cd frontend
cp .env.production .env.production.local
npm run build
npm run preview
```

### Deploy to Production
```bash
# See: DEPLOYMENT_GODADDY_VPS.md
# Summary:
# 1. SSH into server
# 2. Copy .env.production to .env
# 3. Edit with actual credentials
# 4. Run deployment script
```

---

## 🔍 Troubleshooting

### "DisallowedHost" Error
**Problem:** Domain not in ALLOWED_HOSTS  
**Fix:** Add your domain to `backend/.env.production`
```env
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,api.yourdomain.com
```

### CORS Error in Frontend
**Problem:** Frontend URL not in CORS_ALLOWED_ORIGINS  
**Fix:** Add frontend URL to `backend/.env.production`
```env
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Environment Variables Not Working in Frontend
**Problem:** Variables don't start with `VITE_`  
**Fix:** All frontend variables must start with `VITE_`
```env
VITE_API_URL=...        # ✅ Works
API_URL=...             # ❌ Won't work
```

### Changes Not Reflecting After Edit
**Backend:**
```bash
# Restart server
sudo systemctl restart gunicorn
```

**Frontend:**
```bash
# Rebuild
npm run build
```

---

## 📚 Related Documentation

- **[PRODUCTION_ENV_SETUP.md](PRODUCTION_ENV_SETUP.md)** - Detailed production configuration guide
- **[DEPLOYMENT_GODADDY_VPS.md](DEPLOYMENT_GODADDY_VPS.md)** - Full GoDaddy VPS deployment
- **[README.md](README.md)** - General project setup
- **[DOCUMENTATION.md](DOCUMENTATION.md)** - Complete documentation index

---

## 📞 Need Help?

1. Check the appropriate .env.example file for variable descriptions
2. Review [PRODUCTION_ENV_SETUP.md](PRODUCTION_ENV_SETUP.md) for detailed setup
3. See [DEPLOYMENT_GODADDY_VPS.md](DEPLOYMENT_GODADDY_VPS.md) for deployment steps
4. Contact team for support

---

**Last Updated:** August 2026  
**Powered by:** Provegaa Tech Hub
