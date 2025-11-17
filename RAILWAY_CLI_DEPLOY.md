# 🚀 Railway CLI Deployment Guide

Deploy your backend to Railway using the CLI - faster and more automated!

---

## 📋 Prerequisites

- Railway CLI installed ✅ (already done)
- GitHub account (for Railway login)
- Your Vercel frontend URL

---

## 🔐 Step 1: Login to Railway

**You need to do this manually** (opens browser):

```bash
railway login
```

This will:
1. Open your browser
2. Ask you to authorize Railway
3. Complete the login

**Verify login:**
```bash
railway whoami
```

Should show your email address.

---

## 🎯 Step 2: Create or Link Project

### Option A: Create New Project

```bash
cd backend
railway init
```

This will:
- Ask for project name (e.g., "proposal-app")
- Create a new Railway project
- Link your local directory to it

### Option B: Link to Existing Project

If you already created a project in Railway dashboard:

```bash
cd backend
railway link
```

Select your project from the list.

---

## 🗄️ Step 3: Add PostgreSQL Database

**From Railway Dashboard:**
1. Go to https://railway.app/dashboard
2. Click on your project
3. Click **"+ New"**
4. Select **"Database"** → **"Add PostgreSQL"**
5. Wait ~30 seconds

**Or from CLI (if supported):**
```bash
railway add postgresql
```

The `DATABASE_URL` will be automatically injected into your service.

---

## ⚙️ Step 4: Configure Service Settings

**Set Root Directory (CRITICAL):**

From Railway Dashboard:
1. Click on your service
2. **Settings** → **Root Directory**
3. Set to: `backend`
4. Save

**Or verify build/start commands are correct:**
- Build: `npm install && npx prisma generate && npm run build`
- Start: `npm start`

---

## 🔐 Step 5: Set Environment Variables

### Quick Method: Use the Deployment Script

```bash
# From project root
./deploy-railway.sh
```

The script will:
- ✅ Generate secure JWT secrets
- ✅ Set all required environment variables
- ✅ Run database migrations
- ✅ Seed the database
- ✅ Deploy your app

### Manual Method: Set Variables One by One

```bash
cd backend

# Generate and set JWT_SECRET
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
railway variables set JWT_SECRET="$JWT_SECRET"

# Generate and set JWT_REFRESH_SECRET
JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
railway variables set JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"

# Set NODE_ENV
railway variables set NODE_ENV=production

# Set FRONTEND_URL (replace with your Vercel URL!)
railway variables set FRONTEND_URL="https://your-vercel-app.vercel.app,http://localhost:3000"

# Verify all variables
railway variables
```

**Required Variables:**
- ✅ `DATABASE_URL` (auto-injected from PostgreSQL)
- ✅ `JWT_SECRET` (secure random string)
- ✅ `JWT_REFRESH_SECRET` (different from JWT_SECRET)
- ✅ `NODE_ENV=production`
- ✅ `FRONTEND_URL` (your Vercel URL + localhost)

---

## 🗃️ Step 6: Run Database Migrations

```bash
cd backend
railway run npx prisma migrate deploy
```

This creates all database tables.

---

## 🌱 Step 7: Seed Database

```bash
railway run npm run seed
```

This populates the database with contract templates.

---

## 🚀 Step 8: Deploy

```bash
railway up
```

Or Railway will auto-deploy when you push to GitHub (if auto-deploy is enabled).

**Watch deployment:**
```bash
railway logs --follow
```

---

## 🌐 Step 9: Get Your Backend URL

```bash
railway domain
```

Or generate a custom domain:
```bash
railway domain generate
```

Copy the URL - you'll need it for Vercel!

---

## 🔗 Step 10: Connect Frontend to Backend

1. **Get your Railway backend URL:**
   ```bash
   railway domain
   ```
   Example: `https://your-app-production-xxxx.up.railway.app`

2. **Update Vercel:**
   - Go to Vercel Dashboard → Your Project
   - **Settings** → **Environment Variables**
   - Update `VITE_API_URL`:
     ```
     https://your-app-production-xxxx.up.railway.app/api
     ```
   - Save
   - **Deployments** → Redeploy latest

---

## ✅ Step 11: Test Everything

**Test backend:**
```bash
# Health check
curl https://your-app.up.railway.app/health

# Test API
curl https://your-app.up.railway.app/api/templates
```

**Test frontend:**
1. Visit your Vercel URL
2. Try registering a new account
3. Try logging in
4. Check if templates load
5. ✅ Everything should work!

---

## 📊 Useful Railway CLI Commands

```bash
# View project status
railway status

# View logs (live)
railway logs --follow

# View environment variables
railway variables

# Set environment variable
railway variables set KEY=value

# Run command in Railway environment
railway run <command>

# Open Railway dashboard
railway open

# View deployments
railway logs

# Get service URL
railway domain
```

---

## 🔄 Auto-Deploy from GitHub

Railway automatically deploys when you push to GitHub!

**Enable/Disable:**
- Railway Dashboard → Service → Settings → Source
- Toggle "Auto Deploy"

**Test auto-deploy:**
```bash
# Make a small change
echo "// test" >> backend/src/server.ts

# Commit and push
git add backend/src/server.ts
git commit -m "test: verify auto-deploy"
git push

# Watch Railway dashboard - should auto-deploy!
```

---

## 🐛 Troubleshooting

### "Not logged in"
```bash
railway login
```

### "Project not linked"
```bash
cd backend
railway link
```

### "DATABASE_URL not found"
- Add PostgreSQL database in Railway dashboard
- It auto-injects `DATABASE_URL` to your service

### "Build fails"
- Check Root Directory is set to `backend`
- Verify `package.json` exists in `backend/` folder
- Check build logs: `railway logs`

### "CORS errors"
- Verify `FRONTEND_URL` includes your Vercel URL
- Format: `https://your-app.vercel.app,http://localhost:3000`
- Redeploy after updating

### "Migrations fail"
```bash
# Check database connection
railway run npx prisma db pull

# Run migrations again
railway run npx prisma migrate deploy
```

---

## 📋 Deployment Checklist

- [ ] Railway CLI installed
- [ ] Logged in (`railway login`)
- [ ] Project created/linked (`railway init` or `railway link`)
- [ ] PostgreSQL database added
- [ ] Root Directory set to `backend` (in dashboard)
- [ ] Environment variables set:
  - [ ] `DATABASE_URL` (auto-injected)
  - [ ] `JWT_SECRET`
  - [ ] `JWT_REFRESH_SECRET`
  - [ ] `NODE_ENV=production`
  - [ ] `FRONTEND_URL` (with Vercel URL)
- [ ] Database migrations run (`railway run npx prisma migrate deploy`)
- [ ] Database seeded (`railway run npm run seed`)
- [ ] Backend deployed (`railway up`)
- [ ] Domain generated (`railway domain`)
- [ ] Vercel `VITE_API_URL` updated
- [ ] Frontend redeployed
- [ ] Registration tested
- [ ] Login tested
- [ ] Templates loading

---

## 🎉 Success!

Your backend is now deployed to Railway! 🚀

**Quick commands reference:**
```bash
railway status      # Check status
railway logs        # View logs
railway domain      # Get URL
railway variables   # View env vars
railway open        # Open dashboard
```

---

## 💡 Pro Tips

1. **Use the deployment script:**
   ```bash
   ./deploy-railway.sh
   ```
   It automates everything!

2. **Monitor logs:**
   ```bash
   railway logs --follow
   ```
   Watch your app in real-time

3. **Run commands in Railway environment:**
   ```bash
   railway run npm run test
   railway run npx prisma studio
   ```

4. **Quick redeploy:**
   ```bash
   railway up
   ```
   Or just push to GitHub (if auto-deploy enabled)

---

## 🚀 Next Steps

1. ✅ Backend deployed to Railway
2. ✅ Frontend connected to backend
3. ✅ Test all features
4. ✅ Monitor usage in Railway dashboard
5. ✅ Set up alerts (optional)

**Your full-stack app is live!** 🎉

