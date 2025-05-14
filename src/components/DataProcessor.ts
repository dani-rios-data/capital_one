import Papa from 'papaparse';

// Interfaz para los datos procesados
interface ProcessedData {
  audience: any[];
  publisher: any[];
  device: any[];
  category: any[];
  brandLeaf: any[];
}

// Clase que maneja el procesamiento de los datos CSV
class DataProcessor {
  private static instance: DataProcessor;
  private data: ProcessedData = {
    audience: [],
    publisher: [],
    device: [],
    category: [],
    brandLeaf: []
  };
  private isLoaded: boolean = false;
  private loadingPromise: Promise<void> | null = null;

  private constructor() {}

  // Patrón singleton para asegurar que solo hay una instancia
  public static getInstance(): DataProcessor {
    if (!DataProcessor.instance) {
      DataProcessor.instance = new DataProcessor();
    }
    return DataProcessor.instance;
  }

  // Carga todos los archivos CSV
  public async loadAllData(): Promise<void> {
    if (this.isLoaded) {
      return Promise.resolve();
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = new Promise<void>((resolve, reject) => {
      Promise.all([
        this.loadCSV('/data/top3_by_audience_macro.csv'),
        this.loadCSV('/data/top3_by_publisher.csv'),
        this.loadCSV('/data/top3_by_device.csv'),
        this.loadCSV('/data/top3_by_category.csv'),
        this.loadCSV('/data/top3_by_brand_leaf.csv'),
        this.loadCSV('/data/capital_one_publisher.csv'),
        this.loadCSV('/data/capital_one_device.csv'),
        this.loadCSV('/data/capital_one_category.csv'),
        this.loadCSV('/data/capital_one_brand_leaf.csv'),
        this.loadCSV('/data/capital_one_audience_category.csv')
      ])
        .then(([
          audienceData,
          publisherData,
          deviceData,
          categoryData,
          brandLeafData,
          capitalOnePublisher,
          capitalOneDevice,
          capitalOneCategory,
          capitalOneBrandLeaf,
          capitalOneAudience
        ]) => {
          // Combinar todos los datos relacionados por tipo
          this.data.audience = [...audienceData, ...capitalOneAudience];
          this.data.publisher = [...publisherData, ...capitalOnePublisher];
          this.data.device = [...deviceData, ...capitalOneDevice];
          this.data.category = [...categoryData, ...capitalOneCategory];
          this.data.brandLeaf = [...brandLeafData, ...capitalOneBrandLeaf];
          
          this.isLoaded = true;
          resolve();
        })
        .catch(error => {
          console.error('Error loading CSV data:', error);
          reject(error);
        });
    });

    return this.loadingPromise;
  }

  // Cargar un archivo CSV específico
  private async loadCSV(filePath: string): Promise<any[]> {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filePath}: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      
      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(results.data);
          },
          error: (error) => {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error(`Error loading ${filePath}:`, error);
      return [];
    }
  }

  // Devuelve todos los datos cargados
  public getAllData(): ProcessedData {
    if (!this.isLoaded) {
      console.warn('Data not loaded yet. Call loadAllData() first.');
      return this.data;
    }
    return this.data;
  }

  // Obtener datos por tipo
  public getDataByType(type: keyof ProcessedData): any[] {
    if (!this.isLoaded) {
      console.warn('Data not loaded yet. Call loadAllData() first.');
      return [];
    }
    return this.data[type] || [];
  }

  // Buscar datos según filtros
  public searchData(query: string): any[] {
    const results: any[] = [];
    const lowerQuery = query.toLowerCase();
    
    // Busca en todas las categorías de datos
    Object.entries(this.data).forEach(([key, dataArray]) => {
      const matchingItems = dataArray.filter((item: any) => {
        return Object.values(item).some(value => {
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(lowerQuery);
        });
      });
      
      results.push(...matchingItems.map(item => ({ ...item, dataType: key })));
    });
    
    return results;
  }

  // Obtener estadísticas resumidas por tipo
  public getStatsByType(type: keyof ProcessedData): any {
    if (!this.isLoaded) {
      console.warn('Data not loaded yet. Call loadAllData() first.');
      return {};
    }

    const data = this.data[type];
    if (!data || data.length === 0) return {};

    const stats: any = {
      count: data.length,
      fields: Object.keys(data[0] || {})
    };

    // Si hay campos numéricos, podemos calcular estadísticas adicionales
    if (data.length > 0) {
      const numericFields = Object.entries(data[0])
        .filter(([_, value]) => !isNaN(Number(value)))
        .map(([key, _]) => key);

      if (numericFields.length > 0) {
        stats.numericStats = {};
        
        numericFields.forEach(field => {
          const values = data
            .map(item => parseFloat(item[field]))
            .filter(val => !isNaN(val));
          
          if (values.length > 0) {
            stats.numericStats[field] = {
              min: Math.min(...values),
              max: Math.max(...values),
              avg: values.reduce((sum, val) => sum + val, 0) / values.length,
              sum: values.reduce((sum, val) => sum + val, 0)
            };
          }
        });
      }
    }

    return stats;
  }
}

export default DataProcessor; 