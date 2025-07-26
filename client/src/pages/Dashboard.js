import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user, loading, removeCareer } = useContext(AuthContext);
  const [quizHistory, setQuizHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchQuizHistory = async () => {
      try {
        const res = await axios.get('/api/quiz/history');
        setQuizHistory(res.data.data);
        setLoadingHistory(false);
      } catch (err) {
        console.error(err);
        setLoadingHistory(false);
      }
    };

    fetchQuizHistory();
  }, []);

  const handleRemoveCareer = async (careerId) => {
    await removeCareer(careerId);
  };

  if (loading || !user) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="text-primary">Dashboard</h1>
        <p className="lead">Welcome {user.name}</p>
      </div>

      <div className="dashboard-section">
        <h2>Saved Careers</h2>
        {user.savedCareers && user.savedCareers.length > 0 ? (
          <div className="dashboard-grid">
            {user.savedCareers.map((career) => (
              <div className="career-card" key={career._id}>
                <div className="career-card-header">
                  <h3>{career.title}</h3>
                </div>
                <div className="career-card-body">
                  <p>{career.description.substring(0, 150)}...</p>
                  <div className="career-categories">
                    {career.categories.map((category, index) => (
                      <span className="badge" key={index}>
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="career-card-footer">
                  <Link to={`/careers/${career._id}`} className="btn btn-primary btn-sm">
                    View Details
                  </Link>
                  <button
                    onClick={() => handleRemoveCareer(career._id)}
                    className="btn btn-danger btn-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>You haven't saved any careers yet.</p>
        )}
      </div>

      <div className="dashboard-section">
        <h2>Quiz History</h2>
        {loadingHistory ? (
          <p>Loading quiz history...</p>
        ) : quizHistory.length > 0 ? (
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Top Recommendation</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {quizHistory.map((result) => (
                  <tr key={result._id}>
                    <td>{result.quizId ? result.quizId.title : 'Unknown Quiz'}</td>
                    <td>{new Date(result.date).toLocaleDateString()}</td>
                    <td>{result.score}</td>
                    <td>
                      {result.recommendations.length > 0 && result.recommendations[0].careerId
                        ? result.recommendations[0].careerId.title
                        : 'No recommendation'}
                    </td>
                    <td>
                      <Link
                        to={`/quiz/${result.quizId ? result.quizId._id : 'unknown'}/results`}
                        className="btn btn-primary btn-sm"
                      >
                        View Results
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>You haven't taken any quizzes yet.</p>
        )}
        <div className="my-2">
          <Link to="/quiz" className="btn btn-primary">
            Take a New Quiz
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;