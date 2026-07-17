import React, { useState, useEffect, useRef } from 'react';
import MonthCollage from './components/MonthCollage';
import Timeline from './components/Timeline';
import MonthDisplay from './components/MonthDisplay';
import BackgroundMusic from './components/BackgroundMusic';
import './App.css';

function App() {
  const [months, setMonths] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const audioRef = useRef(null);
  // const [audioStarted, setAudioStarted] = useState(false);

  // // --- Background Music with Click-to-Start ---
  // useEffect(() => {
  //   const audio = audioRef.current;
  //   if (!audio) return;

  //   audio.volume = 0.3;
  //   audio.loop = true;

  //   // Function to start audio
  //   const startAudio = () => {
  //     if (audioStarted) return;
      
  //     audio.play()
  //       .then(() => {
  //         console.log('🎵 Music started');
  //         setAudioStarted(true);
  //       })
  //       .catch(err => console.log('Audio error:', err));
  //   };

  //   // Start on any click/tap
  //   const handleInteraction = () => {
  //     startAudio();
  //     // Remove listeners after first interaction
  //     document.removeEventListener('click', handleInteraction);
  //     document.removeEventListener('touchstart', handleInteraction);
  //     document.removeEventListener('keydown', handleInteraction);
  //   };

  //   // Add listeners for user interaction
  //   document.addEventListener('click', handleInteraction);
  //   document.addEventListener('touchstart', handleInteraction);
  //   document.addEventListener('keydown', handleInteraction);

  //   // Try to autoplay (may work in some browsers)
  //   startAudio();

  //   return () => {
  //     audio.pause();
  //     audio.currentTime = 0;
  //     document.removeEventListener('click', handleInteraction);
  //     document.removeEventListener('touchstart', handleInteraction);
  //     document.removeEventListener('keydown', handleInteraction);
  //   };
  // }, [audioStarted]);

  // --- Fetch months data ---
  useEffect(() => {
    fetchMonths();
  }, []);

  const fetchMonths = async () => {
    try {
      const response = await fetch('/api/months');
      if (!response.ok) throw new Error('Failed to fetch months');
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
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

  // Mouse wheel navigation
  useEffect(() => {
    if (months.length === 0) return;
    
    const handleWheel = (e) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        nextMonth();
      } else if (e.deltaY < 0) {
        prevMonth();
      }
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [months.length]);

  if (loading) return <div className="loading">📸 Loading gallery...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (months.length === 0) return <div className="error">No photos found</div>;

  const currentMonth = months[currentIndex];

  return (
    <div className="app">
       <BackgroundMusic />
      
      <MonthDisplay 
        month={currentMonth.displayName} 
        index={currentIndex}
        total={months.length}
      />
      
      <MonthCollage images={currentMonth.images} monthName={currentMonth.displayName} />
      
      <Timeline 
        months={months} 
        currentIndex={currentIndex} 
        onSelect={goToMonth} 
      />
    </div>
  );
}

export default App;
