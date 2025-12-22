import React from 'react';

interface WindowsDialogProps {
  title: string;
  subtitle?: string;
  message: string;
  buttonText: string;
  onClick?: () => void;
}

const WindowsDialog: React.FC<WindowsDialogProps> = ({
  title,
  subtitle,
  message,
  buttonText,
  onClick
}) => {
  return (
    <div className="windows-dialog">
      {/* Title Bar */}
      <div className="windows-titlebar">
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
          
          {/* Button */}
          <button className="windows-button" onClick={onClick}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WindowsDialog;
