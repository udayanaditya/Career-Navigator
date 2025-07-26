import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const CareerDetail = () => {
  const { id } = useParams();
  const { user, saveCareer, removeCareer } = useContext(AuthContext);
  
  const [career, setCareer] = useState(null);
  const [similarCareers, setSimilarCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchCareer = async () => {
      try {
        const res = await axios.get(`/api/careers/${id}`);
        setCareer(res.data.data);
        
        // Check if career is saved by user
        if (user && user.savedCareers) {
          setIsSaved(user.savedCareers.some(c => c._id === id));
        }
        
        // Fetch similar careers
        const similarRes = await axios.get(`/api/careers/${id}/similar`);
        setSimilarCareers(similarRes.data.data);
        
        setLoading(false);
      } catch (err) {
        setError('Error fetching career details');
        setLoading(false);
        console.error(err);
      }
    };

    fetchCareer();
  }, [id, user]);

  const handleSaveCareer = async () => {
    if (!user) return;
    
    if (isSaved) {
      const success = await removeCareer(id);
      if (success) setIsSaved(false);
    } else {
      const success = await saveCareer(id);
      if (success) setIsSaved(true);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (error || !career) {
    return (
      <div className="container">
        <div className="alert alert-danger">{error || 'Career not found'}</div>
        <Link to="/careers" className="btn btn-primary">
          Back to Careers
        </Link>
      </div>
    );
  }

  return (
    <div className="career-detail">
      <div className="career-header">
        <h1 className="text-primary">{career.title}</h1>
        <div className="career-categories">
          {career.categories.map((category, index) => (
            <span className="badge" key={index}>
              {category}
            </span>
          ))}
        </div>
        {user && (
          <button
            onClick={handleSaveCareer}
            className={`btn ${isSaved ? 'btn-danger' : 'btn-primary'} my-1`}
          >
            {isSaved ? 'Remove from Saved' : 'Save Career'}
          </button>
        )}
      </div>

      <div className="career-section">
        <h2>Description</h2>
        <p>{career.description}</p>
      </div>

      <div className="career-section">
        <h2>Key Information</h2>
        <div className="career-stats">
          <div className="stat-card">
            <h3>Entry Salary</h3>
            <div className="stat-value">${career.salary.entry.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <h3>Mid-Career Salary</h3>
            <div className="stat-value">${career.salary.mid.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <h3>Senior Salary</h3>
            <div className="stat-value">${career.salary.senior.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <h3>Job Growth</h3>
            <div className="stat-value">{career.jobOutlook.growth}%</div>
          </div>
          <div className="stat-card">
            <h3>Job Outlook</h3>
            <div className="stat-value">{career.jobOutlook.outlook}</div>
          </div>
        </div>
      </div>

      <div className="career-section">
        <h2>Work Environment</h2>
        <ul>
          {career.workEnvironment.map((env, index) => (
            <li key={index}>{env}</li>
          ))}
        </ul>
      </div>

      <div className="career-section">
        <h2>Requirements</h2>
        
        <h3>Education</h3>
        <ul>
          {career.requirements.education.map((edu, index) => (
            <li key={index}>
              <strong>{edu.level}</strong> in {edu.field}
              {edu.importance && (
                <span className="text-muted"> (Importance: {edu.importance}/10)</span>
              )}
            </li>
          ))}
        </ul>
        
        <h3>Skills</h3>
        <ul>
          {career.requirements.skills.map((skill, index) => (
            <li key={index}>
              {skill.name}
              {skill.importance && (
                <span className="text-muted"> (Importance: {skill.importance}/10)</span>
              )}
            </li>
          ))}
        </ul>
        
        <h3>Key Subjects</h3>
        <ul>
          {career.requirements.subjects.map((subject, index) => (
            <li key={index}>
              {subject.name}
              {subject.importance && (
                <span className="text-muted"> (Importance: {subject.importance}/10)</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="career-section">
        <h2>Career Roadmap</h2>
        <div className="roadmap">
          {career.roadmap.map((stage, index) => (
            <div className="roadmap-item" key={index}>
              <h3>{stage.stage}</h3>
              <p><strong>Duration:</strong> {stage.duration}</p>
              <p>{stage.description}</p>
              <h4>Key Milestones:</h4>
              <ul>
                {stage.milestones.map((milestone, idx) => (
                  <li key={idx}>{milestone}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {career.resources && career.resources.length > 0 && (
        <div className="career-section">
          <h2>Learning Resources</h2>
          <ul>
            {career.resources.map((resource, index) => (
              <li key={index}>
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  {resource.title}
                </a>
                <span className="badge">{resource.type}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {similarCareers.length > 0 && (
        <div className="career-section">
          <h2>Similar Careers</h2>
          <div className="grid-3">
            {similarCareers.map((similar) => (
              <div className="career-card" key={similar._id}>
                <div className="career-card-header">
                  <h3>{similar.title}</h3>
                </div>
                <div className="career-card-body">
                  <p>{similar.description.substring(0, 100)}...</p>
                </div>
                <div className="career-card-footer">
                  <Link to={`/careers/${similar._id}`} className="btn btn-primary btn-sm">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="my-2">
        <Link to="/careers" className="btn btn-light">
          Back to Careers
        </Link>
        <Link to="/quiz" className="btn btn-primary">
          Take Career Quiz
        </Link>
      </div>
    </div>
  );
};

export default CareerDetail;