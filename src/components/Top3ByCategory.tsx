import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { loadCSV } from '../utils/csvUtils';
import ChartCard from './common/ChartCard';
import BrandCreativeCard from './BrandCreativeCard';
import './Top3ByCategory.css'; // Importar el archivo CSS

interface Top3Item {
  category: string;
  date: string;
  link: string;
  spend: number;
}

interface CategoryData {
  [category: string]: Top3Item[];
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
  categories: string[];
  selectedDate: string;
  selectedCategory: string;
  onDateChange: (date: string) => void;
  onCategoryChange: (category: string) => void;
}

const FilterSelectors: React.FC<FilterSelectorsProps> = ({
  dates,
  categories,
  selectedDate,
  selectedCategory,
  onDateChange,
  onCategoryChange
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
        
        {/* Category selector */}
        <div style={{ flex: '1 1 300px' }}>
          <label 
            htmlFor="category-select" 
            style={{ 
              display: 'block', 
              fontWeight: '500', 
              color: '#2c4282', 
              marginBottom: '8px' 
            }}
          >
            Product Category
          </label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px 16px', 
              borderRadius: '6px', 
              border: '1px solid #e5e7eb', 
              backgroundColor: 'white', 
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' 
            }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────── Main Component ────
const Top3ByCategory: React.FC<{ csvPath?: string }> = ({ csvPath = '/data/top3_by_category.csv' }) => {
  const [categoryData, setCategoryData] = useState<CategoryData>({});
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allDates, setAllDates] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // ─── Fetch CSV ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setStatus('loading');
      try {
        const raw = await loadCSV(csvPath);
        const map: CategoryData = {};
        const dateSet = new Set<string>();

        raw.forEach((row) => {
          const category = (row.Category_Level_8 || '').toString().trim();
          const date = (row.Date || '').toString().trim();
          const link = normaliseLink(row.Link_to_Creative as string);
          const spend = Number(row.Spend_USD) || 0;
          if (!category || !date || !link || !spend) return;
          dateSet.add(date);
          map[category] ??= [];
          map[category].push({ category, date, link, spend });
        });

        const uniqueDates = [...dateSet].sort((a, b) => b.localeCompare(a));
        const sortedCategories = Object.keys(map).sort();
        const topSpender = sortedCategories.reduce(
          (prev, c) => {
            const total = map[c].reduce((s, i) => s + i.spend, 0);
            return total > prev.max ? { max: total, category: c } : prev;
          },
          { max: 0, category: '' },
        ).category;

        setCategoryData(map);
        setAllCategories(sortedCategories);
        setAllDates(uniqueDates);
        setSelectedDate(uniqueDates[0] ?? '');
        setSelectedCategory(topSpender || sortedCategories[0] || '');
        setStatus('idle');
      } catch (err) {
        console.error(err);
        setErrorMsg('Error loading data – please try again later.');
        setStatus('error');
      }
    })();
  }, [csvPath]);

  // ─── Filtrar opciones relevantes para los selectores ─────────────────────
  const availableCategories = useMemo(() => {
    if (!selectedDate || !categoryData) return allCategories;
    
    // Filtrar categorías que tienen datos para la fecha seleccionada
    return allCategories.filter(category => 
      categoryData[category]?.some(item => item.date === selectedDate)
    );
  }, [allCategories, categoryData, selectedDate]);

  const availableDates = useMemo(() => {
    if (!selectedCategory || !categoryData[selectedCategory]) return allDates;
    
    // Filtrar fechas que tienen datos para la categoría seleccionada
    const datesForCategory = new Set(
      categoryData[selectedCategory].map(item => item.date)
    );
    
    return allDates.filter(date => datesForCategory.has(date));
  }, [allDates, categoryData, selectedCategory]);

  // Asegurar que las selecciones son válidas después de filtrar
  useEffect(() => {
    // Si la categoría seleccionada no está disponible para la fecha actual, seleccionar la primera disponible
    if (availableCategories.length > 0 && !availableCategories.includes(selectedCategory)) {
      setSelectedCategory(availableCategories[0]);
    }
  }, [availableCategories, selectedCategory]);

  useEffect(() => {
    // Si la fecha seleccionada no está disponible para la categoría actual, seleccionar la primera disponible
    if (availableDates.length > 0 && !availableDates.includes(selectedDate)) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  // ─── Derived: Top‑3 para categoría/fecha ────────────────────────────────────
  const top3 = useMemo<Top3Item[]>(() => {
    if (!selectedCategory || !selectedDate) return [];
    return (
      categoryData[selectedCategory]?.
        filter((i) => i.date === selectedDate)
        .sort((a, b) => b.spend - a.spend)
        .slice(0, 3) ?? []
    );
  }, [categoryData, selectedCategory, selectedDate]);

  // Manejadores de cambio que verifican si la selección es válida
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    
    // Si al cambiar la fecha, la categoría actual ya no es válida, actualizar a una válida
    const categoriesForDate = allCategories.filter(category => 
      categoryData[category]?.some(item => item.date === date)
    );
    
    if (!categoriesForDate.includes(selectedCategory) && categoriesForDate.length > 0) {
      setSelectedCategory(categoriesForDate[0]);
    }
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    
    // Si al cambiar la categoría, la fecha actual ya no es válida, actualizar a una válida
    if (categoryData[category]) {
      const datesForCategory = new Set(
        categoryData[category].map(item => item.date)
      );
      
      if (!datesForCategory.has(selectedDate) && categoryData[category].length > 0) {
        // Ordenar las fechas para seleccionar la más reciente
        const sortedDates = Array.from(datesForCategory).sort((a, b) => b.localeCompare(a));
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
    <ChartCard title="Top Creatives by Product Category">
      {/* Filtros como componente separado */}
      <div className="mb-6">
        <FilterSelectors
          dates={availableDates}
          categories={availableCategories}
          selectedDate={selectedDate}
          selectedCategory={selectedCategory}
          onDateChange={handleDateChange}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {/* Badges de fecha y categoría */}
      <div className="badges-container">
        <span className="date-badge">
          {formatDate(selectedDate)}
        </span>
        <span className="badges-separator">•</span>
        <span className="category-badge">
          {selectedCategory}
        </span>
      </div>

      {/* Gallery */}
      {top3.length ? (
        <div className="horizontal-gallery-container">
          <div className="cards-row">
            {top3.map((item, idx) => (
              <BrandCreativeCard
                key={`${item.category}-${idx}`}
                brand={item.category}
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
          <p className="empty-result-text">No creatives found for the selected product category and date.</p>
        </div>
      )}
    </ChartCard>
  );
};

export default Top3ByCategory; 