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

  // Show up to 16 images so the larger photos stay spaced out and readable
  const displayImages = images.slice(0, 16);

  // Keep images in outer zones so they stay visible and away from the centered timeline
  const getStrictPosition = (index, existingPositions) => {
    const seed = index * 9301 + 49297;
    const random = (seed % 233280) / 233280;

    const sizePercent = 24;
    const timelineXMin = 40;
    const timelineXMax = 60;
    const timelineYMin = 16;
    const timelineYMax = 84;

    const candidateAnchors = [
      { left: 4, top: 4 },
      { left: 76, top: 4 },
      { left: 4, top: 24 },
      { left: 76, top: 24 },
      { left: 4, top: 46 },
      { left: 76, top: 46 },
      { left: 4, top: 70 },
      { left: 76, top: 70 },
      { left: 18, top: 8 },
      { left: 64, top: 8 },
      { left: 18, top: 78 },
      { left: 64, top: 78 },
      { left: 14, top: 18 },
      { left: 70, top: 18 },
      { left: 14, top: 64 },
      { left: 70, top: 64 },
      { left: 24, top: 36 },
      { left: 60, top: 36 },
      { left: 30, top: 12 },
      { left: 54, top: 12 },
      { left: 30, top: 74 },
      { left: 54, top: 74 }
    ];

    let validPosition = null;

    for (let attempt = 0; attempt < candidateAnchors.length * 3; attempt++) {
      const anchor = candidateAnchors[(index + attempt) % candidateAnchors.length];
      const jitterX = ((random + attempt * 0.07) % 1) * 8 - 4;
      const jitterY = (((random * 3) + attempt * 0.09) % 1) * 8 - 4;

      let left = anchor.left + jitterX;
      let top = anchor.top + jitterY;

      left = Math.max(2, Math.min(100 - sizePercent - 2, left));
      top = Math.max(2, Math.min(100 - sizePercent - 2, top));

      const imageCenterX = left + sizePercent / 2;
      const imageCenterY = top + sizePercent / 2;

      const inTimelineZone =
        imageCenterX > timelineXMin &&
        imageCenterX < timelineXMax &&
        imageCenterY > timelineYMin &&
        imageCenterY < timelineYMax;

      if (inTimelineZone) {
        continue;
      }

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
        validPosition = { left, top };
        break;
      }
    }

    if (!validPosition) {
      validPosition = {
        left: (index % 2 === 0 ? 14 : 68) + (random - 0.5) * 6,
        top: 8 + ((index % 4) * 18) + (random * 6)
      };
    }

    const rotation = (random - 0.5) * 25;
    const delay = random * 0.3;
    const duration = 4 + random * 4;
    const amplitude = 5 + random * 8;

    return {
      left: validPosition.left,
      top: validPosition.top,
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