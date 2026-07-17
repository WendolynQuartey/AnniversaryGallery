import React, { useState, useEffect } from 'react';
import './MonthCollage.css';

const MonthCollage = ({ images, monthName }) => {
  const [loadedImages, setLoadedImages] = useState([]);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Track window resize
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

  const displayImages = images.slice(0, 25);

  // Scrapbook-style positioning with STRICT collision avoidance
  const getScrapbookPosition = (index, existingPositions, viewportWidth, viewportHeight) => {
    const seed = index * 9301 + 49297;
    const random = (seed % 233280) / 233280;
    
    // IMAGE SIZE: Large but with room for spacing
    const baseSize = Math.min(viewportWidth, viewportHeight) * 0.22; // 22% of smaller dimension
    const sizeVariation = 0.7 + random * 0.6; // 70% to 130% of base
    const imageSize = Math.min(baseSize * sizeVariation, viewportWidth * 0.35, viewportHeight * 0.35);
    
    // Convert to percentage of viewport for positioning
    const sizePercent = (imageSize / Math.min(viewportWidth, viewportHeight)) * 100;
    
    // Keep-out zone to protect the timeline (30% to 70% of screen)
    const centerMin = 30;
    const centerMax = 70;
    
    let left, top;
    let attempts = 0;
    let maxAttempts = 100; // More attempts to find non-overlapping positions
    let collision = true;
    
    // Padding to keep images fully on screen
    const padding = sizePercent * 0.2;
    
    while (collision && attempts < maxAttempts) {
      // Spread across the ENTIRE screen, but avoid center
      const positionType = Math.floor((random + attempts * 0.07) % 8);
      
      switch(positionType) {
        case 0: // Top area
          left = padding + ((random + attempts * 0.05) % 1) * (100 - padding * 2);
          top = padding + ((random * 2 + attempts * 0.03) % 1) * (centerMin - padding - 3);
          break;
        case 1: // Bottom area
          left = padding + ((random + attempts * 0.06) % 1) * (100 - padding * 2);
          top = centerMax + ((random * 2 + attempts * 0.04) % 1) * (100 - centerMax - padding - 3);
          break;
        case 2: // Left area
          left = padding + ((random + attempts * 0.04) % 1) * (centerMin - padding - 3);
          top = padding + ((random * 4 + attempts * 0.02) % 1) * (100 - padding * 2);
          break;
        case 3: // Right area
          left = centerMax + ((random + attempts * 0.08) % 1) * (100 - centerMax - padding - 3);
          top = padding + ((random * 4 + attempts * 0.02) % 1) * (100 - padding * 2);
          break;
        case 4: // Top-Left corner
          left = padding + ((random + attempts * 0.03) % 1) * (centerMin - padding - 3);
          top = padding + ((random * 2 + attempts * 0.03) % 1) * (centerMin - padding - 3);
          break;
        case 5: // Top-Right corner
          left = centerMax + ((random + attempts * 0.07) % 1) * (100 - centerMax - padding - 3);
          top = padding + ((random * 2 + attempts * 0.03) % 1) * (centerMin - padding - 3);
          break;
        case 6: // Bottom-Left corner
          left = padding + ((random + attempts * 0.03) % 1) * (centerMin - padding - 3);
          top = centerMax + ((random * 2 + attempts * 0.03) % 1) * (100 - centerMax - padding - 3);
          break;
        case 7: // Bottom-Right corner
          left = centerMax + ((random + attempts * 0.07) % 1) * (100 - centerMax - padding - 3);
          top = centerMax + ((random * 2 + attempts * 0.03) % 1) * (100 - centerMax - padding - 3);
          break;
        default:
          left = padding + ((random + attempts * 0.01) % 1) * (100 - padding * 2);
          top = padding + ((random * 7 + 13 + attempts * 0.01) % 1) * (100 - padding * 2);
      }
      
      // Add organic randomness
      left += (random - 0.5) * 4;
      top += ((random * 3 + 7) % 1) * 4 - 2;
      
      // Ensure images stay fully on screen
      const maxLeft = 100 - sizePercent - 0.5;
      const maxTop = 100 - sizePercent - 0.5;
      left = Math.max(padding + 0.5, Math.min(maxLeft, left));
      top = Math.max(padding + 0.5, Math.min(maxTop, top));
      
      // STRICT collision check - images must not overlap at all
      collision = false;
      const minDistance = sizePercent * 1.2; // 20% extra space between images
      
      for (const pos of existingPositions) {
        const dx = Math.abs(left - pos.left);
        const dy = Math.abs(top - pos.top);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance) {
          collision = true;
          break;
        }
      }
      
      attempts++;
    }
    
    // Wider rotation range for more character
    const rotation = (random - 0.5) * 45; // -22.5° to +22.5°
    
    // Random animation properties
    const delay = (random * 0.3);
    const duration = 4 + random * 4;
    const amplitude = 8 + random * 12;
    
    return { 
      left, 
      top, 
      rotation, 
      size: imageSize / 150, // Normalize to CSS base size
      delay, 
      duration, 
      amplitude,
      sizePercent,
      pixelSize: imageSize
    };
  };

  // Generate all positions with collision avoidance
  const generatePositions = () => {
    const positions = [];
    for (let i = 0; i < displayImages.length; i++) {
      const pos = getScrapbookPosition(i, positions, windowSize.width, windowSize.height);
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
        
        // Calculate pixel dimensions
        const pixelSize = pos ? pos.pixelSize : 200;
        const finalSize = Math.min(pixelSize, windowSize.width * 0.40, windowSize.height * 0.40);
        
        return (
          <div
            key={index}
            className={`floating-image-item scrapbook-style ${isLoaded ? 'loaded' : ''}`}
            style={{
              left: `${pos ? pos.left : 10}%`,
              top: `${pos ? pos.top : 10}%`,
              width: `${Math.max(finalSize, 130)}px`,
              height: `${Math.max(finalSize, 130)}px`,
              transform: `rotate(${pos ? pos.rotation : 0}deg)`,
              animationDelay: `${pos ? pos.delay : 0}s`,
              animationDuration: `${pos ? pos.duration : 5}s`,
              '--float-amplitude': `${pos ? pos.amplitude : 12}px`,
              '--rotation': `${pos ? pos.rotation : 0}deg`,
              zIndex: Math.floor(pos ? pos.top : 50)
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
            {/* Scrapbook-style tape decoration */}
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