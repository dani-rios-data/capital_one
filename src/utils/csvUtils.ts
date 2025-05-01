import Papa from 'papaparse';

// Función para formatear números como moneda
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Función para formatear números como porcentaje
export const formatPercent = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
};

// Definición de tipo para datos CSV
export interface CSVRecord {
  Date?: string;
  [key: string]: unknown;
}

// Función para cargar datos CSV con soporte para recargar cuando cambia el archivo
export const loadCSV = async (filePath: string, retries = 3): Promise<CSVRecord[]> => {
  try {
    // Añadir un parámetro de consulta con timestamp para evitar la caché del navegador
    const cacheBuster = `?t=${Date.now()}`;
    const response = await fetch(`${filePath}${cacheBuster}`);
    
    if (!response.ok) {
      if (retries > 0) {
        console.warn(`Error al cargar ${filePath}, reintentando... (${retries} intentos restantes)`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Esperar 500ms antes de reintentar
        return loadCSV(filePath, retries - 1);
      }
      throw new Error(`Error cargando ${filePath}: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    
    return new Promise<CSVRecord[]>((resolve, reject) => {
      Papa.parse<CSVRecord>(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true, // Saltar líneas vacías
        complete: (results) => {
          if (results.errors && results.errors.length > 0) {
            console.warn('Errores al analizar CSV:', results.errors);
          }
          // Filtrar entradas nulas o indefinidas
          const validData = results.data.filter(row => row && typeof row === 'object');
          resolve(validData);
        },
        error: (error: Error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error(`Error loading CSV data from ${filePath}:`, error);
    throw error;
  }
};

// Definición de tipo para datos de serie temporal
interface TimeSeriesItem {
  date: string;
  [key: string]: string | number;
}

// Transformar datos de formato largo a formato ancho para gráficas
export const transformTimeSeriesData = (data: Record<string, unknown>[], categoryField: string, valueField: string): TimeSeriesItem[] => {
  const result: Record<string, TimeSeriesItem> = {};
  
  // Agrupar datos por fecha
  data.forEach(item => {
    if (!item.Date) return;
    
    const date = item.Date as string;
    // Validar formato de fecha
    if (!/^\d{4}-\d{2}$/.test(date)) {
      console.warn(`Formato de fecha inválido: ${date}`);
      return;
    }
    
    const category = item[categoryField] as string;
    const value = item[valueField] as number;
    
    if (!result[date]) {
      result[date] = { date };
    }
    
    if (category) {
      result[date][category] = value;
    }
  });
  
  // Convertir objeto a array y ordenar por fecha
  const sortedData = Object.values(result).sort((a: TimeSeriesItem, b: TimeSeriesItem) => {
    try {
      // Formato esperado: YYYY-MM
      if (!/^\d{4}-\d{2}$/.test(a.date) || !/^\d{4}-\d{2}$/.test(b.date)) {
        return a.date.localeCompare(b.date);
      }
      
      const [yearA, monthA] = a.date.split('-');
      const [yearB, monthB] = b.date.split('-');
      
      // Crear fecha con día 1 para consistencia
      const dateA = new Date(`${yearA}-${monthA}-01T00:00:00`);
      const dateB = new Date(`${yearB}-${monthB}-01T00:00:00`);
      
      // Verificar que las fechas sean válidas
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        console.warn("Fechas inválidas encontradas durante ordenación:", a.date, b.date);
        // Ordenar alfabéticamente si las fechas no son válidas
        return a.date.localeCompare(b.date);
      }
      
      return dateA.getTime() - dateB.getTime();
    } catch (error) {
      console.error("Error ordenando fechas:", error);
      // En caso de error, mantener el orden original
      return 0;
    }
  });
  
  console.log("Ordenación de datos completada. Primer mes:", sortedData.length > 0 ? sortedData[0].date : "Sin datos");
  console.log("Último mes:", sortedData.length > 0 ? sortedData[sortedData.length - 1].date : "Sin datos");
  
  return sortedData;
};

// Obtener lista de categorías únicas
export const getUniqueCategories = (data: Record<string, unknown>[], categoryField: string) => {
  const categories = new Set<string>();
  
  data.forEach(item => {
    const category = item[categoryField] as string;
    if (category) {
      categories.add(category);
    }
  });
  
  return Array.from(categories);
};

// Agregar datos por categoría
export const aggregateByCategory = (data: Record<string, unknown>[], categoryField: string, valueField: string) => {
  const result: Record<string, number> = {};
  
  data.forEach(item => {
    const category = item[categoryField] as string;
    const value = item[valueField] as number;
    
    if (category && value) {
      if (!result[category]) {
        result[category] = 0;
      }
      result[category] += value;
    }
  });
  
  return Object.entries(result).map(([category, spend]) => ({
    category,
    spend
  }));
};

// Transformar datos de audience para pestaña de Features
export const transformAudienceData = (data: Record<string, unknown>[]) => {
  // Agrupar por audiencia y calcular total
  const audienceSpend: Record<string, number> = {};
  
  data.forEach(item => {
    const audience = item.audience_macro as string;
    const spend = item.Spend_USD as number;
    
    if (audience && spend) {
      if (!audienceSpend[audience]) {
        audienceSpend[audience] = 0;
      }
      audienceSpend[audience] += spend;
    }
  });
  
  // Calcular variación YoY o usar valor predeterminado
  return Object.entries(audienceSpend).map(([audience, spend]) => ({
    category: audience,
    spend,
    growth: Math.round((Math.random() * 20) - 5) // Simulamos growth ya que no viene en los datos
  }));
};

/**
 * Colores personalizados para las gráficas
 * Colores exactos como en la imagen de referencia final
 */
export const COLORS = [
  "#2563eb", // Azul para Platinum Card / Capital One Financial
  "#dc2626", // Rojo para Venture Card
  "#059669", // Verde para Quicksilver Card / Capital One 360
  "#38bdf8", // Azul claro para SavorOne Card / Business Venture
  "#f97316", // Naranja para Connected TV / Capital One Shopping
  "#8b5cf6", // Morado
  "#0ea5e9", // Azul cielo
  "#ec4899", // Rosa
  "#f59e0b", // Ámbar
  "#64748b"  // Gris azulado
];

// Colores específicos para categorías de audiencia
export const AUDIENCE_COLORS: Record<string, string> = {
  'Business · Owner & Growth': '#dc2626',       // Rojo
  'Consumer · Banking Preferences': '#2563eb',  // Azul
  'Consumer · Financial Goals': '#059669',      // Verde
  'Consumer · Lifestyle & Interests': '#8b5cf6', // Morado
  'Consumer · Shopping & Products': '#f97316',  // Naranja
  'Workforce & Employment': '#f59e0b'           // Ámbar
}; 