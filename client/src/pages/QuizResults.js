import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const QuizResults = () => {
  // No need for id param as we're using location state
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, saveCareer } = useContext(AuthContext);

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);
  const [savedCareers, setSavedCareers] = useState([]);

  useEffect(() => {
    // If results were passed via location state, use them
    if (location.state && location.state.results) {
      setResults(location.state.results);
      setLoading(false);
    } else {
      // Otherwise, redirect to quiz list
      navigate('/quiz');
    }
  }, [location, navigate]);

  const handleSaveCareer = async (careerId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await saveCareer(careerId);
      setSavedCareers([...savedCareers, careerId]);
    } catch (err) {
      console.error('Error saving career:', err);
    }
  };

  if (loading) {
    return <div className="container">Loading results...</div>;
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={() => navigate('/quiz')}>
          Back to Quizzes
        </button>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="container">
        <div className="alert alert-danger">Results not available</div>
        <button className="btn btn-primary" onClick={() => navigate('/quiz')}>
          Back to Quizzes
        </button>
      </div>
    );
  }

  const { userProfile, recommendations } = results;

  // Get top interests and subjects
  const getTopItems = (items, count = 5) => {
    return Object.entries(items)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([name, value]) => ({ name, value }));
  };

  const topInterests = getTopItems(userProfile.interests);
  const topSubjects = getTopItems(userProfile.subjects);

  return (
    <div className="container results-container">
      <h1 className="text-primary">Your Career Profile</h1>
      
      <div className="results-summary">
        <div className="card">
          <h3>Your Profile Summary</h3>
          <div className="grid-2">
            <div>
              <h4>Top Interests</h4>
              <ul className="list">
                {topInterests.map((interest, index) => (
                  <li key={index}>
                    {interest.name} <span className="text-primary">{Math.round(interest.value)}/10</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Top Academic Strengths</h4>
              <ul className="list">
                {topSubjects.map((subject, index) => (
                  <li key={index}>
                    {subject.name} <span className="text-primary">{Math.round(subject.value)}/10</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <h2 className="my-2">Recommended Careers</h2>
      <p className="lead">
        Based on your responses, here are careers that align with your interests and academic strengths
      </p>

      <div className="recommendations">
        {recommendations.map((rec) => (
          <div className="recommendation-card" key={rec.career._id}>
            <div className="recommendation-header">
              <h3>{rec.career.title}</h3>
              <div className="match-percentage">
                <span className="percentage">{rec.matchPercentage}%</span>
                <span className="match-text">Match</span>
              </div>
            </div>
            
            <p>{rec.career.description.substring(0, 150)}...</p>
            
            <div className="match-details">
              <div className="match-item">
                <span className="match-label">Interest Match:</span>
                <div className="match-bar">
                  <div 
                    className="match-fill" 
                    style={{ width: `${rec.interestMatch}%` }}
                  ></div>
                </div>
                <span className="match-value">{rec.interestMatch}%</span>
              </div>
              <div className="match-item">
                <span className="match-label">Academic Match:</span>
                <div className="match-bar">
                  <div 
                    className="match-fill" 
                    style={{ width: `${rec.subjectMatch}%` }}
                  ></div>
                </div>
                <span className="match-value">{rec.subjectMatch}%</span>
              </div>
            </div>
            
            <div className="recommendation-actions">
              <Link to={`/careers/${rec.career._id}`} className="btn btn-primary">
                View Details
              </Link>
              {isAuthenticated && (
                <button 
                  className={`btn ${savedCareers.includes(rec.career._id) ? 'btn-success' : 'btn-light'}`}
                  onClick={() => handleSaveCareer(rec.career._id)}
                  disabled={savedCareers.includes(rec.career._id)}
                >
                  {savedCareers.includes(rec.career._id) ? 'Saved' : 'Save Career'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="results-actions my-2">
        <Link to="/quiz" className="btn btn-primary">
          Take Another Quiz
        </Link>
        <Link to="/careers" className="btn btn-secondary">
          Explore All Careers
        </Link>
        {isAuthenticated && (
          <Link to="/dashboard" className="btn btn-light">
            View Dashboard
          </Link>
        )}
      </div>

      {!isAuthenticated && (
        <div className="alert alert-info mt-2">
          <i className="fas fa-info-circle"></i> <Link to="/register">Create an account</Link> or <Link to="/login">log in</Link> to save your results and track your career journey!
        </div>
      )}
    </div>
  );
};

export default QuizResults;