#!/bin/bash

# Vamsapattika Project Setup Script
# This script automates the initial setup for new team members

set -e  # Exit on error

echo "======================================"
echo "  Vamsapattika Project Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "Checking prerequisites..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    echo "Please install Python 3.10+ from https://www.python.org/downloads/"
    exit 1
fi
echo -e "${GREEN}✓ Python 3 found: $(python3 --version)${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm found: $(npm --version)${NC}"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠ PostgreSQL is not found in PATH${NC}"
    echo "Make sure PostgreSQL is installed and running."
    echo "Continue anyway? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓ PostgreSQL found${NC}"
fi

echo ""
echo "======================================"
echo "  Setting up Backend"
echo "======================================"
echo ""

# Backend setup
cd backend

# Create virtual environment
echo "Creating Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${YELLOW}Virtual environment already exists${NC}"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
echo -e "${GREEN}✓ Python dependencies installed${NC}"

# Check .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ Backend .env file not found${NC}"
    echo "Creating .env from template..."
    cat > .env << 'EOL'
# Django Configuration
SECRET_KEY=django-insecure-vamsapattika-2024-change-this-in-production-abc123xyz789
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://vamsapattika_user:SecurePassword123!@localhost:5432/vamsapattika_db

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
DEFAULT_FROM_EMAIL=noreply@vamsapattika.com

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Logging
DJANGO_LOG_LEVEL=DEBUG
EOL
    echo -e "${GREEN}✓ Backend .env created${NC}"
    echo -e "${YELLOW}⚠ Please update .env with your credentials${NC}"
else
    echo -e "${GREEN}✓ Backend .env already exists${NC}"
fi

# Database setup
echo ""
echo -e "${YELLOW}Database Setup${NC}"
echo "Do you want to create the database now? (y/n)"
echo "Prerequisites: PostgreSQL must be running"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "Creating database..."
    psql postgres << 'EOSQL'
CREATE DATABASE vamsapattika_db;
CREATE USER vamsapattika_user WITH PASSWORD 'SecurePassword123!';
ALTER ROLE vamsapattika_user SET client_encoding TO 'utf8';
ALTER ROLE vamsapattika_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE vamsapattika_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE vamsapattika_db TO vamsapattika_user;
EOSQL

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database created successfully${NC}"
    else
        echo -e "${YELLOW}⚠ Database creation failed. It may already exist.${NC}"
    fi
fi

# Run migrations
echo ""
echo "Running database migrations..."
python manage.py migrate
echo -e "${GREEN}✓ Migrations completed${NC}"

# Create superuser
echo ""
echo "Do you want to create a Django superuser? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    python manage.py createsuperuser
fi

# Create subscription plans
echo ""
echo "Creating subscription plans..."
python manage.py create_plans
echo -e "${GREEN}✓ Subscription plans created${NC}"

cd ..

echo ""
echo "======================================"
echo "  Setting up Frontend"
echo "======================================"
echo ""

# Frontend setup
cd frontend

# Install dependencies
echo "Installing Node.js dependencies..."
npm install
echo -e "${GREEN}✓ Node.js dependencies installed${NC}"

# Check .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ Frontend .env file not found${NC}"
    echo "Creating .env from template..."
    cat > .env << 'EOL'
# Django Backend API URL
VITE_API_URL=http://localhost:8000/api

# Razorpay Key ID (for payment integration)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here

# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
EOL
    echo -e "${GREEN}✓ Frontend .env created${NC}"
    echo -e "${YELLOW}⚠ Please update .env with your credentials${NC}"
else
    echo -e "${GREEN}✓ Frontend .env already exists${NC}"
fi

cd ..

echo ""
echo "======================================"
echo "  Setup Complete!"
echo "======================================"
echo ""
echo -e "${GREEN}✓ Backend setup complete${NC}"
echo -e "${GREEN}✓ Frontend setup complete${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Update environment variables:"
echo "   - backend/.env (Google Client ID, Razorpay keys)"
echo "   - frontend/.env (Google Client ID, Razorpay Key ID)"
echo ""
echo "2. Start the backend server:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python manage.py runserver"
echo ""
echo "3. Start the frontend server (in a new terminal):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. Open your browser to http://localhost:5173"
echo ""
echo "For detailed documentation, see README.md"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
