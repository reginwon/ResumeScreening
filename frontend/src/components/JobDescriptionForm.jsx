import React, { useState } from 'react';
import { Save } from 'lucide-react';

function JobDescriptionForm({ onSubmit, currentJD }) {
  const [jd, setJd] = useState(currentJD || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (jd.trim()) {
      onSubmit(jd);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="jd-form">
      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        placeholder="Paste the job description here...&#10;&#10;Include:&#10;- Role title and department&#10;- Required skills and qualifications&#10;- Responsibilities&#10;- Experience requirements&#10;- Education requirements"
        rows={15}
        className="jd-textarea"
      />
      <button type="submit" className="btn-primary" disabled={!jd.trim()}>
        <Save size={18} />
        Update Job Description
      </button>
    </form>
  );
}

export default JobDescriptionForm;
