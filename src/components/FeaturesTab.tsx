import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
  loadCSV, formatCurrency, COLORS, AUDIENCE_COLORS, 
  transformAudienceData 
} from '../utils/csvUtils';
import ChartCard from './common/ChartCard';
import AudienceCategoryTrendChart from './AudienceCategoryTrendChart';

interface AudienceCategoryItem {
  category: string;
  spend: number;
  growth: number;
  maxValue?: number;
}

interface BarLabelProps {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
}

interface PayloadItem {
  value: number;
  name: string;
  payload: AudienceCategoryItem;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: PayloadItem[];
  coordinate?: { x: number; y: number };
}

// Enhanced tooltip component for the bar chart
const CustomBarTooltip = ({ active, payload, coordinate }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const category = data.payload.category;
    const spend = data.value;
    const total = data.payload.maxValue || 0;
    const percentage = total ? ((spend / total) * 100).toFixed(1) : '0';
    const color = AUDIENCE_COLORS[category] || data.color || '#666';
    
    return (
      <div className="custom-tooltip" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        padding: '12px 16px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
        position: 'absolute',
        left: coordinate ? `${coordinate.x + 15}px` : 'auto',
        top: coordinate ? `${coordinate.y - 70}px` : 'auto',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
        zIndex: 1000,
        minWidth: '220px',
        transition: 'opacity 0.15s ease-in-out'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: color,
            marginRight: '8px'
          }}></div>
          <p style={{ 
            margin: 0, 
            fontWeight: 'bold',
            fontSize: '14px',
            color: '#333'
          }}>{category}</p>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: '#666' }}>Spend:</span>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>{formatCurrency(spend)}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: '#666' }}>% of Total:</span>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>{percentage}%</span>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '10px', 
          height: '4px', 
          width: '100%', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '2px' 
        }}>
          <div style={{ 
            height: '100%', 
            width: `${percentage}%`, 
            backgroundColor: color, 
            borderRadius: '2px',
            transition: 'width 0.3s ease-in-out'
          }}></div>
        </div>
      </div>
    );
  }
  return null;
};

// Component for Features Tab
const FeaturesTab: React.FC = () => {
  const [audienceCategoryData, setAudienceCategoryData] = useState<AudienceCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for better tooltip positioning
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Load data from CSV file
        const audienceRaw = await loadCSV('/data/capital_one_audience_category.csv');
        
        // Transform data for charts
        const transformedAudienceData = transformAudienceData(audienceRaw);
        
        // Calculate total spend
        const total = transformedAudienceData.reduce((acc, item) => acc + item.spend, 0);
        
        // Sort data by spend in descending order STRICTLY
        const sortedData = [...transformedAudienceData]
          .sort((a, b) => b.spend - a.spend)
          .map(item => ({
            ...item,
            maxValue: total
          }));
        
        setAudienceCategoryData(sortedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error loading data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;
  }

  // Custom label for bar chart
  const renderCustomBarLabel = (props: BarLabelProps) => {
    const { x, y, width, height, value } = props;
    const formatValue = (val: number) => {
      if (val >= 1000000) return `$${(val / 1000000).toFixed(0)}M`;
      if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
      return `$${val}`;
    };
    
    return (
      <text x={x + width + 5} y={y + height / 2} fill="#666" textAnchor="start" dominantBaseline="middle">
        {formatValue(value)}
      </text>
    );
  };

  // Format x-axis ticks
  const formatXAxis = (value: number) => {
    if (value === 0) return '$0';
    if (value >= 1000000) return `$${value / 1000000}M`;
    if (value >= 1000) return `$${value / 1000}K`;
    return `$${value}`;
  };
  
  return (
    <div className="tab-content">
      {/* Time series chart for audience categories */}
      <AudienceCategoryTrendChart />
      
      <div className="flex flex-wrap md:flex-nowrap gap-4 mt-4">
        <div className="w-full">
          <ChartCard title="Category Distribution">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={audienceCategoryData}
            layout="vertical"
                margin={{ top: 20, right: 80, left: 180, bottom: 20 }}
                onMouseMove={(e) => e && e.activeCoordinate && setMousePosition({ 
                  x: e.activeCoordinate.x, 
                  y: e.activeCoordinate.y 
                })}
              >
                <XAxis 
                  type="number" 
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="category" 
                  width={170} 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  content={<CustomBarTooltip />}
                  cursor={{ fill: 'rgba(240, 240, 240, 0.2)' }}
                  position={mousePosition}
                  isAnimationActive={false}
                  allowEscapeViewBox={{ x: true, y: true }}
                />
                <Bar 
                  dataKey="spend" 
                  name="Total Ad Spend" 
                  radius={[0, 4, 4, 0]}
                  barSize={30}
                  label={renderCustomBarLabel}
                >
              {audienceCategoryData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={AUDIENCE_COLORS[entry.category] || COLORS[index % COLORS.length]} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
          </ChartCard>
      </div>
      </div>
    </div>
  );
};

export default FeaturesTab; 