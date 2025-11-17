# 🚀 Backend Service Setup - PostgreSQL Already Deployed!

Great! PostgreSQL is already deployed. Now let's set up the backend service.

---

## ✅ Current Status

✅ PostgreSQL database deployed  
⏳ Backend service needs to be created/configured

---

## 📋 Step 1: Check if Backend Service Exists

**In Railway Dashboard:**

1. Open: https://railway.app/project/dcfa1e72-e755-431e-a28b-47e79ba6e697
2. Look for services list
3. Do you see a service besides PostgreSQL?

**If NO backend service exists:**
- Continue to Step 2A

**If backend service EXISTS:**
- Skip to Step 2B

---

## 🆕 Step 2A: Create Backend Service

**In Railway Dashboard:**

1. Click **"+ New"** button
2. Select **"GitHub Repo"** or **"Deploy from GitHub repo"**
3. Find and select: **`addressanup/proposal_app`**
4. Click **"Deploy Now"** or **"Add Service"**
5. Wait for service to be created
6. ✅ Backend service should appear

---

## ⚙️ Step 2B: Configure Existing Backend Service

**In Railway Dashboard:**

1. **Click on your backend service** (not PostgreSQL)
2. **Go to "Settings" tab**
3. **Find "Root Directory" field**
4. **Set it to:** `backend` (exactly, no quotes)
5. **Click "Update" or "Save"**
   - ⚠️ **This is CRITICAL!**

6. **Verify Build Commands:**
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`

7. **Save and Redeploy:**
   - Click "Update" or "Save"
   - Go to "Deployments" tab
   - Click "Redeploy" on the latest deployment

---

## 🔐 Step 3: Set Environment Variables (CLI)

**After backend service is created and Root Directory is set:**

Run these commands from your terminal:

```bash
cd "/Users/anuppandey/Dev Projects/proposal_app/backend"

# Generate and set JWT secrets
railway variables set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
railway variables set JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Set other required variables
railway variables set NODE_ENV=production

# Set FRONTEND_URL (replace with your actual Vercel URL!)
railway variables set FRONTEND_URL="https://your-vercel-app.vercel.app,http://localhost:3000"

# Verify variables are set
railway variables
```

**Note:** `DATABASE_URL` should already be there automatically from PostgreSQL!

---

## 🗃️ Step 4: Run Database Migrations (CLI)

```bash
# Run migrations to create tables
railway run npx prisma migrate deploy

# Seed database with contract templates
railway run npm run seed
```

---

## 🚀 Step 5: Deploy Backend (CLI)

```bash
# Deploy (or wait for auto-deploy from GitHub)
railway up
```

**Or:** Railway will auto-deploy when you push to GitHub (if auto-deploy is enabled)

---

## 🌐 Step 6: Get Your Backend URL

```bash
# Get deployment URL
railway domain
```

**Or in Dashboard:**
- Backend service → Settings → Domains
- Click "Generate Domain"
- Copy the URL

---

## 🔗 Step 7: Update Vercel Frontend

1. **Copy your Railway backend URL** (from Step 6)
   - Example: `https://proposal-app-production-xxxx.up.railway.app`

2. **Go to Vercel Dashboard:**
   - Your Project → Settings → Environment Variables

3. **Update `VITE_API_URL`:**
   ```
   https://proposal-app-production-xxxx.up.railway.app/api
   ```
   (Replace with your actual Railway URL)

4. **Save and Redeploy:**
   - Deployments tab → Redeploy latest

---

## ✅ Checklist

- [x] PostgreSQL deployed ✅
- [ ] Backend service created/verified
- [ ] Root Directory set to `backend` (Settings)
- [ ] Build/Start commands verified (Settings)
- [ ] Environment variables set (CLI)
  - [ ] `DATABASE_URL` (auto-injected) ✅
  - [ ] `JWT_SECRET`
  - [ ] `JWT_REFRESH_SECRET`
  - [ ] `NODE_ENV=production`
  - [ ] `FRONTEND_URL` (with Vercel URL)
- [ ] Database migrations run (CLI)
- [ ] Database seeded (CLI)
- [ ] Backend deployed (CLI or auto-deploy)
- [ ] Domain generated (CLI or Dashboard)
- [ ] Vercel `VITE_API_URL` updated
- [ ] Frontend redeployed
- [ ] Tested registration/login

---

## 🐛 Troubleshooting

### Backend build fails with "Root Directory" error

**Fix:**
- Go to backend service → Settings
- Set Root Directory to: `backend` (exactly)
- Save and redeploy

### "DATABASE_URL not found"

**Fix:**
- Make sure PostgreSQL and backend services are in the same project
- Railway auto-injects `DATABASE_URL` - it should appear automatically
- Check Variables tab in backend service

### CORS errors

**Fix:**
- Make sure `FRONTEND_URL` includes your Vercel URL
- Format: `https://your-app.vercel.app,http://localhost:3000`
- Redeploy backend after updating

---

## 📊 Quick Commands Reference

```bash
# Check status
railway status

# View variables
railway variables

# Set variable
railway variables set KEY=value

# Run migrations
railway run npx prisma migrate deploy

# Seed database
railway run npm run seed

# Deploy
railway up

# Get URL
railway domain

# View logs
railway logs --follow
```

---

## 🎯 Summary

1. ✅ PostgreSQL is deployed
2. Create/verify backend service (Dashboard)
3. Set Root Directory to `backend` (Dashboard Settings)
4. Set environment variables (CLI)
5. Run migrations and seed (CLI)
6. Deploy (CLI or auto-deploy)
7. Get backend URL (CLI or Dashboard)
8. Update Vercel frontend
9. Test! 🎉

---

**You're making great progress!** Once backend service is created and configured, you're almost done! 🚀

