import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="dashboard-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div className="logo-container">
        <img src="/Capital_One_logo.svg" alt="Capital One" className="company-logo" />
        <div className="logo-accent"></div>
      </div>
      
      <div className="title-container" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <h1 className="dashboard-title">
          <span className="title-accent">Capital One</span> Advertising Strategy Analysis
        </h1>
        <div className="title-decoration"></div>
      </div>
    </header>
  );
};

export default Header; 