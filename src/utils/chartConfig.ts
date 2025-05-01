/**
 * Configuración global para las gráficas de línea
 */
export const lineChartConfig = {
  // Configuración para el grid (cuadrícula)
  grid: {
    strokeDasharray: "2 2",
    stroke: "#f0f0f0",
    vertical: true,
    horizontal: true
  },
  
  // Configuración para los ejes
  xAxis: {
    tickLine: false,
    axisLine: { stroke: "#e0e0e0" },
    fontSize: 10,
    color: "#666"
  },
  
  yAxis: {
    tickLine: false,
    axisLine: false,
    tickFormatter: (value: number) => `${value/1000}k`,
    fontSize: 10,
    color: "#666"
  },
  
  // Configuración para la línea
  line: {
    strokeWidth: 1.5,
    dot: { r: 3 },
    activeDot: { r: 5 }
  },
  
  // Configuración para el tooltip
  tooltip: {
    contentStyle: {
      fontSize: "12px",
      padding: "6px",
      borderRadius: "3px"
    }
  },
  
  // Configuración para la leyenda
  legend: {
    fontSize: 10,
    iconSize: 8,
    verticalAlign: "bottom",
    formatter: (value: string) => value.length > 15 ? `${value.slice(0, 15)}...` : value
  }
};

/**
 * Configuración global para las gráficas de área
 */
export const areaChartConfig = {
  ...lineChartConfig,
  area: {
    fillOpacity: 0.6,
    stroke: null
  }
};

/**
 * Configuración global para las gráficas de barras
 */
export const barChartConfig = {
  ...lineChartConfig,
  bar: {
    barSize: 15,
    radius: [0, 0, 0, 0]
  }
};

/**
 * Colores personalizados para las gráficas
 * Estos colores coinciden con los que se muestran en el dashboard
 */
export const CHART_COLORS = [
  "#1E88E5", // Azul primario (azul claro)
  "#E53935", // Rojo
  "#00ACC1", // Teal/aqua
  "#43A047", // Verde
  "#FFB300", // Ámbar
  "#8E24AA", // Púrpura
  "#5C6BC0", // Índigo
  "#D81B60", // Rosado
  "#F4511E", // Naranja
  "#607D8B"  // Azul-gris
]; 