import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const QuizTake = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`/api/quiz/${id}`);
        setQuiz(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching quiz');
        setLoading(false);
        console.error(err);
      }
    };

    fetchQuiz();
  }, [id]);

  const handleOptionSelect = (questionId, optionId, value) => {
    // Check if this question has already been answered
    const existingAnswerIndex = answers.findIndex(
      (answer) => answer.questionId === questionId
    );

    if (existingAnswerIndex !== -1) {
      // Update existing answer
      const updatedAnswers = [...answers];
      updatedAnswers[existingAnswerIndex] = {
        questionId,
        optionId,
        value,
      };
      setAnswers(updatedAnswers);
    } else {
      // Add new answer
      setAnswers([
        ...answers,
        {
          questionId,
          optionId,
          value,
        },
      ]);
    }
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (answers.length !== quiz.questions.length) {
      setError('Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(`/api/quiz/${id}/submit`, { answers });
      navigate(`/quiz/${id}/results`, { state: { results: res.data.data } });
    } catch (err) {
      setError('Error submitting quiz');
      setSubmitting(false);
      console.error(err);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
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

  if (!quiz) {
    return (
      <div className="container">
        <div className="alert alert-danger">Quiz not found</div>
        <button className="btn btn-primary" onClick={() => navigate('/quiz')}>
          Back to Quizzes
        </button>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const isAnswered = answers.some((a) => a.questionId === question._id);
  const selectedOption = answers.find((a) => a.questionId === question._id)?.optionId;

  return (
    <div className="container quiz-container">
      <h1 className="text-primary">{quiz.title}</h1>
      <div className="quiz-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentQuestion / quiz.questions.length) * 100}%` }}
          ></div>
        </div>
        <p>
          Question {currentQuestion + 1} of {quiz.questions.length}
        </p>
      </div>

      <div className="quiz-question">
        <h3>{question.text}</h3>
        <div className="quiz-options">
          {question.options.map((option) => (
            <div 
              key={option._id} 
              className={`quiz-option ${selectedOption === option._id ? 'selected' : ''}`}
              onClick={() => handleOptionSelect(question._id, option._id, option.value)}
            >
              {option.text}
            </div>
          ))}
        </div>
      </div>

      <div className="quiz-navigation">
        <button 
          className="btn btn-secondary" 
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </button>
        
        {currentQuestion < quiz.questions.length - 1 ? (
          <button 
            className="btn btn-primary" 
            onClick={handleNext}
            disabled={!isAnswered}
          >
            Next
          </button>
        ) : (
          <button 
            className="btn btn-success" 
            onClick={handleSubmit}
            disabled={answers.length !== quiz.questions.length || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>

      {!isAuthenticated && (
        <div className="alert alert-info mt-2">
          <i className="fas fa-info-circle"></i> Sign in to save your quiz results and track your career journey!
        </div>
      )}
    </div>
  );
};

export default QuizTake;