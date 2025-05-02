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
        <div className="chart-title-container">
          <div className="chart-icon">
            {/* Icono sutil de gráfico */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
          </div>
          <h2 className="chart-title">{title}</h2>
        </div>
        {filter && <div className="chart-filter">{filter}</div>}
      </div>
      <div className="chart-body">
        {children}
      </div>
    </div>
  );
};

export default ChartCard; 