import React, { useRef, useEffect } from 'react';
import './Timeline.css';

const Timeline = ({ months, currentIndex, onSelect }) => {
  const timelineRef = useRef(null);
  const activeRef = useRef(null);

  // Scroll to active month
  useEffect(() => {
    if (activeRef.current && timelineRef.current) {
      const container = timelineRef.current;
      const active = activeRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      
      const scrollLeft = active.offsetLeft - containerRect.width / 2 + activeRect.width / 2;
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  // Group months by year
  const groupedMonths = months.reduce((acc, month, index) => {
    if (!acc[month.year]) acc[month.year] = [];
    acc[month.year].push({ ...month, index });
    return acc;
  }, {});

  const years = Object.keys(groupedMonths).sort();

  // Get month abbreviation (first 3 letters)
  const getMonthAbbr = (monthName) => {
    return monthName.slice(0, 3);
  };

  return (
    <div className="timeline-wrapper">
      <div className="timeline-container" ref={timelineRef}>
        <div className="timeline-track">
          {years.map((year) => (
            <div key={year} className="timeline-year-group">
              <div className="timeline-year-label">{year}</div>
              <div className="timeline-months">
                {groupedMonths[year].map((month) => {
                  const isActive = month.index === currentIndex;
                  
                  return (
                    <div
                      key={month.index}
                      ref={isActive ? activeRef : null}
                      className={`timeline-item ${isActive ? 'active' : ''}`}
                      onClick={() => onSelect(month.index)}
                    >
                      <div className="timeline-dot">
                        {isActive && <div className="timeline-pulse" />}
                      </div>
                      <div className="timeline-label">
                        {getMonthAbbr(month.month)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;