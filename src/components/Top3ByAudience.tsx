import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { loadCSV } from '../utils/csvUtils';
import ChartCard from './common/ChartCard';
import BrandCreativeCard from './BrandCreativeCard';
import './Top3ByAudience.css'; // Importar el archivo CSS

interface Top3Item {
  audience: string;
  date: string;
  link: string;
  spend: number;
}

interface AudienceData {
  [audience: string]: Top3Item[];
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
  audiences: string[];
  selectedDate: string;
  selectedAudience: string;
  onDateChange: (date: string) => void;
  onAudienceChange: (audience: string) => void;
}

const FilterSelectors: React.FC<FilterSelectorsProps> = ({
  dates,
  audiences,
  selectedDate,
  selectedAudience,
  onDateChange,
  onAudienceChange
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
        
        {/* Audience selector */}
        <div style={{ flex: '1 1 300px' }}>
          <label 
            htmlFor="audience-select" 
            style={{ 
              display: 'block', 
              fontWeight: '500', 
              color: '#2c4282', 
              marginBottom: '8px' 
            }}
          >
            Audience Segment
          </label>
          <select
            id="audience-select"
            value={selectedAudience}
            onChange={(e) => onAudienceChange(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px 16px', 
              borderRadius: '6px', 
              border: '1px solid #e5e7eb', 
              backgroundColor: 'white', 
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' 
            }}
          >
            {audiences.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────── Main Component ────
const Top3ByAudience: React.FC<{ csvPath?: string }> = ({ csvPath = '/data/top3_by_audience_macro.csv' }) => {
  const [audienceData, setAudienceData] = useState<AudienceData>({});
  const [allAudiences, setAllAudiences] = useState<string[]>([]);
  const [allDates, setAllDates] = useState<string[]>([]);
  const [selectedAudience, setSelectedAudience] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // ─── Fetch CSV ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setStatus('loading');
      try {
        const raw = await loadCSV(csvPath);
        const map: AudienceData = {};
        const dateSet = new Set<string>();

        raw.forEach((row) => {
          const audience = (row.audience_macro || '').toString().trim();
          const date = (row.Date || '').toString().trim();
          const link = normaliseLink(row.Link_to_Creative as string);
          const spend = Number(row.Spend_USD) || 0;
          if (!audience || !date || !link || !spend) return;
          dateSet.add(date);
          map[audience] ??= [];
          map[audience].push({ audience, date, link, spend });
        });

        const uniqueDates = [...dateSet].sort((a, b) => b.localeCompare(a));
        const sortedAudiences = Object.keys(map).sort();
        const topSpender = sortedAudiences.reduce(
          (prev, a) => {
            const total = map[a].reduce((s, i) => s + i.spend, 0);
            return total > prev.max ? { max: total, audience: a } : prev;
          },
          { max: 0, audience: '' },
        ).audience;

        setAudienceData(map);
        setAllAudiences(sortedAudiences);
        setAllDates(uniqueDates);
        setSelectedDate(uniqueDates[0] ?? '');
        setSelectedAudience(topSpender || sortedAudiences[0] || '');
        setStatus('idle');
      } catch (err) {
        console.error(err);
        setErrorMsg('Error loading data – please try again later.');
        setStatus('error');
      }
    })();
  }, [csvPath]);

  // ─── Filtrar opciones relevantes para los selectores ─────────────────────
  const availableAudiences = useMemo(() => {
    if (!selectedDate || !audienceData) return allAudiences;
    
    // Filtrar audiencias que tienen datos para la fecha seleccionada
    return allAudiences.filter(audience => 
      audienceData[audience]?.some(item => item.date === selectedDate)
    );
  }, [allAudiences, audienceData, selectedDate]);

  const availableDates = useMemo(() => {
    if (!selectedAudience || !audienceData[selectedAudience]) return allDates;
    
    // Filtrar fechas que tienen datos para la audiencia seleccionada
    const datesForAudience = new Set(
      audienceData[selectedAudience].map(item => item.date)
    );
    
    return allDates.filter(date => datesForAudience.has(date));
  }, [allDates, audienceData, selectedAudience]);

  // Asegurar que las selecciones son válidas después de filtrar
  useEffect(() => {
    // Si la audiencia seleccionada no está disponible para la fecha actual, seleccionar la primera disponible
    if (availableAudiences.length > 0 && !availableAudiences.includes(selectedAudience)) {
      setSelectedAudience(availableAudiences[0]);
    }
  }, [availableAudiences, selectedAudience]);

  useEffect(() => {
    // Si la fecha seleccionada no está disponible para la audiencia actual, seleccionar la primera disponible
    if (availableDates.length > 0 && !availableDates.includes(selectedDate)) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  // ─── Derived: Top‑3 para audiencia/fecha ────────────────────────────────────
  const top3 = useMemo<Top3Item[]>(() => {
    if (!selectedAudience || !selectedDate) return [];
    return (
      audienceData[selectedAudience]?.
        filter((i) => i.date === selectedDate)
        .sort((a, b) => b.spend - a.spend)
        .slice(0, 3) ?? []
    );
  }, [audienceData, selectedAudience, selectedDate]);

  // Manejadores de cambio que verifican si la selección es válida
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    
    // Si al cambiar la fecha, la audiencia actual ya no es válida, actualizar a una válida
    const audiencesForDate = allAudiences.filter(audience => 
      audienceData[audience]?.some(item => item.date === date)
    );
    
    if (!audiencesForDate.includes(selectedAudience) && audiencesForDate.length > 0) {
      setSelectedAudience(audiencesForDate[0]);
    }
  };
  
  const handleAudienceChange = (audience: string) => {
    setSelectedAudience(audience);
    
    // Si al cambiar la audiencia, la fecha actual ya no es válida, actualizar a una válida
    if (audienceData[audience]) {
      const datesForAudience = new Set(
        audienceData[audience].map(item => item.date)
      );
      
      if (!datesForAudience.has(selectedDate) && audienceData[audience].length > 0) {
        // Ordenar las fechas para seleccionar la más reciente
        const sortedDates = Array.from(datesForAudience).sort((a, b) => b.localeCompare(a));
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
    <ChartCard title="Top Creatives by Audience Segment">
      {/* Filtros como componente separado */}
      <div className="mb-6">
        <FilterSelectors
          dates={availableDates}
          audiences={availableAudiences}
          selectedDate={selectedDate}
          selectedAudience={selectedAudience}
          onDateChange={handleDateChange}
          onAudienceChange={handleAudienceChange}
        />
      </div>

      {/* Badges de fecha y audiencia */}
      <div className="badges-container">
        <span className="date-badge">
          {formatDate(selectedDate)}
        </span>
        <span className="badges-separator">•</span>
        <span className="audience-badge">
          {selectedAudience}
        </span>
      </div>

      {/* Gallery */}
      {top3.length ? (
        <div className="horizontal-gallery-container">
          <div className="cards-row">
            {top3.map((item, idx) => (
              <BrandCreativeCard
                key={`${item.audience}-${idx}`}
                brand={item.audience}
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
          <p className="empty-result-text">No creatives found for the selected audience segment and date.</p>
        </div>
      )}
    </ChartCard>
  );
};

export default Top3ByAudience; 