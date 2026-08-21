import React from 'react';

const PlayerCard = ({ player, size = 'medium' }) => {
  if (!player) return null;

  const posClass = player.element_type === 1 ? 'pos-gkp' : 
                   player.element_type === 2 ? 'pos-def' : 
                   player.element_type === 3 ? 'pos-mid' : 'pos-fwd';

  return (
    <div className={`fpl-player-badge ${posClass}`} style={{ 
      display: 'inline-block',
      width: size === 'small' ? '80px' : size === 'large' ? '150px' : '100px',
      fontSize: size === 'small' ? '0.75rem' : '0.85rem'
    }}>
      <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {player.web_name}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginTop: '2px', fontSize: '0.9em' }}>
        <span>£{(player.now_cost / 10).toFixed(1)}</span>
        <span style={{ color: '#e0e0e0' }}>{player.total_points}pts</span>
      </div>
    </div>
  );
};

export default PlayerCard;
