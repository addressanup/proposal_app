# 🔧 Fix DATABASE_URL Missing Issue

The `DATABASE_URL` environment variable is not set in Railway. Here's how to fix it.

---

## 🔍 Problem

Railway backend is crashing because `DATABASE_URL` is missing. Railway should auto-inject it from PostgreSQL, but it's not connected.

---

## ✅ Solution: Connect PostgreSQL to Backend

### Option 1: Via Railway Dashboard (Recommended)

1. **Go to Railway Dashboard:**
   - https://railway.app/project/dcfa1e72-e755-431e-a28b-47e79ba6e697

2. **Check if PostgreSQL Service Exists:**
   - Look for a PostgreSQL service in your project
   - If it doesn't exist, create it (see below)

3. **Link PostgreSQL to Backend:**
   - Click on **PostgreSQL service** (not backend)
   - Go to **"Variables"** tab
   - Find **`DATABASE_URL`** or **`POSTGRES_URL`**
   - Copy the value

4. **Add DATABASE_URL to Backend:**
   - Click on **backend service**
   - Go to **"Variables"** tab
   - Click **"New Variable"**
   - Name: `DATABASE_URL`
   - Value: Paste the PostgreSQL connection string you copied
   - Click **"Add"**

5. **Verify:**
   - Go back to backend service → Variables
   - You should now see `DATABASE_URL`

### Option 2: Via CLI

**Get DATABASE_URL from PostgreSQL service:**

```bash
cd backend

# First, link to PostgreSQL service (you may need to do this in dashboard)
# Then get the DATABASE_URL
railway variables --service <postgres-service-name>
```

**Or get it from Railway Dashboard:**
- PostgreSQL service → Variables → Copy `DATABASE_URL`

**Then set it manually:**
```bash
railway variables --set "DATABASE_URL=postgresql://user:password@host:5432/railway"
```

**Replace with the actual value from Railway!**

### Option 3: Create PostgreSQL if Missing

**If PostgreSQL service doesn't exist:**

1. **Railway Dashboard:**
   - Click **"+ New"** button
   - Select **"Database"**
   - Choose **"Add PostgreSQL"**
   - Wait ~30 seconds for provisioning

2. **Get DATABASE_URL:**
   - Click on PostgreSQL service
   - Go to **"Variables"** tab
   - Copy **`DATABASE_URL`**

3. **Add to Backend:**
   - Backend service → Variables
   - Add `DATABASE_URL` with the copied value

---

## 📋 Step-by-Step: Railway Dashboard

### Step 1: Verify PostgreSQL Exists

1. Open Railway Dashboard
2. Check your project services
3. Do you see a **PostgreSQL** service?

**If YES:** Go to Step 2  
**If NO:** Create it first (see Option 3 above)

### Step 2: Get DATABASE_URL from PostgreSQL

1. Click on **PostgreSQL service** (not backend)
2. Go to **"Variables"** tab
3. Look for:
   - `DATABASE_URL` (most common)
   - `POSTGRES_URL`
   - `POSTGRES_PRIVATE_URL`
   - Or any variable with "postgresql://" value
4. **Copy the full connection string**
   - Example: `postgresql://postgres:password@host.railway.app:5432/railway`

### Step 3: Add DATABASE_URL to Backend

1. Click on **backend service**
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** or **"Add Variable"**
4. Enter:
   - **Name:** `DATABASE_URL`
   - **Value:** Paste the connection string from Step 2
5. Click **"Save"** or **"Add"**

### Step 4: Verify

1. Stay in backend service → Variables tab
2. Scroll down
3. You should see `DATABASE_URL` in the list ✅

### Step 5: Redeploy

1. Backend service → **"Deployments"** tab
2. Click **"Redeploy"** on latest deployment
3. Wait for deployment to complete

---

## 🧪 Test After Fix

**Check logs:**
- Backend service → Deployments → Latest → View Logs
- Should see: Server running successfully
- Should NOT see: "Environment variable not found: DATABASE_URL"

**Test health endpoint:**
```bash
curl https://backend-production-bd1c2.up.railway.app/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

---

## 🔍 Troubleshooting

### "DATABASE_URL still not found after adding"

**Check:**
1. Make sure you added it to **backend service** (not PostgreSQL)
2. Verify the variable name is exactly: `DATABASE_URL` (case-sensitive)
3. Check that you saved it
4. Redeploy the backend service

### "PostgreSQL service not found"

**Solution:**
- Create PostgreSQL service in Railway Dashboard
- Then follow steps above

### "Connection string format wrong"

**DATABASE_URL format should be:**
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

Example:
```
postgresql://postgres:abc123@postgres.railway.app:5432/railway
```

**Make sure:**
- No quotes around the value
- Full connection string (including protocol, host, port, database)
- Copy from Railway exactly as shown

---

## ✅ Quick Checklist

- [ ] PostgreSQL service exists in Railway
- [ ] Got DATABASE_URL from PostgreSQL service variables
- [ ] Added DATABASE_URL to backend service variables
- [ ] Variable name is exactly `DATABASE_URL`
- [ ] Variable value is full connection string
- [ ] Saved the variable
- [ ] Redeployed backend service
- [ ] Checked logs - no DATABASE_URL errors
- [ ] Health endpoint works

---

## 🚀 After DATABASE_URL is Set

Once `DATABASE_URL` is configured:

1. **Run migrations:**
   ```bash
   cd backend
   railway run npx prisma migrate deploy
   ```

2. **Seed database (optional):**
   ```bash
   railway run npm run seed
   ```

3. **Test backend:**
   ```bash
   curl https://backend-production-bd1c2.up.railway.app/health
   ```

---

## 💡 Why This Happens

Railway auto-injects `DATABASE_URL` from PostgreSQL service to other services, but only if:
- PostgreSQL service exists in the same project
- Services are properly linked (usually automatic, but sometimes needs manual setup)

If auto-injection didn't work, you need to manually copy `DATABASE_URL` from PostgreSQL service and add it to backend service.

---

**The fastest fix is via Railway Dashboard - just copy DATABASE_URL from PostgreSQL and add it to backend!** 🎯

