import React, { useRef, useEffect, useState } from 'react';
import { formatCurrency, COLORS } from '../utils/csvUtils';
import ReactDOM from 'react-dom';

// Interfaz para los datos del tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color?: string;
    dataKey?: string;
    payload?: Record<string, unknown>;
  }>;
  label?: string;
  labelFormatter?: (label: string) => string;
  coordinate?: {
    x: number;
    y: number;
  };
  viewBox?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
}

// Tooltip personalizado con borde sólido en la parte superior y ajuste automático de posición
const CustomTooltip: React.FC<CustomTooltipProps> = ({ 
  active, 
  payload, 
  label, 
  labelFormatter,
  coordinate
}) => {
  const [position, setPosition] = useState<{x: number; y: number}>({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const tooltipSizeRef = useRef<{width: number; height: number}>({ width: 0, height: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [needsScroll, setNeedsScroll] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [forceDisplay, setForceDisplay] = useState(false);
  const [tooltipReady, setTooltipReady] = useState(false);
  
  // Esta es una bandera para forzar el mantenimiento del tooltip
  const forceKeepVisible = isHovering || forceDisplay;

  // Crear un div para el portal si no existe
  useEffect(() => {
    if (!portalRef.current) {
      const div = document.createElement('div');
      div.className = 'tooltip-portal';
      div.style.position = 'fixed';
      div.style.top = '0';
      div.style.left = '0';
      div.style.width = '0';
      div.style.height = '0';
      div.style.overflow = 'visible';
      div.style.pointerEvents = 'none';
      div.style.zIndex = '9999';
      document.body.appendChild(div);
      portalRef.current = div;
    }

    // Limpieza al desmontar
    return () => {
      if (portalRef.current) {
        document.body.removeChild(portalRef.current);
        portalRef.current = null;
      }
    };
  }, []);

  // Función para calcular la posición del tooltip
  const calculateTooltipPosition = () => {
    if ((!active && !forceKeepVisible) || !coordinate || !tooltipRef.current) return;
    
    // Buscar el contenedor de gráfico activo basado en el hover reciente
    const containers = [
      document.getElementById('device-chart-container'),
      document.getElementById('brand-chart-container'),
      document.getElementById('category-chart-container'),
      document.getElementById('publisher-chart-container')
    ].filter(Boolean);
    
    let activeContainer = null;
    
    // Verificar cuál es el contenedor activo basado en elementos activos
    for (const container of containers) {
      if (container && container.querySelector('.recharts-active-dot')) {
        activeContainer = container;
        break;
      }
    }
    
    // Si no encontramos contenedor activo por punto activo, usar aproximación por proporción relativa
    if (!activeContainer) {
      // Obtener la posición actual del mouse (usar coordinate como referencia)
      for (const container of containers) {
        if (!container) continue;
        
        const rect = container.getBoundingClientRect();
        
        // Verificar si el cursor está dentro de este contenedor
        if (
          coordinate.x >= 0 && 
          coordinate.x <= rect.width && 
          coordinate.y >= 0 && 
          coordinate.y <= rect.height
        ) {
          activeContainer = container;
          break;
        }
      }
      
      // Si aún no encontramos ninguno, usar el primero disponible
      if (!activeContainer) {
        activeContainer = containers[0] || document.querySelector('.chart-container');
      }
    }
    
    if (!activeContainer) return;
    
    // Obtener el rectángulo del gráfico
    const chartRect = activeContainer.getBoundingClientRect();
    
    // Calcular la posición basada en las coordenadas del cursor relativas a la ventana
    const cursorX = chartRect.left + coordinate.x;
    const cursorY = chartRect.top + coordinate.y;
    
    // Medir el tooltip si está disponible
    if (tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      tooltipSizeRef.current = {
        width: tooltipRect.width || 280, // Valor predeterminado si no se puede obtener
        height: tooltipRect.height || 300 // Valor predeterminado si no se puede obtener
      };
    }
    
    // Posicionar el tooltip basado en la posición en el gráfico para evitar obstrucción
    let x = cursorX;
    let y = cursorY - 10; // Un poco arriba del cursor
    
    // Margen de padding para evitar que el tooltip esté pegado al borde
    const PADDING = 15;
    
    // Límites de la ventana
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = tooltipSizeRef.current.width;
    const tooltipHeight = tooltipSizeRef.current.height;
    
    // Estrategia de posicionamiento inteligente
    // Determinar si el tooltip debe estar a la izquierda o derecha del cursor
    if (cursorX > viewportWidth / 2) {
      // Cursor en la mitad derecha de la pantalla: mostrar tooltip a la izquierda
      x = Math.max(PADDING, cursorX - tooltipWidth - 10);
    } else {
      // Cursor en la mitad izquierda de la pantalla: mostrar tooltip a la derecha
      x = Math.min(viewportWidth - tooltipWidth - PADDING, cursorX + 10);
    }
    
    // Determinar si el tooltip debe estar arriba o abajo del cursor
    if (cursorY > viewportHeight / 2) {
      // Cursor en la mitad inferior de la pantalla: mostrar tooltip arriba
      y = Math.max(PADDING, cursorY - tooltipHeight - 10);
    } else {
      // Cursor en la mitad superior de la pantalla: mostrar tooltip abajo
      y = Math.min(viewportHeight - tooltipHeight - PADDING, cursorY + 10);
    }
    
    // Asegurar que el tooltip esté completamente visible
    // Ajuste horizontal final
    if (x + tooltipWidth > viewportWidth - PADDING) {
      x = viewportWidth - tooltipWidth - PADDING;
    }
    if (x < PADDING) {
      x = PADDING;
    }
    
    // Ajuste vertical final
    if (y + tooltipHeight > viewportHeight - PADDING) {
      y = viewportHeight - tooltipHeight - PADDING;
    }
    if (y < PADDING) {
      y = PADDING;
    }
    
    // Actualizar la posición
    setPosition({ x, y });
    
    // Marcamos el tooltip como listo después de posicionarlo
    if (!tooltipReady) {
      setTooltipReady(true);
    }
  };

  // Función para comprobar si el tooltip necesita scroll
  const checkIfNeedsScroll = () => {
    if (tooltipRef.current) {
      // Buscar el contenedor de items
      const itemsContainer = tooltipRef.current.querySelector('.custom-tooltip-items');
      
      // Verificar si el contenido del tooltip es más alto que el contenedor visible
      if (itemsContainer) {
        const contentHeight = itemsContainer.scrollHeight;
        const containerHeight = itemsContainer.clientHeight;
        const needsScrolling = contentHeight > containerHeight + 10;
        
        console.log('Necesita scroll:', needsScrolling, 'Altura contenido:', contentHeight, 'Altura contenedor:', containerHeight);
        setNeedsScroll(needsScrolling);
        
        // Asegurarse de que el contenedor tenga el scroll habilitado
        if (needsScrolling && itemsContainer instanceof HTMLElement) {
          itemsContainer.style.overflowY = 'auto';
        }
      }
    }
  };

  // Efecto para actualizar la posición basada en las coordenadas del mouse
  useEffect(() => {
    // Solo calculamos si está activo y tenemos coordenadas
    if ((active || forceKeepVisible) && coordinate) {
      calculateTooltipPosition();
      
      // Verificar si necesita scroll después de renderizar
      setTimeout(checkIfNeedsScroll, 100);
      
      // Revisar de nuevo después de un tiempo para asegurar que se ha renderizado todo
      setTimeout(() => {
        checkIfNeedsScroll();
        
        // Forzar actualización de estilo en caso de que sea necesario
        const itemsContainer = tooltipRef.current?.querySelector('.custom-tooltip-items');
        if (itemsContainer && itemsContainer instanceof HTMLElement) {
          itemsContainer.style.overflowY = 'auto';
          itemsContainer.style.maxHeight = '250px';
        }
      }, 300);
    }
    
    // Si se activa, forzamos la visualización por un corto periodo
    if (active && !forceDisplay) {
      setForceDisplay(true);
    }
  }, [active, coordinate, payload, forceKeepVisible]);

  // Manejador de entrada del mouse al tooltip
  const handleMouseEnter = () => {
    setIsHovering(true);
    setForceDisplay(true); // Forzar visualización al hacer hover
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  // Manejador de salida del mouse del tooltip
  const handleMouseLeave = () => {
    // Pequeña demora para permitir que el cursor se mueva al tooltip
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovering(false);
      
      // Solo desactivamos la visualización forzada si el tooltip ya no está activo
      if (!active) {
        setTimeout(() => {
          setForceDisplay(false);
        }, 500); // Aumentamos a 500ms para dar más tiempo
      }
    }, 500); // Aumentamos a 500ms para dar más tiempo para interactuar
  };

  // Manejador para el evento de scroll en el tooltip
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setForceDisplay(true);
    
    // Renovar el timer de forzado cuando hay scroll
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isHovering && !active) {
        setForceDisplay(false);
      }
    }, 2000); // Aumentamos a 2 segundos para dar más tiempo de interacción
  };

  // Manejador para evitar que el evento se propague y mantener el tooltip visible
  const handleTooltipInteraction = (e: React.MouseEvent) => {
    e.stopPropagation();
    setForceDisplay(true);
  };

  // Efecto para limpiar el timeout
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Efecto para mantener forzada la visualización por un tiempo después de que active cambie a false
  useEffect(() => {
    if (!active && forceDisplay && !isHovering) {
      const timer = setTimeout(() => {
        setForceDisplay(false);
      }, 1500); // Aumentamos a 1.5s para dar más tiempo
      
      return () => clearTimeout(timer);
    }
  }, [active, forceDisplay, isHovering]);

  // Si no está activo ni forzado y no hay datos, no mostrar nada
  if ((!active && !forceKeepVisible) || !payload || payload.length === 0 || !portalRef.current) {
    return null;
  }

  // Asegúrate de filtrar solo valores válidos para evitar errores en el cálculo
  const validPayload = payload.filter(entry => entry && typeof entry.value === 'number');
  
  // Calcular el total
  const total = validPayload.reduce((sum, entry) => sum + entry.value, 0);

  // Formatear la etiqueta (fecha)
  const formattedLabel = labelFormatter ? labelFormatter(label || '') : label;

  // Estilos para el tooltip fijo
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    top: position.y,
    left: position.x,
    zIndex: 9999,
    maxHeight: 'calc(100vh - 40px)',
    opacity: tooltipReady ? 1 : 0.01, // Empezar casi invisible hasta que esté listo
    pointerEvents: 'auto', // Siempre permitir interacción
    visibility: 'visible',
    transform: 'none',
    display: 'block',
    transition: 'opacity 0.2s ease-out, top 0.2s, left 0.2s', // Transición suave de opacidad
    overflowY: 'hidden', // Movemos el scroll a los items, no a todo el tooltip
    maxWidth: '300px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
    borderRadius: '6px',
    border: '1px solid rgba(0, 0, 0, 0.08)'
  };

  // Estilos para las diferentes secciones del tooltip
  const headerStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    backgroundColor: 'white',
    zIndex: 1,
    borderBottom: needsScroll ? '1px solid #eee' : 'none',
    paddingBottom: '8px'
  };

  const totalStyle: React.CSSProperties = {
    position: 'sticky',
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 1,
    borderTop: needsScroll ? '1px solid #eee' : 'none',
    paddingTop: '8px',
    marginTop: '8px'
  };

  // Estilos para los items dentro del tooltip
  const itemsContainerStyle: React.CSSProperties = {
    maxHeight: '250px',
    overflowY: 'auto', 
    overflowX: 'hidden',
    display: 'block',
    width: '100%',
    paddingRight: '4px', // Siempre dejamos espacio para el scrollbar
    position: 'relative'
  };

  // Indicador de scroll cuando hay muchos items
  const scrollIndicator = needsScroll && (
    <div className="scroll-indicator" style={{
      position: 'absolute',
      bottom: '0',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '30px',
      height: '15px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: '10px 10px 0 0',
      fontSize: '12px',
      color: '#666',
      boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.1)',
      zIndex: 2
    }}>
      <span style={{ marginBottom: '-2px' }}>⌄</span>
    </div>
  );

  // Utilizar un portal para renderizar el tooltip directamente en el body
  return ReactDOM.createPortal(
    <div 
      className="custom-tooltip" 
      ref={tooltipRef}
      style={tooltipStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleTooltipInteraction}
      onClick={handleTooltipInteraction}
      onWheel={handleTooltipInteraction}
    >
      <div className="custom-tooltip-header" style={headerStyle}>
        <h3 className="custom-tooltip-title">{formattedLabel}</h3>
      </div>
      
      <div 
        className="custom-tooltip-items" 
        style={itemsContainerStyle}
        onScroll={handleScroll}
      >
        <div className="custom-tooltip-scrollable-content">
          {validPayload.map((entry, index) => (
            <div key={`tooltip-item-${index}-${entry.name}`} className="custom-tooltip-item">
              <div className="custom-tooltip-label">
                <span 
                  className="custom-tooltip-color"
                  style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }}
                ></span>
                <span className="custom-tooltip-text">{entry.name}</span>
              </div>
              <span className="custom-tooltip-value">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
        {needsScroll && scrollIndicator}
      </div>
      
      <div className="custom-tooltip-total" style={totalStyle}>
        <span className="custom-tooltip-total-text">
          Total: {formatCurrency(total)}
        </span>
      </div>
    </div>,
    portalRef.current
  );
};

export default CustomTooltip; 