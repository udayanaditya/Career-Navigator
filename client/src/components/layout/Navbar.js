import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);

  const authLinks = (
    <ul>
      <li>
        <Link to="/careers">Explore Careers</Link>
      </li>
      <li>
        <Link to="/quiz">Take Quiz</Link>
      </li>
      <li>
        <Link to="/dashboard">Dashboard</Link>
      </li>
      <li>
        <a onClick={logout} href="#!">
          <i className="fas fa-sign-out-alt"></i>{' '}
          <span className="hide-sm">Logout</span>
        </a>
      </li>
    </ul>
  );

  const guestLinks = (
    <ul>
      <li>
        <Link to="/careers">Explore Careers</Link>
      </li>
      <li>
        <Link to="/quiz">Take Quiz</Link>
      </li>
      <li>
        <Link to="/register">Register</Link>
      </li>
      <li>
        <Link to="/login">Login</Link>
      </li>
    </ul>
  );

  return (
    <nav className="navbar">
      <h1>
        <Link to="/">
          <i className="fas fa-compass"></i> Career Navigator
        </Link>
      </h1>
      {isAuthenticated ? authLinks : guestLinks}
    </nav>
  );
};

export default Navbar;