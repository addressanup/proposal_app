# Railway Auto-Deploy Setup - GitHub Integration

## ✅ All Configuration Files Ready

Your backend has all the necessary files for Railway auto-detection:
- ✅ `backend/package.json` - Node.js app definition
- ✅ `backend/Procfile` - Start command
- ✅ `backend/nixpacks.toml` - Build configuration
- ✅ `backend/railway.json` - Railway-specific settings

All files are committed to: `claude/project-core-study-019MCKRukSbZfsKAGDfCXZqA`

---

## 🚀 Railway Auto-Deploy Setup (Step by Step)

### **Step 1: Create New Project from GitHub**

1. Go to **https://railway.app/dashboard**
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose: **`addressanup/proposal_app`**
5. Railway will create the project ✅

### **Step 2: Configure the Service**

After Railway creates the service:

1. **Click on the service** (it might say "Node" or show your repo name)
2. Go to **Settings** tab
3. Find **"Service Settings"** section

**Set These CRITICAL Settings:**

**Root Directory:**
```
backend
```
⚠️ **This is the most important setting!** Railway must know to look in the `backend` folder.

**Branch:**
```
claude/project-core-study-019MCKRukSbZfsKAGDfCXZqA
```
(Railway should auto-detect this, but verify it's correct)

**Watch Paths (optional but recommended):**
```
backend/**
```
This makes Railway only redeploy when backend code changes.

### **Step 3: Let Railway Auto-Detect Build**

With Root Directory set to `backend`, Railway will automatically:
1. Find `package.json` ✅
2. Detect it's a Node.js app ✅
3. Find `Procfile` and use `npm start` ✅
4. Use `nixpacks.toml` for build configuration ✅

**Do NOT manually set build/start commands** - let auto-detection work!

### **Step 4: Add PostgreSQL Database**

1. In your Railway project (not in the service), click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Wait 30 seconds for provisioning
4. ✅ Railway automatically links DATABASE_URL to your service!

### **Step 5: Add Environment Variables**

Click on your backend service → **"Variables"** tab

Add these variables:

**JWT_SECRET:**
```bash
# Generate a secure random secret (run this locally):
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the output and paste as JWT_SECRET value
```

**JWT_REFRESH_SECRET:**
```bash
# Generate another different secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the output and paste as JWT_REFRESH_SECRET value
```

**NODE_ENV:**
```
production
```

**Note:** `DATABASE_URL` should already be there (auto-added from PostgreSQL)

### **Step 6: Deploy**

1. Railway should **auto-deploy** after you save settings
2. If not, click **"Deploy"** button
3. Watch the build logs in **"Deployments"** tab

**Expected Build Log:**
```
✓ Detecting build plan with Nixpacks...
✓ Installing Node.js 18...
✓ Running: npm ci --legacy-peer-deps || npm install
✓ Running: npx prisma generate
✓ Running: npm run build
✓ Build successful!
✓ Starting: npm start
✓ Server running on port 5000
```

### **Step 7: Get Your Backend URL**

1. Click on your backend service
2. Go to **"Settings"** tab
3. Scroll to **"Domains"** section
4. Click **"Generate Domain"**
5. Copy your URL: `https://your-app-production-xxxx.up.railway.app`

### **Step 8: Run Database Migrations**

Option A - **Using Railway CLI (Recommended):**

```bash
# Install Railway CLI globally
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Select your project and service when prompted

# Run migrations
railway run npx prisma migrate deploy

# Seed the database with templates
railway run npm run seed
```

Option B - **Manual via Environment Variable:**

```bash
# In your local terminal
cd backend

# Copy DATABASE_URL from Railway dashboard
# Variables tab → Click "Copy" on DATABASE_URL

# Set it locally
export DATABASE_URL="postgresql://postgres:xxx@xxx.railway.app:5432/railway"

# Run migrations
npx prisma migrate deploy

# Seed database
npm run seed
```

### **Step 9: Enable Auto-Deploy from GitHub**

This should already be enabled by default, but verify:

1. Service → **Settings** → **"Source"** section
2. Look for **"Auto Deploy"** toggle
3. Make sure it's **ON** ✅

**Now whenever you push to GitHub, Railway auto-deploys!**

---

## 🔄 How Auto-Deploy Works

Once configured:

```
1. You push code to GitHub
   ↓
2. Railway detects changes in backend/ folder
   ↓
3. Railway automatically builds using nixpacks.toml
   ↓
4. Railway runs: npm install → prisma generate → npm run build
   ↓
5. Railway starts with: npm start
   ↓
6. ✅ Your backend is updated!
```

**Zero-downtime deployments!**

---

## 🐛 Troubleshooting Auto-Detection

### Issue: "Railpack could not determine how to build"

**Fix:**
1. Verify **Root Directory** is set to `backend`
2. Check that branch is `claude/project-core-study-019MCKRukSbZfsKAGDfCXZqA`
3. Refresh Railway page (Ctrl+R)
4. Try redeploying

### Issue: Build fails with "package.json not found"

**Fix:**
- Root Directory is NOT set correctly
- Should be `backend` (without leading or trailing slashes)

### Issue: "Script start.sh not found"

**Fix:**
- Procfile is missing or not committed
- Check: `git show HEAD:backend/Procfile` should show `web: npm start`
- If missing, the files aren't pushed - redeploy

### Issue: Prisma errors during build

**Fix:**
- DATABASE_URL not set
- Add PostgreSQL database to project
- Check Variables tab for DATABASE_URL

---

## ✅ Verification Checklist

After setup, verify these:

- [ ] Railway project created from GitHub repo
- [ ] Service Root Directory set to `backend`
- [ ] PostgreSQL database added to project
- [ ] DATABASE_URL appears in service variables (auto-linked)
- [ ] JWT_SECRET variable added
- [ ] JWT_REFRESH_SECRET variable added
- [ ] NODE_ENV=production variable added
- [ ] Service deployed successfully
- [ ] Domain generated (Railway URL)
- [ ] Database migrations completed
- [ ] Database seeded with templates
- [ ] Auto-deploy is enabled
- [ ] Backend responds to health check

**Test your backend:**
```bash
curl https://your-app.up.railway.app/api/health

# Should return:
{"status":"ok","timestamp":"2025-11-16T..."}
```

---

## 🔗 Connect to Vercel Frontend

Once backend is deployed:

1. **Copy your Railway URL:**
   ```
   https://your-app-production-xxxx.up.railway.app
   ```

2. **Update Vercel:**
   - Vercel Dashboard → Your Project
   - Settings → Environment Variables
   - Update `VITE_API_URL`:
     ```
     https://your-app-production-xxxx.up.railway.app/api
     ```
   - Redeploy frontend

3. **Test registration:**
   - Visit your Vercel URL
   - Go to `/register`
   - Create an account
   - ✅ Should work!

---

## 💡 Pro Tips for Auto-Deploy

### 1. **Watch Paths**
Set watch paths to `backend/**` so Railway only deploys when backend code changes (not when you update frontend or docs).

### 2. **Deployment Notifications**
Railway → Project Settings → Notifications
- Enable Discord/Slack notifications
- Get notified when deployments succeed/fail

### 3. **Environment-Specific Variables**
Railway supports multiple environments (production, staging)
- Use different branches for different environments
- Each environment has its own variables

### 4. **Rollback if Needed**
Deployments tab → Click on a previous successful deployment → "Redeploy"

### 5. **View Logs in Real-Time**
```bash
railway logs
# Shows live logs from your production service
```

---

## 🎯 Testing Auto-Deploy

To test that auto-deploy works:

1. **Make a small change:**
   ```bash
   # Add a comment to backend/src/server.ts
   git add backend/src/server.ts
   git commit -m "test: Verify auto-deploy works"
   git push origin claude/project-core-study-019MCKRukSbZfsKAGDfCXZqA
   ```

2. **Watch Railway:**
   - Go to Deployments tab
   - Should see new deployment start automatically (within 30 seconds)
   - ✅ Auto-deploy confirmed!

---

## 📊 Expected Results

After following this guide:

✅ **Backend deployed to Railway**
✅ **PostgreSQL database connected**
✅ **Auto-deploy from GitHub enabled**
✅ **Environment variables configured**
✅ **Database migrations complete**
✅ **8 contract templates seeded**
✅ **Frontend can connect to backend**
✅ **Registration works**
✅ **Login works**
✅ **Full-stack app is live!**

---

## 🚀 You're Done!

Your app now has:
- **Frontend:** Vercel (auto-deploys from GitHub)
- **Backend:** Railway (auto-deploys from GitHub)
- **Database:** Railway PostgreSQL (managed)

**Every push to GitHub automatically updates your live app!** 🎉

---

## 📞 Still Having Issues?

If Railway auto-detection still fails after setting Root Directory:

**Alternative: Manual Commands**
1. Service → Settings
2. **Custom Build Command:**
   ```
   npm install && npx prisma generate && npm run build
   ```
3. **Custom Start Command:**
   ```
   npm start
   ```
4. Deploy again

This overrides auto-detection and uses manual commands instead.
