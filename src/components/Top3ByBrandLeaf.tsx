import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { loadCSV } from '../utils/csvUtils';
import ChartCard from './common/ChartCard';
import BrandCreativeCard from './BrandCreativeCard';
import './Top3ByBrandLeaf.css'; // Importar el archivo CSS

interface Top3Item {
  brand: string;
  date: string;
  link: string;
  spend: number;
}

interface BrandData {
  [brand: string]: Top3Item[];
}

// ───────────────────────────────────────────────────────────── Helpers ────
const normaliseLink = (raw: string): string => {
  if (!raw) return '';
  let url = raw.trim();
  url = url.replace(/\s/g, '%20');
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return url;
};

const formatDate = (yyyymm: string) => {
  const [year, month] = yyyymm.split('-');
  if (!year || !month) return yyyymm;
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
    new Date(`${year}-${month}-01T00:00:00`),
  );
};

// ────────────────────────────────────────── Selector Component ────
interface FilterSelectorsProps {
  dates: string[];
  brands: string[];
  selectedDate: string;
  selectedBrand: string;
  onDateChange: (date: string) => void;
  onBrandChange: (brand: string) => void;
}

const FilterSelectors: React.FC<FilterSelectorsProps> = ({
  dates,
  brands,
  selectedDate,
  selectedBrand,
  onDateChange,
  onBrandChange
}) => {
  return (
    <div style={{ 
      backgroundColor: '#f0f4ff', 
      borderRadius: '8px', 
      padding: '20px', 
      marginBottom: '24px' 
    }}>
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '20px' 
      }}>
        {/* Date selector */}
        <div style={{ flex: '1 1 200px' }}>
          <label 
            htmlFor="date-select" 
            style={{ 
              display: 'block', 
              fontWeight: '500', 
              color: '#2c4282', 
              marginBottom: '8px' 
            }}
          >
            Date
          </label>
          <select
            id="date-select"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px 16px', 
              borderRadius: '6px', 
              border: '1px solid #e5e7eb', 
              backgroundColor: 'white', 
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' 
            }}
          >
            {dates.map((d) => (
              <option key={d} value={d}>
                {formatDate(d)}
              </option>
            ))}
          </select>
        </div>
        
        {/* Brand Leaf selector */}
        <div style={{ flex: '1 1 300px' }}>
          <label 
            htmlFor="brand-select" 
            style={{ 
              display: 'block', 
              fontWeight: '500', 
              color: '#2c4282', 
              marginBottom: '8px' 
            }}
          >
            Brand leaf
          </label>
          <select
            id="brand-select"
            value={selectedBrand}
            onChange={(e) => onBrandChange(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px 16px', 
              borderRadius: '6px', 
              border: '1px solid #e5e7eb', 
              backgroundColor: 'white', 
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' 
            }}
          >
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────── Main Component ────
const Top3ByBrandLeaf: React.FC<{ csvPath?: string }> = ({ csvPath = '/data/top3_by_brand_leaf.csv' }) => {
  const [brandData, setBrandData] = useState<BrandData>({});
  const [allBrands, setAllBrands] = useState<string[]>([]);
  const [allDates, setAllDates] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // ─── Fetch CSV ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setStatus('loading');
      try {
        const raw = await loadCSV(csvPath);
        const map: BrandData = {};
        const dateSet = new Set<string>();

        raw.forEach((row) => {
          const brand = (row.Brand_Leaf || row['Brand (Leaf)'] || '').toString().trim();
          const date = (row.Date || '').toString().trim();
          const link = normaliseLink(row.Link_to_Creative as string);
          const spend = Number(row.Spend_USD) || 0;
          if (!brand || !date || !link || !spend) return;
          dateSet.add(date);
          map[brand] ??= [];
          map[brand].push({ brand, date, link, spend });
        });

        const uniqueDates = [...dateSet].sort((a, b) => b.localeCompare(a));
        const sortedBrands = Object.keys(map).sort();
        const topSpender = sortedBrands.reduce(
          (prev, b) => {
            const total = map[b].reduce((s, i) => s + i.spend, 0);
            return total > prev.max ? { max: total, brand: b } : prev;
          },
          { max: 0, brand: '' },
        ).brand;

        setBrandData(map);
        setAllBrands(sortedBrands);
        setAllDates(uniqueDates);
        setSelectedDate(uniqueDates[0] ?? '');
        setSelectedBrand(topSpender || sortedBrands[0] || '');
        setStatus('idle');
      } catch (err) {
        console.error(err);
        setErrorMsg('Error loading data – please try again later.');
        setStatus('error');
      }
    })();
  }, [csvPath]);

  // ─── Filtrar opciones relevantes para los selectores ─────────────────────
  const availableBrands = useMemo(() => {
    if (!selectedDate || !brandData) return allBrands;
    
    // Filtrar marcas que tienen datos para la fecha seleccionada
    return allBrands.filter(brand => 
      brandData[brand]?.some(item => item.date === selectedDate)
    );
  }, [allBrands, brandData, selectedDate]);

  const availableDates = useMemo(() => {
    if (!selectedBrand || !brandData[selectedBrand]) return allDates;
    
    // Filtrar fechas que tienen datos para la marca seleccionada
    const datesForBrand = new Set(
      brandData[selectedBrand].map(item => item.date)
    );
    
    return allDates.filter(date => datesForBrand.has(date));
  }, [allDates, brandData, selectedBrand]);

  // Asegurar que las selecciones son válidas después de filtrar
  useEffect(() => {
    // Si la marca seleccionada no está disponible para la fecha actual, seleccionar la primera disponible
    if (availableBrands.length > 0 && !availableBrands.includes(selectedBrand)) {
      setSelectedBrand(availableBrands[0]);
    }
  }, [availableBrands, selectedBrand]);

  useEffect(() => {
    // Si la fecha seleccionada no está disponible para la marca actual, seleccionar la primera disponible
    if (availableDates.length > 0 && !availableDates.includes(selectedDate)) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  // ─── Derived: Top‑3 para marca/fecha ────────────────────────────────────
  const top3 = useMemo<Top3Item[]>(() => {
    if (!selectedBrand || !selectedDate) return [];
    return (
      brandData[selectedBrand]?.
        filter((i) => i.date === selectedDate)
        .sort((a, b) => b.spend - a.spend)
        .slice(0, 3) ?? []
    );
  }, [brandData, selectedBrand, selectedDate]);

  // Manejadores de cambio que verifican si la selección es válida
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    
    // Si al cambiar la fecha, la marca actual ya no es válida, actualizar a una válida
    const brandsForDate = allBrands.filter(brand => 
      brandData[brand]?.some(item => item.date === date)
    );
    
    if (!brandsForDate.includes(selectedBrand) && brandsForDate.length > 0) {
      setSelectedBrand(brandsForDate[0]);
    }
  };
  
  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    
    // Si al cambiar la marca, la fecha actual ya no es válida, actualizar a una válida
    if (brandData[brand]) {
      const datesForBrand = new Set(
        brandData[brand].map(item => item.date)
      );
      
      if (!datesForBrand.has(selectedDate) && brandData[brand].length > 0) {
        // Ordenar las fechas para seleccionar la más reciente
        const sortedDates = Array.from(datesForBrand).sort((a, b) => b.localeCompare(a));
        setSelectedDate(sortedDates[0]);
      }
    }
  };

  // ─── Img / Video fallback ───────────────────────────────────────────────
  const handleMediaError = useCallback((e: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement>) => {
    const el = e.currentTarget as HTMLImageElement & HTMLVideoElement;
    el.onerror = null;
    if (el.tagName === 'IMG') el.src = '/img/placeholder.svg';
    else if (el.tagName === 'VIDEO') {
      el.poster = '/img/placeholder.svg';
      el.controls = false;
    }
  }, []);

  // ─── Render ─────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-700" />
      </div>
    );
  }

  if (status === 'error') {
    return <div className="rounded bg-red-100 px-4 py-3 text-red-700">{errorMsg}</div>;
  }

  return (
    <ChartCard title="Top Creatives by Brand Investment">
      {/* Filtros como componente separado */}
      <div className="mb-6">
        <FilterSelectors
          dates={availableDates}
          brands={availableBrands}
          selectedDate={selectedDate}
          selectedBrand={selectedBrand}
          onDateChange={handleDateChange}
          onBrandChange={handleBrandChange}
        />
      </div>

      {/* Badges de fecha y marca */}
      <div className="badges-container">
        <span className="date-badge">
          {formatDate(selectedDate)}
        </span>
        <span className="badges-separator">•</span>
        <span className="brand-badge">
          {selectedBrand}
        </span>
      </div>

      {/* Gallery */}
      {top3.length ? (
        <div className="horizontal-gallery-container">
          <div className="cards-row">
            {top3.map((item, idx) => (
              <BrandCreativeCard
                key={`${item.brand}-${idx}`}
                brand={item.brand}
                date={item.date}
                link={item.link}
                rank={idx + 1}
                spend={item.spend}
                onMediaError={handleMediaError}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-result-container">
          <div className="empty-result-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="empty-result-text">No creatives found for the selected brand and date.</p>
        </div>
      )}
    </ChartCard>
  );
};

export default Top3ByBrandLeaf; 