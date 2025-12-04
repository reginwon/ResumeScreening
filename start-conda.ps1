# Start Resume Screening Application with Conda/Mamba

Write-Host "🚀 Starting Resume Screening Application with Conda..." -ForegroundColor Cyan

# Check if conda/mamba is available
$condaCmd = $null
if (Get-Command mamba -ErrorAction SilentlyContinue) {
    $condaCmd = "mamba"
} elseif (Get-Command conda -ErrorAction SilentlyContinue) {
    $condaCmd = "conda"
} else {
    Write-Host "❌ Conda/Mamba not found! Please install Miniforge." -ForegroundColor Red
    exit 1
}

Write-Host "Using: $condaCmd" -ForegroundColor Green

# Check if environment exists
$envExists = & $condaCmd env list | Select-String "resume-screening"
if (-not $envExists) {
    Write-Host "📦 Creating conda environment..." -ForegroundColor Yellow
    & $condaCmd create -n resume-screening python=3.11 -y
}

# Activate environment
Write-Host "🔧 Activating environment..." -ForegroundColor Yellow
& $condaCmd activate resume-screening

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Green
Set-Location backend
pip install -r requirements.txt

# Check .env file
if (-not (Test-Path .env)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please create backend\.env with your OPENAI_API_KEY" -ForegroundColor Yellow
    Set-Location ..
    exit 1
}

# Build frontend
Write-Host "📦 Building frontend..." -ForegroundColor Green
Set-Location ..\frontend

if (-not (Test-Path node_modules)) {
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
Write-Host "Application will be available at: http://localhost:8000" -ForegroundColor Cyan
python main.py
