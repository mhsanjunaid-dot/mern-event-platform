import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Event Hub
        </Link>
        <div className="navbar-menu">
          {user ? (
            <>
              <span className="navbar-user">Welcome, {user.name}!</span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-tertiary btn-sm">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
              {user && (
             <Link to="/create-event" className="btn btn-primary btn-sm">
              Create Event
             </Link>
            )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;