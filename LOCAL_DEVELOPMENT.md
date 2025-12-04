# Resume Screening - Local Development with Conda/Mamba

This guide is for running the application locally using Miniforge/Conda/Mamba.

## Prerequisites

- Miniforge/Conda/Mamba installed
- Node.js 18+
- OpenAI API key

## Setup with Conda/Mamba

### 1. Create Conda Environment

```bash
# Using mamba (faster)
mamba create -n resume-screening python=3.11 -y
mamba activate resume-screening

# Or using conda
conda create -n resume-screening python=3.11 -y
conda activate resume-screening
```

### 2. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit and add your OpenAI API key
# Windows
notepad .env

# Linux/Mac
nano .env
```

Add to `.env`:
```
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o
```

### 4. Build Frontend

```bash
cd ../frontend
npm install
npm run build
```

### 5. Run Application

```bash
cd ../backend
python main.py
```

Open browser: `http://localhost:8000` 🎉

## Development Mode (with Hot Reload)

### Terminal 1 - Backend
```bash
mamba activate resume-screening
cd backend
python main.py
```

### Terminal 2 - Frontend Dev Server
```bash
cd frontend
npm run dev
```

Frontend dev server: `http://localhost:3000`
Production build: `http://localhost:8000`

## Quick Start Scripts (Optional)

If you prefer scripts, use:

### Conda/Mamba users:
- `start-conda.sh` (Linux/Mac) or `start-conda.ps1` (Windows)

### Python venv users:
- `start.ps1` (Windows) or `start.sh` (Linux/Mac)

## Environment Management

### Activate environment
```bash
mamba activate resume-screening
# or
conda activate resume-screening
```

### Deactivate environment
```bash
conda deactivate
```

### Update dependencies
```bash
mamba activate resume-screening
cd backend
pip install -r requirements.txt --upgrade
```

### Remove environment
```bash
mamba env remove -n resume-screening
```

## Troubleshooting

**Issue: Command not found**
- Ensure Miniforge is in PATH
- Restart terminal after installation

**Issue: Environment activation fails**
- Initialize shell: `mamba init` or `conda init`
- Restart terminal

**Issue: Package conflicts**
- Use mamba instead of conda (faster, better dependency resolution)
- Create fresh environment: `mamba env remove -n resume-screening && mamba create -n resume-screening python=3.11 -y`
