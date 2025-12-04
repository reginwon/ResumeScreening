from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
from typing import Optional
import uvicorn
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from agent import ResumeScreeningAgent
from pdf_parser import extract_text_from_pdf

app = FastAPI(title="Resume Screening API")

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8000"],  # React dev servers + production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (replace with database in production)
job_description_store = {"jd": ""}

# Initialize the agent
agent = ResumeScreeningAgent()


class JobDescriptionUpdate(BaseModel):
    job_description: str


class AnalysisResponse(BaseModel):
    candidate_name: Optional[str]
    overall_match_score: float
    fit_summary: str
    strengths: list[str]
    gaps: list[str]
    recommendations: str
    detailed_analysis: dict


@app.post("/api/job-description")
async def update_job_description(jd: JobDescriptionUpdate):
    """Update the job description for resume screening"""
    if not jd.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty")
    
    job_description_store["jd"] = jd.job_description
    return {
        "message": "Job description updated successfully",
        "job_description": jd.job_description
    }


@app.get("/api/job-description")
async def get_job_description():
    """Retrieve the current job description"""
    return {"job_description": job_description_store.get("jd", "")}


@app.post("/api/analyze-resume", response_model=AnalysisResponse)
async def analyze_resume(file: UploadFile = File(...)):
    """
    Upload and analyze a resume against the job description
    Returns detailed analysis including match score and recommendations
    """
    # Validate job description exists
    if not job_description_store.get("jd"):
        raise HTTPException(
            status_code=400,
            detail="Please set a job description first"
        )
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )
    
    try:
        # Read PDF content
        pdf_content = await file.read()
        
        # Extract text from PDF
        resume_text = extract_text_from_pdf(pdf_content)
        
        if not resume_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from PDF. Please ensure the PDF contains readable text."
            )
        
        # Analyze resume using the agent
        analysis = await agent.analyze_resume(
            resume_text=resume_text,
            job_description=job_description_store["jd"]
        )
        
        return analysis
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing resume: {str(e)}"
        )


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "agent_ready": agent.is_ready(),
        "job_description_set": bool(job_description_store.get("jd"))
    }


# Serve React frontend (production build)
# Try multiple possible locations for the frontend
frontend_locations = [
    Path(__file__).parent.parent / "frontend" / "dist",  # Local development
    Path(__file__).parent / "static",  # Azure deployment
]

frontend_path = None
for location in frontend_locations:
    if location.exists():
        frontend_path = location
        break

if frontend_path:
    # Mount static files (JS, CSS, images)
    if (frontend_path / "assets").exists():
        app.mount("/assets", StaticFiles(directory=frontend_path / "assets"), name="assets")
    
    # Serve index.html for root and all non-API routes (SPA routing)
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not found")
        
        # Serve index.html for all other routes (including root)
        index_file = frontend_path / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend not built")
else:
    # If frontend not built, provide API info at root
    @app.get("/")
    async def root():
        return {
            "message": "Resume Screening API",
            "status": "running",
            "note": "Frontend not built. Run: cd frontend && npm run build"
        }


if __name__ == "__main__":
    # Check if frontend is built
    if not frontend_path:
        print("\n⚠️  WARNING: Frontend not built!")
        print("Please run: cd frontend && npm install && npm run build\n")
    else:
        print(f"✅ Serving frontend from: {frontend_path}")
    
    # Display which AI service is being used
    if os.getenv("AZURE_OPENAI_ENDPOINT"):
        print(f"🔵 Using Azure OpenAI: {os.getenv('AZURE_OPENAI_ENDPOINT')}")
        print(f"📦 Deployment: {os.getenv('AZURE_OPENAI_DEPLOYMENT_NAME')}")
    elif os.getenv("OPENAI_API_KEY"):
        print(f"🟢 Using OpenAI API")
        print(f"📦 Model: {os.getenv('OPENAI_MODEL', 'gpt-4o')}")
    else:
        print("⚠️  WARNING: No API credentials configured!")
    
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
