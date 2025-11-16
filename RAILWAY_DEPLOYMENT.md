# Deploy Backend to Railway - Step by Step Guide

## 🚀 Deploy Your Backend to Railway (10 Minutes)

Railway is perfect for Node.js backends with PostgreSQL. It's free to start and super easy.

---

## 📋 Step 1: Sign Up for Railway

1. Go to **https://railway.app**
2. Click **"Login"** or **"Start a New Project"**
3. Sign in with **GitHub** (recommended)
4. Authorize Railway to access your GitHub account

---

## 🎯 Step 2: Create New Project

1. Click **"New Project"** (big button on dashboard)
2. Select **"Deploy from GitHub repo"**
3. If you don't see your repos, click **"Configure GitHub App"** to grant access
4. Find and select: **`addressanup/proposal_app`**
5. Railway will detect it's a Node.js project ✅

---

## ⚙️ Step 3: Configure the Service

After selecting your repo, Railway creates a service. Now configure it:

### 3.1: Set Root Directory

1. Click on your service (shows the deployment)
2. Go to **"Settings"** tab
3. Scroll to **"Root Directory"**
4. Set to: **`backend`**
5. Click **"Update"**

### 3.2: Set Build & Start Commands

Still in Settings:

**Build Command:**
```bash
npm install && npx prisma generate
```

**Start Command:**
```bash
npm start
```

**Watch Paths (optional):**
```
backend/**
```

---

## 🗄️ Step 4: Add PostgreSQL Database

1. Click **"New"** button in your project
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Railway will provision a PostgreSQL database (30 seconds)
5. ✅ Database created!

The database is automatically connected to your backend service.

---

## 🔐 Step 5: Set Environment Variables

Click on your **backend service** → **"Variables"** tab

### Add These Variables:

**1. DATABASE_URL** (should already be there automatically)
```
postgresql://user:password@host:5432/railway
```
✅ Railway auto-injects this from the PostgreSQL service

**2. JWT_SECRET**
```
your-super-secret-jwt-key-at-least-32-characters-long-abc123
```
⚠️ Use a real random string in production!

**3. JWT_REFRESH_SECRET**
```
your-super-secret-refresh-key-also-32-chars-minimum-xyz789
```
⚠️ Different from JWT_SECRET!

**4. NODE_ENV**
```
production
```

**5. PORT** (optional, Railway sets this automatically)
```
5000
```

### How to Add Variables:

1. Click **"New Variable"**
2. Enter **Variable Name** (e.g., `JWT_SECRET`)
3. Enter **Value**
4. Click **"Add"**
5. Repeat for all variables

**Generate Random Secrets:**
```bash
# Run this locally to generate secure secrets:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🔨 Step 6: Deploy

1. Railway should auto-deploy after you save settings
2. If not, click **"Deploy"** button
3. Watch the **"Deployments"** tab for progress
4. Wait 2-3 minutes for build to complete

**Deployment Logs** will show:
```
Installing dependencies...
Running prisma generate...
Building TypeScript...
Starting server...
✓ Deployed
```

---

## 🌐 Step 7: Get Your Backend URL

1. Click on your backend service
2. Go to **"Settings"** tab
3. Scroll to **"Domains"**
4. Click **"Generate Domain"**
5. Railway gives you a URL like:
   ```
   https://proposal-app-production-xxxx.up.railway.app
   ```
6. **Copy this URL** - you'll need it!

---

## 🗃️ Step 8: Run Database Migrations

Railway doesn't automatically run Prisma migrations. You need to do it once:

### Option A: Using Railway CLI (Recommended)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migration
railway run npx prisma migrate deploy

# Seed database with templates
railway run npm run seed
```

### Option B: Using Railway Dashboard (Temporary)

1. Backend service → **Settings**
2. Change **Start Command** temporarily to:
   ```
   npx prisma migrate deploy && npm start
   ```
3. Redeploy
4. After successful deploy, change Start Command back to:
   ```
   npm start
   ```

### Option C: Connect Locally

```bash
# In your local backend folder
# Copy DATABASE_URL from Railway Variables tab

export DATABASE_URL="postgresql://user:pass@host.railway.app:5432/railway"

# Run migrations
npx prisma migrate deploy

# Seed database
npm run seed
```

---

## ✅ Step 9: Test Your Backend

Test if backend is running:

```bash
# Replace with your Railway URL
curl https://your-app.up.railway.app/api/health

# Or visit in browser:
https://your-app.up.railway.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-11-16T..."
}
```

---

## 🔗 Step 10: Connect Frontend to Backend

Now update your Vercel frontend to use the Railway backend:

### 10.1: Update Vercel Environment Variable

1. Go to **Vercel Dashboard** → Your Project
2. **Settings** → **Environment Variables**
3. Find **`VITE_API_URL`** or add it:
   ```
   Name: VITE_API_URL
   Value: https://your-app.up.railway.app/api
   ```
   ⚠️ Replace with YOUR Railway URL!
4. Save

### 10.2: Redeploy Frontend

1. **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Wait 1-2 minutes

---

## 🎉 Step 11: Test Everything

Visit your Vercel frontend URL:

**Test Registration:**
1. Go to `/register`
2. Fill in the form:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: Test123!@#
3. Click Register
4. ✅ Should succeed and redirect to login!

**Test Login:**
1. Login with the credentials you just created
2. ✅ Should redirect to dashboard!

**Test Data:**
1. Go to `/templates`
2. Should show 8 contract templates ✅
3. Click on a template to view details ✅

---

## 🐛 Troubleshooting

### Deployment Failed

**Check Build Logs:**
1. Railway → Deployments tab
2. Click on failed deployment
3. Check logs for errors

**Common Issues:**
- **Missing dependencies:** Make sure `package.json` is correct
- **Prisma errors:** Run `npx prisma generate` in build command
- **TypeScript errors:** Fix errors in code, push changes

### Database Connection Errors

**Check DATABASE_URL:**
1. Railway → PostgreSQL service
2. Variables tab
3. Copy `DATABASE_URL`
4. Make sure backend service has this variable

**Test Connection:**
```bash
# Using Railway CLI
railway run npx prisma studio

# Opens Prisma Studio to view database
```

### Backend Not Responding

**Check Service Logs:**
1. Backend service → Deployments
2. Click on active deployment
3. View logs
4. Look for errors

**Restart Service:**
1. Settings → Restart
2. Or redeploy

### CORS Errors

If you see CORS errors in browser console, update backend:

**Edit `backend/src/server.ts`:**
```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-vercel-app.vercel.app'  // Add your Vercel URL
  ],
  credentials: true
}));
```

Commit and push changes, Railway will auto-deploy.

---

## 💰 Railway Pricing

**Free Tier:**
- $5 monthly credit (free)
- Good for testing and small apps
- Enough for this project to start!

**After Free Tier:**
- Pay-as-you-go
- ~$10-20/month for small production app
- Pause services when not in use to save credits

**Monitor Usage:**
- Railway Dashboard → Usage tab
- Shows current usage and credits remaining

---

## 🔄 Automatic Deployments

Railway automatically deploys when you push to GitHub!

**How it works:**
1. You push code to GitHub
2. Railway detects changes in `backend/` folder
3. Automatically builds and deploys
4. ✅ Your backend is updated!

**Disable Auto-Deploy (if needed):**
1. Settings → GitHub
2. Toggle "Auto-Deploy" off

---

## 📊 Summary Checklist

After following all steps, you should have:

- [ ] Railway account created
- [ ] Project created from GitHub repo
- [ ] PostgreSQL database added
- [ ] Environment variables set (JWT secrets, DATABASE_URL)
- [ ] Root directory set to `backend`
- [ ] Backend deployed successfully
- [ ] Domain generated (Railway URL)
- [ ] Database migrations run
- [ ] Database seeded with templates
- [ ] Vercel frontend updated with Railway backend URL
- [ ] Frontend redeployed
- [ ] Registration tested and working
- [ ] Login tested and working
- [ ] Templates loading correctly

---

## 🎯 Final URLs

After deployment, you'll have:

**Frontend (Vercel):**
```
https://your-app.vercel.app
```

**Backend (Railway):**
```
https://your-app.up.railway.app
```

**Database (Railway PostgreSQL):**
```
Managed by Railway
Accessible at: DATABASE_URL in environment variables
```

---

## 🚀 Next Steps

Once deployed:

1. **Test all features:**
   - Registration ✅
   - Login ✅
   - Dashboard ✅
   - Templates ✅
   - Contracts ✅

2. **Monitor performance:**
   - Railway → Metrics tab
   - Check response times
   - Monitor database usage

3. **Set up alerts:**
   - Railway can notify you of deployments
   - Set up error tracking (optional)

---

## 💡 Pro Tips

**1. Use Railway CLI for faster workflows:**
```bash
railway link      # Link to project
railway logs      # View logs
railway run       # Run commands
railway open      # Open dashboard
```

**2. Environment Secrets:**
Never commit real secrets to GitHub! Always use Railway environment variables.

**3. Database Backups:**
Railway Pro tier includes automatic backups. For free tier, export manually:
```bash
railway run npx prisma db pull
```

**4. Cost Optimization:**
- Use Railway's sleep feature for non-production apps
- Monitor usage regularly
- Pause unused services

---

## ✅ Success!

After following this guide, your backend will be:
- ✅ Deployed to Railway
- ✅ Connected to PostgreSQL database
- ✅ Accessible from your Vercel frontend
- ✅ Auto-deploying on every push

**Your full-stack app is now live!** 🎉
