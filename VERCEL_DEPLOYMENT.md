# Vercel Deployment Guide

## ⚠️ Important: This is a Full-Stack Application

The CLM Platform has **two separate parts** that need to be deployed:

1. **Frontend** (React + Vite) → Deploy to Vercel
2. **Backend** (Node.js + Express) → Deploy separately (NOT to Vercel's frontend hosting)

---

## Frontend Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your repository: `addressanup/proposal_app`

3. **Configure Build Settings**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Environment Variables**
   Add these in Vercel Dashboard → Settings → Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   VITE_APP_NAME=CLM Platform
   ```
   ⚠️ Replace `https://your-backend-url.com` with your actual backend URL

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your frontend will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend folder
cd frontend

# Deploy
vercel

# Follow prompts:
# - Set root directory to current folder
# - Build Command: npm run build
# - Output Directory: dist
# - Development Command: npm run dev

# For production deployment
vercel --prod
```

---

## Backend Deployment Options

⚠️ **The backend CANNOT be deployed to Vercel's static hosting.** Choose one of these options:

### Option 1: Railway.app (Easiest for Node.js)

1. Go to https://railway.app
2. Sign in with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Select your repo
5. Configure:
   ```
   Root Directory: backend
   Build Command: npm install && npx prisma generate && npm run build
   Start Command: npm start
   ```
6. Add Environment Variables:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret
   JWT_REFRESH_SECRET=your-refresh-secret
   PORT=5000
   NODE_ENV=production
   ```
7. Railway will give you a URL like: `https://your-app.up.railway.app`
8. **Use this URL in your frontend's `VITE_API_URL`**

### Option 2: Render.com

1. Go to https://render.com
2. "New" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   ```
   Name: clm-backend
   Root Directory: backend
   Environment: Node
   Build Command: npm install && npx prisma generate && npm run build
   Start Command: npm start
   ```
5. Add environment variables (same as above)
6. Deploy
7. Use the Render URL in your `VITE_API_URL`

### Option 3: Heroku

```bash
# Install Heroku CLI
# Create new app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set JWT_REFRESH_SECRET=your-refresh-secret
heroku config:set NODE_ENV=production

# Deploy
git subtree push --prefix backend heroku main
```

### Option 4: DigitalOcean App Platform

1. Go to DigitalOcean
2. Create new App
3. Connect GitHub repo
4. Set root directory to `backend`
5. Configure build and run commands
6. Add environment variables
7. Deploy

---

## Complete Deployment Checklist

### Step 1: Deploy Backend First
- [ ] Choose backend hosting (Railway, Render, Heroku, etc.)
- [ ] Set up PostgreSQL database
- [ ] Add all environment variables
- [ ] Deploy backend
- [ ] Test backend API at `https://your-backend.com/api/health`
- [ ] Copy backend URL for frontend config

### Step 2: Deploy Frontend to Vercel
- [ ] Update `VITE_API_URL` environment variable with backend URL
- [ ] Deploy to Vercel
- [ ] Test frontend loads
- [ ] Test API connection

### Step 3: Database Setup
- [ ] Run Prisma migrations: `npx prisma migrate deploy`
- [ ] Seed database: `npm run seed`
- [ ] Verify data in database

### Step 4: Testing
- [ ] Register a new user
- [ ] Login
- [ ] View dashboard
- [ ] Browse templates
- [ ] Create a contract
- [ ] Test all features

---

## Troubleshooting

### Frontend Issues

**404 Error on Page Refresh**
- ✅ FIXED: `vercel.json` is already configured to handle this
- This file redirects all routes to `index.html` for client-side routing

**Blank Page / White Screen**
- Check browser console for errors
- Verify `VITE_API_URL` is set correctly
- Check Network tab for failed API calls

**API Errors / CORS Issues**
- Backend must allow your Vercel domain
- Update backend CORS configuration:
  ```typescript
  // backend/src/index.ts
  app.use(cors({
    origin: [
      'http://localhost:3000',
      'https://your-frontend.vercel.app'
    ]
  }));
  ```

### Backend Issues

**Database Connection Failed**
- Verify `DATABASE_URL` is correct
- Check database is accessible from hosting platform
- Use connection pooling for production

**Environment Variables Not Working**
- Ensure all variables are set in hosting dashboard
- Restart the app after adding variables
- Check variable names (case-sensitive)

**Build Fails**
- Check Node.js version (use 18+)
- Verify `package.json` scripts
- Check build logs for specific errors

---

## Environment Variables Reference

### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend.railway.app/api
VITE_APP_NAME=CLM Platform
```

### Backend (Railway/Render/etc)
```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-very-long-random-secret-key-here
JWT_REFRESH_SECRET=your-very-long-refresh-secret-key-here
PORT=5000
NODE_ENV=production

# Optional AWS S3 (if using file uploads)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket
```

---

## Updating Your Deployment

### Frontend Updates
```bash
# Vercel auto-deploys on git push
git add .
git commit -m "Update frontend"
git push origin main
# Vercel will automatically rebuild and deploy
```

### Backend Updates
- Railway/Render: Auto-deploy on git push
- Heroku: `git push heroku main`
- Manual: Redeploy via platform dashboard

---

## Cost Estimates

### Free Tier Options
- **Frontend (Vercel):** Free for personal projects
- **Backend (Railway):** $5/month credit (free to start)
- **Backend (Render):** Free tier available
- **Database:**
  - Railway PostgreSQL: Included
  - Render PostgreSQL: Free tier available
  - Heroku: $5/month

### Recommended Setup for Production
- Frontend: Vercel Pro ($20/month) - Better performance
- Backend: Railway ($10-20/month) - Based on usage
- Database: Managed PostgreSQL ($10-15/month)

**Total: ~$40-55/month for production**

---

## Quick Fix for Your Current Error

The 404 error you're seeing is now fixed! Here's what to do:

### Immediate Fix:

1. **Commit the new files:**
   ```bash
   git add frontend/vercel.json frontend/.vercelignore
   git commit -m "fix: Add Vercel configuration for SPA routing"
   git push
   ```

2. **In Vercel Dashboard:**
   - Go to your project settings
   - Deployments → Redeploy latest
   - Or wait for auto-deploy from git push

3. **Set Environment Variable:**
   - Settings → Environment Variables
   - Add `VITE_API_URL` with your backend URL
   - ⚠️ **Important:** You need to deploy the backend first!

### If Backend Not Deployed Yet:

**Option A: Quick Test (Frontend Only)**
- Set `VITE_API_URL=http://localhost:5000/api` (just to test frontend)
- Frontend will work but API calls will fail
- Good for testing UI only

**Option B: Deploy Full Stack (Recommended)**
1. Deploy backend to Railway (takes 5 minutes)
2. Get backend URL: `https://xxx.up.railway.app`
3. Update Vercel env: `VITE_API_URL=https://xxx.up.railway.app/api`
4. Redeploy frontend
5. Everything works! ✅

---

## Next Steps

1. ✅ Fix is committed (vercel.json added)
2. 🔄 Push to trigger Vercel redeploy
3. 🚀 Deploy backend to Railway/Render
4. 🔧 Update VITE_API_URL in Vercel
5. ✅ Test full application

Need help with backend deployment? Let me know which platform you'd like to use!
