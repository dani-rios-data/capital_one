import React, { useState } from 'react';
import TimeSeriesTab from './TimeSeriesTab';
import FeaturesTab from './FeaturesTab';
import Header from './layout/Header';
import TabsNavigation from './layout/TabsNavigation';

// Componente principal del Dashboard
const CapitalOneDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('timeSeries');

  return (
    <>
      {/* Área fija para header y navegación - full width */}
      <div className="fixed-header-area">
        <div className="header-content">
          {/* Header */}
          <Header />
          
          {/* Tabs de navegación */}
          <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
      
      {/* Contenido principal con ancho máximo */}
      <div className="dashboard-container">
        <main className="dashboard-content">
          {activeTab === 'timeSeries' && <TimeSeriesTab />}
          {activeTab === 'features' && <FeaturesTab />}
        </main>
      </div>
    </>
  );
};

export default CapitalOneDashboard; 