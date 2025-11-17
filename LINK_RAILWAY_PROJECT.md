# 🔗 Link Railway Project - Quick Guide

You need to link your local directory to the Railway project manually.

---

## ✅ Solution: Link Project Manually

**Run this in your terminal** (not here, in your actual terminal):

```bash
cd "/Users/anuppandey/Dev Projects/proposal_app/backend"
railway link
```

This will:
1. Show you a list of workspaces
2. Ask you to select: `addressanup's Projects`
3. Show you a list of projects
4. Ask you to select: `proposal-app-backend`
5. Link the directory to the project ✅

---

## 📋 Step-by-Step Instructions

1. **Open your terminal** (the one where you ran `railway open`)

2. **Navigate to backend directory:**
   ```bash
   cd "/Users/anuppandey/Dev Projects/proposal_app/backend"
   ```

3. **Link the project:**
   ```bash
   railway link
   ```

4. **Follow the prompts:**
   - When asked for workspace: Select `addressanup's Projects`
   - When asked for project: Select `proposal-app-backend`

5. **Verify link:**
   ```bash
   railway status
   ```
   
   Should show:
   ```
   Project: proposal-app-backend
   Environment: production
   Service: backend
   ```

---

## 🚀 After Linking

Once linked, you can:

```bash
# Open Railway dashboard
railway open

# View status
railway status

# View variables
railway variables

# Set variables
railway variables set KEY=value

# Run commands
railway run <command>

# Deploy
railway up
```

---

## 🎯 Next Steps After Linking

1. **Open dashboard:**
   ```bash
   railway open
   ```

2. **Create services:**
   - Click "+ New" → "Database" → "Add PostgreSQL"
   - Click "+ New" → "GitHub Repo" → Select `addressanup/proposal_app`

3. **Configure backend service:**
   - Click on backend service
   - Settings → Root Directory → Set to `backend`
   - Save

4. **Set environment variables:**
   ```bash
   ./setup-railway-env.sh "https://your-vercel-app.vercel.app,http://localhost:3000"
   ```

5. **Deploy:**
   ```bash
   railway run npx prisma migrate deploy
   railway run npm run seed
   railway up
   ```

---

## ✅ Quick Checklist

- [ ] Run `railway link` in terminal
- [ ] Select workspace: `addressanup's Projects`
- [ ] Select project: `proposal-app-backend`
- [ ] Verify with `railway status`
- [ ] Open dashboard with `railway open`
- [ ] Create services in dashboard
- [ ] Set Root Directory to `backend`
- [ ] Set environment variables
- [ ] Deploy!

---

## 🐛 Troubleshooting

### "No linked project found"
- Run `railway link` to link the project
- Make sure you're in the `backend/` directory

### "Failed to prompt for options"
- You're running in a non-interactive environment
- Run `railway link` in your actual terminal (not via script)

### "Project not found"
- Make sure you're logged in: `railway whoami`
- Check project exists: `railway list`

---

## 💡 Why Link is Needed

Railway CLI needs to know which project to work with. The `railway link` command connects your local directory to a specific Railway project, so commands like `railway open`, `railway status`, and `railway variables` know which project to use.

---

**Once you run `railway link` in your terminal, you'll be able to use all Railway CLI commands!** 🚀

