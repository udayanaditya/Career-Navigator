import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <section className="landing">
      <div className="landing-inner">
        <h1>Career Navigator</h1>
        <p>
          Discover the perfect career path based on your interests and academic
          preferences. Take our personalized quiz to get started on your journey.
        </p>
        <div className="buttons">
          <Link to="/quiz" className="btn btn-primary">
            Take Career Quiz
          </Link>
          <Link to="/careers" className="btn btn-light">
            Explore Careers
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Home;