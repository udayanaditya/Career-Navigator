import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h3>Career Navigator</h3>
        <p>Find your perfect career path based on your interests and academic preferences</p>
        
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/careers">Explore Careers</Link>
          <Link to="/quiz">Take Quiz</Link>
          <Link to="/about">About</Link>
        </div>
        
        <p>&copy; {new Date().getFullYear()} Career Navigator. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;