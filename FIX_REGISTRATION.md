# 🔧 Fix Registration Failure

Registration is failing with "Internal server error". Here's how to diagnose and fix it.

---

## 🔍 Issues Found

1. **Backend returns "Internal server error"** when testing registration
2. **CORS might be blocking** requests from Vercel frontend
3. **FRONTEND_URL might not include actual Vercel URL**

---

## ✅ Solution Steps

### Step 1: Check Your Vercel Frontend URL

**What is your actual Vercel frontend URL?**

- Is it: `https://clmpro.live`? (if custom domain set up)
- Or: `https://your-app.vercel.app`? (default Vercel URL)

**We need the actual Vercel URL to add it to CORS!**

### Step 2: Update FRONTEND_URL in Railway

**If your Vercel URL is `https://your-app.vercel.app`:**

```bash
cd backend
railway variables --set "FRONTEND_URL=https://your-app.vercel.app,https://clmpro.live,https://www.clmpro.live,http://localhost:3000"
```

**Replace `your-app.vercel.app` with your actual Vercel URL!**

**Or if custom domain `clmpro.live` is already set up in Vercel:**
```bash
railway variables --set "FRONTEND_URL=https://clmpro.live,https://www.clmpro.live,http://localhost:3000"
```

### Step 3: Check Backend Logs for Actual Error

**The "Internal server error" suggests a backend issue. Check logs:**

1. **Railway Dashboard → Backend Service → Deployments**
2. Click on **latest deployment**
3. **View Logs**
4. Look for error messages when registration is attempted
5. Share the actual error message

**Common errors:**
- Database connection errors
- Prisma migration issues
- Missing required fields
- Audit log errors

### Step 4: Verify Frontend API URL

**Check that Vercel has the correct backend URL:**

1. **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Verify `VITE_API_URL` is set to:
   ```
   https://backend-production-bd1c2.up.railway.app/api
   ```
3. Make sure frontend was **redeployed** after setting this

### Step 5: Test CORS

**Check browser console for CORS errors:**

1. Open your Vercel frontend in browser
2. Open **Developer Tools** (F12)
3. Go to **Console** tab
4. Try registering
5. Look for CORS errors like:
   - "Access to XMLHttpRequest blocked by CORS policy"
   - "No 'Access-Control-Allow-Origin' header"

**If you see CORS errors:**
- Add your Vercel URL to `FRONTEND_URL` in Railway (Step 2)
- Redeploy backend

---

## 🧪 Debug Steps

### Test 1: Check API Base URL

**What does the frontend use as API base URL?**

Check browser Network tab:
1. Open Developer Tools → Network
2. Try registering
3. Look at the request URL
4. Should be: `https://backend-production-bd1c2.up.railway.app/api/auth/register`
5. If different, `VITE_API_URL` is wrong in Vercel

### Test 2: Check CORS Headers

**Test registration with CORS headers:**

```bash
curl -X POST https://backend-production-bd1c2.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Origin: https://your-vercel-app.vercel.app" \
  -d '{"email":"test2@example.com","password":"Test123!@#","firstName":"Test","lastName":"User"}' \
  -v
```

**Check response headers for:**
- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Credentials`

### Test 3: Check Backend Response

**Look at the actual error in Railway logs:**

1. Make a registration request from frontend
2. Immediately check Railway logs
3. Find the error message
4. Share it so we can fix the specific issue

---

## 🔍 Common Issues

### Issue 1: CORS Error

**Symptoms:**
- Browser console shows CORS error
- Request fails with "No 'Access-Control-Allow-Origin' header"

**Fix:**
- Add Vercel URL to `FRONTEND_URL` in Railway
- Format: `https://your-app.vercel.app,https://clmpro.live,http://localhost:3000`
- Redeploy backend

### Issue 2: Internal Server Error

**Symptoms:**
- Request reaches backend
- Returns 500 error
- "Internal server error" message

**Possible causes:**
- Database migration issue
- Prisma Client not generated correctly
- Missing environment variables
- Code error in registration handler

**Fix:**
- Check Railway logs for actual error
- Verify DATABASE_URL is set
- Check if migrations ran successfully

### Issue 3: Wrong API URL

**Symptoms:**
- Request goes to wrong URL
- 404 errors
- CORS errors on wrong domain

**Fix:**
- Verify `VITE_API_URL` in Vercel
- Should be: `https://backend-production-bd1c2.up.railway.app/api`
- Redeploy frontend

---

## 🚀 Quick Fix Checklist

- [ ] Get your actual Vercel frontend URL
- [ ] Add Vercel URL to Railway `FRONTEND_URL`
- [ ] Redeploy backend (if CORS was issue)
- [ ] Verify `VITE_API_URL` in Vercel is correct
- [ ] Redeploy frontend (if needed)
- [ ] Check Railway logs for actual error
- [ ] Test registration from browser
- [ ] Check browser console for errors
- [ ] Check Network tab for request/response

---

## 💡 What I Need From You

1. **What is your actual Vercel frontend URL?**
   - Check Vercel dashboard → Your Project → Settings → Domains
   - Or visit your frontend - what's the URL?

2. **What error do you see in browser console?**
   - Open Developer Tools → Console
   - Try registering
   - Copy the error message

3. **What error in Railway logs?**
   - Railway Dashboard → Backend Service → Deployments → Latest → Logs
   - Try registering
   - Look for error messages
   - Share the error

---

**Once I know these details, I can fix the specific issue!** 🎯

