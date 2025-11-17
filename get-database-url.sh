#!/bin/bash

# Get DATABASE_URL from Railway PostgreSQL service

set -e

echo "🔍 Getting DATABASE_URL from Railway PostgreSQL..."
echo ""

cd "$(dirname "$0")/backend"

# Check if logged in
if ! railway whoami &>/dev/null; then
    echo "❌ Not logged in to Railway. Please run: railway login"
    exit 1
fi

echo "✅ Logged in to Railway"
echo ""

echo "📋 Available services:"
railway status
echo ""

echo "⚠️  To get DATABASE_URL, you need to:"
echo ""
echo "1. Go to Railway Dashboard:"
echo "   https://railway.app/project/dcfa1e72-e755-431e-a28b-47e79ba6e697"
echo ""
echo "2. Click on PostgreSQL service (not backend)"
echo ""
echo "3. Go to 'Variables' tab"
echo ""
echo "4. Find and copy DATABASE_URL (or POSTGRES_URL)"
echo ""
echo "5. Add it to backend service:"
echo "   - Click on backend service"
echo "   - Variables tab → New Variable"
echo "   - Name: DATABASE_URL"
echo "   - Value: (paste the connection string)"
echo "   - Save"
echo ""
echo "6. Then run this to set it via CLI:"
echo "   railway variables --set 'DATABASE_URL=postgresql://...'"
echo ""

