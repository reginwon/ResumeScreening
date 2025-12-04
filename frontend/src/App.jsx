import React, { useState } from 'react';
import { Upload, FileText, Briefcase, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import JobDescriptionForm from './components/JobDescriptionForm';
import ResumeUpload from './components/ResumeUpload';
import AnalysisDashboard from './components/AnalysisDashboard';
import './App.css';

function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleJobDescriptionUpdate = async (jd) => {
    try {
      const response = await fetch('http://localhost:8000/api/job-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ job_description: jd }),
      });

      if (!response.ok) throw new Error('Failed to update job description');
      
      setJobDescription(jd);
      alert('Job description updated successfully!');
    } catch (error) {
      alert('Error updating job description: ' + error.message);
    }
  };

  const handleResumeUpload = async (file) => {
    if (!jobDescription) {
      alert('Please set a job description first!');
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/api/analyze-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to analyze resume');
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (error) {
      alert('Error analyzing resume: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <Briefcase size={32} />
          <h1>AI Resume Screening</h1>
          <p>Intelligent candidate evaluation powered by AI</p>
        </div>
      </header>

      <main className="app-main">
        <div className="content-grid">
          {/* Left Panel: Job Description */}
          <div className="panel">
            <div className="panel-header">
              <FileText size={24} />
              <h2>Job Description</h2>
            </div>
            <JobDescriptionForm 
              onSubmit={handleJobDescriptionUpdate}
              currentJD={jobDescription}
            />
          </div>

          {/* Right Panel: Resume Upload */}
          <div className="panel">
            <div className="panel-header">
              <Upload size={24} />
              <h2>Upload Resume</h2>
            </div>
            <ResumeUpload 
              onUpload={handleResumeUpload}
              isLoading={isLoading}
              disabled={!jobDescription}
            />
          </div>
        </div>

        {/* Analysis Dashboard */}
        {isLoading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Analyzing resume...</p>
          </div>
        )}

        {analysisResult && !isLoading && (
          <AnalysisDashboard analysis={analysisResult} />
        )}
      </main>
    </div>
  );
}

export default App;
