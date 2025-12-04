#!/bin/bash
# Start Resume Screening Application with Conda/Mamba

echo "🚀 Starting Resume Screening Application with Conda..."

# Check if conda/mamba is available
if command -v mamba &> /dev/null; then
    CONDA_CMD="mamba"
elif command -v conda &> /dev/null; then
    CONDA_CMD="conda"
else
    echo "❌ Conda/Mamba not found! Please install Miniforge."
    exit 1
fi

# Check if environment exists
if ! $CONDA_CMD env list | grep -q "resume-screening"; then
    echo "📦 Creating conda environment..."
    $CONDA_CMD create -n resume-screening python=3.11 -y
fi

# Activate environment
echo "🔧 Activating environment..."
eval "$($CONDA_CMD shell.bash hook)"
$CONDA_CMD activate resume-screening

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt

# Check .env file
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create backend/.env with your OPENAI_API_KEY"
    exit 1
fi

# Build frontend
echo "📦 Building frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend built successfully!"

# Start backend
cd ../backend
echo "🚀 Starting backend server..."
echo "Application will be available at: http://localhost:8000"
python main.py
