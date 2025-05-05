import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="dashboard-header">
      <div className="logo-container">
        <img src="/Capital_One_logo.svg" alt="Capital One" className="company-logo" />
        <div className="logo-accent"></div>
      </div>
      
      <div className="title-container">
        <h1 className="dashboard-title">
          <span className="title-accent">Capital One</span> Advertising Strategy Analysis
        </h1>
        <div className="title-decoration"></div>
      </div>
      
      <div className="analytics-badge">
        <span className="badge-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18"></path>
            <path d="M18.4 9l-6-6-7 7"></path>
            <path d="M2 12h18"></path>
          </svg>
        </span>
        Marketing Analytics
      </div>
    </header>
  );
};

export default Header; 