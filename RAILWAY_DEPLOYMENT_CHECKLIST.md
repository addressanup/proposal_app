# ✅ Railway Deployment - What to Watch For

All settings are configured! Here's what to expect during redeployment.

---

## 🔍 During Deployment - Watch for These Logs

### Expected Successful Build Logs:

```
✓ Detecting build plan...
✓ Installing Node.js 18...
✓ Installing dependencies...
  npm ci --legacy-peer-deps || npm install
✓ Running: npx prisma generate
  Generating Prisma Client...
✓ Running: npm run build
  Building TypeScript...
✓ Build successful!
✓ Starting: npm start
  🚀 Server running on port 5000
✓ Deployed successfully!
```

### ✅ Success Indicators:

- ✅ No errors in build logs
- ✅ "Build successful!" message
- ✅ Server starts on a port
- ✅ Deployment status turns green
- ✅ Service is "Active" or "Running"

---

## ⚠️ If You See Errors

### Error: "package.json not found"

**Problem:** Root Directory not applied correctly
**Fix:** Double-check Root Directory is exactly `backend` (no quotes)

### Error: "prisma: command not found"

**Problem:** Prisma not installed during build
**Fix:** Verify Build Command includes: `npx prisma generate`

### Error: "Cannot find module 'dist/server.js'"

**Problem:** TypeScript didn't compile
**Fix:** Verify Build Command includes: `npm run build`

### Error: "DATABASE_URL is required"

**Problem:** Database connection string not set
**Fix:** PostgreSQL service should auto-inject it, but check Variables tab

---

## 🎯 After Deployment Succeeds

Once deployment is successful, here are the next steps:

### Step 1: Set Environment Variables

```bash
cd "/Users/anuppandey/Dev Projects/proposal_app/backend"

# Set JWT secrets
railway variables set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
railway variables set JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Set other variables
railway variables set NODE_ENV=production
railway variables set FRONTEND_URL="https://your-vercel-app.vercel.app,http://localhost:3000"
```

Replace `your-vercel-app.vercel.app` with your actual Vercel URL.

### Step 2: Run Database Migrations

```bash
# Run migrations
railway run npx prisma migrate deploy

# Seed database with templates
railway run npm run seed
```

### Step 3: Get Your Backend URL

```bash
# Get deployment URL
railway domain
```

**Or in Dashboard:**
- Backend service → Settings → Domains
- Click "Generate Domain"
- Copy the URL (e.g., `https://proposal-app-production-xxxx.up.railway.app`)

### Step 4: Test Your Backend

```bash
# Health check
curl https://your-app.up.railway.app/health

# Should return:
# {"status":"ok","timestamp":"2025-11-16T..."}
```

### Step 5: Update Vercel Frontend

1. Copy your Railway backend URL (from Step 3)
2. Go to **Vercel Dashboard** → Your Project
3. **Settings** → **Environment Variables**
4. Update `VITE_API_URL`:
   ```
   https://your-app-production-xxxx.up.railway.app/api
   ```
5. **Save** and **Redeploy** frontend

---

## 📊 Deployment Status Checklist

- [ ] Root Directory set to `backend` ✅
- [ ] Build Command set: `npm install && npx prisma generate && npm run build` ✅
- [ ] Start Command set: `npm start` ✅
- [ ] Redeploy initiated
- [ ] Build logs show successful build
- [ ] Server starts successfully
- [ ] Deployment status is green/active
- [ ] Environment variables set (after deployment)
- [ ] Database migrations run (after deployment)
- [ ] Database seeded (after deployment)
- [ ] Backend URL obtained
- [ ] Vercel frontend updated
- [ ] Frontend redeployed
- [ ] Tested registration/login

---

## 🚀 Quick Commands After Deployment

```bash
# Check status
railway status

# View logs (live)
railway logs --follow

# View environment variables
railway variables

# Set variable
railway variables set KEY=value

# Run command
railway run <command>

# Get URL
railway domain

# Open dashboard
railway open
```

---

## 🎉 You're Almost There!

Once deployment succeeds:
1. Set environment variables ✅
2. Run migrations ✅
3. Get backend URL ✅
4. Update Vercel ✅
5. Test everything ✅

**Your full-stack app will be live!** 🚀

---

## 🆘 Need Help?

If deployment fails, check:
- Build logs for specific errors
- Verify all three settings are saved
- Check that files are committed to Git
- Verify Root Directory is exactly `backend`

**Good luck with the deployment!** 🍀

