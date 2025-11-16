# CLM Platform - Quick Start Guide

Get your CLM Platform up and running in 5 minutes!

---

## Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 18+** ([Download](https://nodejs.org/))
- ✅ **PostgreSQL 14+** ([Download](https://www.postgresql.org/download/))
- ✅ **Git** ([Download](https://git-scm.com/downloads))
- ✅ **npm or yarn** (comes with Node.js)

### Verify Installation

```bash
node --version    # Should be v18 or higher
npm --version     # Should be 9 or higher
psql --version    # Should be 14 or higher
```

---

## Quick Setup (5 Minutes)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd proposal_app
```

### Step 2: Set Up Database

```bash
# Create PostgreSQL database
createdb clm_platform

# Verify database was created
psql -l | grep clm_platform
```

### Step 3: Configure Backend

```bash
cd backend

# Copy environment template
cp .env.example .env

# Open .env and update the DATABASE_URL:
# DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/clm_platform"

# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Seed sample contract templates
npm run seed
```

**Expected Output:**
```
✅ Created system user
📄 Creating Employment Agreement templates...
📄 Creating Offer Letter templates...
📄 Creating NDA templates...
📄 Creating Vendor/Service Agreement templates...
📄 Creating Consulting Agreement templates...
✅ Created 8 contract templates
🎉 Seed completed successfully!
```

### Step 4: Configure Frontend

```bash
cd ../frontend

# Copy environment template
cp .env.example .env

# Install dependencies
npm install
```

### Step 5: Start the Platform

**Option A: Using the Startup Script (Recommended)**

```bash
# From the project root
./start-dev.sh
```

This script will:
- Check all prerequisites
- Install dependencies if needed
- Run migrations
- Start both backend and frontend
- Show you the URLs to access

**Option B: Manual Start (Two Terminals)**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### Step 6: Access the Platform

Open your browser to:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/health

---

## What You'll See

### On First Load

1. **Login Page** - The platform starts with a login interface
2. **Dashboard** - After authentication, you'll see:
   - Contract statistics
   - Quick actions
   - Navigation to Templates and Contracts

### Sample Data

After running `npm run seed`, you'll have **8 professional contract templates**:

1. **Full-Time Employment Agreement** - Tech Industry
2. **Part-Time Employment Agreement**
3. **Executive Job Offer Letter**
4. **Standard Job Offer Letter**
5. **Mutual Non-Disclosure Agreement**
6. **Unilateral Non-Disclosure Agreement**
7. **Master Services Agreement (MSA)**
8. **Independent Contractor Consulting Agreement**

---

## Quick Test

### Test the Backend API

```bash
# Check health
curl http://localhost:5000/health

# List templates (requires authentication)
curl http://localhost:5000/api/templates
```

### Create Your First Contract

1. Navigate to **http://localhost:3000/templates**
2. Click on a template to preview
3. Click "Use Template" to create a contract
4. Fill in the required fields
5. Click "Create Contract"

---

## Common Issues & Solutions

### Issue: Port Already in Use

**Symptoms:** Error message saying port 3000 or 5000 is already in use

**Solution:**
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Issue: Database Connection Failed

**Symptoms:** Error connecting to PostgreSQL

**Solutions:**

1. **Check if PostgreSQL is running:**
   ```bash
   pg_isready
   # Should output: /tmp:5432 - accepting connections
   ```

2. **Start PostgreSQL if not running:**
   ```bash
   # macOS (Homebrew)
   brew services start postgresql@14

   # Linux
   sudo systemctl start postgresql

   # Windows
   # Start PostgreSQL service from Services panel
   ```

3. **Verify DATABASE_URL in backend/.env:**
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/clm_platform"
   ```

4. **Test connection:**
   ```bash
   psql -U username -d clm_platform
   ```

### Issue: Frontend Can't Reach Backend

**Symptoms:** API errors in browser console, "Network Error"

**Solutions:**

1. **Ensure backend is running:**
   ```bash
   curl http://localhost:5000/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

2. **Check CORS configuration:**
   - Open `backend/src/server.ts`
   - Verify `FRONTEND_URL` in `.env` is `http://localhost:3000`

3. **Clear browser cache:**
   - Open DevTools (F12)
   - Right-click refresh button → "Empty Cache and Hard Reload"

### Issue: Seed Script Fails

**Symptoms:** Error when running `npm run seed`

**Solutions:**

1. **Ensure migrations are run first:**
   ```bash
   cd backend
   npx prisma migrate dev
   ```

2. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

3. **Check database connection and try again:**
   ```bash
   npm run seed
   ```

### Issue: Missing Environment Variables

**Symptoms:** "Environment variable not found" error

**Solution:**
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your values

# Frontend
cd frontend
cp .env.example .env
# Edit .env if needed (default values usually work)
```

---

## Next Steps

### 1. Explore the Platform

- **Templates:** Browse the 8 pre-built templates
- **Create Contract:** Create your first contract from a template
- **Dashboard:** View contract statistics and expiring contracts

### 2. Customize Templates

- Modify existing templates to match your needs
- Add custom fields
- Create new templates for your specific contract types

### 3. Invite Team Members

- Create an organization
- Invite team members
- Assign roles and permissions

### 4. Set Up Production

See [PLATFORM_COMPLETE.md](PLATFORM_COMPLETE.md) for production deployment guide.

---

## Development Workflow

### Daily Development

```bash
# Start the platform
./start-dev.sh

# In separate terminal, watch for database changes
cd backend
npx prisma studio  # Opens DB GUI at http://localhost:5555
```

### Making Changes

**Backend Changes:**
- Edit files in `backend/src/`
- Server auto-reloads on file changes

**Frontend Changes:**
- Edit files in `frontend/src/`
- Browser auto-reloads on file changes

**Database Changes:**
1. Edit `backend/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your_migration_name`
3. Prisma Client is auto-generated

### Adding New Features

1. **Backend:**
   - Add service in `backend/src/services/`
   - Add controller in `backend/src/controllers/`
   - Add route in `backend/src/routes/`
   - Register route in `backend/src/server.ts`

2. **Frontend:**
   - Add service in `frontend/src/services/`
   - Add component in `frontend/src/components/`
   - Add page in `frontend/src/pages/`
   - Add route in `frontend/src/App.tsx`

---

## Useful Commands

### Backend

```bash
cd backend

npm run dev          # Start development server
npm run build        # Build for production
npm run migrate      # Run database migrations
npm run seed         # Seed sample data
npm run studio       # Open Prisma Studio
npm test             # Run tests
```

### Frontend

```bash
cd frontend

npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

---

## API Endpoints Quick Reference

### Authentication
```bash
POST /api/auth/register       # Register new user
POST /api/auth/login          # Login
POST /api/auth/refresh        # Refresh token
```

### Templates
```bash
GET  /api/templates           # List all templates
GET  /api/templates/:id       # Get template
POST /api/templates           # Create template
POST /api/templates/:id/preview  # Preview template
```

### Contracts
```bash
GET  /api/contracts           # List contracts
GET  /api/contracts/:id       # Get contract
POST /api/contracts/from-template  # Create from template
GET  /api/contracts/expiring  # Get expiring contracts
GET  /api/contracts/statistics  # Dashboard stats
```

**Full API documentation:** [CLM_API_DOCUMENTATION.md](CLM_API_DOCUMENTATION.md)

---

## Resources

### Documentation
- **[Platform Overview](PLATFORM_COMPLETE.md)** - Complete platform documentation
- **[API Reference](CLM_API_DOCUMENTATION.md)** - All API endpoints
- **[Frontend Guide](frontend/README.md)** - Frontend development
- **[Roadmap](PLATFORM_ROADMAP.md)** - Future development plan

### External Resources
- **React:** https://react.dev
- **TypeScript:** https://www.typescriptlang.org
- **Prisma:** https://www.prisma.io/docs
- **Tailwind CSS:** https://tailwindcss.com
- **Vite:** https://vitejs.dev

---

## Getting Help

1. **Check the documentation** in the root folder
2. **Search existing issues** on GitHub
3. **Create a new issue** with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages (if any)
   - Environment details (OS, Node version, etc.)

---

## Success Checklist

After completing this guide, you should have:

- [ ] PostgreSQL database created and running
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] 8 sample templates in the database
- [ ] Ability to view templates
- [ ] Ability to create contracts (when fully implemented)

---

**Ready to build contracts?** 🚀

Access the platform at **http://localhost:3000** and start exploring!

**Questions?** Check [PLATFORM_COMPLETE.md](PLATFORM_COMPLETE.md) for detailed information.

---

**Last Updated:** 2025-01-16
