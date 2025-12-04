import React from 'react';
import { User, TrendingUp, CheckCircle, XCircle, Lightbulb, Award } from 'lucide-react';

function AnalysisDashboard({ analysis }) {
  if (!analysis) {
    return null;
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Moderate Match';
    return 'Weak Match';
  };

  return (
    <div className="analysis-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <Award size={28} />
          <h2>Candidate Analysis</h2>
        </div>
      </div>

      {/* Score Card */}
      <div className="score-card">
        <div className="score-circle-container">
          <svg className="score-circle" width="200" height="200">
            <circle
              className="score-circle-bg"
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            <circle
              className="score-circle-fill"
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke={getScoreColor(analysis.overall_match_score)}
              strokeWidth="12"
              strokeDasharray={`${2 * Math.PI * 80}`}
              strokeDashoffset={`${2 * Math.PI * 80 * (1 - analysis.overall_match_score / 100)}`}
              transform="rotate(-90 100 100)"
              strokeLinecap="round"
            />
            <text
              x="100"
              y="90"
              textAnchor="middle"
              className="score-number"
              fill={getScoreColor(analysis.overall_match_score)}
            >
              {Math.round(analysis.overall_match_score)}
            </text>
            <text
              x="100"
              y="115"
              textAnchor="middle"
              className="score-label"
              fill="#6b7280"
            >
              {getScoreLabel(analysis.overall_match_score)}
            </text>
          </svg>
        </div>

        {analysis.candidate_name && (
          <div className="candidate-info">
            <User size={20} />
            <span>{analysis.candidate_name}</span>
          </div>
        )}

        <div className="fit-summary">
          <p>{analysis.fit_summary}</p>
        </div>
      </div>

      {/* Strengths and Gaps */}
      <div className="analysis-grid">
        <div className="analysis-section strengths">
          <div className="section-header">
            <CheckCircle size={24} />
            <h3>Strengths</h3>
          </div>
          <ul>
            {Array.isArray(analysis.strengths) && analysis.strengths.map((strength, idx) => (
              <li key={idx}>{strength}</li>
            ))}
            {(!analysis.strengths || analysis.strengths.length === 0) && (
              <li>No strengths identified</li>
            )}
          </ul>
        </div>

        <div className="analysis-section gaps">
          <div className="section-header">
            <XCircle size={24} />
            <h3>Gaps & Areas for Consideration</h3>
          </div>
          <ul>
            {Array.isArray(analysis.gaps) && analysis.gaps.map((gap, idx) => (
              <li key={idx}>{gap}</li>
            ))}
            {(!analysis.gaps || analysis.gaps.length === 0) && (
              <li>No gaps identified</li>
            )}
          </ul>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="detailed-analysis">
        <h3>Detailed Assessment</h3>
        <div className="details-grid">
          {analysis.detailed_analysis && typeof analysis.detailed_analysis === 'object' && 
            Object.entries(analysis.detailed_analysis).map(([key, value]) => (
              <div key={key} className="detail-item">
                <h4>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                <p>{value}</p>
              </div>
            ))
          }
        </div>
      </div>

      {/* Recommendations */}
      <div className="recommendations">
        <div className="section-header">
          <Lightbulb size={24} />
          <h3>Hiring Recommendations</h3>
        </div>
        <p>{analysis.recommendations}</p>
      </div>
    </div>
  );
}

export default AnalysisDashboard;
