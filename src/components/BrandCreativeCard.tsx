import React from 'react';
import './BrandCreativeCard.css';

interface BrandCreativeCardProps {
  brand: string;
  date: string;
  link: string;
  rank: number;
  spend: number;
  onMediaError?: (e: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement>) => void;
}

const BrandCreativeCard: React.FC<BrandCreativeCardProps> = ({ 
  brand, 
  link, 
  rank,
  spend,
  onMediaError 
}) => {
  // Determinar si el enlace es un video
  const isVideo = /\.mp4($|\?)/i.test(link) || /x-ad-assets.*\/media_asset.*\/media(\?|$)/i.test(link);
  
  // Formatear moneda
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  
  // Manejar error de carga de medios
  const handleMediaError = (e: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement>) => {
    if (onMediaError) {
      onMediaError(e);
    } else {
      const el = e.currentTarget as HTMLImageElement & HTMLVideoElement;
      el.onerror = null;
      if (el.tagName === 'IMG') el.src = '/img/placeholder.svg';
      else if (el.tagName === 'VIDEO') {
        el.poster = '/img/placeholder.svg';
        el.controls = false;
      }
    }
  };
  
  // Abrir enlace en nueva pestaña
  const openMediaInNewTab = () => {
    window.open(link, '_blank');
  };
  
  return (
    <div className="brand-creative-container">
      <div className="brand-creative-info">
        <h3 className="brand-title">{brand}</h3>
        <div className="brand-rank-badge">Ranking #{rank}</div>
        <div className="brand-spend">{formatCurrency(spend)}</div>
      </div>
      
      <div className="brand-creative-media" onClick={openMediaInNewTab}>
        {!isVideo ? (
          <img
            src={link}
            alt={`${brand} creative #${rank}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={handleMediaError}
            className="clickable-media"
          />
        ) : (
          <video
            src={link}
            muted
            loop
            autoPlay
            playsInline
            onError={handleMediaError}
            className="clickable-media"
          />
        )}
      </div>
    </div>
  );
};

export default BrandCreativeCard; 