# Capital One Dashboard

Dashboard para visualización de datos de gasto publicitario utilizando React, Recharts y CSV.

## Características

- Visualización de datos de series temporales
- Análisis por categorías de audiencia
- Actualización automática al reemplazar archivos CSV
- Interfaz responsive y moderna
- Preparado para despliegue en Vercel

## Estructura del proyecto

- `/public/data/`: Archivos CSV con los datos para las gráficas
- `/src/components/`: Componentes React para el dashboard
- `/src/utils/`: Utilidades para procesar datos CSV

## Actualizando datos

Para actualizar los datos visualizados, simplemente reemplace los archivos CSV en la carpeta `/public/data/` manteniendo el mismo formato y estructura de columnas.

### Archivos CSV disponibles:

- `brandLeafData.csv`: Datos de gasto por marca
- `deviceData.csv`: Datos de gasto por dispositivo
- `categoryData.csv`: Datos de gasto por categoría
- `publisherData.csv`: Datos de gasto por publicador
- `audienceCategoryData.csv`: Datos de categorías de audiencia
- `audienceTimeSeriesData.csv`: Datos de series temporales por audiencia

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Despliegue en Vercel

Este proyecto está configurado para despliegue automático en Vercel. Simplemente enlace su repositorio con Vercel y se desplegará automáticamente.
#   c a p i t a l _ o n e 
 
 