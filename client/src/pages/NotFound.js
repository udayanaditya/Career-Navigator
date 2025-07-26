import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container not-found">
      <h1 className="text-primary">404</h1>
      <h2>Page Not Found</h2>
      <p className="lead">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="not-found-actions">
        <Link to="/" className="btn btn-primary">
          Go to Home
        </Link>
        <Link to="/careers" className="btn btn-secondary">
          Explore Careers
        </Link>
        <Link to="/quiz" className="btn btn-light">
          Take a Quiz
        </Link>
      </div>
    </div>
  );
};

export default NotFound;