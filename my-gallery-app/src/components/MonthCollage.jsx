import React, { useState, useEffect } from 'react';
import './MonthCollage.css';

const MonthCollage = ({ images, monthName }) => {
  const [loadedImages, setLoadedImages] = useState([]);

  useEffect(() => {
    setLoadedImages([]);
    
    // Preload images
    images.forEach((src, index) => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => [...prev, index]);
      };
      img.onerror = () => {
        // Still mark as loaded to show placeholder
        setLoadedImages(prev => [...prev, index]);
      };
      img.src = src;
    });
  }, [images]);

  // Take first 12 images for collage (4x3 grid)
  const collageImages = images.slice(0, 12);
  
  // If fewer than 12, show placeholder cards
  while (collageImages.length < 12) {
    collageImages.push(null);
  }

  return (
    <div className="collage-grid">
      {collageImages.map((src, index) => (
        <div key={index} className="collage-item">
          {src ? (
            <img 
              src={src} 
              alt={`${monthName} - Photo ${index + 1}`}
              className={`collage-image ${loadedImages.includes(index) ? 'loaded' : ''}`}
              loading="lazy"
            />
          ) : (
            <div className="collage-placeholder">📷</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MonthCollage;