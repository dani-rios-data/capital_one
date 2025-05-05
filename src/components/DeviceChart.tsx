import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, 
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  loadCSV, COLORS, 
  transformTimeSeriesData, getUniqueCategories
} from '../utils/csvUtils';
import ChartCard from './common/ChartCard';
import CustomTooltip from './CustomTooltip';

interface TimeSeriesData {
  date: string;
  [key: string]: string | number;
}

interface DeviceOption {
  value: string;
  label: string;
}

// Función para formatear fechas en formato "Mes Año"
const formatXAxis = (dateStr: string) => {
  try {
    // Asegurarse de que la fecha sea válida y esté en el formato correcto
    if (!dateStr || typeof dateStr !== 'string') {
      return '';
    }
    
    // Validar que el formato sea el esperado (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    const [year, month] = dateStr.split('-');
    // Crear fecha con día 1 para evitar problemas con días inválidos
    const date = new Date(`${year}-${month}-01T00:00:00`);
    
    if (isNaN(date.getTime())) {
      console.error("Fecha inválida:", dateStr);
      return dateStr;
    }
    
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
  } catch (error) {
    console.error("Error formateando fecha:", dateStr, error);
    return dateStr;
  }
};

// Función para formatear valores en millones
const formatYAxis = (value: number) => {
  if (value === 0) return '$0';
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(0)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

const DeviceSelector: React.FC<{
  selectedDevices: DeviceOption[];
  setSelectedOpen: (isOpen: boolean) => void;
  isOpen: boolean;
}> = ({ selectedDevices, setSelectedOpen, isOpen }) => {
  return (
    <button 
      className="filter-button"
      onClick={() => setSelectedOpen(!isOpen)}
    >
      Filter devices 
      {selectedDevices.length > 0 && (
        <span className="filter-count">{selectedDevices.length}</span>
      )}
      <span className="filter-arrow" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
    </button>
  );
};

const DeviceChart: React.FC = () => {
  const [deviceData, setDeviceData] = useState<TimeSeriesData[]>([]);
  const [uniqueDevices, setUniqueDevices] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<DeviceOption[]>([]);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const csvFilePath = '/data/capital_one_device.csv';

  // Efecto para cerrar el selector cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSelectorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Función para cargar los datos CSV y procesarlos
  const fetchDeviceData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos del archivo CSV
      const deviceRaw = await loadCSV(csvFilePath);
      
      if (!deviceRaw || deviceRaw.length === 0) {
        throw new Error("El archivo CSV no contiene datos válidos");
      }
      
      // Transformar datos para la gráfica
      const transformedDeviceData = transformTimeSeriesData(deviceRaw, 'Device', 'Spend_USD');
      
      // Filtrar fechas para asegurarse de que no haya fechas futuras
      const today = new Date();
      const filteredData = transformedDeviceData.filter(item => {
        try {
          const [year, month] = item.date.split('-').map(Number);
          // Crear fecha con el último día del mes para comparación
          const itemDate = new Date(year, month, 0); 
          return itemDate <= today;
        } catch (e) {
          console.error("Error filtrando fecha:", item.date, e);
          return false;
        }
      });
      
      // Obtener dispositivos únicos
      const devices = getUniqueCategories(deviceRaw, 'Device');
      
      // Actualizar estado
      setDeviceData(filteredData);
      setUniqueDevices(devices);
      
      // Seleccionar los 5 dispositivos con mayor gasto por defecto si no hay ninguno seleccionado
      if (devices.length > 0 && selectedDevices.length === 0) {
        selectTopDevices(filteredData, devices, 5);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error cargando datos. Por favor intente de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos al montar el componente
  useEffect(() => {
    fetchDeviceData();
    
    // Configurar recarga de datos cada 30 segundos
    const intervalId = setInterval(() => {
      fetchDeviceData();
    }, 30000);
    
    // Limpiar intervalo al desmontar
    return () => clearInterval(intervalId);
  }, []);

  // Función para seleccionar los dispositivos con mayor gasto
  const selectTopDevices = (data: TimeSeriesData[], devices: string[], count = 5) => {
    // Calcular el gasto total para cada dispositivo
    const deviceTotals: Record<string, number> = {};
    
    devices.forEach(device => {
      deviceTotals[device] = 0;
      data.forEach(item => {
        if (item[device]) {
          deviceTotals[device] += Number(item[device]);
        }
      });
    });
    
    // Ordenar dispositivos por gasto total
    const topDevices = Object.entries(deviceTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(entry => ({ value: entry[0], label: entry[0] }));
      
    setSelectedDevices(topDevices);
  };

  // Manejar cambios en los dispositivos seleccionados
  const handleDeviceToggle = (device: DeviceOption) => {
    setSelectedDevices(prev => {
      const exists = prev.some(item => item.value === device.value);
      if (exists) {
        return prev.filter(item => item.value !== device.value);
      } else {
        return [...prev, device];
      }
    });
  };

  // Método para seleccionar todos los dispositivos
  const selectAllDevices = () => {
    const allDevices = uniqueDevices.map(device => ({ value: device, label: device }));
    setSelectedDevices(allDevices);
  };

  // Método para deseleccionar todos los dispositivos
  const selectNoneDevices = () => {
    setSelectedDevices([]);
  };

  if (loading && deviceData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (error && deviceData.length === 0) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;
  }

  // Opciones para el selector
  const deviceOptions: DeviceOption[] = uniqueDevices.map(device => ({
    value: device,
    label: device
  }));

  // Encontrar el valor máximo para el dominio del eje Y
  const maxValue = Math.max(
    ...deviceData.flatMap(item => 
      selectedDevices.map(device => 
        typeof item[device.value] === 'number' ? item[device.value] as number : 0
      )
    ), 1  // Asegurar que siempre hay un valor mínimo
  );
  
  // Redondear hacia arriba para tener un máximo limpio
  const yDomainMax = Math.ceil(maxValue / 1000000) * 1000000;

  // Componente de filtro para pasar al ChartCard
  const deviceFilter = (
    <div className="brand-filter-container" ref={dropdownRef}>
      <DeviceSelector 
        selectedDevices={selectedDevices} 
        setSelectedOpen={setSelectorOpen}
        isOpen={selectorOpen}
      />
      
      {selectorOpen && (
        <div className="brand-dropdown-menu">
          <div className="brand-dropdown-header">
            <div className="brand-dropdown-title">Select devices</div>
            <div className="brand-dropdown-actions">
              <button className="brand-action-link" onClick={selectAllDevices}>All</button>
              <span className="brand-action-separator">|</span>
              <button className="brand-action-link" onClick={selectNoneDevices}>None</button>
            </div>
          </div>
          <div className="brand-dropdown-items">
            {deviceOptions.map(device => (
              <div 
                key={device.value} 
                className="brand-dropdown-item"
                onClick={() => handleDeviceToggle(device)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleDeviceToggle(device);
                  }
                }}
                tabIndex={0}
                role="checkbox"
                aria-checked={selectedDevices.some(item => item.value === device.value)}
              >
                <div className="brand-checkbox">
                  <input 
                    type="checkbox" 
                    id={`device-${device.value}`}
                    checked={selectedDevices.some(item => item.value === device.value)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleDeviceToggle(device);
                    }} 
                    className="brand-checkbox-input"
                  />
                  <label 
                    htmlFor={`device-${device.value}`}
                    className="brand-checkbox-label"
                  >
                    <span 
                      className="brand-color-dot" 
                      style={{ 
                        backgroundColor: COLORS[deviceOptions.findIndex(d => d.value === device.value) % COLORS.length] 
                      }}
                    ></span>
                    {device.label}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Verificar si hay datos para mostrar
  if (deviceData.length === 0 || selectedDevices.length === 0) {
    return (
      <ChartCard title="Platform Media" filter={deviceFilter}>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No hay datos para mostrar. Por favor seleccione al menos un dispositivo.</p>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard 
      title="Platform Media"
      filter={deviceFilter}
    >
      <div>
        <div className="chart-container" id="device-chart-container" style={{ position: 'relative', width: '100%', height: '380px' }} ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={deviceData} 
              margin={{ top: 15, right: 30, left: 20, bottom: 15 }}
            >
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={formatXAxis}
                interval="preserveStartEnd"
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                tickFormatter={formatYAxis}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                domain={[0, yDomainMax]}
              />
              <Tooltip 
                content={<CustomTooltip />}
                labelFormatter={formatXAxis}
                wrapperStyle={{ 
                  zIndex: 9999, 
                  visibility: 'visible',
                  pointerEvents: 'none',
                  opacity: 1
                }}
                isAnimationActive={false}
                allowEscapeViewBox={{ x: true, y: true }}
                cursor={{ strokeDasharray: '3 3', stroke: '#666' }}
                position={{ x: 0, y: 0 }}
                offset={0}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                layout="horizontal"
                iconSize={8}
                iconType="circle"
                wrapperStyle={{
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '0',
                  fontSize: '11px',
                  lineHeight: '16px',
                  backgroundColor: 'transparent'
                }}
              />
              {selectedDevices.map((device, index) => (
                <Line 
                  key={device.value}
                  type="monotone" 
                  dataKey={device.value} 
                  name={device.label}
                  stroke={COLORS[index % COLORS.length]} 
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="insights-container">
          <h3 className="insights-title">Key Insights</h3>
          <div className="insights-content">
            <p><strong>OTT Dominance:</strong> OTT (Over-The-Top) media maintained the highest monthly ad spend throughout 2024, averaging $10.2M per month and accounting for 32% of the total annual ad spend, showing Capital One's strong focus on streaming platforms.</p>
            
            <p><strong>Instagram's Exponential Growth:</strong> Instagram ad spend saw a 229% increase from January ($4.2M) to December ($13.7M), with the most dramatic rise in Q4 (56% increase from Q3), indicating a significant shift toward this platform for end-of-year campaigns.</p>
            
            <p><strong>Desktop vs. Mobile Disparity:</strong> Desktop Display consistently outperformed Mobile Display by an average ratio of 33:1, with Desktop Display receiving $5.7M monthly versus Mobile Display's $170K, highlighting a clear prioritization of desktop advertising channels.</p>
            
            <p><strong>Year-End Platform Shifts:</strong> While most platforms maintained relatively stable spending patterns, Instagram (+145%) and Desktop Display (+80%) showed substantial increases in Q4 compared to the yearly average, demonstrating a strategic reallocation for holiday season advertising.</p>
          </div>
        </div>
      </div>
    </ChartCard>
  );
};

export default DeviceChart; 