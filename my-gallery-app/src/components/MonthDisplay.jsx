import React, { useState, useEffect } from 'react';
import './MonthDisplay.css';

const MonthDisplay = ({ month, index, total }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div className={`month-display ${visible ? 'show' : ''}`}>
      <h1>{month}</h1>
      <p className="progress">{index + 1} / {total}</p>
    </div>
  );
};

export default MonthDisplay;