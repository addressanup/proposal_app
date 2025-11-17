# 🚀 Create Railway Services - Step by Step

You don't have any services yet! Let's create them now.

---

## 📋 Step 1: Add PostgreSQL Database

1. **Open Railway Dashboard:**
   - Go to: https://railway.app/project/dcfa1e72-e755-431e-a28b-47e79ba6e697
   - Or run in terminal: `railway open`

2. **Add PostgreSQL:**
   - Click the **"+ New"** button (big green/blue button)
   - Select **"Database"** from the dropdown
   - Choose **"Add PostgreSQL"**
   - Wait ~30 seconds for provisioning
   - ✅ PostgreSQL database will appear as a service

   **Note:** Railway automatically injects `DATABASE_URL` into other services!

---

## 📦 Step 2: Add Backend Service from GitHub

1. **Still in Railway Dashboard:**
   - Click **"+ New"** button again
   - Select **"GitHub Repo"** from the dropdown
   - Railway will show your repositories
   - Find and select: **`addressanup/proposal_app`**
   - Click **"Deploy Now"** or **"Add Service"**

2. **Railway will create the service:**
   - It might take a minute to detect the repo
   - Railway will show "Deploying..." status

---

## ⚙️ Step 3: Configure Backend Service

**IMPORTANT:** After the backend service is created:

1. **Click on the backend service** (it might show as "proposal_app" or similar)

2. **Go to "Settings" tab**

3. **Set Root Directory:**
   - Find **"Root Directory"** field
   - Set to: `backend` (exactly, no quotes)
   - Click **"Update"** or **"Save"**
   - ⚠️ **This is CRITICAL!**

4. **Verify Build Commands** (should auto-detect, but verify):
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`

---

## 🔄 Step 4: Redeploy After Configuration

After setting Root Directory:

1. Go to **"Deployments"** tab
2. Click **"Redeploy"** on the failed deployment
3. Or it might auto-redeploy after you save settings

Now Railway will:
- ✅ Look in `backend/` folder
- ✅ Find `package.json`
- ✅ Use `nixpacks.toml` for build
- ✅ Build successfully!

---

## 📊 What You Should See

After adding both services, your Railway project should show:

```
proposal-app-backend (Project)
├── PostgreSQL (Service)
│   └── Database running on port 5432
│
└── proposal_app / backend (Service)
    └── Node.js app deploying...
```

---

## 🔍 If You Still Don't See Services

### Option A: Create from Dashboard

1. Go to Railway dashboard
2. Make sure you're in the correct project
3. Look for **"+ New"** button (usually top right or center)
4. If you don't see it, try refreshing the page

### Option B: Check Project

Make sure you're in the right project:
- Project name should be: `proposal-app-backend`
- If you have multiple projects, make sure you selected the correct one

### Option C: Create via CLI (Alternative)

Try creating services via CLI:

```bash
cd backend

# Add PostgreSQL (might prompt interactively)
railway add --database postgres

# The backend service should already exist if linked from GitHub
# But if not, you need to add it from dashboard
```

---

## ✅ After Services Are Created

Once both services exist:

1. **Set Root Directory** for backend service (Step 3 above)
2. **Set environment variables:**
   ```bash
   cd backend
   ./setup-railway-env.sh "https://your-vercel-app.vercel.app,http://localhost:3000"
   ```
3. **Run migrations:**
   ```bash
   railway run npx prisma migrate deploy
   railway run npm run seed
   ```
4. **Deploy:**
   ```bash
   railway up
   ```

---

## 🎯 Quick Visual Guide

### Railway Dashboard Layout:

```
┌─────────────────────────────────────┐
│  Railway Dashboard                  │
│                                     │
│  Project: proposal-app-backend      │
│                                     │
│  [+ New]  ← Click this button       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Services                    │   │
│  │                             │   │
│  │ (Empty - no services yet)   │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### After Adding Services:

```
┌─────────────────────────────────────┐
│  Railway Dashboard                  │
│                                     │
│  Project: proposal-app-backend      │
│                                     │
│  [+ New]                            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Services                    │   │
│  │                             │   │
│  │ 🗄️ PostgreSQL              │   │
│  │    Running on port 5432     │   │
│  │                             │   │
│  │ 🚀 proposal_app            │   │
│  │    Deploying...             │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 🆘 Still Having Issues?

If you can't find the "+ New" button or services aren't showing:

1. **Refresh the page** (Ctrl+R or Cmd+R)
2. **Check if you're logged in:**
   ```bash
   railway whoami
   ```
3. **Verify project exists:**
   ```bash
   railway status
   ```
4. **Try opening dashboard:**
   ```bash
   railway open
   ```

---

## 📝 Summary

1. ✅ Railway project exists: `proposal-app-backend`
2. ⏳ Add PostgreSQL database (Dashboard → "+ New" → "Database")
3. ⏳ Add backend service (Dashboard → "+ New" → "GitHub Repo")
4. ⏳ Set Root Directory to `backend` (Settings)
5. ⏳ Redeploy

Once services are created, Railway will start deploying! 🚀

