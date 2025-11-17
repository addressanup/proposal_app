#!/bin/bash

# Railway Deployment Script for Backend
# Run this after: railway login

set -e

echo "🚀 Starting Railway Deployment..."
echo ""

# Check if logged in
if ! railway whoami &>/dev/null; then
    echo "❌ Not logged in to Railway. Please run: railway login"
    exit 1
fi

echo "✅ Logged in to Railway"
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/backend"

echo "📦 Current directory: $(pwd)"
echo ""

# Check if project is linked
if [ ! -f ".railway/link.json" ]; then
    echo "🔗 Linking project to Railway..."
    echo "   (Select your project when prompted, or create a new one)"
    railway link
    echo ""
fi

echo "📋 Project linked. Current project info:"
railway status
echo ""

# Check if PostgreSQL service exists
echo "🗄️  Checking for PostgreSQL database..."
if ! railway service list 2>/dev/null | grep -q "PostgreSQL"; then
    echo "   ⚠️  PostgreSQL not found. You'll need to add it manually:"
    echo "   1. Go to Railway dashboard"
    echo "   2. Click '+ New' → 'Database' → 'Add PostgreSQL'"
    echo "   3. Then run this script again"
    echo ""
    read -p "   Press Enter after adding PostgreSQL, or Ctrl+C to cancel..."
fi

echo ""
echo "🔐 Setting up environment variables..."
echo ""

# Generate JWT secrets if not provided
if [ -z "$JWT_SECRET" ]; then
    echo "   Generating JWT_SECRET..."
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    railway variables set JWT_SECRET="$JWT_SECRET"
    echo "   ✅ JWT_SECRET set"
else
    railway variables set JWT_SECRET="$JWT_SECRET"
    echo "   ✅ JWT_SECRET set (from environment)"
fi

if [ -z "$JWT_REFRESH_SECRET" ]; then
    echo "   Generating JWT_REFRESH_SECRET..."
    JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    railway variables set JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"
    echo "   ✅ JWT_REFRESH_SECRET set"
else
    railway variables set JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"
    echo "   ✅ JWT_REFRESH_SECRET set (from environment)"
fi

# Set NODE_ENV
railway variables set NODE_ENV=production
echo "   ✅ NODE_ENV set to production"

# Set FRONTEND_URL if provided
if [ -n "$FRONTEND_URL" ]; then
    railway variables set FRONTEND_URL="$FRONTEND_URL"
    echo "   ✅ FRONTEND_URL set to: $FRONTEND_URL"
else
    echo "   ⚠️  FRONTEND_URL not set. Set it manually:"
    echo "      railway variables set FRONTEND_URL='https://your-vercel-app.vercel.app,http://localhost:3000'"
fi

echo ""
echo "📝 Current environment variables:"
railway variables
echo ""

# Run database migrations
echo "🗃️  Running database migrations..."
railway run npx prisma migrate deploy
echo "   ✅ Migrations completed"
echo ""

# Seed database
echo "🌱 Seeding database with templates..."
railway run npm run seed
echo "   ✅ Database seeded"
echo ""

# Deploy
echo "🚀 Deploying to Railway..."
railway up
echo ""

echo "✅ Deployment complete!"
echo ""
echo "📊 Get your deployment URL:"
echo "   railway domain"
echo ""
echo "🔍 View logs:"
echo "   railway logs"
echo ""
echo "📈 Check status:"
echo "   railway status"
echo ""

