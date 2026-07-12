# BASIRA Backend - Environment Setup Guide 🚀

This guide will walk you through setting up the BASIRA backend development environment from scratch.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [System Requirements](#system-requirements)
3. [Installation Steps](#installation-steps)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)
9. [Production Setup](#production-setup)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

| Software | Minimum Version | Recommended | Purpose |
|----------|----------------|-------------|---------|
| **Node.js** | 18.0.0 | 20.x LTS | Runtime environment |
| **npm** | 9.0.0 | 10.x | Package manager |
| **PostgreSQL** | 14.0 | 15.x | Database |
| **Git** | 2.30+ | Latest | Version control |

### Optional Software

| Software | Purpose |
|----------|---------|
| **Redis** | Caching and session storage (recommended for production) |
| **Docker** | Containerization (optional but recommended) |
| **Postman** | API testing |
| **VS Code** | Recommended IDE |

---

## System Requirements

### Development Environment

- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: Minimum 4GB, recommended 8GB+
- **Storage**: 2GB free space
- **Internet**: Required for initial setup

### Production Environment

- **OS**: Linux (Ubuntu 22.04 LTS recommended)
- **RAM**: Minimum 2GB, recommended 4GB+
- **CPU**: 2+ cores recommended
- **Storage**: 10GB+ free space
- **Network**: SSL certificate for HTTPS

---

## Installation Steps

### Step 1: Install Node.js

#### Windows

1. Download Node.js installer from [nodejs.org](https://nodejs.org/)
2. Run the installer and follow the prompts
3. Verify installation:
```bash
node --version
npm --version
```

#### macOS

Using Homebrew:
```bash
brew install node@20
```

Or download from [nodejs.org](https://nodejs.org/)

#### Linux (Ubuntu/Debian)

```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

---

### Step 2: Install PostgreSQL

#### Windows

1. Download PostgreSQL installer from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer and remember the password you set for 'postgres' user
3. Verify installation:
```bash
psql --version
```

#### macOS

Using Homebrew:
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Linux (Ubuntu/Debian)

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify
sudo -u postgres psql --version
```

---

### Step 3: Install Redis (Optional but Recommended)

#### Windows

1. Download Redis for Windows from [GitHub](https://github.com/microsoftarchive/redis/releases)
2. Run installer
3. Start Redis service

#### macOS

```bash
brew install redis
brew services start redis
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

Verify Redis:
```bash
redis-cli ping
# Should return: PONG
```

---

### Step 4: Clone the Repository

```bash
# Clone the project
git clone https://github.com/your-org/basira-backend.git

# Navigate to project directory
cd basira-backend

# Check current branch
git branch
```

---

### Step 5: Install Project Dependencies

```bash
# Install all dependencies
npm install

# This will install:
# - Fastify and plugins
# - Prisma ORM
# - TypeScript
# - All required dependencies
```

**Expected output:**
```
added 500+ packages in 2m
```

---

## Environment Configuration

### Step 1: Create Environment File

```bash
# Copy the example environment file
cp .env.example .env

# On Windows (PowerShell)
Copy-Item .env.example .env
```

### Step 2: Configure Environment Variables

Open `.env` file and configure the following variables:

#### Application Configuration

```env
# Application
NODE_ENV=development
PORT=3000
API_VERSION=v1
API_PREFIX=/api/v1
```

#### Database Configuration

```env
# PostgreSQL Connection String Format:
# postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public

# Development Example:
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/basira_db?schema=public

# Replace:
# - your_password: Your PostgreSQL password
# - localhost: Your database host
# - 5432: PostgreSQL port (default)
# - basira_db: Database name (will be created)
```

#### JWT Secrets

**🔐 IMPORTANT**: Generate strong secrets for production!

```env
# Generate strong secrets (64+ characters)
JWT_ACCESS_SECRET=your-super-secret-jwt-access-key-change-in-production-minimum-64-chars
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-change-in-production-minimum-64-chars

# Token expiry
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

**Generate strong secrets:**

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64
```

#### Redis Configuration (Optional)

```env
# Redis (if using)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DB=0
```

#### SMS Service Configuration

For development, you can use mock mode. For production, configure Twilio:

```env
# Development (Mock Mode)
SMS_PROVIDER=mock

# Production (Twilio)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

**Get Twilio Credentials:**
1. Sign up at [twilio.com](https://www.twilio.com/)
2. Get Account SID and Auth Token from dashboard
3. Purchase a phone number

#### Security Configuration

```env
# Encryption
ENCRYPTION_KEY=your-32-byte-encryption-key-for-sensitive-data
BCRYPT_ROUNDS=12

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:8080
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# OTP Configuration
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=3
OTP_RATE_LIMIT_WINDOW=15
OTP_DAILY_LIMIT=10
```

---

## Database Setup

### Step 1: Create Database

#### Using PostgreSQL CLI

```bash
# Linux/macOS - Connect as postgres user
sudo -u postgres psql

# Windows - Open psql from Start menu
# Enter password when prompted
```

```sql
-- Create database
CREATE DATABASE basira_db;

-- Create user (optional, for better security)
CREATE USER basira_user WITH ENCRYPTED PASSWORD 'strong_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE basira_db TO basira_user;

-- Exit
\q
```

#### Using pgAdmin (GUI)

1. Open pgAdmin
2. Right-click on "Databases" → "Create" → "Database"
3. Enter name: `basira_db`
4. Click "Save"

### Step 2: Update Connection String

Update your `.env` file with the correct database URL:

```env
# If using default postgres user:
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/basira_db?schema=public

# If you created basira_user:
DATABASE_URL=postgresql://basira_user:strong_password@localhost:5432/basira_db?schema=public
```

### Step 3: Run Migrations

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations to create tables
npm run db:migrate

# Expected output:
# ✔ Your database is now in sync with your schema
```

This will create all tables:
- users
- user_profiles
- user_settings
- financial_goals
- goal_transactions
- expenses
- expense_categories
- income
- budgets
- notifications
- ai_insights
- user_sessions
- otp_codes
- audit_logs
- user_achievements

### Step 4: Seed Database

```bash
# Populate database with initial data
npm run db:seed

# This will create:
# - Default expense categories (Food, Transport, etc.)
# - Demo data (optional)
```

### Step 5: Verify Database Setup

```bash
# Open Prisma Studio to view your data
npm run db:studio

# Opens in browser at: http://localhost:5555
```

Or verify with SQL:

```bash
# Connect to database
psql postgresql://postgres:password@localhost:5432/basira_db

# List tables
\dt

# Check expense categories
SELECT * FROM expense_categories;

# Exit
\q
```

---

## Running the Application

### Development Mode

```bash
# Start development server with hot reload
npm run dev

# Server will start on: http://localhost:3000
# API Documentation: http://localhost:3000/api/docs
```

**Expected output:**
```
🚀 Server listening on 0.0.0.0:3000
📚 Environment: development
🔐 Authentication: Enabled
📊 Database: PostgreSQL with Prisma
📖 API Documentation: http://0.0.0.0:3000/api/docs
```

### Production Mode

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Using PM2 (Production Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Build the project
npm run build

# Start with PM2
pm2 start dist/app.js --name basira-api

# View logs
pm2 logs basira-api

# Restart
pm2 restart basira-api

# Stop
pm2 stop basira-api
```

---

## Verification

### 1. Check Server Health

```bash
curl http://localhost:3000/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12.345,
  "environment": "development"
}
```

### 2. Access API Documentation

Open in browser:
```
http://localhost:3000/api/docs
```

You should see the Swagger UI with all API endpoints documented.

### 3. Test Authentication Endpoint

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "أحمد محمد",
    "phoneNumber": "+962791234567",
    "password": "SecurePass123!",
    "dateOfBirth": "2000-01-01"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "تم إنشاء الحساب بنجاح. يرجى التحقق من رقم الهاتف.",
  "data": {
    "userId": "uuid-here",
    "requiresVerification": true,
    "otpSent": true
  }
}
```

### 4. Check Database Connection

```bash
# Open Prisma Studio
npm run db:studio

# Verify:
# 1. All tables are visible
# 2. Expense categories exist
# 3. You can browse data
```

### 5. Check Logs

```bash
# View application logs
tail -f logs/combined.log

# View error logs
tail -f logs/error.log
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error:**
```
Error: Port 3000 is already in use
```

**Solution:**
```bash
# Find process using port 3000
# Linux/macOS:
lsof -i :3000

# Windows:
netstat -ano | findstr :3000

# Kill the process or change PORT in .env
PORT=3001
```

#### 2. Database Connection Failed

**Error:**
```
Error: Can't reach database server at localhost:5432
```

**Solutions:**

1. Check if PostgreSQL is running:
```bash
# Linux/macOS:
sudo systemctl status postgresql

# Windows: Check Services app
```

2. Verify database credentials in `.env`
3. Check if database exists:
```bash
psql -U postgres -l
```

4. Verify connection string format:
```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

#### 3. Migration Failed

**Error:**
```
Error: Migration failed to apply
```

**Solution:**
```bash
# Reset database (⚠️ WARNING: Deletes all data)
npx prisma migrate reset

# Or manually drop and recreate
psql -U postgres -c "DROP DATABASE IF EXISTS basira_db;"
psql -U postgres -c "CREATE DATABASE basira_db;"

# Then run migrations again
npm run db:migrate
```

#### 4. Module Not Found

**Error:**
```
Error: Cannot find module '@fastify/jwt'
```

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 5. Prisma Client Not Generated

**Error:**
```
Error: @prisma/client did not initialize yet
```

**Solution:**
```bash
# Generate Prisma Client
npm run db:generate
```

#### 6. TypeScript Compilation Errors

**Error:**
```
Error: TS2307: Cannot find module
```

**Solution:**
```bash
# Reinstall dependencies
npm install

# Generate Prisma Client
npm run db:generate

# Check TypeScript config
npx tsc --showConfig
```

#### 7. Environment Variables Not Loaded

**Error:**
```
Error: JWT_ACCESS_SECRET is required
```

**Solution:**
1. Ensure `.env` file exists in project root
2. Verify all required variables are set
3. Restart the server after changing `.env`

#### 8. Redis Connection Failed (if using Redis)

**Error:**
```
Error: Redis connection refused
```

**Solution:**
```bash
# Check if Redis is running
redis-cli ping

# Start Redis
# Linux/macOS:
sudo systemctl start redis

# Windows: Start Redis service from Services app

# Or comment out Redis in .env if not needed
```

---

## Production Setup

### 1. Environment Variables

Create production `.env` with secure values:

```env
NODE_ENV=production
PORT=3000

# Secure database with SSL
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# Strong secrets (64+ characters)
JWT_ACCESS_SECRET=<generated-with-crypto.randomBytes>
JWT_REFRESH_SECRET=<generated-with-crypto.randomBytes>
ENCRYPTION_KEY=<generated-with-crypto.randomBytes>

# Production CORS
CORS_ORIGIN=https://yourdomain.com
CORS_CREDENTIALS=true

# Real SMS service
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=<your-sid>
TWILIO_AUTH_TOKEN=<your-token>
TWILIO_PHONE_NUMBER=<your-number>

# Security
HELMET_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
SENTRY_DSN=<your-sentry-dsn>
ANALYTICS_ENABLED=true
```

### 2. Database Migration

```bash
# Run migrations (does not reset data)
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 3. Build for Production

```bash
# Install production dependencies only
npm ci --production

# Build TypeScript
npm run build

# Test production build
NODE_ENV=production node dist/app.js
```

### 4. Process Manager

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/app.js --name basira-api --instances max

# Setup startup script
pm2 startup
pm2 save

# Monitor
pm2 monit
```

### 5. Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name api.basira.jo;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d api.basira.jo

# Auto-renewal
sudo certbot renew --dry-run
```

### 7. Monitoring

- **Logs**: Setup log rotation with `logrotate`
- **Metrics**: Use Prometheus + Grafana
- **Errors**: Configure Sentry for error tracking
- **Uptime**: Setup health check monitoring

---

## Next Steps

After successful setup:

1. ✅ **Test all endpoints** - Use API documentation at `/api/docs`
2. ✅ **Review security** - Check security headers and rate limits
3. ✅ **Setup monitoring** - Configure logging and error tracking
4. ✅ **Write tests** - Add unit and integration tests
5. ✅ **Documentation** - Review all API documentation
6. ✅ **Backup strategy** - Setup database backups
7. ✅ **CI/CD** - Configure deployment pipeline

---

## Useful Commands Reference

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Build TypeScript
npm start                # Start production server

# Database
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier

# Testing (when implemented)
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

---

## Support

Need help? Check these resources:

- 📖 **Documentation**: `/docs` folder
- 🐛 **Issues**: GitHub Issues
- 💬 **Discord**: Join our community
- 📧 **Email**: support@basira.jo

---

## Security Checklist

Before going to production:

- [ ] Change all default passwords and secrets
- [ ] Use strong JWT secrets (64+ characters)
- [ ] Enable SSL/TLS for database connections
- [ ] Configure proper CORS origins
- [ ] Setup rate limiting
- [ ] Enable Helmet security headers
- [ ] Configure proper logging
- [ ] Setup error monitoring (Sentry)
- [ ] Regular security updates
- [ ] Database backups configured
- [ ] Firewall rules configured
- [ ] Environment variables secured

---

**Setup Complete! 🎉**

Your BASIRA backend is now ready for development!

Access your API at: `http://localhost:3000`
View documentation at: `http://localhost:3000/api/docs`
