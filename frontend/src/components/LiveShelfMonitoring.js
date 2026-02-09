import React, { useState } from 'react';
import './LiveShelfMonitoring.css';

const LiveShelfMonitoring = () => {
  const [viewMode, setViewMode] = useState('detection');

  return (
    <div className="card">
      <div className="card-header-with-toggle">
        <h2 className="card-title">Live Shelf View</h2>
        <div className="view-toggle">
          <button
            className={`toggle-button ${viewMode === 'original' ? 'active' : ''}`}
            onClick={() => setViewMode('original')}
          >
            Original View
          </button>
          <button
            className={`toggle-button ${viewMode === 'detection' ? 'active' : ''}`}
            onClick={() => setViewMode('detection')}
          >
            Detection Overlay
          </button>
        </div>
      </div>
      <div className="video-container">
        <div className="video-placeholder">
          <div className="placeholder-content">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M10 8l6 4-6 4V8z" />
            </svg>
            <p>Camera Feed / Processed Detection View</p>
            {viewMode === 'detection' && (
              <span className="overlay-badge">Detection Overlay Active</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveShelfMonitoring;
