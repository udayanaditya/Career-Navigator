import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get('/api/quiz');
        setQuizzes(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching quizzes');
        setLoading(false);
        console.error(err);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <h1 className="text-primary">Career Quizzes</h1>
      <p className="lead">
        Take a quiz to discover career paths that match your interests and academic preferences
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      {quizzes.length === 0 ? (
        <div className="alert alert-info">No quizzes available at the moment</div>
      ) : (
        <div className="grid-2">
          {quizzes.map((quiz) => (
            <div className="card" key={quiz._id}>
              <h3>{quiz.title}</h3>
              <p>{quiz.description}</p>
              <div className="badge">
                {quiz.type === 'interests' && 'Interests Quiz'}
                {quiz.type === 'subjects' && 'Academic Subjects Quiz'}
                {quiz.type === 'comprehensive' && 'Comprehensive Assessment'}
              </div>
              <div className="my-1">
                <Link to={`/quiz/${quiz._id}`} className="btn btn-primary">
                  Start Quiz
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="quiz-info my-2">
        <h2>About Our Quizzes</h2>
        <div className="grid-3">
          <div className="card">
            <h3>Interests Quiz</h3>
            <p>
              Discover careers that align with your personal interests, hobbies, and passions.
              This quiz focuses on what you enjoy doing.
            </p>
          </div>
          <div className="card">
            <h3>Academic Subjects Quiz</h3>
            <p>
              Find careers that match your academic strengths and preferred subjects.
              This quiz helps connect your educational background to potential careers.
            </p>
          </div>
          <div className="card">
            <h3>Comprehensive Assessment</h3>
            <p>
              Our most detailed assessment that combines interests, academic preferences,
              work style, and values to provide highly personalized career recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizList;