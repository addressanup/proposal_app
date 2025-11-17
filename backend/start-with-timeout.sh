#!/bin/bash
set -e

echo "🔄 Running database migrations with timeout..."

# Run migrations with a 10-second timeout
timeout 10 npx prisma migrate deploy || {
  echo "⚠️ Migration failed or timed out, but continuing..."
  echo "This might be because:"
  echo "  - Database is not ready yet"
  echo "  - Migrations already applied"
  echo "  - Connection issue (will retry on next request)"
}

echo "🚀 Starting server..."
exec npm start

