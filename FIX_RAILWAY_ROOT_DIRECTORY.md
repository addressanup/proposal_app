# 🔧 Fix Railway Root Directory Issue

## Problem

Railway is trying to build from the root directory instead of `backend`, causing this error:
```
⚠ Script start.sh not found
✖ Railpack could not determine how to build the app.
```

## Solution: Set Root Directory in Dashboard

**This MUST be done in the Railway dashboard** (not via CLI):

### Step 1: Open Railway Dashboard

1. Go to: https://railway.app/project/dcfa1e72-e755-431e-a28b-47e79ba6e697
2. Or run: `railway open` (in your terminal)

### Step 2: Configure Backend Service

1. **Click on your backend service** (should be named "backend" or show your repo name)
2. Go to **"Settings"** tab
3. Scroll down to **"Service Settings"** section
4. Find **"Root Directory"** field
5. **Set it to:** `backend` (without quotes, no leading/trailing slashes)
6. Click **"Update"** or **"Save"**

### Step 3: Verify Build Commands

While in Settings, verify these are set correctly:

**Build Command:**
```
npm install && npx prisma generate && npm run build
```

**Start Command:**
```
npm start
```

If they're not set, add them manually.

### Step 4: Redeploy

After setting Root Directory:

1. Go to **"Deployments"** tab
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to trigger auto-deploy

---

## ✅ Verification

After setting Root Directory, Railway should:
- ✅ Find `backend/package.json`
- ✅ Detect Node.js app
- ✅ Use `backend/nixpacks.toml` for build
- ✅ Use `backend/Procfile` for start command
- ✅ Build successfully

---

## 🐛 Still Having Issues?

### Check These:

1. **Root Directory is exactly:** `backend` (not `./backend` or `/backend`)
2. **Service is linked to GitHub repo:** Settings → Source
3. **Branch is correct:** Should be `main` (or your default branch)
4. **Files are committed:** Make sure `backend/package.json`, `backend/Procfile`, etc. are in GitHub

### Verify Files Exist in GitHub:

```bash
# Check if files are in the repo
git ls-files backend/package.json
git ls-files backend/Procfile
git ls-files backend/nixpacks.toml
```

All should return file paths. If not, commit and push:
```bash
git add backend/
git commit -m "Add backend configuration files"
git push
```

---

## 📋 Quick Checklist

- [ ] Opened Railway dashboard
- [ ] Clicked on backend service
- [ ] Went to Settings tab
- [ ] Set Root Directory to `backend`
- [ ] Saved/Updated settings
- [ ] Verified Build Command
- [ ] Verified Start Command
- [ ] Redeployed service
- [ ] Build succeeds ✅

---

## 🚀 After Fix

Once Root Directory is set correctly:

1. Railway will build from `backend/` folder
2. It will find `package.json` and detect Node.js
3. It will use `nixpacks.toml` for build configuration
4. It will use `Procfile` for start command
5. Deployment will succeed! ✅

Then continue with:
- Setting environment variables
- Running migrations
- Getting your backend URL

---

## 💡 Why This Happens

Railway analyzes the repository root by default. Since your project has both `frontend/` and `backend/` folders, Railway doesn't know which one to build. Setting Root Directory tells Railway: "Look in the `backend/` folder for the app to build."

