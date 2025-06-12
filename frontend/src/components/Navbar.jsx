import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const Navigation = ({ title = "User Dashboard" }) => {
  const { user, logout } = useAuth();


  const [theme, setTheme] = useState(() => {
    // Get saved theme from localStorage or default to 'light'
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    // Apply theme to the document and save to localStorage
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <nav className="navbar navbar-expand-lg  navbar-light">
      <div className="container-fluid">
        <span className="navbar-brand mb-0 h1">{title}</span>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="/">Home</a>
            </li>
            {user && (
              <>
                <li className="nav-item">
                  <a className="nav-link" href="/devices">Devices</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/leads">Leads</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/profile">Profile</a>
                </li>
              </>
            )}
            <li className="nav-item ms-lg-2 p-2">
              <button
                onClick={toggleTheme}
                className="btn btn-outline-secondary btn-sm"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <i className="bi bi-moon-stars-fill"></i> : <i className="bi bi-sun-fill"></i>}
              </button>
            </li>
          </ul>
          {user && ( 
            <span className="d-flex">
              <button 
                onClick={logout} 
                className="btn btn-outline-warning"
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </button>
            </span>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;