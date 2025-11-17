# ✅ Railway Project Linked! - Next Steps

Your Railway project is now linked! Here's what to do next.

---

## 🎯 Current Status

✅ **Project Linked:** `proposal-app-backend`  
⏳ **Services:** None yet (need to create)  
⏳ **Environment Variables:** Not set yet

---

## 📋 Step 1: Open Railway Dashboard

**Run this in your terminal:**

```bash
cd "/Users/anuppandey/Dev Projects/proposal_app/backend"
railway open
```

This will open the Railway dashboard in your browser at:
https://railway.app/project/dcfa1e72-e755-431e-a28b-47e79ba6e697

---

## 🚀 Step 2: Create Services in Dashboard

Once the dashboard opens, you'll see:

### Add PostgreSQL Database:

1. Click the **"+ New"** button (big green/blue button)
2. Select **"Database"** from the dropdown
3. Choose **"Add PostgreSQL"**
4. Wait ~30 seconds
5. ✅ PostgreSQL service will appear

**Note:** Railway automatically injects `DATABASE_URL` into other services!

### Add Backend Service:

1. Click **"+ New"** button again
2. Select **"GitHub Repo"** or **"Deploy from GitHub repo"**
3. Find your repository: **`addressanup/proposal_app`**
4. Click **"Deploy Now"** or **"Add Service"**
5. ✅ Backend service will appear (might show as "proposal_app" or similar)

---

## ⚙️ Step 3: Configure Backend Service

**IMPORTANT:** After backend service is created:

1. **Click on the backend service** (not PostgreSQL)

2. **Go to "Settings" tab**

3. **Set Root Directory:**
   - Find **"Root Directory"** field
   - Set to: `backend` (exactly, no quotes)
   - Click **"Update"** or **"Save"**
   - ⚠️ **This is CRITICAL!**

4. **Verify Build Commands:**
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`

5. **Save and Redeploy:**
   - Click "Update" or "Save"
   - Go to "Deployments" tab
   - Click "Redeploy" on the latest deployment

---

## 🔐 Step 4: Set Environment Variables (CLI)

After services are created and configured, run:

```bash
cd "/Users/anuppandey/Dev Projects/proposal_app/backend"

# Use the setup script (replace with your Vercel URL)
./setup-railway-env.sh "https://your-vercel-app.vercel.app,http://localhost:3000"
```

Or manually:

```bash
# Generate and set JWT secrets
railway variables set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
railway variables set JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Set other variables
railway variables set NODE_ENV=production
railway variables set FRONTEND_URL="https://your-vercel-app.vercel.app,http://localhost:3000"
```

---

## 🗃️ Step 5: Run Database Migrations (CLI)

```bash
# Run migrations
railway run npx prisma migrate deploy

# Seed database with templates
railway run npm run seed
```

---

## 🚀 Step 6: Deploy (CLI)

```bash
# Deploy
railway up

# Or it will auto-deploy when you push to GitHub!
```

---

## 🌐 Step 7: Get Your Backend URL

```bash
# Get deployment URL
railway domain

# Or generate domain in dashboard:
# Service → Settings → Domains → Generate Domain
```

---

## 🔗 Step 8: Update Vercel Frontend

1. Copy your Railway backend URL (from Step 7)
2. Go to Vercel Dashboard → Your Project
3. Settings → Environment Variables
4. Update `VITE_API_URL`:
   ```
   https://your-app-production-xxxx.up.railway.app/api
   ```
5. Redeploy frontend

---

## ✅ Checklist

- [x] Railway project linked ✅
- [ ] PostgreSQL database added (Dashboard)
- [ ] Backend service added (Dashboard)
- [ ] Root Directory set to `backend` (Dashboard Settings)
- [ ] Environment variables set (CLI)
- [ ] Database migrations run (CLI)
- [ ] Database seeded (CLI)
- [ ] Backend deployed (CLI)
- [ ] Domain generated (CLI or Dashboard)
- [ ] Vercel `VITE_API_URL` updated
- [ ] Frontend redeployed
- [ ] Tested registration/login

---

## 📊 Useful Commands

```bash
# Check status
railway status

# Open dashboard
railway open

# View logs
railway logs --follow

# Set variable
railway variables set KEY=value

# View variables
railway variables

# Run command
railway run <command>

# Deploy
railway up

# Get URL
railway domain
```

---

## 🎯 Quick Summary

1. **Dashboard:** Create PostgreSQL and backend services
2. **Dashboard:** Set Root Directory to `backend` for backend service
3. **CLI:** Set environment variables
4. **CLI:** Run migrations and seed
5. **CLI:** Deploy (or auto-deploy from GitHub)
6. **CLI:** Get backend URL
7. **Vercel:** Update frontend with backend URL

---

## 🚀 You're Almost There!

Project is linked ✅  
Now create services in the dashboard, then continue with CLI commands!

**Next command to run:**
```bash
railway open
```

This opens the dashboard so you can create services! 🎉

