import React from 'react';

const LiveGameweek = ({ currentGw }) => {
  return (
    <div className="fpl-live-gw">
      <div className="fpl-card" style={{ textAlign: 'center', padding: '40px' }}>
        <h2 style={{ color: '#d4af37' }}>Live Gameweek {currentGw?.id}</h2>
        <p style={{ color: '#888', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Live points tracking will be available during active gameweeks. The system will automatically update player points, bonus points, and live ranks as matches are played.
        </p>
        
        <div style={{ marginTop: '30px', display: 'inline-block', border: '1px solid #333', borderRadius: '8px', padding: '20px', background: '#0a0a0a' }}>
          <div style={{ color: '#4caf50', fontSize: '2rem', fontWeight: 'bold' }}>-- pts</div>
          <div style={{ color: '#888', fontSize: '0.9rem', marginTop: '5px' }}>Live Score</div>
        </div>
      </div>
    </div>
  );
};

export default LiveGameweek;
