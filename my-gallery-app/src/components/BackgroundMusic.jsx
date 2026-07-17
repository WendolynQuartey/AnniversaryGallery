import React, { useEffect, useRef } from 'react';

const BackgroundMusic = () => {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.3;
    audio.loop = true;

    // Try to play
    const playAudio = () => {
      audio.play().catch(() => {
        // If autoplay fails, try on user interaction
        const startOnClick = () => {
          audio.play();
          document.removeEventListener('click', startOnClick);
        };
        document.addEventListener('click', startOnClick);
      });
    };

    playAudio();

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return (
    <audio
      ref={audioRef}
      src="/background-music.mp3"
      preload="auto"
      style={{ display: 'none' }}
    />
  );
};

export default BackgroundMusic;