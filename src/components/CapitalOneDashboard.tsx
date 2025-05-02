import React, { useState } from 'react';
import TimeSeriesTab from './TimeSeriesTab';
import FeaturesTab from './FeaturesTab';
import InformationTab from './InformationTab';
import Header from './layout/Header';
import TabsNavigation from './layout/TabsNavigation';
import AudioPlayer from './layout/AudioPlayer';

// Componente principal del Dashboard
const CapitalOneDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('timeSeries');

  // Ruta al archivo de audio
  const audioSrc = '/audio/capital_one.mp3';

  return (
    <>
      {/* Área fija para header - full width */}
      <div className="fixed-header-area">
        <div className="header-content">
          {/* Header */}
          <Header />
        </div>
        
        {/* Reproductor de audio */}
        <div className="audio-player-container">
          <AudioPlayer audioSrc={audioSrc} />
        </div>
        
        {/* Tabs de navegación - directamente en el área fija para ocupar todo el ancho */}
        <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      
      {/* Contenido principal con ancho máximo */}
      <div className="dashboard-container">
        <main className="dashboard-content">
          {activeTab === 'timeSeries' && <TimeSeriesTab />}
          {activeTab === 'features' && <FeaturesTab />}
          {activeTab === 'information' && <InformationTab />}
        </main>
      </div>
    </>
  );
};

export default CapitalOneDashboard; 