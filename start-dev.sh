#!/bin/bash

# CLM Platform - Development Startup Script
# This script starts both backend and frontend in development mode

set -e

echo "🚀 Starting CLM Platform Development Environment..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is running
if ! command -v pg_isready &> /dev/null; then
    echo "⚠️  Warning: pg_isready command not found. Make sure PostgreSQL is installed and running."
else
    if ! pg_isready &> /dev/null; then
        echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
        exit 1
    fi
fi

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Check if .env exists in backend
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found!"
    echo "📝 Creating backend/.env from .env.example..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your database credentials before continuing."
    echo "   Then run this script again."
    exit 1
fi

# Check if database exists and migrations are run
echo "🔍 Checking database setup..."
cd backend

# Generate Prisma Client
echo "⚙️  Generating Prisma Client..."
npx prisma generate

# Check if migrations need to be run
if ! npx prisma migrate status &> /dev/null; then
    echo "📊 Running database migrations..."
    npx prisma migrate dev
fi

cd ..

echo ""
echo "✅ All checks passed!"
echo ""
echo "🌟 Starting services..."
echo ""
echo "📍 Backend will run on: http://localhost:5000"
echo "📍 Frontend will run on: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend in background
echo "🔧 Starting backend..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend in background
echo "🎨 Starting frontend..."
cd frontend && npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
