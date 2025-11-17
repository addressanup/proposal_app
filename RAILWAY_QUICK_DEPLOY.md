# 🚀 Quick Railway Deployment Guide

Since your frontend is already deployed on Vercel, here's how to deploy your backend to Railway in 10 minutes.

---

## ✅ Prerequisites

- [ ] GitHub repository is connected to Railway
- [ ] Vercel frontend URL (you'll need this for CORS)

---

## 📋 Step-by-Step Deployment

### Step 1: Create Railway Project

1. Go to **https://railway.app**
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository: `proposal_app`
5. Railway will auto-detect it's a Node.js project ✅

### Step 2: Configure Service Settings

**CRITICAL:** Click on the service → **Settings** tab

**Set Root Directory:**
```
backend
```
⚠️ This tells Railway to look in the `backend/` folder, not the root!

**Verify Build Command** (should auto-detect):
```
npm install && npx prisma generate && npm run build
```

**Verify Start Command** (should auto-detect):
```
npm start
```

### Step 3: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Wait ~30 seconds for provisioning
4. ✅ `DATABASE_URL` is automatically added to your backend service!

### Step 4: Set Environment Variables

Click on your **backend service** → **"Variables"** tab

**Required Variables:**

1. **JWT_SECRET** (generate a secure random string):
   ```bash
   # Run locally to generate:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and paste as the value.

2. **JWT_REFRESH_SECRET** (generate a different one):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **NODE_ENV:**
   ```
   production
   ```

4. **FRONTEND_URL:**
   ```
   https://your-vercel-app.vercel.app,http://localhost:3000
   ```
   ⚠️ Replace `your-vercel-app.vercel.app` with your actual Vercel URL!
   (Comma-separated allows both production and local dev)

5. **PORT** (optional, Railway sets this automatically):
   ```
   5000
   ```

**Note:** `DATABASE_URL` should already be there (auto-injected from PostgreSQL service)

### Step 5: Deploy

1. Railway should **auto-deploy** after you save settings
2. If not, click **"Deploy"** button
3. Watch the **"Deployments"** tab for progress
4. Wait 2-3 minutes for build to complete

**Expected logs:**
```
✓ Installing dependencies...
✓ Running prisma generate...
✓ Building TypeScript...
✓ Starting server...
✓ Deployed successfully!
```

### Step 6: Get Your Backend URL

1. Click on your backend service
2. Go to **"Settings"** tab
3. Scroll to **"Domains"** section
4. Click **"Generate Domain"**
5. Copy your Railway URL:
   ```
   https://your-app-production-xxxx.up.railway.app
   ```

### Step 7: Run Database Migrations

**Option A: Using Railway CLI (Recommended)**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run npx prisma migrate deploy

# Seed database with templates
railway run npm run seed
```

**Option B: Manual (if CLI doesn't work)**

1. Backend service → **Settings**
2. Temporarily change **Start Command** to:
   ```
   npx prisma migrate deploy && npm run seed && npm start
   ```
3. Redeploy
4. After successful deploy, change Start Command back to:
   ```
   npm start
   ```

### Step 8: Test Your Backend

```bash
# Replace with your Railway URL
curl https://your-app.up.railway.app/health
# Or test the API endpoint:
curl https://your-app.up.railway.app/api/templates
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-11-16T..."
}
```

### Step 9: Connect Frontend to Backend

1. Go to **Vercel Dashboard** → Your Project
2. **Settings** → **Environment Variables**
3. Update or add **`VITE_API_URL`**:
   ```
   https://your-app-production-xxxx.up.railway.app/api
   ```
   ⚠️ Replace with YOUR Railway URL!
4. Click **Save**
5. Go to **Deployments** tab
6. Click **⋯** (three dots) on latest deployment
7. Click **Redeploy**
8. Wait 1-2 minutes

### Step 10: Test Everything

1. Visit your Vercel frontend URL
2. Try registering a new account
3. Try logging in
4. Check if templates load
5. ✅ Everything should work!

---

## 🔍 Troubleshooting

### Build Fails

**Check:**
- Root Directory is set to `backend` (not empty!)
- All environment variables are set
- Check deployment logs for specific errors

### CORS Errors

If you see CORS errors in browser console:
1. Verify `FRONTEND_URL` in Railway includes your Vercel URL
2. Make sure it's comma-separated: `https://your-app.vercel.app,http://localhost:3000`
3. Redeploy backend after updating

### Database Connection Errors

1. Verify `DATABASE_URL` exists in Variables tab
2. It should be auto-injected from PostgreSQL service
3. If missing, check that PostgreSQL service is in the same project

### Backend Not Responding

1. Check **Deployments** tab → View logs
2. Look for errors in startup
3. Verify migrations ran successfully
4. Try restarting the service

---

## ✅ Deployment Checklist

After deployment, verify:

- [ ] Railway project created from GitHub
- [ ] Root Directory set to `backend`
- [ ] PostgreSQL database added
- [ ] `DATABASE_URL` in environment variables
- [ ] `JWT_SECRET` set (secure random string)
- [ ] `JWT_REFRESH_SECRET` set (different from JWT_SECRET)
- [ ] `NODE_ENV=production` set
- [ ] `FRONTEND_URL` includes your Vercel URL
- [ ] Backend deployed successfully
- [ ] Domain generated (Railway URL)
- [ ] Database migrations completed
- [ ] Database seeded with templates
- [ ] Backend health check works
- [ ] Vercel `VITE_API_URL` updated
- [ ] Frontend redeployed
- [ ] Registration works
- [ ] Login works
- [ ] Templates load

---

## 🎯 Final URLs

**Frontend (Vercel):**
```
https://your-app.vercel.app
```

**Backend (Railway):**
```
https://your-app-production-xxxx.up.railway.app
```

**API Base URL:**
```
https://your-app-production-xxxx.up.railway.app/api
```

---

## 🔄 Auto-Deploy

Railway automatically deploys when you push to GitHub!

**How it works:**
1. Push code to GitHub
2. Railway detects changes in `backend/` folder
3. Automatically builds and deploys
4. ✅ Backend updated!

**Disable (if needed):**
- Settings → Source → Toggle "Auto Deploy" off

---

## 💰 Railway Pricing

**Free Tier:**
- $5 monthly credit (free)
- Perfect for testing and small apps
- Enough to get started!

**Monitor Usage:**
- Railway Dashboard → Usage tab
- Shows current usage and credits

---

## 🎉 Success!

Your full-stack app is now live:
- ✅ **Frontend:** Vercel (auto-deploys from GitHub)
- ✅ **Backend:** Railway (auto-deploys from GitHub)
- ✅ **Database:** Railway PostgreSQL (managed)

**Every push to GitHub automatically updates your live app!** 🚀

