# Vercel + Railway Deployment Guide

This guide covers deploying the ContractFlow CLM Platform with:
- **Frontend**: Vercel (CDN, static hosting)
- **Backend**: Railway (API, database, file storage)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    User Browser                     │
└──────────────┬──────────────────────────────────────┘
               │
               ├─── Static Files ──────► Vercel (Frontend)
               │                         - React App
               │                         - Landing Pages
               │                         - Dashboard UI
               │
               └─── API Requests ──────► Railway (Backend)
                                         - Express.js API
                                         - PostgreSQL DB
                                         - Prisma ORM
```

---

## 🚀 Quick Deploy

### Step 1: Deploy Backend to Railway

1. **Go to Railway Dashboard**
   - Visit: https://railway.app/dashboard
   - Click "New Project"

2. **Deploy from GitHub**
   - Select "Deploy from GitHub repo"
   - Choose your repository: `addressanup/proposal_app`
   - Railway will auto-detect the `railway.json` configuration

3. **Add PostgreSQL Database**
   - In your project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will auto-provision and connect it

4. **Configure Environment Variables**

   Go to your backend service → Variables tab and add:

   ```bash
   # Required Variables
   NODE_ENV=production
   PORT=8080

   # Database (auto-filled by Railway)
   DATABASE_URL=${{Postgres.DATABASE_URL}}

   # JWT Secrets (generate with: openssl rand -base64 64)
   JWT_SECRET=<generate-a-64-character-random-string>
   JWT_REFRESH_SECRET=<generate-a-different-64-character-random-string>

   # Frontend URL (will be your Vercel domain)
   FRONTEND_URL=https://your-app.vercel.app

   # AWS S3 (for file uploads)
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=<your-aws-key>
   AWS_SECRET_ACCESS_KEY=<your-aws-secret>
   S3_BUCKET_NAME=<your-bucket-name>

   # Email (SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=<your-email@gmail.com>
   SMTP_PASSWORD=<your-app-password>
   SMTP_FROM_NAME=ContractFlow
   SMTP_FROM_EMAIL=<your-email@gmail.com>
   ```

5. **Deploy**
   - Railway will automatically deploy on git push
   - Check deployment logs for any errors
   - Note your Railway backend URL: `https://your-backend.railway.app`

6. **Verify Backend is Running**
   ```bash
   curl https://your-backend.railway.app/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

---

### Step 2: Deploy Frontend to Vercel

#### Option A: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click "Add New..." → "Project"

2. **Import Repository**
   - Select your GitHub repository: `addressanup/proposal_app`
   - Vercel will auto-detect the `vercel.json` configuration

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: Leave as `/` (vercel.json handles the path)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`

4. **Environment Variables**

   Add the following environment variable:

   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | `https://your-backend.railway.app/api` |

   Replace `your-backend.railway.app` with your actual Railway backend URL.

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your frontend
   - Note your Vercel URL: `https://your-app.vercel.app`

6. **Update Railway FRONTEND_URL**
   - Go back to Railway → Backend service → Variables
   - Update `FRONTEND_URL` to your Vercel URL: `https://your-app.vercel.app`
   - This ensures CORS allows requests from your frontend

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# From project root
vercel

# Follow prompts:
# - Select project name
# - Root directory: ./ (keep default)
# - Modify settings: No

# Set environment variable
vercel env add VITE_API_URL production
# Enter: https://your-backend.railway.app/api

# Deploy to production
vercel --prod
```

---

## 🔧 Configuration Files

### Backend: `railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "backend/Dockerfile",
    "dockerContext": "backend"
  },
  "deploy": {
    "startCommand": "./start.sh",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Frontend: `vercel.json`

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## ✅ Post-Deployment Checklist

### Test Backend (Railway)

- [ ] Health check: `https://your-backend.railway.app/health`
- [ ] Database migrations ran successfully (check Railway logs)
- [ ] Environment variables are set correctly
- [ ] CORS allows your Vercel frontend domain

### Test Frontend (Vercel)

- [ ] Landing page loads: `https://your-app.vercel.app/`
- [ ] About page loads: `https://your-app.vercel.app/about`
- [ ] Features page loads: `https://your-app.vercel.app/features`
- [ ] Login page loads: `https://your-app.vercel.app/login`

### Test Integration

- [ ] User registration works (creates account via Railway API)
- [ ] User login works (authenticates via Railway API)
- [ ] Dashboard loads after login
- [ ] API calls work (check Network tab in browser DevTools)
- [ ] File uploads work (S3 integration)
- [ ] Email notifications work (SMTP configured)

---

## 🔍 Troubleshooting

### CORS Errors

**Problem**: Frontend can't reach backend API

**Solution**:
1. Check Railway `FRONTEND_URL` environment variable matches your Vercel domain
2. Ensure it includes `https://` protocol
3. No trailing slash: ✅ `https://app.vercel.app` ❌ `https://app.vercel.app/`

### API Calls Fail with 404

**Problem**: Frontend calling wrong API URL

**Solution**:
1. Check Vercel environment variable `VITE_API_URL`
2. Should end with `/api`: `https://your-backend.railway.app/api`
3. Redeploy frontend after changing environment variables

### Build Fails on Vercel

**Problem**: TypeScript or build errors

**Solution**:
1. Check Vercel build logs for specific errors
2. Ensure `frontend/package.json` build script is: `"build": "vite build"`
3. TypeScript strict mode is disabled in `frontend/tsconfig.json`

### Build Fails on Railway

**Problem**: Database migrations or Docker build errors

**Solution**:
1. Check Railway logs for specific errors
2. Ensure `DATABASE_URL` is set correctly
3. Verify `start.sh` is executable in Dockerfile
4. Check Prisma schema is valid

---

## 🔄 Continuous Deployment

Both platforms support automatic deployments:

### Vercel
- Auto-deploys on every push to `main` branch
- Preview deployments for pull requests
- View deployments: https://vercel.com/dashboard

### Railway
- Auto-deploys on every push to `main` branch
- View deployments and logs: https://railway.app/dashboard
- Monitor resource usage and costs

---

## 🌐 Custom Domains

### Add Custom Domain to Vercel (Frontend)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `app.yourdomain.com`)
3. Configure DNS:
   - **A Record**: Point to Vercel's IP
   - **CNAME**: Point to `cname.vercel-dns.com`
4. Wait for SSL certificate provisioning (automatic)

### Add Custom Domain to Railway (Backend)

1. Go to Railway Dashboard → Your Service → Settings → Domains
2. Click "Generate Domain" or add custom domain
3. For custom domain:
   - Add domain (e.g., `api.yourdomain.com`)
   - Configure DNS CNAME to Railway's provided value
4. Update Vercel's `VITE_API_URL` to new domain

### Update Environment Variables After Domain Changes

**Vercel**:
```bash
VITE_API_URL=https://api.yourdomain.com/api
```

**Railway**:
```bash
FRONTEND_URL=https://app.yourdomain.com
```

---

## 📊 Monitoring

### Railway Metrics
- CPU and Memory usage
- Request logs
- Error tracking
- Database connections

### Vercel Analytics
- Page views
- Performance metrics
- Core Web Vitals
- Geographic distribution

---

## 💰 Pricing

### Vercel (Hobby - Free)
- 100 GB bandwidth/month
- Unlimited sites
- Automatic HTTPS
- Free for personal projects

### Railway (Developer - $5/month)
- $5 free credit/month
- Pay for what you use
- ~$20-30/month typical for small apps
  - Backend service: ~$10-15/month
  - PostgreSQL: ~$5-10/month

---

## 🆘 Support

**Vercel Issues**: https://vercel.com/support
**Railway Issues**: https://help.railway.app/

**Project Issues**: Create an issue in the GitHub repository

---

## 🎉 Success!

Your ContractFlow CLM Platform is now live:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.railway.app
- **Database**: PostgreSQL on Railway
- **CDN**: Vercel Edge Network

Users can now access your landing page, register accounts, and use the full CLM platform!
