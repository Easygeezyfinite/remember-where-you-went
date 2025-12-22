import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import WindowsDialog from '@/components/WindowsDialog';
import RetroMediaPlayer from '@/components/RetroMediaPlayer';
import backgroundImage from '@/assets/background.png';

const Index = () => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const playlist = [
    { src: '/Mulatu.mp3', title: 'Mulatu', artist: 'Mulatu Astatke' },
    { src: '/christmas1.mp3', title: 'Jingle Bells', artist: 'Christmas Classic' },
    { src: '/christmas2.mp3', title: 'Silent Night', artist: 'Christmas Classic' },
  ];

  // Purple blink hint every 4 seconds
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setShowHint(true);
      // Hide after 800ms
      setTimeout(() => setShowHint(false), 800);
    }, 4000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Silent notification - fire and forget
  const sendNotification = (buttonClicked: string) => {
    fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buttonClicked }),
    }).catch(() => {}); // Silently fail if notification doesn't work
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Autoplay blocked - will play on first user interaction
        const playOnInteraction = () => {
          audio.play();
          document.removeEventListener('click', playOnInteraction);
        };
        document.addEventListener('click', playOnInteraction);
      });
    }
  }, []);

  // Update audio source when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.src = playlist[currentTrackIndex].src;
      audio.load();
      audio.play().catch(() => {});
    }
  }, [currentTrackIndex]);

  const handleButtonClick = () => {
    sendNotification('You just goofy joe');
    window.location.href = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3WcLXj_rxJYYZYzI8LmOHPkI3nCnJSg4M-g&s';
  };

  const handleSecondButtonClick = () => {
    sendNotification('They kinda did');
    window.open('https://medium.com/@Alizeyshah1/exam-importance-2600cfb93f75', '_blank');
  };

  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  const handleSecretClick = () => {
    sendNotification('Secret terminal accessed');
    navigate('/terminal');
  };

  return (
    <main 
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Secret "Of course not" button - positioned just below the dialog */}
      <button
        onClick={handleSecretClick}
        className="absolute cursor-pointer transition-all duration-300"
        style={{
          // Positioned just below the centered dialog
          top: '58.5%',
          left: '49.7%',
          transform: 'translateX(-50%)',
          width: '100px',
          height: '39.7px',
          // Invisible by default, purple glow on hint
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '3px',
          boxShadow: showHint 
            ? '0 0 20px 8px rgba(168, 85, 247, 0.6), 0 0 40px 15px rgba(168, 85, 247, 0.3), inset 0 0 15px rgba(168, 85, 247, 0.4)' 
            : 'none',
        }}
        aria-label="Secret"
      />
      
      <audio ref={audioRef} src={playlist[currentTrackIndex].src} loop />
      <WindowsDialog
        title="hallo tsibkti"
        subtitle="(Best viewed on iOS fs fs)"
        message="did the exams cook you like that"
        buttonText="You just goofy joe"
        onClick={handleButtonClick}
        secondButtonText="They kinda did"
        onSecondButtonClick={handleSecondButtonClick}
      />
      <RetroMediaPlayer 
        audioRef={audioRef} 
        currentTrack={playlist[currentTrackIndex]}
        onNext={handleNextTrack}
        onPrev={handlePrevTrack}
      />
    </main>
  );
};

export default Index;
