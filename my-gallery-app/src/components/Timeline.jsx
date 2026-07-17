import React, { useRef, useEffect, useState } from 'react';
import './Timeline.css';

const Timeline = ({ months, currentIndex, onSelect }) => {
  const timelineRef = useRef(null);
  const [visibleItems, setVisibleItems] = useState({});

  // Handle scroll to fade items in/out
  useEffect(() => {
    const container = timelineRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const centerY = containerRect.top + containerRect.height / 2;
      
      // Get all timeline items
      const items = container.querySelectorAll('.timeline-item');
      const newVisibility = {};
      
      items.forEach((item, index) => {
        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.top + itemRect.height / 2;
        const distanceFromCenter = Math.abs(itemCenter - centerY);
        const maxDistance = containerRect.height / 2;
        
        // Calculate opacity based on distance from center (0 = fully visible, 1 = hidden)
        const opacity = Math.max(0, 1 - (distanceFromCenter / maxDistance));
        newVisibility[index] = opacity;
      });
      
      setVisibleItems(newVisibility);
    };

    container.addEventListener('scroll', handleScroll);
    // Initial calculation
    handleScroll();
    
    return () => container.removeEventListener('scroll', handleScroll);
  }, [months]);

  // Scroll to active month when it changes
  useEffect(() => {
    if (timelineRef.current) {
      const activeItem = timelineRef.current.querySelector('.timeline-item.active');
      if (activeItem) {
        const container = timelineRef.current;
        const containerRect = container.getBoundingClientRect();
        const activeRect = activeItem.getBoundingClientRect();
        
        const scrollTop = activeItem.offsetTop - containerRect.height / 2 + activeRect.height / 2;
        container.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
      }
    }
  }, [currentIndex]);

  // Group months by year
  const groupedMonths = months.reduce((acc, month, index) => {
    if (!acc[month.year]) acc[month.year] = [];
    acc[month.year].push({ ...month, index });
    return acc;
  }, {});

  const years = Object.keys(groupedMonths).sort();

  // Get random position offset for scattered effect
  const getScatterOffset = (index) => {
    // Use deterministic pseudo-random based on index for consistency
    const hash = (index * 9301 + 49297) % 233280;
    const randomX = ((hash / 233280) * 60 - 30); // -30 to +30 pixels
    const randomY = ((hash * 7 + 13) % 233280) / 233280 * 20 - 10; // -10 to +10 pixels
    return { x: randomX, y: randomY };
  };

  // Get month abbreviation
  const getMonthAbbr = (monthName) => {
    return monthName.slice(0, 3);
  };

  return (
    <div className="timeline-wrapper">
      <div className="timeline-container" ref={timelineRef}>
        <div className="timeline-line"></div>
        {years.map((year) => (
          <div key={year} className="timeline-year-group">
            <div className="timeline-year-label">{year}</div>
            {groupedMonths[year].map((month) => {
              const isActive = month.index === currentIndex;
              const opacity = visibleItems[month.index] !== undefined ? visibleItems[month.index] : 0.3;
              const scatter = getScatterOffset(month.index);
              
              return (
                <div
                  key={month.index}
                  className={`timeline-item ${isActive ? 'active' : ''}`}
                  onClick={() => onSelect(month.index)}
                  style={{
                    opacity: opacity,
                    transform: `translate(${scatter.x}px, ${scatter.y}px)`,
                    transition: 'opacity 0.3s ease, transform 0.3s ease'
                  }}
                >
                  <div className="timeline-marker">
                    <div className={`marker-dot ${isActive ? 'active' : ''}`}>
                      {isActive && <div className="pulse-ring"></div>}
                    </div>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-label">{getMonthAbbr(month.month)}</div>
                    {isActive && (
                      <div className="timeline-month-full">{month.displayName}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;