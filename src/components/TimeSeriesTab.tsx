import React from 'react';
import BrandLeafChart from './BrandLeafChart';
import DeviceChart from './DeviceChart';
import CategoryChart from './CategoryChart';
import PublisherChart from './PublisherChart';
import Top3ByBrandLeaf from './Top3ByBrandLeaf';

// Componente para la pestaña de Series de Tiempo
const TimeSeriesTab: React.FC = () => {
  return (
    <div className="tab-content">
      <h2 className="tabs-section-title">Campaign Investment Analysis</h2>
      
      <BrandLeafChart />
      
      <Top3ByBrandLeaf />
      
      <DeviceChart />
      
      <CategoryChart />
      
      <PublisherChart />
    </div>
  );
};

export default TimeSeriesTab; 