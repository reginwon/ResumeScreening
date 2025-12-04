# Setup Resume Screening Application
# Run this script once to set up the project

Write-Host "🔧 Setting up Resume Screening Application..." -ForegroundColor Cyan

# Setup Backend
Write-Host "`n📦 Setting up backend..." -ForegroundColor Green
Set-Location backend

if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

Write-Host "Activating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1

Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  Please edit backend\.env and add your OPENAI_API_KEY" -ForegroundColor Yellow
}

# Setup Frontend
Write-Host "`n📦 Setting up frontend..." -ForegroundColor Green
Set-Location ..\frontend

Write-Host "Installing Node dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Building frontend..." -ForegroundColor Yellow
npm run build

Set-Location ..

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend\.env and add your OPENAI_API_KEY" -ForegroundColor White
Write-Host "2. Run: .\start.ps1" -ForegroundColor White
Write-Host "`nApplication will be available at: http://localhost:8000" -ForegroundColor Cyan
