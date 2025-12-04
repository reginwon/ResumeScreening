# Copilot Instructions for Resume Screening System

## Project Overview

This is an AI-powered resume screening application with a **FastAPI backend** and **React frontend**. The system analyzes candidate resumes against job descriptions using OpenAI's API.

**Key Components:**
- Backend: FastAPI REST API with OpenAI integration
- Frontend: React (Vite) with Lucide icons
- AI Agent: Resume analysis using OpenAI chat models
- PDF Processing: PyPDF2 for text extraction

## Architecture

```
backend/
  ├── main.py          # FastAPI app, routes, CORS
  ├── agent.py         # OpenAI agent for resume analysis
  └── pdf_parser.py    # PDF text extraction

frontend/
  ├── src/
  │   ├── components/  # JobDescriptionForm, ResumeUpload, AnalysisDashboard
  │   ├── App.jsx      # Main app with state management
  │   └── App.css      # Global styles
  └── vite.config.js   # Vite config with proxy
```

## Development Workflows

### Running the Application

**Backend:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python main.py
```
Server: `http://localhost:8000`

**Frontend:**
```powershell
cd frontend
npm run dev
```
Server: `http://localhost:3000`

### Environment Setup

Backend requires `.env` file with:
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
```

### Key Dependencies

**Backend:** `fastapi`, `uvicorn`, `openai`, `PyPDF2`, `python-multipart`
**Frontend:** `react`, `react-dom`, `lucide-react`, `vite`

## Code Conventions

### Backend Patterns

1. **Async/Await**: All FastAPI route handlers and OpenAI calls use `async`/`await`
2. **Error Handling**: Use `HTTPException` with descriptive messages
3. **Type Hints**: All functions have type annotations (Python 3.9+ style)
4. **Response Models**: Pydantic models for request/response validation

**Example:**
```python
@app.post("/api/analyze-resume", response_model=AnalysisResponse)
async def analyze_resume(file: UploadFile = File(...)):
    # Validate, process, return typed response
```

### Frontend Patterns

1. **State Management**: `useState` in `App.jsx` for global state (JD, analysis results)
2. **Component Props**: Pass handlers and state down to children
3. **Styling**: CSS custom properties (variables) in `:root`, BEM-like class names
4. **Icons**: Use `lucide-react` components consistently

**Example:**
```jsx
const [analysisResult, setAnalysisResult] = useState(null);

<AnalysisDashboard analysis={analysisResult} />
```

### API Integration

- **Base URL**: `http://localhost:8000` (hardcoded in `App.jsx`)
- **CORS**: Backend allows `localhost:3000` and `localhost:5173`
- **File Upload**: Uses `FormData` for multipart PDF upload
- **Error Display**: Simple `alert()` for errors (enhance with toast notifications)

## AI Agent Details

### Agent Configuration

- **Model**: OpenAI `gpt-4o` (configurable via `OPENAI_MODEL`)
- **Temperature**: 0.3 (for consistent analysis)
- **Response Format**: JSON object with structured fields
- **System Prompt**: Expert HR recruiter persona with detailed analysis instructions

### Analysis Output Structure

```json
{
  "candidate_name": "string | null",
  "overall_match_score": 0-100,
  "fit_summary": "string",
  "strengths": ["array of strings"],
  "gaps": ["array of strings"],
  "recommendations": "string",
  "detailed_analysis": {
    "technical_skills": "string",
    "experience": "string",
    "education": "string",
    "soft_skills": "string"
  }
}
```

### Modifying Analysis Criteria

To adjust scoring or analysis focus, edit the `system_prompt` in `backend/agent.py`. The agent uses OpenAI's JSON mode (`response_format={"type": "json_object"}`).

## Data Flow

1. User sets job description → `POST /api/job-description` → stored in `job_description_store` (in-memory)
2. User uploads PDF → `POST /api/analyze-resume` → PDF parsed → text sent to agent → analysis returned
3. Frontend displays analysis in dashboard with score visualization

**Note:** Job descriptions are stored in-memory and reset on server restart. For persistence, integrate a database.

## Common Tasks

### Adding New API Endpoints

1. Define route in `backend/main.py`
2. Add Pydantic model if needed
3. Update CORS if frontend origin changes
4. Call from `App.jsx` or components

### Modifying Analysis Fields

1. Update `system_prompt` in `agent.py`
2. Adjust validation in `analyze_resume()` method
3. Update `AnalysisResponse` Pydantic model
4. Modify `AnalysisDashboard.jsx` to display new fields

### Styling Changes

- Colors: Edit CSS variables in `:root` (App.css)
- Layout: Grid systems in `.content-grid`, `.analysis-grid`
- Responsive: Media queries at 768px and 968px breakpoints

## Testing Notes

- **Manual Testing**: Use sample PDFs with varied content
- **Edge Cases**: Empty PDFs, non-PDF files, missing job descriptions
- **API Testing**: Use FastAPI's `/docs` endpoint for Swagger UI

## Production Considerations

- Replace in-memory storage with database (PostgreSQL, MongoDB)
- Add authentication/authorization
- Implement rate limiting for API calls
- Use environment-based API URLs (not hardcoded)
- Add comprehensive error logging
- Consider caching for repeated analyses
- Implement file size limits and virus scanning
