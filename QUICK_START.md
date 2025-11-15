# Quick Start Guide 🚀

Get your proposal platform running in 5 minutes!

---

## Prerequisites
- ✅ Node.js 18+
- ✅ PostgreSQL 14+
- ✅ Gmail account (for email testing) OR Mailtrap account

---

## Step 1: Database Setup

```bash
# Start PostgreSQL (if not running)
# Mac:
brew services start postgresql

# Linux:
sudo service postgresql start

# Create database
psql -U postgres
CREATE DATABASE proposal_platform;
\q
```

---

## Step 2: Backend Configuration

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env file
nano .env  # or use your favorite editor
```

**Minimum required configuration:**

```env
# Database (update with your credentials)
DATABASE_URL="postgresql://postgres:password@localhost:5432/proposal_platform?schema=public"

# JWT Secrets (change these!)
JWT_SECRET=your-very-secret-key-change-me
JWT_REFRESH_SECRET=your-refresh-secret-change-me

# Email (Option 1: Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=noreply@proposalplatform.com

# OR Email (Option 2: Mailtrap for testing)
# SMTP_HOST=smtp.mailtrap.io
# SMTP_PORT=2525
# SMTP_USER=your-mailtrap-user
# SMTP_PASS=your-mailtrap-pass

# AWS S3 (Optional - for production)
# For development, file URLs will be placeholders
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=placeholder
AWS_SECRET_ACCESS_KEY=placeholder
S3_BUCKET_NAME=proposal-documents

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

---

## Step 3: Install & Run Backend

```bash
# Install dependencies
npm install

# Run database migration
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

**You should see:**
```
🚀 Server running on port 5000
📝 Environment: development
```

---

## Step 4: Test Backend

### Test 1: Health Check
```bash
curl http://localhost:5000/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-15T10:30:00.000Z"
}
```

### Test 2: Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Expected response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

✅ **Backend is working!**

---

## Step 5: Test Complete Workflow

### 1. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Save the `accessToken` from response**

### 2. Create Organization
```bash
curl -X POST http://localhost:5000/api/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "My Company",
    "slug": "my-company",
    "description": "My awesome company"
  }'
```

**Save the `organization.id` from response**

### 3. Create Proposal
```bash
curl -X POST http://localhost:5000/api/proposals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Website Redesign Proposal",
    "description": "Complete website redesign",
    "content": "This is our proposal content...",
    "organizationId": "YOUR_ORGANIZATION_ID"
  }'
```

**Save the `proposal.id` from response**

### 4. Create Share Link
```bash
curl -X POST http://localhost:5000/api/sharing/links \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "proposalId": "YOUR_PROPOSAL_ID",
    "recipientEmail": "client@example.com",
    "recipientName": "Jane Client",
    "linkType": "EMAIL_SPECIFIC",
    "sendEmail": true,
    "customMessage": "Please review this proposal"
  }'
```

**Response will include:**
```json
{
  "status": "success",
  "data": {
    "shareLink": {
      "shareUrl": "http://localhost:3000/p/abc123..."
    }
  }
}
```

✅ **Email sent! Check your inbox (or Mailtrap)**

### 5. Access Share Link (Public - No Auth)
```bash
curl http://localhost:5000/api/sharing/preview/YOUR_SHARE_TOKEN
```

✅ **Anyone can view the proposal preview!**

### 6. New User Signup via Share Link
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@example.com",
    "password": "ClientPass123!",
    "firstName": "Jane",
    "lastName": "Client",
    "shareToken": "YOUR_SHARE_TOKEN"
  }'
```

✅ **User registered + Connection auto-created!**

### 7. Check Connections
```bash
# Login as original user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Get connections
curl http://localhost:5000/api/connections \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

✅ **Connection with Jane Client is there!**

---

## Step 6: Frontend Setup (Optional)

```bash
cd ../frontend

# Install dependencies
npm install

# Update API URL in .env
echo "REACT_APP_API_URL=http://localhost:5000" > .env

# Start frontend
npm start
```

Frontend will open at: http://localhost:3000

---

## 🎯 What You Can Test Now

### Document Upload
```bash
curl -X POST http://localhost:5000/api/proposals/YOUR_PROPOSAL_ID/documents \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/proposal.pdf"
```

### Connection Stats
```bash
curl http://localhost:5000/api/connections/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get All Share Links
```bash
curl http://localhost:5000/api/proposals/YOUR_PROPOSAL_ID/share-links \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📧 Email Setup Guide

### Option 1: Gmail (Easy for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Proposal Platform"
   - Copy the 16-character password

3. **Update .env:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcd-efgh-ijkl-mnop  # Your app password
SMTP_FROM=noreply@proposalplatform.com
```

### Option 2: Mailtrap (Best for Development)

1. **Sign up:** https://mailtrap.io/
2. **Get credentials** from your inbox
3. **Update .env:**
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-pass
SMTP_FROM=noreply@proposalplatform.com
```

All emails will be caught by Mailtrap - perfect for testing!

---

## 🗄️ Database Exploration

```bash
# Open Prisma Studio (Database GUI)
npx prisma studio
```

Opens at: http://localhost:5555

You can now:
- View all data
- Edit records
- Test relationships

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Check database exists
psql -U postgres -l | grep proposal_platform

# Re-run migrations
npx prisma migrate reset
npx prisma migrate dev
```

### Email not sending
```bash
# Test email configuration
node -e "
const nodemailer = require('nodemailer');
const transport = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});
transport.verify((err, success) => {
  console.log(err || 'Email configured correctly!');
});
"
```

### Port already in use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

---

## 📖 Next Steps

1. **Read API Documentation:** `backend/NEW_API_ENDPOINTS.md`
2. **Explore Database:** Run `npx prisma studio`
3. **Test with Postman:** Import the endpoints
4. **Build Frontend:** Start with login/register pages
5. **Deploy:** Follow `DEPLOYMENT.md` when ready

---

## 🎉 You're All Set!

Your proposal platform is now running with:
- ✅ Document uploads
- ✅ Secure sharing
- ✅ Auto-connections
- ✅ Email notifications
- ✅ Complete API

**Happy coding! 🚀**

---

## 💡 Pro Tips

1. **Use Postman** - Import all endpoints for easy testing
2. **Enable Prisma Logs** - Add `?logs=query` to see SQL
3. **Watch Mode** - `npm run dev` auto-restarts on changes
4. **Test Email** - Use Mailtrap to see all emails
5. **Database Reset** - `npx prisma migrate reset` for fresh start

---

**Need help? Check `IMPLEMENTATION_COMPLETE.md` for detailed documentation!**
