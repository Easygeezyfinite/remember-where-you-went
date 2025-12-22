import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface TerminalLine {
  text: string;
  color?: string;
}

const Terminal = () => {
  const navigate = useNavigate();
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  const terminalContent = [
    { text: '$ ./analyze_success_factors.sh', delay: 25 },
    { text: '', delay: 200 },
    { text: '[INFO] Initializing research database...', delay: 15 },
    { text: '[OK] Database connection established', delay: 15 },
    { text: '', delay: 150 },
    { text: 'Loading analysis module.....', delay: 40 },
    { text: '', delay: 300 },
    { text: '╔══════════════════════════════════════════════════════════════════╗', delay: 5 },
    { text: '║  MASTERS DEGREE SUCCESS FACTOR ANALYSIS v2.4.1                   ║', delay: 5 },
    { text: '╚══════════════════════════════════════════════════════════════════╝', delay: 5 },
    { text: '', delay: 200 },
    { text: '[PROCESSING] Differentiating between multiple reasons why', delay: 20 },
    { text: '             masters degrees create successful people in life...', delay: 20 },
    { text: '', delay: 300 },
    { text: '[FETCH] Connecting to https://research.edu/success-data/api/v2/mas', delay: 15 },
    { text: '^C', delay: 400 },
    { text: '', delay: 100 },
    { text: '[CANCELLED] Operation interrupted by a tsibkti user', delay: 15 },
    { text: '¯\\_(ツ)_/¯', delay: 50, color: '#a855f7' },
    { text: '[ERROR] Connection timeout: api.success-research.edu:443', delay: 15 },
    { text: '', delay: 250 },
    { text: '════════════════════════════════════════════════════════════════════', delay: 5 },
    { text: '', delay: 150 },
    { text: '  ⚠️  URL link not loading... try again later..', delay: 30 },
    { text: '', delay: 250 },
    { text: '════════════════════════════════════════════════════════════════════', delay: 5 },
    { text: '', delay: 400 },
    { text: '[SYSTEM] Press any key or click to return...', delay: 20 },
  ];

  // Cursor blink effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // Typing effect
  useEffect(() => {
    if (currentLineIndex >= terminalContent.length) return;

    const currentLine = terminalContent[currentLineIndex];
    
    if (currentCharIndex < currentLine.text.length) {
      const timeout = setTimeout(() => {
        setCurrentCharIndex(prev => prev + 1);
      }, currentLine.delay);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setLines(prev => [...prev, { text: currentLine.text, color: currentLine.color }]);
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [currentLineIndex, currentCharIndex]);

  // Handle exit
  const handleExit = () => {
    navigate('/');
  };

  useEffect(() => {
    const handleKeyPress = () => {
      if (currentLineIndex >= terminalContent.length) {
        handleExit();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentLineIndex]);

  const currentTypingLine = currentLineIndex < terminalContent.length 
    ? terminalContent[currentLineIndex].text.substring(0, currentCharIndex)
    : '';
  
  const currentTypingColor = currentLineIndex < terminalContent.length 
    ? terminalContent[currentLineIndex].color
    : undefined;

  return (
    <div 
      className="min-h-screen w-full bg-black p-4 md:p-8 overflow-auto cursor-pointer"
      onClick={() => currentLineIndex >= terminalContent.length && handleExit()}
      style={{ fontFamily: '"Courier New", "Lucida Console", Monaco, monospace' }}
    >
      {/* CRT scanline effect */}
      <div 
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)',
        }}
      />
      
      {/* CRT glow effect */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 150px rgba(0, 255, 0, 0.1)',
        }}
      />

      {/* Terminal window */}
      <div className="max-w-4xl mx-auto">
        {/* Terminal header */}
        <div 
          className="flex items-center gap-2 px-4 py-2 rounded-t-lg"
          style={{ 
            background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)',
            borderBottom: '1px solid #1a1a1a',
          }}
        >
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400" onClick={handleExit} />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-gray-400 text-sm ml-4">root@success-research:~</span>
        </div>

        {/* Terminal body */}
        <div 
          className="p-4 md:p-6 rounded-b-lg min-h-[80vh]"
          style={{ 
            background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)',
            border: '1px solid #2a2a2a',
            borderTop: 'none',
          }}
        >
          {/* Completed lines */}
          {lines.map((line, index) => (
            <div 
              key={index} 
              className="text-sm md:text-base whitespace-pre-wrap leading-relaxed"
              style={{ 
                color: line.color || '#4ade80',
                textShadow: line.color 
                  ? `0 0 10px ${line.color}80` 
                  : '0 0 10px rgba(0, 255, 0, 0.5)',
                minHeight: line.text === '' ? '1.5em' : 'auto',
              }}
            >
              {line.text}
            </div>
          ))}
          
          {/* Currently typing line */}
          {currentLineIndex < terminalContent.length && (
            <div 
              className="text-sm md:text-base whitespace-pre-wrap leading-relaxed"
              style={{ 
                color: currentTypingColor || '#4ade80',
                textShadow: currentTypingColor 
                  ? `0 0 10px ${currentTypingColor}80` 
                  : '0 0 10px rgba(0, 255, 0, 0.5)',
              }}
            >
              {currentTypingLine}
              <span 
                className="inline-block w-2 h-4 ml-0.5 align-middle"
                style={{ 
                  backgroundColor: showCursor ? (currentTypingColor || '#4ade80') : 'transparent',
                  boxShadow: showCursor ? `0 0 10px ${currentTypingColor || 'rgba(0, 255, 0, 0.8)'}` : 'none',
                }}
              />
            </div>
          )}

          {/* Final cursor after all text */}
          {currentLineIndex >= terminalContent.length && (
            <div className="text-green-400 text-sm md:text-base mt-2">
              $ <span 
                className="inline-block w-2 h-4 ml-0.5 align-middle"
                style={{ 
                  backgroundColor: showCursor ? '#4ade80' : 'transparent',
                  boxShadow: showCursor ? '0 0 10px rgba(0, 255, 0, 0.8)' : 'none',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Terminal;
