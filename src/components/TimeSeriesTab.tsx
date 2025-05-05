import React from 'react';
import BrandLeafChart from './BrandLeafChart';
import DeviceChart from './DeviceChart';
import CategoryChart from './CategoryChart';
import PublisherChart from './PublisherChart';

// Componente para la pestaña de Series de Tiempo
const TimeSeriesTab: React.FC = () => {
  return (
    <div className="tab-content">
      <h2 className="section-title">Time Series Analysis</h2>
      
      <BrandLeafChart />
      
      <DeviceChart />
      
      <CategoryChart />
      
      <PublisherChart />
    </div>
  );
};

export default TimeSeriesTab; 