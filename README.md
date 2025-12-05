# AI Resume Screening System

An intelligent resume screening application that uses AI to analyze candidate resumes against job descriptions. Built with FastAPI backend and React frontend.


## 🎯 Features

- **Job Description Management**: Update and store job descriptions with auto-save to file
- **Resume Upload & Preview**: Drag-and-drop PDF upload with live PDF preview
- **AI-Powered Analysis**: Azure OpenAI-based intelligent resume evaluation
- **Candidate Management**: SQLite database storing all candidates with 5-star ratings
- **Interactive Dashboard**: 
  - Overall match score (0-100)
  - Candidate strengths and gaps
  - Detailed skill assessments (Technical, Experience, Education, Communication)
  - Hiring recommendations
- **AI Chat Assistant**: Ask questions about candidates with conversation memory and markdown support (tables, lists, code blocks)
- **Modern UI/UX**:
  - Wider floating sidebars (700px candidates, 600px chat) - hidden by default
  - Full-height sidebars matching page height
  - Dynamic layout: content adjusts when sidebars toggle
  - No overlap between sidebars and main content
  - Resume preview aligns perfectly with chat sidebar when visible
  - Auto-scaling panels to fit screen size
  - PDF resume preview with placeholder
  - Toast notifications (non-blocking)
  - Responsive layout with 3-panel design
  - Chat history persistence (localStorage)
  - Markdown table rendering in chat
  - Smart conversation summarization (cumulative, dynamic token allocation)

## 🏗️ Architecture

```
ResumeScreening/
├── backend/              # FastAPI server
│   ├── main.py          # API endpoints & CORS config
│   ├── agent.py         # Azure OpenAI agent logic
│   ├── pdf_parser.py    # PDF text extraction
│   ├── database.py      # SQLite database & job description storage
│   ├── data/            # SQLite DB & saved job description
│   └── requirements.txt
└── frontend/            # React app (Vite)
    ├── src/
    │   ├── components/  
    │   │   ├── JobDescriptionForm.jsx
    │   │   ├── ResumeUpload.jsx
    │   │   ├── AnalysisDashboard.jsx
    │   │   ├── CandidatesList.jsx
    │   │   └── ChatWindow.jsx
    │   ├── App.jsx      # Main application with state & layout
    │   └── App.css      # Responsive 3-panel layout styling
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
   - Enter the job description in the Job Description panel
   - Click "Update Job Description"
   - Job description is auto-saved to file and persists across restarts
   - Toast notification confirms save (non-blocking)

2. **Upload Resume**:
   - Drag and drop a PDF resume or click to browse
   - Resume preview appears automatically in the right panel
   - Click "Analyze Resume" to process
   - Analysis creates a new candidate in the database

3. **View Candidates**:
   - Left sidebar shows all candidates with 5-star ratings (700px wide, hidden by default)
   - Full-height sidebar from top to bottom of page
   - Columns: Name, Date, Technical Skills, Experience, Education, Communication, Overall
   - Click any candidate row to view detailed analysis
   - Toggle sidebar visibility with arrow button
   - When visible, main content shifts right to avoid overlap

4. **Chat with AI**:
   - Right sidebar contains AI chat assistant (600px wide, hidden by default)
   - Ask questions like "Who has the most experience?" or "Compare top 2 candidates"
   - Supports markdown formatting including tables
   - Conversation memory: AI remembers context across messages
   - Smart summarization: Every 10 messages after 20, cumulative summaries preserve long conversations
   - Chat history persists in browser localStorage
   - Clear history button available
   - Toggle sidebar visibility with arrow button
   - When visible, chat perfectly overlays the Resume preview area

5. **Review Analysis**:
   - See match score, strengths, gaps
   - Review detailed skill assessments
   - Read AI-generated hiring recommendations

## 🔧 API Endpoints

### Job Description
- **`POST /api/job-description`**: Update job description (saves to file)
- **`GET /api/job-description`**: Retrieve current job description

### Resume Analysis
- **`POST /api/analyze-resume`**: Upload and analyze resume (multipart/form-data)
  - Returns: Match score, strengths, gaps, recommendations
  - Saves candidate to SQLite database

### Candidates
- **`GET /api/candidates`**: Get all candidates with ratings
- **`GET /api/candidates/{id}`**: Get detailed candidate analysis
- **`DELETE /api/candidates/{id}`**: Delete a candidate

### Chat
- **`POST /api/chat`**: Chat with AI about candidates with conversation memory
  - Body: `{"message": "your question", "history": [...]}`
  - Returns: AI response with candidate context
  - Features: Cumulative conversation summarization (every 10 messages after 20)
  - Dynamic token allocation: grows with conversation length (200-1500 tokens)

### Health
- **`GET /api/health`**: Health check endpoint

## 🧪 Development

### Backend Structure

- **`main.py`**: FastAPI app with CORS, routes, error handling, and SQLite integration
- **`agent.py`**: Azure OpenAI agent for resume analysis using structured prompts (JSON mode)
- **`pdf_parser.py`**: PyPDF2-based text extraction
- **`database.py`**: SQLite database manager for candidates and file-based job description storage

### Frontend Structure

- **`App.jsx`**: Main component with state management, 3-panel layout, toast notifications
- **`JobDescriptionForm.jsx`**: JD input with auto-load from backend
- **`ResumeUpload.jsx`**: File upload with drag-and-drop
- **`AnalysisDashboard.jsx`**: Results visualization with detailed metrics
- **`CandidatesList.jsx`**: Sortable table with 5-star ratings for all candidates
- **`ChatWindow.jsx`**: AI chat with markdown support (tables, code blocks, lists), localStorage persistence

### Key Features Implementation

- **Floating Sidebars**: CSS transforms for smooth slide in/out animations, no overlap with main content
- **Dynamic Layout**: Main content uses padding that adjusts based on which sidebars are visible
- **Relative API URLs**: Frontend uses `/api/*` paths for seamless local and Azure deployment
- **PDF Preview**: Blob URLs with iframe embedding, aligns perfectly with chat sidebar
- **Auto-scaling Panels**: CSS calc() for dynamic height based on viewport
- **Markdown Rendering**: Custom parser with table support in `formatMarkdown()`
- **Toast Notifications**: Fixed position with auto-dismiss (3s timeout)
- **Conversation Memory**: Backend tracks chat sessions with MD5 hash-based session IDs
- **Smart Summarization**: Cumulative summarization every 10 messages, dynamic token allocation (200-1500)
- **Data Persistence**: SQLite for candidates, file storage for job description, localStorage for chat history

## 🔐 Environment Variables

### Backend (.env)
```
# Azure OpenAI Configuration
OPENAI_API_KEY=your_azure_openai_key
OPENAI_ENDPOINT=https://your-instance.openai.azure.com
OPENAI_MODEL=gpt-4o

# Server Configuration
PORT=8000
HOST=0.0.0.0
```

### Example Azure OpenAI Setup
```
OPENAI_API_KEY=abc123...
OPENAI_ENDPOINT=https://westpac-design-assistant-openai.openai.azure.com
OPENAI_MODEL=gpt-4o
```

## 📝 Notes

- **PDF Support**: Only PDF files are supported for resume upload
- **API Key**: Requires valid Azure OpenAI API key with access to chat models (gpt-4o recommended)
- **Model**: Defaults to `gpt-4o` but can be changed in `.env`
- **Data Persistence**: 
  - Candidates stored in SQLite database (`backend/data/resume_screening.db`)
  - Job descriptions saved to file (`backend/data/job_description.txt`)
  - Chat history stored in browser localStorage
- **Browser Compatibility**: Modern browsers (Chrome, Edge, Firefox, Safari)
- **Layout**: Optimized for wide screens (1920px+), responsive down to 1200px
- **Performance**: Auto-scaling panels, lazy-loaded components, efficient state management

## 🚧 Future Enhancements

- [ ] ~~Database integration for persistence~~ ✅ Completed (SQLite)
- [ ] ~~Resume preview in application~~ ✅ Completed (PDF iframe)
- [ ] ~~Chat assistant for candidate queries~~ ✅ Completed (AI chat with markdown)
- [ ] Advanced candidate filtering and sorting
- [ ] Multiple job description support (job requisition management)
- [ ] Resume history and comparison side-by-side
- [ ] Batch resume processing (bulk upload)
- [ ] Export analysis reports (PDF/Excel)
- [ ] User authentication and role-based access
- [ ] Custom scoring criteria and weights
- [ ] Email integration for candidate communication
- [ ] Interview scheduling integration
- [ ] Advanced analytics dashboard (charts, trends)
- [ ] Resume parsing improvements (structured data extraction)
- [ ] Multi-language support

## 🌐 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed Azure deployment instructions.

Quick deploy to Azure Web App:
1. Create Azure App Service (Python 3.11, Linux)
2. Set environment variables in App Settings:
   - `OPENAI_API_KEY`
   - `OPENAI_ENDPOINT`
   - `OPENAI_MODEL`
3. Configure Startup Command: 
   ```
   gunicorn --bind=0.0.0.0:8000 --workers=4 --worker-class=uvicorn.workers.UvicornWorker main:app
   ```
4. Add Azure publish profile to GitHub Secrets
5. Push to `main` branch - auto deploys via GitHub Actions!

### Deployment Notes
- Frontend is built and served by FastAPI (static files)
- SQLite database persists in Azure App Service filesystem
- Ensure sufficient disk space for resume storage
- Configure CORS origins if using custom domain

## 🎨 UI/UX Highlights

- **3-Panel Layout**: Floating candidates sidebar (700px, left), main content (center), chat sidebar (600px, right)
- **Smart Sidebar Behavior**: 
  - Both sidebars hidden by default
  - Toggle independently with arrow buttons
  - Main content dynamically adjusts padding to prevent overlap
  - Full-height sidebars (100vh) for maximum space utilization
- **Seamless Integration**: Chat sidebar perfectly aligns over Resume preview when visible
- **Responsive Design**: Adapts to screen sizes with media queries
- **Smooth Animations**: CSS transitions for sidebar toggles, toast notifications
- **Visual Feedback**: Toast notifications, loading states, hover effects
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation support
- **Modern Stack**: React 18, Vite 6, Lucide icons, CSS Grid/Flexbox

## 📄 License

This project is for educational and demonstration purposes.
