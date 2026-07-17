import React from 'react';
import './Navigation.css';

const Navigation = ({ onPrev, onNext, currentIndex, total }) => {
  return (
    <div className="navigation">
      <button onClick={onPrev} className="nav-btn">
        <span className="nav-icon">◀</span> Prev
      </button>
      
      <div className="nav-info">
        <span className="nav-counter">
          {currentIndex + 1} <span className="nav-total">/ {total}</span>
        </span>
      </div>
      
      <button onClick={onNext} className="nav-btn">
        Next <span className="nav-icon">▶</span>
      </button>
    </div>
  );
};

export default Navigation;