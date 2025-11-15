# Proposal Platform - Setup Guide

Complete setup guide for the Proposal Sharing Platform.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** package manager
- **Git** for version control

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd proposa_app
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/proposal_platform?schema=public"

# JWT Configuration (GENERATE NEW SECRETS FOR PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AWS S3 Configuration (Optional - for file uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=proposal-documents

# Email Configuration (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@proposalplatform.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Database Setup

**Create PostgreSQL Database:**

```bash
# Using psql command line
psql -U postgres

# In psql prompt:
CREATE DATABASE proposal_platform;
\q
```

**Run Prisma Migrations:**

```bash
npm run migrate
```

This will:
- Create all database tables
- Set up relationships
- Apply indexes

**View Database (Optional):**

```bash
npm run studio
```

Opens Prisma Studio at http://localhost:5555

#### Start Backend Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

Backend runs at: **http://localhost:5000**

### 3. Frontend Setup

#### Install Dependencies

```bash
cd ../frontend
npm install
```

#### Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

#### Start Frontend

```bash
npm start
```

Frontend runs at: **http://localhost:3000**

## Configuration Details

### JWT Secrets

**IMPORTANT:** Generate secure secrets for production:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Email Setup (Gmail Example)

1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password in `SMTP_PASSWORD`

### AWS S3 Setup (Optional)

For file uploads, configure AWS S3:

1. Create AWS Account
2. Create S3 Bucket
3. Create IAM User with S3 permissions
4. Get Access Key ID and Secret Access Key
5. Add to `.env` file

**Without S3:** File uploads will fail. Implement local storage alternative or disable file upload features.

## Database Schema

The platform uses PostgreSQL with Prisma ORM. Key models:

- **User**: Authentication, profiles, MFA
- **Organization**: Multi-tenant workspaces
- **OrganizationMember**: User-org relationships with roles
- **Proposal**: Main proposal documents
- **ProposalVersion**: Version control
- **Comment**: Threaded discussions
- **Signature**: Digital signatures
- **AuditLog**: Activity tracking
- **Notification**: User notifications

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/profile` - Get profile
- `POST /api/auth/mfa/setup` - Setup MFA
- `POST /api/auth/mfa/verify` - Verify MFA

### Organizations
- `GET /api/organizations` - List organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations/:id` - Get details
- `POST /api/organizations/:id/members` - Invite member
- `DELETE /api/organizations/:id/members/:memberId` - Remove member
- `PATCH /api/organizations/:id/members/:memberId/role` - Update role

### Proposals
- `GET /api/proposals` - List proposals
- `POST /api/proposals` - Create proposal
- `GET /api/proposals/:id` - Get details
- `PATCH /api/proposals/:id` - Update proposal
- `DELETE /api/proposals/:id` - Delete proposal
- `POST /api/proposals/:id/collaborators` - Add collaborator
- `GET /api/proposals/:id/comments` - Get comments
- `POST /api/proposals/:id/comments` - Add comment

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/mark-all-read` - Mark all read
- `POST /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

### Uploads
- `POST /api/upload/document` - Upload file
- `POST /api/upload/upload-url` - Get presigned URL
- `GET /api/upload/download/:fileKey` - Get download URL

## Testing the Setup

### 1. Health Check

```bash
curl http://localhost:5000/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### 2. Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 4. Frontend Test

1. Open http://localhost:3000
2. Click "Register"
3. Create account
4. Login
5. Create organization
6. Create proposal

## Common Issues

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Database Connection Error

- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in `.env`
- Ensure database exists
- Check credentials

### Prisma Migration Errors

```bash
# Reset database (CAUTION: Deletes all data)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate
```

### Frontend Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

- Verify `FRONTEND_URL` in backend `.env`
- Check CORS configuration in `backend/src/server.ts`

## Development Workflow

### Running Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Making Database Changes

1. Edit `backend/prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name description`
3. Prisma Client auto-generates

### Adding New Features

1. Backend:
   - Add service in `backend/src/services/`
   - Add controller in `backend/src/controllers/`
   - Add routes in `backend/src/routes/`
   - Update `server.ts`

2. Frontend:
   - Add service in `frontend/src/services/`
   - Add component/page in `frontend/src/components|pages/`
   - Update routing in `App.tsx`

## Security Checklist

Before deploying to production:

- [ ] Change all default secrets (JWT, database password)
- [ ] Use strong, unique passwords
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS for production domain only
- [ ] Set `NODE_ENV=production`
- [ ] Enable rate limiting
- [ ] Review firewall rules
- [ ] Backup database regularly
- [ ] Enable MFA for admin accounts
- [ ] Review and update dependencies
- [ ] Configure error logging (Sentry, etc.)
- [ ] Set up monitoring and alerts

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment guide.

## Troubleshooting

### Enable Debug Logging

**Backend:**
```env
NODE_ENV=development
```

**Prisma:**
```bash
DEBUG=prisma:* npm run dev
```

### Reset Everything

```bash
# Backend
cd backend
rm -rf node_modules dist
npm install
npx prisma migrate reset

# Frontend
cd ../frontend
rm -rf node_modules build
npm install
```

## Support

For issues and questions:
- Check [TODO.md](./TODO.md) for known issues
- Review [API Documentation](#api-endpoints)
- Check logs in terminal
- Create issue in repository

## Next Steps

1. ✅ Complete setup
2. Create your first user account
3. Set up an organization
4. Create a test proposal
5. Invite team members
6. Configure email notifications
7. Set up file storage (S3)
8. Review security settings
9. Plan production deployment

## Useful Commands

```bash
# Backend
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
npm run migrate      # Run database migrations
npm run studio       # Open Prisma Studio

# Frontend
npm start            # Start dev server
npm run build        # Build for production
npm test             # Run tests

# Database
npx prisma studio              # Open DB GUI
npx prisma migrate dev         # Create migration
npx prisma migrate reset       # Reset DB
npx prisma generate           # Generate client
npx prisma db push            # Push schema without migration
```

---

**Happy coding!** 🚀
