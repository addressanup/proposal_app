#!/bin/bash
set -e

echo "🔄 Running database migrations..."

# Run migrations with better error output
if ! npx prisma migrate deploy; then
  echo "❌ Migration failed!"
  echo "Checking migration status..."
  npx prisma migrate status || true
  echo "Attempting to resolve..."
  exit 1
fi

echo "✅ Migrations completed successfully!"
echo "🚀 Starting server..."
exec npm start

