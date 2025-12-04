import React, { useState, useEffect } from 'react';
import { Upload, FileText, Briefcase, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import JobDescriptionForm from './components/JobDescriptionForm';
import ResumeUpload from './components/ResumeUpload';
import AnalysisDashboard from './components/AnalysisDashboard';
import CandidatesList from './components/CandidatesList';
import ChatWindow from './components/ChatWindow';
import './App.css';

function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [uploadedResumeFile, setUploadedResumeFile] = useState(null);
  const [resumePreviewUrl, setResumePreviewUrl] = useState(null);
  const [isCandidatesVisible, setIsCandidatesVisible] = useState(false);
  const [toast, setToast] = useState(null);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load job description and candidates on mount
  useEffect(() => {
    loadJobDescription();
    loadCandidates();
  }, []);

  const loadJobDescription = async () => {
    try {
      const response = await fetch('/api/job-description');
      if (response.ok) {
        const data = await response.json();
        if (data && data.job_description) {
          setJobDescription(data.job_description);
        }
      }
    } catch (error) {
      console.error('Error loading job description:', error);
      // Don't show alert on initial load, just log
    }
  };

  const loadCandidates = async () => {
    try {
      const response = await fetch('/api/candidates');
      if (response.ok) {
        const data = await response.json();
        setCandidates(data || []);
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
      // Don't show alert on initial load, just log
      setCandidates([]);
    }
  };

  const loadCandidateDetail = async (candidateId) => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data.analysis);
        setSelectedCandidateId(candidateId);
      }
    } catch (error) {
      alert('Error loading candidate details: ' + error.message);
    }
  };

  const handleJobDescriptionUpdate = async (jd) => {
    try {
      const response = await fetch('/api/job-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ job_description: jd }),
      });

      if (!response.ok) throw new Error('Failed to update job description');
      
      setJobDescription(jd);
      showToast('Job description updated successfully!');
    } catch (error) {
      showToast('Error updating job description: ' + error.message, 'error');
    }
  };

  const handleResumeUpload = async (file) => {
    if (!jobDescription) {
      alert('Please set a job description first!');
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);
    
    // Store file and create preview URL
    setUploadedResumeFile(file);
    const fileUrl = URL.createObjectURL(file);
    setResumePreviewUrl(fileUrl);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to analyze resume');
      }

      const result = await response.json();
      setAnalysisResult(result);
      
      // Reload candidates list to show the new candidate
      loadCandidates();
    } catch (error) {
      alert('Error analyzing resume: ' + error.message);
      // Clear preview on error
      setResumePreviewUrl(null);
      setUploadedResumeFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      <header className="app-header">
        <div className="header-content">
          <Briefcase size={32} />
          <h1>AI Resume Screening</h1>
          <p>Intelligent candidate evaluation powered by AI</p>
        </div>
      </header>

      <main className="app-main">
        <div className={`main-content-wrapper ${isCandidatesVisible ? 'candidates-visible' : ''} ${isChatVisible ? 'chat-visible' : ''}`}>
          {/* Left Sidebar: Candidates List */}
          <div className={`candidates-sidebar ${isCandidatesVisible ? 'visible' : 'hidden'}`}>
            <button 
              className="candidates-toggle-btn"
              onClick={() => setIsCandidatesVisible(!isCandidatesVisible)}
              title={isCandidatesVisible ? 'Hide Candidates' : 'Show Candidates'}
            >
              {isCandidatesVisible ? '←' : '→'}
            </button>
            <div className="candidates-sidebar-content">
              <CandidatesList 
                candidates={candidates}
                onSelectCandidate={loadCandidateDetail}
                selectedCandidateId={selectedCandidateId}
              />
            </div>
          </div>

          {/* Center Content */}
          <div className="main-content">
            {selectedCandidateId && analysisResult ? (
              <div className="candidate-detail-view">
                <button 
                  className="back-btn"
                  onClick={() => {
                    setSelectedCandidateId(null);
                    setAnalysisResult(null);
                  }}
                >
                  ← Back to Upload
                </button>
                <AnalysisDashboard analysis={analysisResult} />
              </div>
            ) : (
              <>
                {/* Job Description and Resume Preview - Side by Side */}
                <div className="jd-resume-grid">
                  {/* Job Description - Left */}
                  <div className="panel jd-panel">
                    <div className="panel-header">
                      <FileText size={24} />
                      <h2>Job Description</h2>
                    </div>
                    <JobDescriptionForm 
                      onSubmit={handleJobDescriptionUpdate}
                      currentJD={jobDescription}
                    />
                  </div>

                  {/* Resume PDF Preview - Right */}
                  <div className="panel resume-preview-panel">
                    <div className="panel-header">
                      <FileText size={24} />
                      <h2>Uploaded Resume</h2>
                      {resumePreviewUrl && (
                        <button 
                          className="close-preview-btn"
                          onClick={() => {
                            setResumePreviewUrl(null);
                            setUploadedResumeFile(null);
                          }}
                          title="Close preview"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <div className="resume-preview-container">
                      {resumePreviewUrl ? (
                        <iframe
                          src={resumePreviewUrl}
                          className="resume-pdf-viewer"
                          title="Resume Preview"
                        />
                      ) : (
                        <div className="resume-placeholder">
                          <Upload size={48} />
                          <p>No resume uploaded yet</p>
                          <p className="placeholder-hint">Upload a resume to see preview here</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Resume Upload */}
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

                {/* Analysis Result */}
                {isLoading && (
                  <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Analyzing resume...</p>
                  </div>
                )}

                {analysisResult && !isLoading && !selectedCandidateId && (
                  <div className="panel resume-content-panel">
                    <div className="panel-header">
                      <FileText size={24} />
                      <h2>Resume Analysis</h2>
                    </div>
                    <AnalysisDashboard analysis={analysisResult} />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Sidebar: Chat Window */}
          <div className={`chat-sidebar ${isChatVisible ? 'visible' : 'hidden'}`}>
            <button 
              className="chat-toggle-btn"
              onClick={() => setIsChatVisible(!isChatVisible)}
              title={isChatVisible ? 'Hide Chat' : 'Show Chat'}
            >
              {isChatVisible ? '→' : '←'}
            </button>
            <div className="chat-panel">
              <ChatWindow candidates={candidates} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
