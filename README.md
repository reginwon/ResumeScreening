# AI Resume Screening System

An intelligent resume screening application that uses AI to analyze candidate resumes against job descriptions. Built with FastAPI backend and React frontend.

## 🎯 Features

- **Job Description Management**: Update and store job descriptions for screening
- **Resume Upload**: Drag-and-drop PDF resume upload
- **AI-Powered Analysis**: OpenAI-based intelligent resume evaluation
- **Visual Dashboard**: Interactive analysis dashboard with:
  - Overall match score (0-100)
  - Candidate strengths and gaps
  - Detailed skill assessments
  - Hiring recommendations

## 🏗️ Architecture

```
ResumeScreening/
├── backend/              # FastAPI server
│   ├── main.py          # API endpoints
│   ├── agent.py         # OpenAI agent logic
│   ├── pdf_parser.py    # PDF text extraction
│   └── requirements.txt
└── frontend/            # React app
    ├── src/
    │   ├── components/  # React components
    │   ├── App.jsx      # Main application
    │   └── App.css      # Styling
    └── package.json
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- OpenAI API key
- **Optional**: Miniforge/Conda/Mamba for environment management

### Quick Start (Choose Your Method)

#### Option 1: Using Conda/Mamba (Recommended if you have Miniforge)

```bash
# Create and activate environment
mamba create -n resume-screening python=3.11 -y
mamba activate resume-screening

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Create .env file and add your OpenAI API key
cp .env.example .env
# Edit .env and add: OPENAI_API_KEY=sk-...

# Build frontend
cd ../frontend
npm install
npm run build

# Run application
cd ../backend
python main.py
```

Access at: **`http://localhost:8000`** 🎉

Or use the convenience script:
```bash
# Linux/Mac
./start-conda.sh

# Windows
.\start-conda.ps1
```

#### Option 2: Using Python venv

```powershell
# One-command setup
.\setup.ps1

# Edit .env file
notepad backend\.env
# Add: OPENAI_API_KEY=sk-...

# Run application
.\start.ps1
```

Access at: **`http://localhost:8000`** 🎉

See [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md) for detailed conda/mamba setup instructions.

### Alternative: Manual Setup

<details>
<summary>Click to expand manual setup instructions</summary>

#### Backend Setup

1. Navigate to backend directory:
```powershell
cd backend
```

2. Create virtual environment:
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

3. Install dependencies:
```powershell
pip install -r requirements.txt
```

4. Create `.env` file:
```powershell
copy .env.example .env
```

5. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
```

#### Frontend Build

1. Navigate to frontend directory:
```powershell
cd frontend
```

2. Install dependencies:
```powershell
npm install
```

3. Build for production:
```powershell
npm run build
```

#### Run Application

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python main.py
```

Access at: `http://localhost:8000`

</details>

### Development Mode (Hot Reload)

For development with live updates:

**Using Conda/Mamba:**
```bash
# Terminal 1 - Backend
mamba activate resume-screening
cd backend
python main.py

# Terminal 2 - Frontend (dev server)
cd frontend
npm run dev
```

**Using venv:**
```powershell
# Terminal 1 - Backend
cd backend
.\venv\Scripts\Activate.ps1
python main.py

# Terminal 2 - Frontend (dev server)
cd frontend
npm run dev
```

Frontend dev server: `http://localhost:3000`

## 📖 Usage

1. **Set Job Description**: 
   - Paste the job description in the left panel
   - Click "Update Job Description"

2. **Upload Resume**:
   - Drag and drop a PDF resume or click to browse
   - Click "Analyze Resume"

3. **View Results**:
   - See match score, strengths, gaps
   - Review detailed skill assessments
   - Read hiring recommendations

## 🔧 API Endpoints

### `POST /api/job-description`
Update the job description
```json
{
  "job_description": "string"
}
```

### `GET /api/job-description`
Retrieve current job description

### `POST /api/analyze-resume`
Upload and analyze resume (multipart/form-data)
- Returns: Match score, strengths, gaps, recommendations

### `GET /api/health`
Health check endpoint

## 🧪 Development

### Backend Structure

- **`main.py`**: FastAPI app with CORS, routes, and error handling
- **`agent.py`**: OpenAI agent for resume analysis using structured prompts
- **`pdf_parser.py`**: PyPDF2-based text extraction

### Frontend Structure

- **`App.jsx`**: Main component with state management
- **`JobDescriptionForm.jsx`**: JD input component
- **`ResumeUpload.jsx`**: File upload with drag-and-drop
- **`AnalysisDashboard.jsx`**: Results visualization

## 🔐 Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4o
PORT=8000
HOST=0.0.0.0
```

## 📝 Notes

- **PDF Support**: Only PDF files are supported for resume upload
- **API Key**: Requires valid OpenAI API key with access to chat models
- **Model**: Defaults to `gpt-4o` but can be changed in `.env`
- **Data Storage**: Currently uses in-memory storage (job description resets on restart)

## 🚧 Future Enhancements

- [ ] Database integration for persistence
- [ ] Multiple job description support
- [ ] Resume history and comparison
- [ ] Batch resume processing
- [ ] Export analysis reports
- [ ] User authentication
- [ ] Custom scoring criteria

## 🌐 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed Azure deployment instructions.

Quick deploy to Azure:
1. Create Azure App Service (Python 3.11)
2. Set `OPENAI_API_KEY` in App Settings
3. Add Azure publish profile to GitHub Secrets
4. Push to `main` branch - auto deploys via GitHub Actions!

## 📄 License

This project is for educational and demonstration purposes.
