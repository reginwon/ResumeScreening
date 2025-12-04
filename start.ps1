# Start Resume Screening Application
# This script builds the frontend and starts the backend server

Write-Host "🚀 Starting Resume Screening Application..." -ForegroundColor Cyan

# Check if virtual environment exists
if (-not (Test-Path "backend\venv")) {
    Write-Host "❌ Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run setup first:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor Yellow
    Write-Host "  python -m venv venv" -ForegroundColor Yellow
    Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor Yellow
    Write-Host "  pip install -r requirements.txt" -ForegroundColor Yellow
    exit 1
}

# Check if .env exists
if (-not (Test-Path "backend\.env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please create backend\.env with your OPENAI_API_KEY" -ForegroundColor Yellow
    exit 1
}

# Build frontend
Write-Host "`n📦 Building frontend..." -ForegroundColor Green
Set-Location frontend

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✅ Frontend built successfully!" -ForegroundColor Green

# Start backend
Set-Location ..\backend
Write-Host "`n🚀 Starting backend server..." -ForegroundColor Green

.\venv\Scripts\Activate.ps1
python main.py
