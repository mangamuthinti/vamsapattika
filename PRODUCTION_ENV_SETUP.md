# Production Environment Variables Setup Guide

This guide explains how to configure production environment variables for Vamsapattika deployment.

## 📁 Files Created

- `backend/.env.production` - Backend production environment variables
- `frontend/.env.production` - Frontend production environment variables

## 🔐 Security Notice

**IMPORTANT:** Never commit these files to git! They are already in `.gitignore`.

These files contain sensitive credentials:
- Database passwords
- API secret keys
- OAuth client secrets
- Payment gateway keys

---

## 🎯 Backend Production Setup

### File Location
```
backend/.env.production
```

### Step-by-Step Configuration

#### 1. Generate SECRET_KEY

```bash
cd backend
source venv/bin/activate
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

Copy the output and replace `SECRET_KEY` value in `.env.production`.

#### 2. Set DEBUG to False

**CRITICAL:** Always set `DEBUG=False` in production!

```env
DEBUG=False
```

#### 3. Configure ALLOWED_HOSTS

Add all domains that will access your backend:

```env
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,api.yourdomain.com,your.vps.ip.address
```

**Examples:**
- `vamsapattika.com,www.vamsapattika.com,api.vamsapattika.com`
- `example.com,api.example.com,123.456.789.012`

#### 4. Database Configuration

Update with your production database credentials:

```env
DATABASE_URL=postgresql://username:password@host:port/database
```

**For GoDaddy VPS (local PostgreSQL):**
```env
DATABASE_URL=postgresql://vamsapattika_user:YourSecurePassword123!@localhost:5432/vamsapattika_db
```

**For external database:**
```env
DATABASE_URL=postgresql://user:pass@db.example.com:5432/dbname
```

#### 5. CORS Settings

Update with your actual frontend domain:

```env
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Example:**
```env
CORS_ALLOWED_ORIGINS=https://vamsapattika.com,https://www.vamsapattika.com
CSRF_TRUSTED_ORIGINS=https://vamsapattika.com,https://www.vamsapattika.com
```

#### 6. Google OAuth Credentials

**Get credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Copy **Client ID** and **Client Secret**

**Update .env.production:**
```env
GOOGLE_CLIENT_ID=123456789-abcdefghijk.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
```

**Configure authorized origins:**
In Google Cloud Console, add these to **Authorized JavaScript origins**:
- `https://yourdomain.com`
- `https://www.yourdomain.com`

**Configure redirect URIs:**
In Google Cloud Console, add these to **Authorized redirect URIs**:
- `https://yourdomain.com`
- `https://api.yourdomain.com`

#### 7. Razorpay LIVE Credentials

**CRITICAL:** Use LIVE keys, NOT test keys!

**Get LIVE credentials:**
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Switch to **Live Mode** (top right)
3. Navigate to **Settings** → **API Keys**
4. Click **Generate Live Keys** (if not already done)
5. Copy **Key Id** and **Key Secret**

**Update .env.production:**
```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_secret_here
```

**Note:** Live keys start with `rzp_live_`, test keys start with `rzp_test_`

**Additional Razorpay Setup:**
1. Complete KYC verification
2. Configure payment methods
3. Setup webhook (optional): `https://api.yourdomain.com/api/payments/webhook/`

#### 8. Email Configuration (Optional)

For password reset and notifications:

**Using Gmail:**
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → App passwords
   - Generate password for "Mail"
3. Update .env.production:

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-16-char-app-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
```

**Using SendGrid, Mailgun, etc.:**
Update with your SMTP provider's settings.

#### 9. Frontend URL

Set to your production frontend domain:

```env
FRONTEND_URL=https://yourdomain.com
```

#### 10. Logging Level

For production, use INFO or WARNING:

```env
DJANGO_LOG_LEVEL=INFO
```

---

## 🎨 Frontend Production Setup

### File Location
```
frontend/.env.production
```

### Step-by-Step Configuration

#### 1. Backend API URL

Update with your production API domain:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

**Examples:**
- `https://api.vamsapattika.com/api`
- `https://yourdomain.com/api` (if backend is on same domain)

**Important:** 
- Must start with `https://` (not `http://`)
- Must end with `/api`
- No trailing slash after `/api`

#### 2. Razorpay Key ID

Use your LIVE Key ID (public key, safe to expose):

```env
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
```

**Must be LIVE key:** Starts with `rzp_live_`, not `rzp_test_`

#### 3. Google OAuth Client ID

Use your production Client ID (public, safe to expose):

```env
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijk.apps.googleusercontent.com
```

**Make sure authorized origins are configured** (see Backend Step 6)

---

## 🚀 Using Production Environment Files

### Local Testing with Production Build

**Backend:**
```bash
cd backend
cp .env.production .env
source venv/bin/activate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
cp .env.production .env.production.local
npm run build
npm run preview
```

### GoDaddy VPS Deployment

**Backend:**
```bash
# SSH into VPS
ssh vamsapattika@your.vps.ip.address

# Copy production env file
cd /home/vamsapattika/app/backend
cp .env.production .env

# Edit with actual credentials
vim .env

# Restart service
sudo systemctl restart gunicorn
```

**Frontend:**
```bash
# On your local machine
cd frontend

# Build with production env
npm run build

# On VPS, deploy the build
scp -r dist/* vamsapattika@your.vps.ip.address:/var/www/vamsapattika/
```

Or use the deployment script:
```bash
# On VPS
./deploy.sh
```

---

## ✅ Configuration Checklist

### Before Deployment

**Backend:**
- [ ] SECRET_KEY generated and set
- [ ] DEBUG=False
- [ ] ALLOWED_HOSTS includes all domains and IP
- [ ] DATABASE_URL configured with production database
- [ ] CORS_ALLOWED_ORIGINS includes frontend domains
- [ ] Google OAuth Client ID and Secret set
- [ ] Razorpay LIVE keys configured (not test keys)
- [ ] Email settings configured (if using)
- [ ] FRONTEND_URL set to production domain

**Frontend:**
- [ ] VITE_API_URL points to production API
- [ ] VITE_RAZORPAY_KEY_ID is LIVE key (not test)
- [ ] VITE_GOOGLE_CLIENT_ID is production client ID

**External Services:**
- [ ] Google OAuth authorized origins configured
- [ ] Google OAuth redirect URIs configured
- [ ] Razorpay switched to Live Mode
- [ ] Razorpay KYC completed
- [ ] Razorpay webhook configured (optional)

---

## 🔒 Security Best Practices

### 1. Never Commit Production Env Files

```bash
# Check .gitignore includes:
backend/.env.production
frontend/.env.production
```

### 2. Use Strong Passwords

**Database password:**
- At least 16 characters
- Mix of uppercase, lowercase, numbers, symbols
- Use password generator

**Example:**
```
YourSecurePassword123!@#$%
```

### 3. Rotate Secrets Regularly

- Change SECRET_KEY every 6 months
- Rotate database passwords annually
- Update API keys if compromised

### 4. Limit Access

- Only store production credentials on production server
- Don't share credentials via email/chat
- Use environment variables, not hardcoded values

### 5. Use Different Keys for Each Environment

- Development: Test keys
- Staging: Test keys
- Production: Live keys

### 6. Monitor for Leaks

- Use tools like `git-secrets`
- Scan commits before pushing
- Revoke compromised keys immediately

---

## 🐛 Troubleshooting

### Backend: "DisallowedHost" Error

**Problem:** Domain not in ALLOWED_HOSTS

**Solution:**
```env
# Add your domain to ALLOWED_HOSTS
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,api.yourdomain.com
```

### Frontend: API Calls Failing (CORS Error)

**Problem:** Frontend domain not in CORS_ALLOWED_ORIGINS

**Solution:**
```env
# In backend .env.production
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Razorpay: "Invalid Key" Error

**Problem:** Using test key in production or wrong key

**Solution:**
- Verify you're using LIVE keys (start with `rzp_live_`)
- Check both backend and frontend have matching keys
- Verify keys are copied correctly (no extra spaces)

### Google OAuth: "Redirect URI Mismatch"

**Problem:** Production URL not in authorized redirect URIs

**Solution:**
1. Go to Google Cloud Console
2. Add production URL to authorized redirect URIs
3. Wait 5 minutes for changes to propagate

### Database Connection Error

**Problem:** Wrong DATABASE_URL or database not accessible

**Solution:**
```bash
# Test connection
psql "postgresql://username:password@host:port/database"

# Check PostgreSQL is running
sudo systemctl status postgresql
```

---

## 📚 Additional Resources

- [Django Deployment Checklist](https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Razorpay Live Mode](https://razorpay.com/docs/payment-gateway/test-live-mode/)

---

## 📞 Need Help?

If you encounter issues:

1. Check this guide first
2. Review [DEPLOYMENT_GODADDY_VPS.md](DEPLOYMENT_GODADDY_VPS.md)
3. Check application logs
4. Verify all credentials are correct
5. Contact team for support

---

**Last Updated:** August 2026  
**Powered by:** Provegaa Tech Hub
