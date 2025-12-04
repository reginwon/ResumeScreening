"""
Resume Screening Agent using Microsoft Agent Framework
Analyzes resumes against job descriptions using OpenAI/Azure OpenAI models
"""
import os
import json
from typing import Optional
from openai import AsyncOpenAI, AsyncAzureOpenAI


class ResumeScreeningAgent:
    """
    AI Agent for screening resumes against job descriptions
    Supports both OpenAI and Azure OpenAI
    """
    
    def __init__(self):
        """Initialize the agent with OpenAI or Azure OpenAI client"""
        # Check if using Azure OpenAI
        azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        
        if azure_endpoint:
            # Azure OpenAI configuration
            api_key = os.getenv("AZURE_OPENAI_API_KEY")
            if not api_key:
                raise ValueError("AZURE_OPENAI_API_KEY environment variable is required for Azure OpenAI")
            
            api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
            
            self.client = AsyncAzureOpenAI(
                api_key=api_key,
                api_version=api_version,
                azure_endpoint=azure_endpoint
            )
            # For Azure, model is the deployment name
            self.model = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o")
            self.using_azure = True
        else:
            # Standard OpenAI configuration
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("OPENAI_API_KEY environment variable is required")
            
            self.client = AsyncOpenAI(api_key=api_key)
            self.model = os.getenv("OPENAI_MODEL", "gpt-4o")
            self.using_azure = False
        
        self.system_prompt = """You are an expert HR recruiter and resume screening specialist.
Your task is to analyze resumes against job descriptions and provide detailed, actionable insights.

Analyze the candidate's qualifications, experience, skills, and overall fit for the position.
Be objective, thorough, and constructive in your assessment.

Provide your analysis in the following JSON format:
{
    "candidate_name": "Extract candidate name if available, otherwise null",
    "overall_match_score": 0-100 numeric score,
    "fit_summary": "2-3 sentence summary of overall fit",
    "strengths": ["List of 3-5 key strengths aligned with the job"],
    "gaps": ["List of 2-4 areas where candidate may fall short"],
    "recommendations": "Specific recommendations for hiring decision",
    "detailed_analysis": {
        "technical_skills": "Assessment of technical qualifications",
        "experience": "Evaluation of relevant work experience",
        "education": "Educational background assessment",
        "soft_skills": "Communication, leadership, teamwork indicators"
    }
}"""
    
    def is_ready(self) -> bool:
        """Check if agent is properly configured"""
        if self.using_azure:
            return bool(os.getenv("AZURE_OPENAI_API_KEY") and os.getenv("AZURE_OPENAI_ENDPOINT"))
        return bool(os.getenv("OPENAI_API_KEY"))
    
    async def analyze_resume(self, resume_text: str, job_description: str) -> dict:
        """
        Analyze a resume against a job description
        
        Args:
            resume_text: Extracted text content from resume PDF
            job_description: The job posting/description to match against
            
        Returns:
            Structured analysis with scores and recommendations
        """
        user_message = f"""
JOB DESCRIPTION:
{job_description}

---

CANDIDATE RESUME:
{resume_text}

---

Please analyze this resume against the job description and provide your assessment in the specified JSON format.
"""
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": user_message}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,  # Lower temperature for more consistent analysis
            )
            
            # Parse the JSON response
            analysis_json = response.choices[0].message.content
            analysis = json.loads(analysis_json)
            
            # Validate and ensure all required fields exist
            required_fields = [
                "overall_match_score", "fit_summary", "strengths", 
                "gaps", "recommendations", "detailed_analysis"
            ]
            
            for field in required_fields:
                if field not in analysis:
                    raise ValueError(f"Missing required field: {field}")
            
            # Ensure match score is within range
            analysis["overall_match_score"] = max(0, min(100, 
                float(analysis["overall_match_score"])))
            
            return analysis
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse agent response as JSON: {e}")
        except Exception as e:
            raise RuntimeError(f"Error during resume analysis: {e}")
