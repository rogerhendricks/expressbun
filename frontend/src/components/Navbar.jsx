import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const Navigation = ({ title = "User Dashboard" }) => {
  const { handleLogout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary rounded mb-4">
      <div className="container-fluid">
        <span className="navbar-brand mb-0 h1">{title}</span>
        <button 
          onClick={handleLogout} 
          className="btn btn-outline-light"
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;