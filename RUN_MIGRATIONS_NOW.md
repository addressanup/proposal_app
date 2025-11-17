# 🚀 Run Migrations NOW - Two Options

Railway is using **Nixpacks** (not Docker), so migrations need to run in the Railway environment.

---

## ✅ What I Just Fixed

1. **Updated `nixpacks.toml`** start command:
   ```toml
   [start]
   cmd = "npx prisma migrate deploy && npm start"
   ```

2. **Updated `railway.json`** start command:
   ```json
   "startCommand": "npx prisma migrate deploy && npm start"
   ```

3. **Committed and pushed** - Railway will redeploy with migrations

---

## 🎯 Option 1: Wait for Auto-Redeploy (Recommended)

**Railway will auto-redeploy from GitHub push:**

1. **Wait 2-3 minutes** for Railway to detect the push
2. **Check Railway Dashboard:**
   - Backend service → Deployments
   - Latest deployment should show "Building..." or "Deploying..."
3. **Watch logs:**
   - Click on latest deployment
   - View logs
   - Should see:
     ```
     Running database migrations...
     ✅ Applied migration: 20251114163629_init
     ✅ Applied migration: 20251115093233_add_document_sharing_and_connections
     🚀 Starting server...
     ✅ Database connected successfully
     ```
4. **Migrations will run automatically!** ✅

---

## 🎯 Option 2: Run Migrations via Railway Dashboard (Immediate)

**If you want to run migrations RIGHT NOW:**

### Step 1: Open Railway Shell

1. **Railway Dashboard:**
   - https://railway.app/project/dcfa1e72-e755-431e-a28b-47e79ba6e697
   - Backend service → **Deployments** → Latest deployment

2. **Click "Shell" or "Connect"** button
   - Opens a terminal in the Railway container

### Step 2: Run Migrations

**In the Railway shell, run:**
```bash
npx prisma migrate deploy
```

**You should see:**
```
✅ Applied migration: 20251114163629_init
✅ Applied migration: 20251115093233_add_document_sharing_and_connections
```

### Step 3: Verify Tables Created

**Check if tables exist:**
```bash
npx prisma migrate status
```

**Or:**
```bash
npx prisma studio
```
- Opens Prisma Studio in your browser
- Should see all tables (User, Organization, Proposal, etc.)

---

## 🎯 Option 3: Trigger Redeploy Manually

**If you want to redeploy immediately:**

1. **Railway Dashboard → Backend Service**
2. **Deployments → Latest deployment**
3. **Click "Redeploy"**
4. **Wait for deployment to complete**
5. **Check logs** - migrations should run automatically now

---

## ✅ After Migrations Run

**Once migrations complete:**

1. **Tables should exist:**
   - User
   - Organization
   - Proposal
   - AuditLog
   - All other tables

2. **Test registration:**
   - Visit `https://proposal-app-gray.vercel.app/register`
   - Fill form and submit
   - Should work now! ✅

3. **Check Railway logs:**
   - Should NOT see "Table 'User' does not exist" error
   - Should see successful registration

---

## 🔍 Verify Migrations Ran

**Check Railway logs for:**
- ✅ Migration messages
- ✅ "Database connected successfully"
- ✅ Server started without errors

**Test registration:**
- ✅ No "Table does not exist" error
- ✅ Registration succeeds
- ✅ User created in database

---

## 🎯 Recommended: Wait for Auto-Redeploy

**I recommend waiting for Railway to auto-redeploy** (2-3 minutes):

1. Changes are pushed ✅
2. Railway will auto-detect and redeploy ✅
3. New start command will run migrations automatically ✅
4. Everything will work! ✅

**Or use Option 2 if you want to run migrations immediately!**

---

**Railway will now run migrations automatically on every deployment!** 🚀

