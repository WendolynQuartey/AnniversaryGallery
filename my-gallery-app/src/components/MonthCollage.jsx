import React, { useState, useEffect } from 'react';
import './MonthCollage.css';

const MonthCollage = ({ images, monthName }) => {
  const [loadedImages, setLoadedImages] = useState([]);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Show up to 20 images
  const displayImages = images.slice(0, 20);

  // STRICT positioning with LARGER images
  const getStrictPosition = (index, existingPositions) => {
    const seed = index * 9301 + 49297;
    const random = (seed % 233280) / 233280;
    
    // MUCH LARGER image size (24% of viewport)
    const sizePercent = 24;
    
    // CENTER KEEP-OUT ZONE - Larger to protect timeline
    const centerMin = 28;
    const centerMax = 72;
    
    let left, top;
    let attempts = 0;
    let maxAttempts = 200;
    let validPosition = false;
    
    while (!validPosition && attempts < maxAttempts) {
      // Force images to the EDGES only
      const zone = Math.floor((random + attempts * 0.05) % 4);
      
      switch(zone) {
        case 0: // TOP
          left = 2 + ((random + attempts * 0.03) % 1) * 96;
          top = 1 + ((random * 3 + attempts * 0.02) % 1) * (centerMin - 8);
          break;
        case 1: // BOTTOM
          left = 2 + ((random + attempts * 0.04) % 1) * 96;
          top = centerMax + 8 + ((random * 3 + attempts * 0.03) % 1) * (96 - centerMax);
          break;
        case 2: // LEFT
          left = 1 + ((random + attempts * 0.02) % 1) * (centerMin - 8);
          top = 2 + ((random * 3 + attempts * 0.02) % 1) * 96;
          break;
        case 3: // RIGHT
          left = centerMax + 8 + ((random + attempts * 0.02) % 1) * (96 - centerMax);
          top = 2 + ((random * 3 + attempts * 0.02) % 1) * 96;
          break;
        default:
          left = 2 + ((random + attempts * 0.01) % 1) * 96;
          top = 2 + ((random * 3 + attempts * 0.01) % 1) * 96;
      }
      
      // Add slight randomness for organic feel
      left += (random - 0.5) * 3;
      top += ((random * 3 + 7) % 1) * 3 - 1.5;
      
      // Clamp to keep images on screen
      left = Math.max(0.5, Math.min(100 - sizePercent - 0.5, left));
      top = Math.max(0.5, Math.min(100 - sizePercent - 0.5, top));
      
      // DOUBLE CHECK: Is this image in the center zone?
      const imageCenterX = left + sizePercent / 2;
      const imageCenterY = top + sizePercent / 2;
      
      const inCenterZone = 
        imageCenterX > centerMin && imageCenterX < centerMax &&
        imageCenterY > centerMin && imageCenterY < centerMax;
      
      if (inCenterZone) {
        attempts++;
        continue;
      }
      
      // Check collision with existing images (more spacing for larger images)
      let collides = false;
      const minDistance = sizePercent * 1.25;
      
      for (const pos of existingPositions) {
        const dx = Math.abs(left - pos.left);
        const dy = Math.abs(top - pos.top);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance) {
          collides = true;
          break;
        }
      }
      
      if (!collides) {
        validPosition = true;
      }
      
      attempts++;
    }
    
    // Random rotation for scrapbook feel (slightly less for larger images)
    const rotation = (random - 0.5) * 25;
    const delay = (random * 0.3);
    const duration = 4 + random * 4;
    const amplitude = 5 + random * 8;
    
    return { 
      left, 
      top, 
      rotation, 
      delay, 
      duration, 
      amplitude,
      sizePercent
    };
  };

  // Generate all positions
  const generatePositions = () => {
    const positions = [];
    for (let i = 0; i < displayImages.length; i++) {
      const pos = getStrictPosition(i, positions);
      positions.push(pos);
    }
    return positions;
  };

  const positions = generatePositions();

  return (
    <div className="month-collage floating-container">
      {displayImages.map((src, index) => {
        const pos = positions[index];
        const isLoaded = loadedImages.includes(index);
        
        // Calculate pixel size - MUCH LARGER!
        const baseSize = Math.min(windowSize.width, windowSize.height) * 0.24;
        const finalSize = Math.min(baseSize, windowSize.width * 0.36, windowSize.height * 0.36);
        
        return (
          <div
            key={index}
            className={`floating-image-item scrapbook-style ${isLoaded ? 'loaded' : ''}`}
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              width: `${Math.max(finalSize, 220)}px`,
              height: `${Math.max(finalSize, 220)}px`,
              transform: `rotate(${pos.rotation}deg)`,
              animationDelay: `${pos.delay}s`,
              animationDuration: `${pos.duration}s`,
              '--float-amplitude': `${pos.amplitude}px`,
              '--rotation': `${pos.rotation}deg`,
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
            <div className="scrapbook-tape"></div>
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