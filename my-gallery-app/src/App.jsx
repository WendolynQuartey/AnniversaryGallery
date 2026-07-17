import React, { useState, useEffect } from 'react';
import MonthCollage from './components/MonthCollage';
import Timeline from './components/Timeline';
import MonthDisplay from './components/MonthDisplay';
import Navigation from './components/Navigation';
import './App.css';

function App() {
  const [months, setMonths] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMonths();
  }, []);

  const fetchMonths = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/months');
      if (!response.ok) throw new Error('Failed to fetch months');
      const data = await response.json();
      
      // Filter from July 2025 to July 2026
      const filtered = data.filter(item => {
        const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const monthIndex = monthOrder.indexOf(item.month);
        
        if (item.year === 2025 && monthIndex >= 6) return true;
        if (item.year === 2026 && monthIndex <= 6) return true;
        return false;
      });
      
      setMonths(filtered);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const goToMonth = (index) => {
    setCurrentIndex(index);
  };

  const nextMonth = () => {
    setCurrentIndex((prev) => (prev + 1) % months.length);
  };

  const prevMonth = () => {
    setCurrentIndex((prev) => (prev - 1 + months.length) % months.length);
  };

  // Auto-advance
  useEffect(() => {
    if (months.length === 0) return;
    const interval = setInterval(nextMonth, 6000);
    return () => clearInterval(interval);
  }, [months.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextMonth();
      if (e.key === 'ArrowLeft') prevMonth();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [months.length]);

  if (loading) return <div className="loading">📸 Loading gallery...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (months.length === 0) return <div className="error">No photos found</div>;

  const currentMonth = months[currentIndex];

  return (
    <div className="app">
      <MonthDisplay 
        month={currentMonth.displayName} 
        index={currentIndex}
        total={months.length}
      />
      
      {/* MonthCollage now shows floating images */}
      <MonthCollage images={currentMonth.images} monthName={currentMonth.displayName} />
      
      <Timeline 
        months={months} 
        currentIndex={currentIndex} 
        onSelect={goToMonth} 
      />
      
      <Navigation 
        onPrev={prevMonth} 
        onNext={nextMonth} 
        currentIndex={currentIndex}
        total={months.length}
      />
    </div>
  );
}

export default App;
