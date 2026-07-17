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

  // Simpler position generation that forces spread
  const getPosition = (index) => {
    // Use index to create deterministic but spread-out positions
    const angle = (index * 137.508) % 360; // Golden angle for even distribution
    const radius = 15 + (index % 5) * 8; // Different distances from center
    
    // Convert to cartesian coordinates
    const rad = angle * Math.PI / 180;
    const centerX = 50;
    const centerY = 45;
    
    let left = centerX + Math.cos(rad) * radius;
    let top = centerY + Math.sin(rad) * radius;
    
    // Clamp to edges (keep 5% from edges)
    left = Math.max(5, Math.min(95, left));
    top = Math.max(5, Math.min(95, top));
    
    // Add some randomness to each position
    const seed = index * 9301 + 49297;
    const random = (seed % 233280) / 233280;
    left += (random - 0.5) * 15;
    top += ((random * 7 + 13) % 233280) / 233280 * 15 - 7.5;
    
    // Clamp again
    left = Math.max(5, Math.min(95, left));
    top = Math.max(5, Math.min(95, top));
    
    const rotation = (index * 37 + 13) % 360 - 180;
    const size = 0.5 + (index % 7) / 10;
    const delay = (index % 8) / 10;
    const duration = 4 + (index % 5);
    const amplitude = 8 + (index % 6) * 2;
    
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
            />
          </div>
        );
      })}
    </div>
  );
};

export default MonthCollage;