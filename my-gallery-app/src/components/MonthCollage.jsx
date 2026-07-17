import React, { useState, useEffect } from 'react';
import './MonthCollage.css';

const MonthCollage = ({ images, monthName }) => {
  const [loadedImages, setLoadedImages] = useState([]);

  useEffect(() => {
    setLoadedImages([]);
    
    images.forEach((src, index) => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => [...prev, index]);
      };
      img.onerror = () => {
        setLoadedImages(prev => [...prev, index]);
      };
      img.src = src;
    });
  }, [images]);

  const displayImages = images.slice(0, 20);

  const getPosition = (index) => {
    const seed = index * 9301 + 49297;
    const random = (seed % 233280) / 233280;
    
    let left = 5 + random * 90;
    let top = 5 + ((random * 7 + 13) % 233280) / 233280 * 90;
    
    const rotation = (random * 360 - 180);
    const size = 0.5 + random * 0.8;
    const delay = random * 0.8;
    const duration = 4 + random * 4;
    const amplitude = 8 + random * 12;
    
    return { left, top, rotation, size, delay, duration, amplitude };
  };

  return (
    <div className="month-collage floating-container">
      {displayImages.map((src, index) => {
        const pos = getPosition(index);
        const isLoaded = loadedImages.includes(index);
        
        return (
          <div
            key={index}
            className={`floating-image-item ${isLoaded ? 'loaded' : ''}`}
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              transform: `rotate(${pos.rotation}deg) scale(${pos.size})`,
              animationDelay: `${pos.delay}s`,
              animationDuration: `${pos.duration}s`,
              '--float-amplitude': `${pos.amplitude}px`,
              zIndex: Math.floor(pos.top)
            }}
          >
            <img 
              src={src} 
              alt={`${monthName} - Photo ${index + 1}`}
              className="floating-img"
              loading="lazy"
              onError={(e) => {
                console.log('Failed to load:', src);
                e.target.style.display = 'none';
              }}
            />
            {isLoaded && (
              <div className="image-overlay">
                <span className="photo-number">#{index + 1}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MonthCollage;