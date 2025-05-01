import React, { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  filter?: ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, filter }) => {
  return (
    <div className="chart-section">
      <div className="chart-header">
        <h2 className="chart-title">{title}</h2>
        {filter && <div className="chart-filter">{filter}</div>}
      </div>
      <div className="chart-body">
        {children}
      </div>
    </div>
  );
};

export default ChartCard; 