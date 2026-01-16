#!/bin/bash
echo "Setting up Expense Tracker with MongoDB..."

# Install dependencies if not already done (brief check)
if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install
    cd ..
fi

echo "Starting Application..."
echo "Backend running on port 3001"
echo "Frontend running on port 5173"

# Run backend in background
cd backend
# Start backend and wait for it to be ready-ish? No, just start.
node server.js &
BACKEND_PID=$!
cd ..

# Run frontend
cd frontend
npm run dev

# Cleanup on exit
kill $BACKEND_PID
