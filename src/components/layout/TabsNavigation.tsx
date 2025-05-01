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
            Time Series Analysis
          </button>
        </li>
        <li className="tab-item">
          <button 
            className={`tab-link ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            Audience Analysis
          </button>
        </li>
      </ul>
    </div>
  );
};

export default TabsNavigation; 