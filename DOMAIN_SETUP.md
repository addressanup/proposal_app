# 🌐 Custom Domain Setup - clmpro.live

Configure your custom domain `clmpro.live` for both backend and frontend.

---

## 🎯 Domain Plan

**Frontend:** `clmpro.live` (or `www.clmpro.live`)  
**Backend:** `api.clmpro.live` (recommended) or subdomain you prefer

---

## 🚀 Step 1: Setup Backend Domain (Railway)

### Option A: Use API Subdomain (Recommended)

1. **Add Custom Domain to Railway:**
   ```bash
   cd backend
   railway domain --service backend
   ```
   When prompted, enter: `api.clmpro.live`

2. **Or via Railway Dashboard:**
   - Go to Railway Dashboard → Backend Service
   - Settings → Domains → Add Custom Domain
   - Enter: `api.clmpro.live`
   - Railway will provide DNS records to add

### Option B: Use Root Domain

If you prefer `clmpro.live` for backend:
- Enter: `clmpro.live` instead
- Note: This means frontend would need a different domain like `app.clmpro.live` or `www.clmpro.live`

---

## 🔧 Step 2: Configure DNS

After adding domain in Railway, you'll get DNS records like:

**For Railway (Example):**
```
Type: CNAME
Name: api (or @)
Value: your-app.up.railway.app
```

**Add these DNS records** to your domain registrar (where you bought `clmpro.live`):

1. **For Backend API:**
   - Type: `CNAME`
   - Name: `api` (or subdomain you chose)
   - Value: `backend-production-xxxx.up.railway.app` (from Railway)
   - TTL: `3600` (or default)

2. **For Frontend (Vercel will provide):**
   - Type: `CNAME`
   - Name: `@` (or `www`)
   - Value: `cname.vercel-dns.com` (Vercel will provide exact value)
   - TTL: `3600` (or default)

**Note:** DNS changes can take up to 48 hours to propagate, but usually much faster.

---

## 🔐 Step 3: Update Environment Variables

### Railway Backend

Update `FRONTEND_URL` to include your custom domain:

```bash
cd backend
railway variables --set "FRONTEND_URL=https://clmpro.live,https://www.clmpro.live,http://localhost:3000"
```

**Or if using www:**
```bash
railway variables --set "FRONTEND_URL=https://www.clmpro.live,https://clmpro.live,http://localhost:3000"
```

### Verify Variables:
```bash
railway variables
```

Should show:
- `FRONTEND_URL` with your custom domain
- `DATABASE_URL` (auto-injected)
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `NODE_ENV=production`

---

## 🎨 Step 4: Setup Frontend Domain (Vercel)

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Click on your frontend project

2. **Add Custom Domain:**
   - Settings → Domains
   - Click "Add" or "Add Domain"
   - Enter: `clmpro.live` (or `www.clmpro.live`)

3. **Follow DNS Instructions:**
   - Vercel will show DNS records to add
   - Add them to your domain registrar
   - Wait for DNS verification

4. **Update Environment Variables:**
   - Settings → Environment Variables
   - Update `VITE_API_URL`:
     ```
     https://api.clmpro.live/api
     ```
   - Or if backend is on root domain:
     ```
     https://clmpro.live/api
     ```
   - Click "Save"

5. **Redeploy Frontend:**
   - Deployments → Latest → Redeploy

---

## ✅ Step 5: Verify Everything

### Test Backend:

```bash
# Health check
curl https://api.clmpro.live/health

# Should return:
# {"status":"ok","timestamp":"..."}
```

### Test Frontend:

1. Visit: `https://clmpro.live`
2. Should load your React app
3. Try registering/logging in
4. Should connect to backend API

---

## 🔒 Step 6: SSL/HTTPS

**Railway:**
- Automatically provides SSL certificates via Let's Encrypt
- No additional configuration needed

**Vercel:**
- Automatically provides SSL certificates
- No additional configuration needed

Both should have HTTPS working automatically once DNS is configured.

---

## 📋 DNS Configuration Summary

**Domain Registrar DNS Records:**

```
# Backend API
Type: CNAME
Name: api
Value: backend-production-xxxx.up.railway.app
TTL: 3600

# Frontend
Type: CNAME
Name: @ (or www)
Value: cname.vercel-dns.com (or value from Vercel)
TTL: 3600
```

**Or A Records (if needed):**

Vercel might provide A records instead of CNAME. Follow their instructions.

---

## 🎯 Recommended Domain Structure

**Option 1 (Recommended):**
- Frontend: `clmpro.live` or `www.clmpro.live`
- Backend: `api.clmpro.live`

**Option 2:**
- Frontend: `app.clmpro.live` or `www.clmpro.live`
- Backend: `clmpro.live` or `api.clmpro.live`

**Option 3:**
- Frontend: `clmpro.live`
- Backend: `backend.clmpro.live`

---

## 🔧 Current Setup Checklist

- [ ] Railway backend domain added (`api.clmpro.live` or chosen subdomain)
- [ ] DNS CNAME record added for backend
- [ ] `FRONTEND_URL` updated in Railway with custom domain
- [ ] Vercel custom domain added (`clmpro.live` or `www.clmpro.live`)
- [ ] DNS CNAME/A record added for frontend
- [ ] `VITE_API_URL` updated in Vercel with backend domain
- [ ] Frontend redeployed in Vercel
- [ ] Backend health check works: `https://api.clmpro.live/health`
- [ ] Frontend loads: `https://clmpro.live`
- [ ] Registration/login works
- [ ] API calls succeed

---

## 🐛 Troubleshooting

### Domain Not Resolving

**Check DNS propagation:**
```bash
# Check if DNS is resolving
dig api.clmpro.live
nslookup api.clmpro.live

# Should show Railway CNAME
```

**Wait time:**
- DNS changes usually take 5-60 minutes
- Can take up to 48 hours in rare cases

### SSL Certificate Issues

**Railway:**
- SSL certificates are automatic
- May take a few minutes after DNS resolves

**Vercel:**
- SSL certificates are automatic
- Verify domain in Vercel dashboard

### CORS Errors

**Fix:**
- Make sure `FRONTEND_URL` in Railway includes your custom domain
- Format: `https://clmpro.live,https://www.clmpro.live,http://localhost:3000`
- Redeploy backend after updating

### Backend Not Responding

**Check:**
1. DNS is resolving correctly
2. Railway service is running
3. Health endpoint works: `https://api.clmpro.live/health`

---

## 🎉 Quick Commands

```bash
# Link to backend service
cd backend
railway service backend

# Update FRONTEND_URL
railway variables --set "FRONTEND_URL=https://clmpro.live,https://www.clmpro.live,http://localhost:3000"

# View current variables
railway variables

# View backend domain
railway domain

# Test backend
curl https://api.clmpro.live/health
```

---

## ✅ Final URLs

After setup complete:

**Frontend:**
```
https://clmpro.live
```

**Backend API:**
```
https://api.clmpro.live/api
```

**Backend Health:**
```
https://api.clmpro.live/health
```

---

**Let's get your custom domain set up!** 🚀

