# 🔧 Fix Railway Build Error - "Script start.sh not found"

## Problem

Even though Root Directory is set to `backend`, Railway can't detect how to build the app.

---

## ✅ Solution: Manually Set Build Commands in Dashboard

Railway sometimes doesn't auto-detect build commands even with config files. Set them manually in the dashboard.

### Step 1: Go to Service Settings

1. **Open Railway Dashboard:**
   - https://railway.app/project/dcfa1e72-e755-431e-a28b-47e79ba6e697
   - Click on your **backend service** (not PostgreSQL)

2. **Go to "Settings" tab**

3. **Verify Root Directory:**
   - Make sure it's set to: `backend` (exactly, no quotes, no slashes)
   - If not, set it and click "Update"

### Step 2: Set Build Command Manually

**In the Settings tab, find "Build Command" or "Custom Build Command":**

**Set Build Command to:**
```bash
npm install && npx prisma generate && npm run build
```

**Important:** Some Railway dashboards have different field names:
- "Build Command"
- "Custom Build Command"  
- "Build Command Override"

Use whichever field exists.

### Step 3: Set Start Command Manually

**Find "Start Command" or "Custom Start Command":**

**Set Start Command to:**
```bash
npm start
```

### Step 4: Save and Redeploy

1. **Click "Update" or "Save"** in the Settings tab
2. **Go to "Deployments" tab**
3. **Click "Redeploy"** on the latest deployment
4. **Wait for build to complete**

---

## 🔍 Alternative: Check if Files Are Committed

Railway reads from your GitHub repository. If config files aren't committed, Railway can't see them.

**Check in terminal:**
```bash
cd "/Users/anuppandey/Dev Projects/proposal_app"
git status backend/package.json backend/Procfile backend/nixpacks.toml backend/railway.json
```

**If files show as untracked or modified:**

```bash
# Add and commit the files
git add backend/package.json backend/Procfile backend/nixpacks.toml backend/railway.json
git commit -m "Add Railway configuration files"
git push
```

**Then redeploy in Railway dashboard**

---

## 🔧 Alternative Solution: Use Docker Build

If Railway still can't detect the build, you can use Docker:

**In Railway Dashboard → Backend Service → Settings:**

1. **Set Build Command:**
   ```bash
   docker build -t railway-app -f backend/Dockerfile backend/
   ```

2. **Set Start Command:**
   ```bash
   docker run railway-app
   ```

But this is more complex. Try manual build commands first.

---

## ✅ Verify Build Commands Are Set

**After setting commands, check:**

1. **Settings tab** should show:
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`
   - Root Directory: `backend`

2. **Deployments tab** should show build logs like:
   ```
   Installing dependencies...
   Running prisma generate...
   Building TypeScript...
   Starting server...
   ```

---

## 🐛 Common Issues

### Issue: Settings don't have "Build Command" field

**Solution:**
- Look for "Deploy" tab instead of "Settings"
- Or check "Variables" tab - sometimes build commands are there
- Or Railway might have updated their UI - look for any build-related settings

### Issue: Build still fails

**Solution:**
- Check deployment logs for specific errors
- Make sure `package.json` exists in `backend/` folder
- Verify TypeScript is installed (it's in devDependencies, but might need to be in dependencies for build)

### Issue: "package.json not found"

**Solution:**
- Double-check Root Directory is exactly `backend` (no quotes, no slashes)
- Verify files are committed to Git
- Push changes to GitHub and redeploy

---

## 📋 Checklist

- [ ] Root Directory set to `backend` (Settings)
- [ ] Build Command set manually: `npm install && npx prisma generate && npm run build`
- [ ] Start Command set manually: `npm start`
- [ ] Settings saved (clicked Update/Save)
- [ ] Service redeployed (Deployments → Redeploy)
- [ ] Build logs show proper build steps
- [ ] Build succeeds ✅

---

## 🚀 After Build Succeeds

Once the build succeeds:

1. **Set environment variables:**
   ```bash
   cd backend
   railway variables set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   railway variables set JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   railway variables set NODE_ENV=production
   railway variables set FRONTEND_URL="https://your-vercel-app.vercel.app,http://localhost:3000"
   ```

2. **Run migrations:**
   ```bash
   railway run npx prisma migrate deploy
   railway run npm run seed
   ```

3. **Get your URL:**
   ```bash
   railway domain
   ```

---

**The key is manually setting the Build and Start commands in Railway dashboard settings!** 🎯

