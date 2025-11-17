# 🔧 Fix Registration Internal Server Error

Registration is failing with "Internal server error". Here's how to fix it.

---

## 🔍 Problem Analysis

**What we know:**
- ✅ Backend is running (health check works)
- ✅ Database connected
- ✅ Frontend API config fixed (now uses VITE_API_URL)
- ❌ Registration returns "Internal server error"

**Possible causes:**
1. **CORS error** - Vercel URL not in FRONTEND_URL
2. **Database migration issue** - Tables might not exist
3. **Audit log error** - AuditLog table might not exist
4. **Code error** - Something in registration handler

---

## ✅ Solution Steps

### Step 1: Get Your Vercel URL

**Check your Vercel frontend URL:**

1. **Vercel Dashboard → Your Project**
2. **Settings → Domains**
3. **What URL is shown?**
   - `clmpro.live` (if custom domain set up)
   - `your-app.vercel.app` (default Vercel URL)
   - `your-app-xxx.vercel.app`

**We need the actual URL!**

### Step 2: Update FRONTEND_URL in Railway

**After you tell me your Vercel URL, update FRONTEND_URL:**

```bash
cd backend
railway variables --set "FRONTEND_URL=https://your-actual-vercel-url.vercel.app,https://clmpro.live,https://www.clmpro.live,http://localhost:3000"
```

**Or if custom domain is set up:**
```bash
railway variables --set "FRONTEND_URL=https://clmpro.live,https://www.clmpro.live,http://localhost:3000"
```

### Step 3: Check Railway Logs for Actual Error

**The "Internal server error" means there's a backend error. Check logs:**

1. **Railway Dashboard:**
   - https://railway.app/project/dcfa1e72-e755-431e-a28b-47e79ba6e697
   - Backend service → **Deployments** → Latest deployment
   - Click **"View Logs"** or check logs tab

2. **Make a registration request:**
   - Try registering from your frontend
   - Or use the curl command below

3. **Watch Railway logs:**
   - You should see an error message
   - Share the actual error so we can fix it

**Common errors you might see:**
- `Table 'audit_log' does not exist`
- `Column 'x' does not exist`
- `Prisma migration error`
- `Connection timeout`

### Step 4: Verify Migrations Ran

**Check if migrations completed:**

1. **Railway Dashboard → Backend Service → Deployments**
2. **Check logs for:**
   ```
   ✅ Applied migration: 20251114163629_init
   ✅ Applied migration: 20251115093233_add_document_sharing_and_connections
   ✅ Database migrations completed successfully
   ```

**If migrations didn't run:**
- Migrations run on container startup
- Check earlier logs in the deployment
- Or redeploy to trigger migrations again

### Step 5: Test Registration Endpoint Directly

**Test from command line to see actual error:**

```bash
curl -X POST https://backend-production-bd1c2.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Origin: https://your-vercel-url.vercel.app" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User"
  }' \
  -v
```

**This will show:**
- The actual error response
- CORS headers
- Status code

---

## 🔍 Debugging Checklist

**Check these in order:**

1. **What's your Vercel frontend URL?**
   - Vercel Dashboard → Settings → Domains
   - Share the actual URL

2. **What error in Railway logs?**
   - Railway Dashboard → Backend → Deployments → Logs
   - Try registering
   - Find error message
   - Share the error

3. **What error in browser console?**
   - Open Developer Tools (F12)
   - Console tab
   - Try registering
   - Copy error message

4. **What error in Network tab?**
   - Developer Tools → Network
   - Try registering
   - Click on the registration request
   - Check Response tab
   - See actual error message

5. **Did migrations run?**
   - Railway logs should show migration completion
   - Check deployment logs from container start

---

## 🚨 Common Fixes

### Fix 1: Add Vercel URL to CORS

**If CORS error:**
```bash
cd backend
# Replace with your actual Vercel URL
railway variables --set "FRONTEND_URL=https://your-app.vercel.app,https://clmpro.live,https://www.clmpro.live,http://localhost:3000"
```

**Then redeploy backend**

### Fix 2: Verify Migrations Ran

**If database errors:**
- Migrations should run on startup (we configured this)
- Check logs for migration completion
- If not, redeploy backend to trigger migrations

### Fix 3: Check AuditLog Table

**If "Table 'audit_log' does not exist":**
- Migrations might not have run
- Redeploy backend
- Or manually run migrations via Railway dashboard

---

## 📋 Quick Actions

**Right now, please:**

1. **Share your Vercel frontend URL:**
   - What is it exactly?
   - From Vercel Dashboard → Settings → Domains

2. **Check Railway logs:**
   - Railway Dashboard → Backend → Deployments → Latest → Logs
   - Try registering
   - What error appears?
   - Share the error message

3. **Check browser console:**
   - Open Developer Tools (F12) → Console
   - Try registering
   - What error appears?
   - Share the error

**With this info, I can fix the exact issue!** 🎯

---

## 💡 Most Likely Issues

**Based on the "Internal server error":**

1. **CORS blocking** - Vercel URL not in FRONTEND_URL
2. **Database migration** - AuditLog table doesn't exist yet
3. **Prisma Client** - Not regenerated after schema changes

**All can be fixed once we see the actual error!**

---

**Please check Railway logs and share the actual error message!** 🔍

