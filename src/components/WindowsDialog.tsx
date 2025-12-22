import React, { useState, useRef, useEffect } from 'react';

interface WindowsDialogProps {
  title: string;
  subtitle?: string;
  message: string;
  buttonText: string;
  onClick?: () => void;
  secondButtonText?: string;
  onSecondButtonClick?: () => void;
}

const WindowsDialog: React.FC<WindowsDialogProps> = ({
  title,
  subtitle,
  message,
  buttonText,
  onClick,
  secondButtonText,
  onSecondButtonClick
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragOffset.x,
        y: touch.clientY - dragOffset.y
      });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!dialogRef.current) return;
    const rect = dialogRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!dialogRef.current) return;
    const touch = e.touches[0];
    const rect = dialogRef.current.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });
    setIsDragging(true);
  };

  return (
    <div 
      ref={dialogRef}
      className="windows-dialog"
      style={{
        position: position.x !== 0 || position.y !== 0 ? 'fixed' : 'relative',
        left: position.x !== 0 || position.y !== 0 ? `${position.x}px` : 'auto',
        top: position.x !== 0 || position.y !== 0 ? `${position.y}px` : 'auto',
        transform: position.x !== 0 || position.y !== 0 ? 'none' : undefined,
      }}
    >
      {/* Title Bar - Draggable */}
      <div 
        className="windows-titlebar"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ cursor: 'grab' }}
      >
        <span className="windows-title">{title}</span>
        <button className="windows-close-btn" aria-label="Close">
          <span>×</span>
        </button>
      </div>
      
      {/* Content Area */}
      <div className="windows-content">
        <div className="windows-content-inner">
          {/* Globe Icon */}
          <div className="windows-icon-row">
            <div className="windows-globe-icon">
              <div className="globe-sphere">
                <div className="globe-land"></div>
              </div>
            </div>
            {subtitle && <span className="windows-subtitle">{subtitle}</span>}
          </div>
          
          {/* Main Message */}
          <p className="windows-message">{message}</p>
          
          {/* Buttons */}
          <div className="windows-button-row">
            {secondButtonText && (
              <button className="windows-button" onClick={onSecondButtonClick}>
                {secondButtonText}
              </button>
            )}
            <button className="windows-button" onClick={onClick}>
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WindowsDialog;
