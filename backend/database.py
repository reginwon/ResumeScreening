"""
Database models and operations for resume screening
Uses SQLite for local persistence
"""
import sqlite3
import json
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict


class Database:
    """SQLite database manager for candidates and job descriptions"""
    
    def __init__(self, db_path: str = "data/resume_screening.db"):
        """Initialize database connection and create tables"""
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.init_db()
    
    def get_connection(self):
        """Get database connection"""
        return sqlite3.connect(str(self.db_path), check_same_thread=False)
    
    def init_db(self):
        """Create database tables if they don't exist"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Candidates table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS candidates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                upload_date TEXT NOT NULL,
                resume_text TEXT NOT NULL,
                analysis_json TEXT NOT NULL,
                technical_skills INTEGER,
                experience_level INTEGER,
                education_fit INTEGER,
                communication INTEGER,
                overall_fit INTEGER
            )
        """)
        
        conn.commit()
        conn.close()
    
    def add_candidate(self, resume_text: str, analysis: dict) -> int:
        """
        Add a new candidate to the database
        
        Args:
            resume_text: Raw text from resume
            analysis: Analysis result from AI agent
            
        Returns:
            ID of the inserted candidate
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Extract metrics scores (1-5 scale based on analysis)
        overall_score = analysis.get("overall_match_score", 0)
        
        # Convert 0-100 score to 1-5 scale for metrics
        def score_to_rating(score: float) -> int:
            if score >= 90: return 5
            if score >= 75: return 4
            if score >= 60: return 3
            if score >= 40: return 2
            return 1
        
        cursor.execute("""
            INSERT INTO candidates 
            (name, upload_date, resume_text, analysis_json, 
             technical_skills, experience_level, education_fit, communication, overall_fit)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            analysis.get("candidate_name"),
            datetime.now().isoformat(),
            resume_text,
            json.dumps(analysis),
            score_to_rating(overall_score),  # Technical skills rating
            score_to_rating(overall_score),  # Experience level
            score_to_rating(overall_score),  # Education fit
            score_to_rating(overall_score),  # Communication
            score_to_rating(overall_score)   # Overall fit
        ))
        
        candidate_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return candidate_id
    
    def get_all_candidates(self) -> List[Dict]:
        """Get all candidates with their metrics"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, name, upload_date, technical_skills, experience_level,
                   education_fit, communication, overall_fit
            FROM candidates
            ORDER BY upload_date DESC
        """)
        
        columns = [desc[0] for desc in cursor.description]
        candidates = []
        
        for row in cursor.fetchall():
            candidate = dict(zip(columns, row))
            candidates.append(candidate)
        
        conn.close()
        return candidates
    
    def get_candidate_by_id(self, candidate_id: int) -> Optional[Dict]:
        """Get full candidate details including analysis"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, name, upload_date, resume_text, analysis_json,
                   technical_skills, experience_level, education_fit, communication, overall_fit
            FROM candidates
            WHERE id = ?
        """, (candidate_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
        
        columns = ['id', 'name', 'upload_date', 'resume_text', 'analysis_json',
                   'technical_skills', 'experience_level', 'education_fit', 'communication', 'overall_fit']
        candidate = dict(zip(columns, row))
        
        # Parse JSON analysis
        candidate['analysis'] = json.loads(candidate['analysis_json'])
        del candidate['analysis_json']
        
        return candidate
    
    def get_all_resumes_text(self) -> List[Dict[str, str]]:
        """Get all candidates' resume text for chat context"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, name, resume_text
            FROM candidates
            ORDER BY upload_date DESC
        """)
        
        resumes = []
        for row in cursor.fetchall():
            resumes.append({
                "id": row[0],
                "name": row[1] or f"Candidate {row[0]}",
                "resume_text": row[2]
            })
        
        conn.close()
        return resumes
    
    def delete_candidate(self, candidate_id: int) -> bool:
        """Delete a candidate"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM candidates WHERE id = ?", (candidate_id,))
        deleted = cursor.rowcount > 0
        
        conn.commit()
        conn.close()
        
        return deleted


# Job Description file storage
class JobDescriptionStorage:
    """Manage job description persistence in a text file"""
    
    def __init__(self, file_path: str = "data/job_description.txt"):
        self.file_path = Path(file_path)
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
    
    def save(self, job_description: str):
        """Save job description to file"""
        with open(self.file_path, 'w', encoding='utf-8') as f:
            f.write(job_description)
    
    def load(self) -> str:
        """Load job description from file"""
        if not self.file_path.exists():
            return ""
        
        with open(self.file_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    def exists(self) -> bool:
        """Check if job description file exists"""
        return self.file_path.exists() and self.file_path.stat().st_size > 0
