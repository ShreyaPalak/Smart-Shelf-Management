import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './TopNavigation.css';

const TopNavigation = () => {
  const location = useLocation();

  return (
    <nav className="top-navigation">
      <div className="nav-left">
        <h1 className="app-title">Smart Shelf Management Dashboard</h1>
      </div>
      <div className="nav-center">
        <Link 
          to="/" 
          className={`nav-button ${location.pathname === '/' ? 'active' : ''}`}
        >
          Home
        </Link>
        <Link 
          to="/analytics" 
          className={`nav-button ${location.pathname === '/analytics' ? 'active' : ''}`}
        >
          Analytics
        </Link>
        <Link 
          to="/alerts" 
          className={`nav-button ${location.pathname === '/alerts' ? 'active' : ''}`}
        >
          Alerts
        </Link>
      </div>
      <div className="nav-right">
        <div className="status-indicator">
          <span className="status-dot online"></span>
          <span className="status-text">Online</span>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;
