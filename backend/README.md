# Vamsapattika Backend (Django)

Django REST Framework backend for Vamsapattika family tree application.

## Quick Setup

### 1. Create Virtual Environment
Use Python 3.13 (recommended) or 3.11. Python 3.14 is not supported for this project because the pinned packages fail to build there.

```bash
# Windows (recommended)
py -3.13 -m venv venv
.\venv\Scripts\Activate.ps1

# macOS/Linux
python3.13 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### 3. Configure Environment Variables
Create `.env` file with these variables:
```env
SECRET_KEY=your_secret_key_here
DEBUG=True
DATABASE_URL=postgresql://vamsapattika_user:SecurePassword123!@localhost:5432/vamsapattika_db
GOOGLE_CLIENT_ID=your_google_client_id
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 4. Setup Database
```bash
# Create PostgreSQL database first (see main README.md)
python manage.py migrate
python manage.py createsuperuser
python manage.py create_plans
```

### 5. Run Development Server
```bash
python manage.py runserver
```

Server runs at `http://localhost:8000`

## API Endpoints

### Authentication (`/api/auth/`)
- `POST /register/` - Register new user
- `POST /login/` - Login with email/password
- `POST /google-login/` - Google OAuth login
- `GET /profile/` - Get user profile (requires auth)
- `PUT /profile/update/` - Update profile (requires auth)
- `POST /profile/change-password/` - Change password (requires auth)
- `POST /token/refresh/` - Refresh JWT token

### Family Trees (`/api/trees/`)
- `GET /` - List all user's trees (requires auth)
- `POST /` - Create new tree (requires auth)
- `GET /:tree_id/` - Get specific tree (requires auth)
- `PUT /:tree_id/` - Update tree (requires auth)
- `DELETE /:tree_id/` - Delete tree (requires auth)

### Payments (`/api/payments/`)
- `GET /plans/` - List subscription plans
- `GET /subscription/` - Get user subscription (requires auth)
- `POST /create-order/` - Create Razorpay order (requires auth)
- `POST /verify-payment/` - Verify payment (requires auth)

### Admin Panel
Access Django admin at `http://localhost:8000/admin/`

## Project Structure

```
backend/
├── accounts/              # User authentication & profiles
│   ├── models.py         # User model with Google OAuth support
│   ├── serializers.py    # DRF serializers
│   ├── views.py          # API views
│   └── urls.py           # URL routing
├── family_trees/         # Family tree management
│   ├── models.py         # FamilyTree model
│   ├── serializers.py    # Tree serializers
│   ├── views.py          # Tree CRUD views
│   └── urls.py           # URL routing
├── payments/             # Payment & subscription
│   ├── models.py         # SubscriptionPlan, UserSubscription, PaymentTransaction
│   ├── views.py          # Razorpay integration
│   └── urls.py           # Payment URLs
├── vamsapattika_backend/ # Main Django config
│   ├── settings.py       # Django settings
│   ├── urls.py           # Root URL config
│   └── wsgi.py           # WSGI config
├── manage.py             # Django management commands
├── requirements.txt      # Python dependencies
└── .env                  # Environment variables (not in git)
```

## Common Commands

```bash
# Run migrations
python manage.py migrate

# Create migrations after model changes
python manage.py makemigrations

# Create superuser
python manage.py createsuperuser

# Create subscription plans
python manage.py create_plans

# Run tests
python manage.py test

# Collect static files
python manage.py collectstatic

# Django shell
python manage.py shell
```

## Development Tips

### Testing API with cURL

**Register:**
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","password2":"Test123!","display_name":"Test User"}'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

**Get Profile (with token):**
```bash
curl http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Database Operations

```bash
# Reset database (development only!)
python manage.py flush

# Backup database
pg_dump vamsapattika_db > backup.sql

# Restore database
psql vamsapattika_db < backup.sql
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | `django-insecure-abc123...` |
| `DEBUG` | Debug mode (False in production) | `True` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `ALLOWED_HOSTS` | Allowed host names | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | CORS whitelist | `http://localhost:5173` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123456789-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | `GOCSPX-abc123...` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | `rzp_test_abc123` |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | `xyz789...` |

## Troubleshooting

**Dependency install fails with Pillow / psycopg2 errors:**
```bash
# Use Python 3.13 or 3.11 instead of 3.14
py -3.13 -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

**Import Error for decouple:**
```bash
pip install python-decouple
```

**Migration conflicts:**
```bash
python manage.py migrate --fake accounts zero
python manage.py migrate accounts
```

**Port already in use:**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

**CORS errors:**
- Check `CORS_ALLOWED_ORIGINS` includes frontend URL
- Ensure `django-cors-headers` is in `INSTALLED_APPS`
- Verify `CorsMiddleware` is first in `MIDDLEWARE`

## Deployment

See main [README.md](../README.md) for detailed deployment instructions.

Quick checklist:
- [ ] Set `DEBUG=False`
- [ ] Update `ALLOWED_HOSTS`
- [ ] Use production database
- [ ] Set strong `SECRET_KEY`
- [ ] Use Razorpay Live Keys
- [ ] Setup proper logging
- [ ] Use gunicorn/uWSGI
- [ ] Setup SSL/HTTPS

---

For full documentation, see [main README.md](../README.md)
