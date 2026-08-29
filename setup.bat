@echo off
REM Vamsapattika Project Setup Script (Windows)
REM This script automates the initial setup for new team members

echo ======================================
echo   Vamsapattika Project Setup
echo ======================================
echo.

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed
    echo Please install Python 3.10+ from https://www.python.org/downloads/
    pause
    exit /b 1
)
echo [OK] Python found
python --version

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found
node --version

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed
    pause
    exit /b 1
)
echo [OK] npm found
npm --version

echo.
echo ======================================
echo   Setting up Backend
echo ======================================
echo.

cd backend

REM Create virtual environment
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
    echo [OK] Virtual environment created
) else (
    echo Virtual environment already exists
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install --upgrade pip
pip install -r requirements.txt
echo [OK] Python dependencies installed

REM Check .env file
if not exist ".env" (
    echo [WARNING] Backend .env file not found
    echo Creating .env from template...
    (
        echo # Django Configuration
        echo SECRET_KEY=django-insecure-vamsapattika-2024-change-this-in-production-abc123xyz789
        echo DEBUG=True
        echo ALLOWED_HOSTS=localhost,127.0.0.1
        echo.
        echo # Database
        echo DATABASE_URL=postgresql://vamsapattika_user:SecurePassword123!@localhost:5432/vamsapattika_db
        echo.
        echo # CORS Settings
        echo CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
        echo CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://localhost:3000
        echo.
        echo # Google OAuth
        echo GOOGLE_CLIENT_ID=
        echo GOOGLE_CLIENT_SECRET=
        echo.
        echo # Razorpay
        echo RAZORPAY_KEY_ID=
        echo RAZORPAY_KEY_SECRET=
        echo.
        echo # Email Configuration
        echo EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
        echo EMAIL_HOST=smtp.gmail.com
        echo EMAIL_PORT=587
        echo EMAIL_USE_TLS=True
        echo EMAIL_HOST_USER=
        echo EMAIL_HOST_PASSWORD=
        echo DEFAULT_FROM_EMAIL=noreply@vamsapattika.com
        echo.
        echo # Frontend URL
        echo FRONTEND_URL=http://localhost:5173
        echo.
        echo # Logging
        echo DJANGO_LOG_LEVEL=DEBUG
    ) > .env
    echo [OK] Backend .env created
    echo [WARNING] Please update .env with your credentials
) else (
    echo [OK] Backend .env already exists
)

echo.
echo [NOTE] Database creation must be done manually in PostgreSQL
echo Please run these commands in psql:
echo.
echo CREATE DATABASE vamsapattika_db;
echo CREATE USER vamsapattika_user WITH PASSWORD 'SecurePassword123!';
echo ALTER ROLE vamsapattika_user SET client_encoding TO 'utf8';
echo ALTER ROLE vamsapattika_user SET default_transaction_isolation TO 'read committed';
echo ALTER ROLE vamsapattika_user SET timezone TO 'UTC';
echo GRANT ALL PRIVILEGES ON DATABASE vamsapattika_db TO vamsapattika_user;
echo.
echo Press any key when database is ready...
pause

REM Run migrations
echo.
echo Running database migrations...
python manage.py migrate
echo [OK] Migrations completed

REM Create superuser
echo.
set /p create_super="Do you want to create a Django superuser? (y/n): "
if /i "%create_super%"=="y" (
    python manage.py createsuperuser
)

REM Create subscription plans
echo.
echo Creating subscription plans...
python manage.py create_plans
echo [OK] Subscription plans created

cd ..

echo.
echo ======================================
echo   Setting up Frontend
echo ======================================
echo.

cd frontend

REM Install dependencies
echo Installing Node.js dependencies...
call npm install
echo [OK] Node.js dependencies installed

REM Check .env file
if not exist ".env" (
    echo [WARNING] Frontend .env file not found
    echo Creating .env from template...
    (
        echo # Django Backend API URL
        echo VITE_API_URL=http://localhost:8000/api
        echo.
        echo # Razorpay Key ID ^(for payment integration^)
        echo VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here
        echo.
        echo # Google OAuth Client ID
        echo VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
    ) > .env
    echo [OK] Frontend .env created
    echo [WARNING] Please update .env with your credentials
) else (
    echo [OK] Frontend .env already exists
)

cd ..

echo.
echo ======================================
echo   Setup Complete!
echo ======================================
echo.
echo [OK] Backend setup complete
echo [OK] Frontend setup complete
echo.
echo Next steps:
echo.
echo 1. Update environment variables:
echo    - backend\.env ^(Google Client ID, Razorpay keys^)
echo    - frontend\.env ^(Google Client ID, Razorpay Key ID^)
echo.
echo 2. Start the backend server:
echo    cd backend
echo    venv\Scripts\activate
echo    python manage.py runserver
echo.
echo 3. Start the frontend server ^(in a new terminal^):
echo    cd frontend
echo    npm run dev
echo.
echo 4. Open your browser to http://localhost:5173
echo.
echo For detailed documentation, see README.md
echo.
echo Happy coding! 🚀
echo.
pause
