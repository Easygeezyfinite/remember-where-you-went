import { useState, useEffect, forwardRef } from 'react';

interface Track {
  src: string;
  title: string;
  artist: string;
}

interface RetroMediaPlayerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  currentTrack: Track;
  onNext: () => void;
  onPrev: () => void;
}

const RetroMediaPlayer = forwardRef<HTMLDivElement, RetroMediaPlayerProps>(
  ({ audioRef, currentTrack, onNext, onPrev }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [bars, setBars] = useState<number[]>(Array(20).fill(4));

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);

      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
      };
    }, [audioRef]);

    // Animate visualizer bars with retro purple colors
    useEffect(() => {
      if (!isPlaying) {
        setBars(Array(20).fill(4));
        return;
      }

      const interval = setInterval(() => {
        setBars(prev => prev.map((_, i) => 
          8 + Math.random() * 45 + Math.sin(Date.now() / 200 + i * 0.5) * 10
        ));
      }, 80);

      return () => clearInterval(interval);
    }, [isPlaying]);

    const togglePlay = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    const stop = () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current;
      if (!audio || !duration) return;
      
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      audio.currentTime = percentage * duration;
    };

    const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current;
      if (!audio) return;
      
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newVolume = Math.max(0, Math.min(1, clickX / rect.width));
      setVolume(newVolume);
      audio.volume = newVolume;
    };

    const formatTime = (time: number) => {
      const mins = Math.floor(time / 60);
      const secs = Math.floor(time % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = duration ? (currentTime / duration) * 100 : 0;

    return (
      <div
        ref={ref}
        className="fixed bottom-4 right-4 z-50 select-none"
        style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}
      >
        {/* Main Window */}
        <div
          className="rounded-lg overflow-hidden shadow-2xl"
          style={{
            width: '280px',
            background: 'linear-gradient(180deg, #1e3a5f 0%, #0d2137 100%)',
            border: '1px solid #4a90c2',
          }}
        >
          {/* Title Bar */}
          <div
            className="flex items-center justify-between px-2 py-1"
            style={{
              background: 'linear-gradient(180deg, #3b7bc0 0%, #1e5799 50%, #1e4f8a 100%)',
              borderBottom: '1px solid #0d2137',
            }}
          >
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 flex items-center justify-center">
                <svg viewBox="0 0 16 16" className="w-3 h-3">
                  <circle cx="8" cy="8" r="6" fill="#ff6b00" />
                  <path d="M6 5 L11 8 L6 11 Z" fill="white" />
                </svg>
              </div>
              <span className="text-white text-xs font-bold drop-shadow-sm">
                Windows Media Player
              </span>
            </div>
            <div className="flex gap-0.5">
              <button className="w-5 h-4 text-white text-xs bg-gradient-to-b from-blue-400 to-blue-600 rounded-sm hover:from-blue-300 hover:to-blue-500 border border-blue-300/50">
                _
              </button>
              <button className="w-5 h-4 text-white text-xs bg-gradient-to-b from-blue-400 to-blue-600 rounded-sm hover:from-blue-300 hover:to-blue-500 border border-blue-300/50">
                □
              </button>
              <button className="w-5 h-4 text-white text-xs bg-gradient-to-b from-red-400 to-red-600 rounded-sm hover:from-red-300 hover:to-red-500 border border-red-300/50">
                ×
              </button>
            </div>
          </div>

          {/* Visualization Area */}
          <div
            className="relative overflow-hidden"
            style={{
              height: '80px',
              background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 50%, #0a0a1a 100%)',
            }}
          >
            {/* Retro scanlines effect */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
              }}
            />
            
            {/* Animated visualization bars - Retro Purple */}
            <div className="absolute inset-0 flex items-end justify-center gap-1 px-4 pb-2">
              {bars.map((height, i) => (
                <div
                  key={i}
                  className="w-2"
                  style={{
                    background: `linear-gradient(180deg, #ff00ff 0%, #aa00aa 30%, #8800aa 50%, #6600aa 70%, #440088 100%)`,
                    height: `${height}px`,
                    transition: 'height 0.08s ease-out',
                    boxShadow: isPlaying ? '0 0 8px rgba(255, 0, 255, 0.6)' : 'none',
                  }}
                />
              ))}
            </div>
            {/* Glow effect - purple */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: isPlaying
                  ? 'radial-gradient(ellipse at center, rgba(170, 0, 255, 0.3) 0%, transparent 70%)'
                  : 'none',
              }}
            />
          </div>

          {/* Song Info */}
          <div
            className="px-3 py-1 text-center"
            style={{
              background: 'linear-gradient(180deg, #0d1f33 0%, #162d47 100%)',
              borderTop: '1px solid #2a5a8a',
              borderBottom: '1px solid #0a1520',
            }}
          >
            <div className="text-blue-300 text-xs truncate font-semibold">
              {currentTrack.title}
            </div>
            <div className="text-blue-300 text-[10px] opacity-80">
              {currentTrack.artist}
            </div>
          </div>

          {/* Progress Bar - Interactive */}
          <div className="px-3 py-2" style={{ background: '#0d1f33' }}>
            <div
              className="h-2 rounded-full overflow-hidden cursor-pointer"
              style={{
                background: 'linear-gradient(180deg, #0a1520 0%, #1a3050 100%)',
                border: '1px solid #2a4a6a',
              }}
              onClick={handleSeek}
            >
              <div
                className="h-full transition-all duration-200 pointer-events-none"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(180deg, #4a9eff 0%, #2a6ecc 50%, #1a4e9c 100%)',
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-blue-300 text-[10px]">{formatTime(currentTime)}</span>
              <span className="text-blue-300 text-[10px]">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div
            className="flex items-center justify-center gap-2 px-3 py-2"
            style={{
              background: 'linear-gradient(180deg, #1a3a5a 0%, #0d2540 100%)',
              borderTop: '1px solid #2a5a8a',
            }}
          >
            {/* Previous */}
            <button
              onClick={onPrev}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: 'linear-gradient(180deg, #4a7aaa 0%, #2a4a6a 50%, #1a3a5a 100%)',
                border: '1px solid #5a8aba',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: isPlaying
                  ? 'linear-gradient(180deg, #6a9aca 0%, #3a6a9a 50%, #2a5a8a 100%)'
                  : 'linear-gradient(180deg, #5a8aba 0%, #3a6a9a 50%, #2a5a8a 100%)',
                border: '2px solid #7abaff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white ml-0.5">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Stop */}
            <button
              onClick={stop}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: 'linear-gradient(180deg, #4a7aaa 0%, #2a4a6a 50%, #1a3a5a 100%)',
                border: '1px solid #5a8aba',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <path d="M6 6h12v12H6z" />
              </svg>
            </button>

            {/* Next */}
            <button
              onClick={onNext}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: 'linear-gradient(180deg, #4a7aaa 0%, #2a4a6a 50%, #1a3a5a 100%)',
                border: '1px solid #5a8aba',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>

          {/* Volume Bar - Interactive */}
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{
              background: 'linear-gradient(180deg, #0d2540 0%, #0a1a30 100%)',
              borderTop: '1px solid #1a3a5a',
            }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-blue-300 flex-shrink-0">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
            <div
              className="flex-1 h-2 rounded-full overflow-hidden cursor-pointer"
              style={{
                background: 'linear-gradient(180deg, #0a1520 0%, #1a3050 100%)',
                border: '1px solid #2a4a6a',
              }}
              onClick={handleVolumeChange}
            >
              <div
                className="h-full pointer-events-none"
                style={{
                  width: `${volume * 100}%`,
                  background: 'linear-gradient(90deg, #8800aa 0%, #ff00ff 100%)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

RetroMediaPlayer.displayName = 'RetroMediaPlayer';

export default RetroMediaPlayer;
