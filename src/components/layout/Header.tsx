import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="dashboard-header">
      <div className="logo-container">
        <img src="/Capital_One_logo.svg" alt="Capital One" className="company-logo" />
      </div>
      <h1 className="dashboard-title">Ad Spend Analysis Dashboard</h1>
      <div className="analytics-badge">Marketing Analytics</div>
    </header>
  );
};

export default Header; 