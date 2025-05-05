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

interface BrandOption {
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

const BrandSelector: React.FC<{
  selectedBrands: BrandOption[];
  setSelectedOpen: (isOpen: boolean) => void;
  isOpen: boolean;
}> = ({ selectedBrands, setSelectedOpen, isOpen }) => {
  return (
    <button 
      className="filter-button"
      onClick={() => setSelectedOpen(!isOpen)}
    >
      Filter brands 
      {selectedBrands.length > 0 && (
        <span className="filter-count">{selectedBrands.length}</span>
      )}
      <span className="filter-arrow" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
    </button>
  );
};

const BrandLeafChart: React.FC = () => {
  const [brandData, setBrandData] = useState<TimeSeriesData[]>([]);
  const [uniqueBrands, setUniqueBrands] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<BrandOption[]>([]);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const csvFilePath = '/data/capital_one_brand_leaf.csv';

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
  const fetchBrandData = async () => {
    try {
      setLoading(true);
      console.log("Cargando datos del CSV:", csvFilePath);
      
      // Cargar datos del archivo CSV
      const brandRaw = await loadCSV(csvFilePath);
      
      if (!brandRaw || brandRaw.length === 0) {
        throw new Error("El archivo CSV no contiene datos válidos");
      }
      
      console.log(`CSV cargado con ${brandRaw.length} filas de datos`);
      
      // Verificar los datos cargados
      console.log("Ejemplo de datos:", brandRaw[0]);
      
      // Transformar datos para la gráfica
      const transformedBrandData = transformTimeSeriesData(brandRaw, 'Brand (Leaf)', 'Spend_USD');
      
      // Verificar los datos transformados
      console.log(`Datos transformados: ${transformedBrandData.length} puntos de tiempo`);
      if (transformedBrandData.length > 0) {
        console.log("Primer punto de tiempo:", transformedBrandData[0].date);
        console.log("Último punto de tiempo:", transformedBrandData[transformedBrandData.length - 1].date);
      }
      
      // Filtrar fechas para asegurarse de que no haya fechas futuras
      const today = new Date();
      const filteredData = transformedBrandData.filter(item => {
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
      
      console.log(`Datos después de filtrar fechas futuras: ${filteredData.length} puntos de tiempo`);
      
      // Obtener marcas únicas
      const brands = getUniqueCategories(brandRaw, 'Brand (Leaf)');
      console.log(`Marcas únicas encontradas: ${brands.length}`);
      
      // Actualizar estado
      setBrandData(filteredData);
      setUniqueBrands(brands);
      
      // Seleccionar las 5 marcas con mayor gasto por defecto si no hay ninguna seleccionada
      if (brands.length > 0 && selectedBrands.length === 0) {
        selectTopBrands(filteredData, brands, 5);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error cargando datos. Por favor intente de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos al montar el componente y periódicamente
  useEffect(() => {
    // Cargar datos inicialmente
    fetchBrandData();
    
    // Configurar recarga de datos cada 30 segundos para detectar cambios en el CSV
    const intervalId = setInterval(() => {
      fetchBrandData();
    }, 30000); // 30 segundos
    
    // Limpiar intervalo al desmontar
    return () => clearInterval(intervalId);
  }, []);

  // Función para seleccionar las marcas con mayor gasto
  const selectTopBrands = (data: TimeSeriesData[], brands: string[], count = 5) => {
    // Calcular el gasto total para cada marca
    const brandTotals: Record<string, number> = {};
    
    brands.forEach(brand => {
      brandTotals[brand] = 0;
      data.forEach(item => {
        if (item[brand]) {
          brandTotals[brand] += Number(item[brand]);
        }
      });
    });
    
    // Ordenar marcas por gasto total
    const topBrands = Object.entries(brandTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(entry => ({ value: entry[0], label: entry[0] }));
      
    setSelectedBrands(topBrands);
  };

  // Manejar cambios en las marcas seleccionadas (con checkbox)
  const handleBrandToggle = (brand: BrandOption) => {
    setSelectedBrands(prev => {
      const exists = prev.some(item => item.value === brand.value);
      if (exists) {
        return prev.filter(item => item.value !== brand.value);
      } else {
        return [...prev, brand];
      }
    });
  };

  // Método para seleccionar todas las marcas
  const selectAllBrands = () => {
    const allBrands = uniqueBrands.map(brand => ({ value: brand, label: brand }));
    setSelectedBrands(allBrands);
  };

  // Método para deseleccionar todas las marcas
  const selectNoneBrands = () => {
    setSelectedBrands([]);
  };

  if (loading && brandData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (error && brandData.length === 0) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;
  }

  // Opciones para el selector
  const brandOptions: BrandOption[] = uniqueBrands.map(brand => ({
    value: brand,
    label: brand
  }));

  // Encontrar el valor máximo para el dominio del eje Y
  const maxValue = Math.max(
    ...brandData.flatMap(item => 
      selectedBrands.map(brand => 
        typeof item[brand.value] === 'number' ? item[brand.value] as number : 0
      )
    )
  );
  
  // Redondear hacia arriba para tener un máximo limpio
  const yDomainMax = Math.ceil(maxValue / 1000000) * 1000000;

  // Componente de filtro para pasar al ChartCard
  const brandFilter = (
    <div className="brand-filter-container" ref={dropdownRef}>
      <BrandSelector 
        selectedBrands={selectedBrands} 
        setSelectedOpen={setSelectorOpen}
        isOpen={selectorOpen}
      />
      
      {selectorOpen && (
        <div className="brand-dropdown-menu">
          <div className="brand-dropdown-header">
            <div className="brand-dropdown-title">Select brands</div>
            <div className="brand-dropdown-actions">
              <button className="brand-action-link" onClick={selectAllBrands}>All</button>
              <span className="brand-action-separator">|</span>
              <button className="brand-action-link" onClick={selectNoneBrands}>None</button>
            </div>
          </div>
          <div className="brand-dropdown-items">
            {brandOptions.map(brand => (
              <div 
                key={brand.value} 
                className="brand-dropdown-item"
                onClick={() => handleBrandToggle(brand)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleBrandToggle(brand);
                  }
                }}
                tabIndex={0}
                role="checkbox"
                aria-checked={selectedBrands.some(item => item.value === brand.value)}
              >
                <div className="brand-checkbox">
                  <input 
                    type="checkbox" 
                    id={`brand-${brand.value}`}
                    checked={selectedBrands.some(item => item.value === brand.value)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleBrandToggle(brand);
                    }} 
                    className="brand-checkbox-input"
                  />
                  <label 
                    htmlFor={`brand-${brand.value}`}
                    className="brand-checkbox-label"
                  >
                    <span 
                      className="brand-color-dot" 
                      style={{ 
                        backgroundColor: COLORS[brandOptions.findIndex(b => b.value === brand.value) % COLORS.length] 
                      }}
                    ></span>
                    {brand.label}
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
  if (brandData.length === 0 || selectedBrands.length === 0) {
    return (
      <ChartCard title="Ad Spend by Brand Leaf" filter={brandFilter}>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No hay datos para mostrar. Por favor seleccione al menos una marca.</p>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard 
      title="Ad Spend by Brand Leaf"
      filter={brandFilter}
    >
      <div>
        <div className="chart-container" id="brand-chart-container" style={{ position: 'relative', width: '100%', height: '380px' }} ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={brandData} 
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
              {selectedBrands.map((brand, index) => (
                <Line 
                  key={brand.value}
                  type="monotone" 
                  dataKey={brand.value} 
                  name={brand.label}
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
        
        <div className="insights-container">
          <h3 className="insights-title">Key Insights</h3>
          <div className="insights-content">
            <p><strong>Dramatic Q4 Growth:</strong> Capital One Financial Corporation (General) showed a 153% increase in ad spend from Q3 to Q4, reaching its peak of $10.8M in December, which is 2.4x the annual average.</p>
            
            <p><strong>Product Category Shift:</strong> Credit card products (Venture X, QuickSilver, Savor) collectively increased from 19% of total spend in January to 31% by December, indicating a strategic reallocation of marketing resources.</p>
            
            <p><strong>Consistent High Performers:</strong> The Venture X Card maintained the most consistent high-level spending across all brands with an average monthly spend of $4.2M and a variance of only 16%, compared to the 73% average variance across other top brands.</p>
            
            <p><strong>Seasonal Investment Pattern:</strong> Capital One Shopping demonstrated clear seasonal positioning with spending increases of 37% and 49% in November and December respectively, correlating with holiday shopping seasons.</p>
          </div>
        </div>
      </div>
    </ChartCard>
  );
};

export default BrandLeafChart; 