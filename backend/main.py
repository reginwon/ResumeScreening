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
from database import Database, JobDescriptionStorage

app = FastAPI(title="Resume Screening API")

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8000"],  # React dev servers + production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database and storage
db = Database()
jd_storage = JobDescriptionStorage()

# Load job description from file on startup
job_description_store = {"jd": jd_storage.load()}

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
    candidate_id: Optional[int] = None


@app.post("/api/job-description")
async def update_job_description(jd: JobDescriptionUpdate):
    """Update the job description for resume screening"""
    if not jd.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty")
    
    # Save to both memory and file
    job_description_store["jd"] = jd.job_description
    jd_storage.save(jd.job_description)
    
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
        
        # Store candidate in database
        candidate_id = db.add_candidate(resume_text, analysis)
        analysis["candidate_id"] = candidate_id
        
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


@app.get("/api/candidates")
async def get_candidates():
    """Get all candidates with their metrics"""
    candidates = db.get_all_candidates()
    return candidates


@app.get("/api/candidates/{candidate_id}")
async def get_candidate_detail(candidate_id: int):
    """Get full details for a specific candidate"""
    candidate = db.get_candidate_by_id(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


@app.delete("/api/candidates/{candidate_id}")
async def delete_candidate(candidate_id: int):
    """Delete a candidate"""
    deleted = db.delete_candidate(candidate_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return {"message": "Candidate deleted successfully"}


class ChatMessage(BaseModel):
    message: str
    candidate_id: Optional[int] = None


@app.post("/api/chat")
async def chat_about_candidates(chat: ChatMessage):
    """
    Chat about candidates with AI
    Provides context from all stored resumes
    """
    if not chat.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    # Get all resumes for context
    resumes = db.get_all_resumes_text()
    
    if not resumes:
        raise HTTPException(status_code=400, detail="No candidates in database")
    
    # Build context from all resumes
    context = "You are an HR assistant helping to answer questions about job candidates.\n\n"
    context += f"Job Description:\n{job_description_store.get('jd', 'Not set')}\n\n"
    context += "Candidates:\n"
    
    for resume in resumes:
        context += f"\n--- {resume['name']} (ID: {resume['id']}) ---\n"
        context += resume['resume_text'][:1000] + "...\n"  # Truncate to manage token limits
    
    try:
        response = await agent.client.chat.completions.create(
            model=agent.model,
            messages=[
                {"role": "system", "content": context},
                {"role": "user", "content": chat.message}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        answer = response.choices[0].message.content
        return {"answer": answer}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


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
