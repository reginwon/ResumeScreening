import React, { useState, useRef } from 'react';
import { Upload, FileCheck } from 'lucide-react';

function ResumeUpload({ onUpload, isLoading, disabled }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }
    setSelectedFile(file);
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedFile && !isLoading) {
      onUpload(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="upload-container">
      <div
        className={`upload-dropzone ${dragActive ? 'drag-active' : ''} ${disabled ? 'disabled' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleChange}
          style={{ display: 'none' }}
          disabled={disabled}
        />
        
        {selectedFile ? (
          <>
            <FileCheck size={48} className="upload-icon success" />
            <p className="upload-text">{selectedFile.name}</p>
            <p className="upload-subtext">{(selectedFile.size / 1024).toFixed(1)} KB</p>
          </>
        ) : (
          <>
            <Upload size={48} className="upload-icon" />
            <p className="upload-text">
              {disabled 
                ? 'Set job description first' 
                : 'Drop resume PDF here or click to browse'}
            </p>
            <p className="upload-subtext">PDF files only, max 10MB</p>
          </>
        )}
      </div>

      {selectedFile && (
        <button
          onClick={handleSubmit}
          disabled={isLoading || disabled}
          className="btn-primary"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      )}
    </div>
  );
}

export default ResumeUpload;
