#!/bin/bash

# Create Railway Services Script

set -e

echo "🚀 Creating Railway Services..."
echo ""

cd "$(dirname "$0")/backend"

# Check if logged in
if ! railway whoami &>/dev/null; then
    echo "❌ Not logged in to Railway. Please run: railway login"
    exit 1
fi

echo "✅ Logged in to Railway"
echo ""

# Check if project is linked
if [ ! -f ".railway/link.json" ]; then
    echo "❌ Project not linked. Please run: railway link"
    exit 1
fi

echo "📋 Current project:"
railway status
echo ""

echo "📦 Adding PostgreSQL database..."
echo "   (This will prompt you - select 'Database' and then 'PostgreSQL')"
railway add --database postgres || {
    echo ""
    echo "⚠️  Could not add PostgreSQL via CLI."
    echo "   Please add it manually in Railway dashboard:"
    echo "   1. Go to: https://railway.app/project/dcfa1e72-e755-431e-a28b-47e79ba6e697"
    echo "   2. Click '+ New' → 'Database' → 'Add PostgreSQL'"
    echo ""
}

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Open Railway dashboard: https://railway.app/project/dcfa1e72-e755-431e-a28b-47e79ba6e697"
echo "   2. Verify services exist (PostgreSQL and backend)"
echo "   3. Click on backend service → Settings → Set Root Directory to 'backend'"
echo "   4. Redeploy the service"
echo ""

