# 🗃️ Run Database Migrations and Seed - Railway

Run database migrations and seed the database in Railway.

---

## 🔧 Method 1: Via Railway Dashboard (Recommended)

### Step 1: Access Railway Shell

1. **Go to Railway Dashboard:**
   - https://railway.app/project/dcfa1e72-e755-431e-a28b-47e79ba6e697
   - Click on your **backend service** (not PostgreSQL)

2. **Open Deployment Shell:**
   - Go to **"Deployments"** tab
   - Click on the **latest deployment** (active one)
   - Look for **"Shell"** or **"View Logs"** button
   - Click **"Shell"** to open a terminal in Railway's environment

3. **Or use Railway Dashboard Terminal:**
   - Backend service → **"Deployments"** tab
   - Latest deployment → Look for terminal/shell option

### Step 2: Run Migrations

**In the Railway shell/terminal, run:**
```bash
npx prisma migrate deploy
```

This will:
- Apply all pending migrations
- Create all database tables
- Set up relationships and indexes

**Expected output:**
```
✅ Applied migration: 20251114163629_init
✅ Applied migration: 20251115093233_add_document_sharing_and_connections
✅ Database migrations completed successfully
```

### Step 3: Seed Database

**In the same Railway shell, run:**
```bash
npm run seed
```

**Note:** The seed script has TypeScript errors, but you can skip seeding for now if it fails. The database will work without seed data.

---

## 🔧 Method 2: Via Railway CLI (If Available)

If Railway CLI supports shell access:

```bash
cd backend

# Connect to Railway shell
railway shell

# Then run migrations
npx prisma migrate deploy

# Then seed (optional)
npm run seed
```

---

## 🔧 Method 3: Add Migration to Deployment

### Temporary Fix: Run migrations on startup

**Update Railway start command temporarily:**

1. **Railway Dashboard → Backend Service → Settings**

2. **Change Start Command to:**
   ```
   npx prisma migrate deploy && npm start
   ```

3. **Save and Redeploy**

4. **After successful deployment, change Start Command back to:**
   ```
   npm start
   ```

This runs migrations every time the service starts, then starts the app.

**Note:** This is temporary - after migrations run once, you can remove it.

---

## 🔧 Method 4: Create a One-Time Migration Service

1. **Railway Dashboard → "+ New" → "Empty Service"**
2. **Set Root Directory:** `backend`
3. **Set Start Command:**
   ```
   npx prisma migrate deploy && npx prisma studio
   ```
4. **Run once, then delete the service**

---

## ⚠️ Seed Script Issues

The seed script has TypeScript errors. You have two options:

### Option A: Skip Seeding (For Now)

- Migrations are more important
- Database will work without seed data
- You can seed manually later after fixing seed script

### Option B: Fix Seed Script Later

After migrations are done and backend is running, you can fix the seed script TypeScript errors and run it then.

---

## ✅ After Migrations Complete

Once migrations are successful:

1. **Check logs:**
   - Should see "✅ Database migrations completed successfully"

2. **Test backend:**
   ```bash
   curl https://backend-production-bd1c2.up.railway.app/health
   ```

3. **Verify database:**
   - Backend should start without DATABASE_URL errors
   - Health endpoint should work

---

## 🎯 Recommended: Method 1 (Dashboard Shell)

**The easiest way is via Railway Dashboard Shell:**

1. Dashboard → Backend Service → Deployments → Latest → Shell
2. Run: `npx prisma migrate deploy`
3. Wait for completion
4. Done! ✅

---

## 📋 Checklist

- [ ] Access Railway shell (Dashboard or CLI)
- [ ] Run `npx prisma migrate deploy`
- [ ] Verify migrations completed successfully
- [ ] Test backend health endpoint
- [ ] (Optional) Fix seed script and run `npm run seed`

---

**Start with Method 1 - Railway Dashboard Shell!** 🚀

