import React from 'react';
import { User, Star, Briefcase, GraduationCap, MessageCircle, Award, Home } from 'lucide-react';

function CandidatesList({ candidates, onSelectCandidate, selectedCandidateId, onMainPage }) {
  if (!candidates || candidates.length === 0) {
    return (
      <div className="candidates-list">
        <div className="candidates-header">
          <h2><User size={20} /> Candidates</h2>
          <span className="candidate-count">0 total</span>
        </div>
        <div className="candidates-empty">
          <p>No candidates yet. Upload a resume to get started!</p>
        </div>
      </div>
    );
  }

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? 'star-filled' : 'star-empty'}
        fill={i < rating ? 'currentColor' : 'none'}
      />
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="candidates-list">
      <div className="candidates-header">
        <h2><User size={20} /> Candidates</h2>
        <span className="candidate-count">{candidates.length} total</span>
      </div>

      <div className="candidates-table-container">
        {/* Main Page Navigation */}
        <div 
          className={`nav-item main-page-nav ${!selectedCandidateId ? 'selected' : ''}`}
          onClick={onMainPage}
        >
          <Home size={18} />
          <span>Main Page</span>
        </div>

        <div className="nav-divider"></div>

        <table className="candidates-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th><Briefcase size={14} /> Tech Skills</th>
              <th><Award size={14} /> Experience</th>
              <th><GraduationCap size={14} /> Education</th>
              <th><MessageCircle size={14} /> Comm.</th>
              <th>Overall</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr
                key={candidate.id}
                className={`candidate-row ${selectedCandidateId === candidate.id ? 'selected' : ''}`}
                onClick={() => onSelectCandidate(candidate.id)}
              >
                <td className="candidate-name">
                  {candidate.name || `Candidate ${candidate.id}`}
                </td>
                <td className="candidate-date">
                  {formatDate(candidate.upload_date)}
                </td>
                <td className="rating-cell">
                  <div className="rating-stars">
                    {getRatingStars(candidate.technical_skills)}
                  </div>
                </td>
                <td className="rating-cell">
                  <div className="rating-stars">
                    {getRatingStars(candidate.experience_level)}
                  </div>
                </td>
                <td className="rating-cell">
                  <div className="rating-stars">
                    {getRatingStars(candidate.education_fit)}
                  </div>
                </td>
                <td className="rating-cell">
                  <div className="rating-stars">
                    {getRatingStars(candidate.communication)}
                  </div>
                </td>
                <td className="rating-cell overall">
                  <div className="rating-stars">
                    {getRatingStars(candidate.overall_fit)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CandidatesList;
