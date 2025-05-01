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

interface AudienceCategoryOption {
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

const AudienceCategorySelector: React.FC<{
  selectedCategories: AudienceCategoryOption[];
  setSelectedOpen: (isOpen: boolean) => void;
  isOpen: boolean;
}> = ({ selectedCategories, setSelectedOpen, isOpen }) => {
  return (
    <button 
      className="filter-button"
      onClick={() => setSelectedOpen(!isOpen)}
    >
      Filter audience categories 
      {selectedCategories.length > 0 && (
        <span className="filter-count">{selectedCategories.length}</span>
      )}
      <span className="filter-arrow" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
    </button>
  );
};

const AudienceCategoryChart: React.FC = () => {
  const [audienceData, setAudienceData] = useState<TimeSeriesData[]>([]);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<AudienceCategoryOption[]>([]);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const csvFilePath = '/data/capital_one_audience_category.csv';

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
  const fetchAudienceData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos del archivo CSV
      const audienceRaw = await loadCSV(csvFilePath);
      
      if (!audienceRaw || audienceRaw.length === 0) {
        throw new Error("El archivo CSV no contiene datos válidos");
      }
      
      // Transformar datos para la gráfica
      const transformedAudienceData = transformTimeSeriesData(audienceRaw, 'audience_macro', 'Spend_USD');
      
      // Filtrar fechas para asegurarse de que no haya fechas futuras
      const today = new Date();
      const filteredData = transformedAudienceData.filter(item => {
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
      
      // Obtener categorías únicas
      const categories = getUniqueCategories(audienceRaw, 'audience_macro');
      
      // Actualizar estado
      setAudienceData(filteredData);
      setUniqueCategories(categories);
      
      // Seleccionar las 5 categorías con mayor gasto por defecto si no hay ninguna seleccionada
      if (categories.length > 0 && selectedCategories.length === 0) {
        selectTopCategories(filteredData, categories, 5);
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
    fetchAudienceData();
    
    // Configurar recarga de datos cada 30 segundos
    const intervalId = setInterval(() => {
      fetchAudienceData();
    }, 30000);
    
    // Limpiar intervalo al desmontar
    return () => clearInterval(intervalId);
  }, []);

  // Función para seleccionar las categorías con mayor gasto
  const selectTopCategories = (data: TimeSeriesData[], categories: string[], count = 5) => {
    // Calcular el gasto total para cada categoría
    const categoryTotals: Record<string, number> = {};
    
    categories.forEach(category => {
      categoryTotals[category] = 0;
      data.forEach(item => {
        if (item[category]) {
          categoryTotals[category] += Number(item[category]);
        }
      });
    });
    
    // Ordenar categorías por gasto total
    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(entry => ({ value: entry[0], label: entry[0] }));
      
    setSelectedCategories(topCategories);
  };

  // Manejar cambios en las categorías seleccionadas
  const handleCategoryToggle = (category: AudienceCategoryOption) => {
    setSelectedCategories(prev => {
      const exists = prev.some(item => item.value === category.value);
      if (exists) {
        return prev.filter(item => item.value !== category.value);
      } else {
        return [...prev, category];
      }
    });
  };

  // Método para seleccionar todas las categorías
  const selectAllCategories = () => {
    const allCategories = uniqueCategories.map(category => ({ value: category, label: category }));
    setSelectedCategories(allCategories);
  };

  // Método para deseleccionar todas las categorías
  const selectNoneCategories = () => {
    setSelectedCategories([]);
  };

  if (loading && audienceData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (error && audienceData.length === 0) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;
  }

  // Opciones para el selector
  const categoryOptions: AudienceCategoryOption[] = uniqueCategories.map(category => ({
    value: category,
    label: category
  }));

  // Encontrar el valor máximo para el dominio del eje Y
  const maxValue = Math.max(
    ...audienceData.flatMap(item => 
      selectedCategories.map(category => 
        typeof item[category.value] === 'number' ? item[category.value] as number : 0
      )
    ), 1  // Asegurar que siempre hay un valor mínimo
  );
  
  // Redondear hacia arriba para tener un máximo limpio
  const yDomainMax = Math.ceil(maxValue / 1000000) * 1000000;

  // Componente de filtro para pasar al ChartCard
  const audienceCategoryFilter = (
    <div className="brand-filter-container" ref={dropdownRef}>
      <AudienceCategorySelector 
        selectedCategories={selectedCategories} 
        setSelectedOpen={setSelectorOpen}
        isOpen={selectorOpen}
      />
      
      {selectorOpen && (
        <div className="brand-dropdown-menu">
          <div className="brand-dropdown-header">
            <div className="brand-dropdown-title">Select audience categories</div>
            <div className="brand-dropdown-actions">
              <button className="brand-action-link" onClick={selectAllCategories}>All</button>
              <span className="brand-action-separator">|</span>
              <button className="brand-action-link" onClick={selectNoneCategories}>None</button>
            </div>
          </div>
          <div className="brand-dropdown-items">
            {categoryOptions.map(category => (
              <div 
                key={category.value} 
                className="brand-dropdown-item"
                onClick={() => handleCategoryToggle(category)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCategoryToggle(category);
                  }
                }}
                tabIndex={0}
                role="checkbox"
                aria-checked={selectedCategories.some(item => item.value === category.value)}
              >
                <div className="brand-checkbox">
                  <input 
                    type="checkbox" 
                    id={`audience-category-${category.value}`}
                    checked={selectedCategories.some(item => item.value === category.value)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleCategoryToggle(category);
                    }} 
                    className="brand-checkbox-input"
                  />
                  <label 
                    htmlFor={`audience-category-${category.value}`}
                    className="brand-checkbox-label"
                  >
                    <span 
                      className="brand-color-dot" 
                      style={{ 
                        backgroundColor: COLORS[categoryOptions.findIndex(c => c.value === category.value) % COLORS.length] 
                      }}
                    ></span>
                    {category.label}
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
  if (audienceData.length === 0 || selectedCategories.length === 0) {
    return (
      <ChartCard title="Ad Spend Trends by Audience Category" filter={audienceCategoryFilter}>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No hay datos para mostrar. Por favor seleccione al menos una categoría.</p>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard 
      title="Ad Spend Trends by Audience Category"
      filter={audienceCategoryFilter}
    >
      <div className="chart-container" id="audience-category-chart-container" style={{ position: 'relative', width: '100%', height: '380px' }} ref={chartRef}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={audienceData} 
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
            {selectedCategories.map((category, index) => (
              <Line 
                key={category.value}
                type="monotone" 
                dataKey={category.value} 
                name={category.label}
                stroke={COLORS[index % COLORS.length]} 
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 1 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default AudienceCategoryChart; 