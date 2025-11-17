# 🚀 Railway Setup - Step by Step

Your Railway project is created! Now complete these steps:

---

## ✅ Step 1: Add PostgreSQL Database (Dashboard)

1. **Open Railway Dashboard:**
   ```bash
   railway open
   ```
   Or visit: https://railway.app/project/dcfa1e72-e755-431e-a28b-47e79ba6e697

2. **Add PostgreSQL:**
   - Click **"+ New"** button
   - Select **"Database"**
   - Choose **"Add PostgreSQL"**
   - Wait ~30 seconds for provisioning
   - ✅ `DATABASE_URL` will be auto-injected

---

## ✅ Step 2: Add Backend Service (Dashboard)

1. **In Railway Dashboard:**
   - Click **"+ New"** button again
   - Select **"GitHub Repo"**
   - Choose: `addressanup/proposal_app`
   - Railway will detect it's a Node.js project

2. **Configure Service:**
   - Click on the new service
   - Go to **Settings** tab
   - **Root Directory:** Set to `backend` ⚠️ **CRITICAL!**
   - **Build Command:** (should auto-detect)
     ```
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command:** (should auto-detect)
     ```
     npm start
     ```

---

## ✅ Step 3: Set Environment Variables (CLI)

After PostgreSQL and backend service are added, run:

```bash
cd backend

# Generate and set JWT secrets
railway variables set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
railway variables set JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Set other required variables
railway variables set NODE_ENV=production

# Set FRONTEND_URL (replace with your actual Vercel URL!)
railway variables set FRONTEND_URL="https://your-vercel-app.vercel.app,http://localhost:3000"

# Verify
railway variables
```

---

## ✅ Step 4: Run Migrations & Seed (CLI)

```bash
# Run database migrations
railway run npx prisma migrate deploy

# Seed database with templates
railway run npm run seed
```

---

## ✅ Step 5: Deploy (CLI)

```bash
railway up
```

Or Railway will auto-deploy when you push to GitHub!

---

## ✅ Step 6: Get Your Backend URL

```bash
railway domain
```

Or generate domain in dashboard:
- Service → Settings → Domains → Generate Domain

---

## ✅ Step 7: Update Vercel

1. Copy your Railway backend URL
2. Go to Vercel Dashboard → Your Project
3. Settings → Environment Variables
4. Update `VITE_API_URL`:
   ```
   https://your-app-production-xxxx.up.railway.app/api
   ```
5. Redeploy frontend

---

## 🎯 Quick Commands Reference

```bash
# Check status
railway status

# View logs
railway logs --follow

# Set variable
railway variables set KEY=value

# View variables
railway variables

# Run command
railway run <command>

# Get URL
railway domain

# Open dashboard
railway open
```

---

## 📋 Checklist

- [ ] PostgreSQL database added (Dashboard)
- [ ] Backend service added from GitHub repo (Dashboard)
- [ ] Root Directory set to `backend` (Dashboard)
- [ ] Environment variables set (CLI)
- [ ] Database migrations run (CLI)
- [ ] Database seeded (CLI)
- [ ] Backend deployed (CLI or auto-deploy)
- [ ] Domain generated (CLI or Dashboard)
- [ ] Vercel `VITE_API_URL` updated
- [ ] Frontend redeployed
- [ ] Tested registration/login

---

## 🚀 You're Almost There!

Complete steps 1-2 in the dashboard, then run the CLI commands for steps 3-5.

Your backend will be live! 🎉

