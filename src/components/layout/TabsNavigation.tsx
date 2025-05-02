import React from 'react';

interface TabsNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsNavigation: React.FC<TabsNavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="tabs-container">
      <ul className="tabs-nav">
        <li className="tab-item">
          <button 
            className={`tab-link ${activeTab === 'timeSeries' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeSeries')}
          >
            <span className="tab-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="20" x2="12" y2="10" />
                <line x1="18" y1="20" x2="18" y2="4" />
                <line x1="6" y1="20" x2="6" y2="16" />
              </svg>
            </span>
            <span className="tab-text">Time Series Analysis</span>
          </button>
        </li>
        <li className="tab-item">
          <button 
            className={`tab-link ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            <span className="tab-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2" />
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <circle cx="12" cy="10" r="2" />
                <path d="M8 2v2" />
                <path d="M16 2v2" />
              </svg>
            </span>
            <span className="tab-text">Audience Analysis</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default TabsNavigation; 