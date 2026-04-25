#!/bin/bash

echo "🚀 Starting DevLinks..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start Docker services
echo "📦 Starting PostgreSQL, MongoDB, and Redis..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

# Run migrations
echo "🗄️  Running database migrations..."
alembic upgrade head

# Start backend in background
echo "🚀 Starting FastAPI backend..."
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "⚛️  Starting React frontend..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ DevLinks is running!"
echo ""
echo "📍 Backend API: http://localhost:8000"
echo "📍 API Docs: http://localhost:8000/docs"
echo "📍 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; docker-compose down; exit" INT
wait
