import React, { useState, useEffect } from 'react';

const LoadingPopup = ({ customMessage }) => {
  const [msgIndex, setMsgIndex] = useState(0);

  const messages = [
    "Connecting to Premier League API...",
    "Syncing squad & manager data...",
    "Fetching gameweek fixtures & FDR...",
    "Loading AI strategic projections...",
    "Finalizing dashboard..."
  ];

  useEffect(() => {
    if (customMessage) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [customMessage, messages.length]);

  return (
    <div className="fpl-loading-overlay">
      <div className="fpl-loading-popup">
        <div className="fpl-spinner-container">
          <div className="fpl-spinner"></div>
          <span className="fpl-spinner-inner" role="img" aria-label="football">⚽</span>
        </div>
        <div>
          <h3 className="fpl-loading-title">FPL AI Manager</h3>
          <p className="fpl-loading-text">
            {customMessage || messages[msgIndex]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingPopup;
