#!/bin/bash

# Railway Environment Variables Setup Script

set -e

echo "🔐 Setting up Railway environment variables..."
echo ""

cd "$(dirname "$0")/backend"

# Check if logged in
if ! railway whoami &>/dev/null; then
    echo "❌ Not logged in to Railway. Please run: railway login"
    exit 1
fi

# Check if project is linked
if [ ! -f ".railway/link.json" ]; then
    echo "❌ Project not linked. Please run: railway link"
    exit 1
fi

echo "✅ Logged in and linked to Railway project"
echo ""

# Generate and set JWT secrets
echo "🔑 Generating JWT secrets..."

JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
railway variables set JWT_SECRET="$JWT_SECRET"
echo "   ✅ JWT_SECRET set"

JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
railway variables set JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"
echo "   ✅ JWT_REFRESH_SECRET set"
echo ""

# Set NODE_ENV
echo "⚙️  Setting NODE_ENV..."
railway variables set NODE_ENV=production
echo "   ✅ NODE_ENV set to production"
echo ""

# Prompt for FRONTEND_URL
echo "🌐 Setting FRONTEND_URL..."
if [ -n "$1" ]; then
    FRONTEND_URL="$1"
else
    read -p "   Enter your Vercel frontend URL (e.g., https://your-app.vercel.app): " VERCEL_URL
    if [ -n "$VERCEL_URL" ]; then
        FRONTEND_URL="$VERCEL_URL,http://localhost:3000"
    else
        echo "   ⚠️  FRONTEND_URL not set. Set it manually:"
        echo "      railway variables set FRONTEND_URL='https://your-vercel-app.vercel.app,http://localhost:3000'"
        FRONTEND_URL=""
    fi
fi

if [ -n "$FRONTEND_URL" ]; then
    railway variables set FRONTEND_URL="$FRONTEND_URL"
    echo "   ✅ FRONTEND_URL set to: $FRONTEND_URL"
fi
echo ""

# Show all variables
echo "📝 Current environment variables:"
railway variables
echo ""

echo "✅ Environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Run migrations: railway run npx prisma migrate deploy"
echo "   2. Seed database: railway run npm run seed"
echo "   3. Get backend URL: railway domain"
echo "   4. Update Vercel with backend URL"
echo ""

