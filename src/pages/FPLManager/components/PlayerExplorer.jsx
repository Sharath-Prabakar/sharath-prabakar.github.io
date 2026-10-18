import React, { useState, useMemo } from 'react';
import PlayerCard from './PlayerCard';

const PlayerExplorer = ({ bootstrapData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posFilter, setPosFilter] = useState('0'); // 0 = all
  const [sortBy, setSortBy] = useState('totw_score');
  const [totwOnly, setTotwOnly] = useState(false);
  
  const players = bootstrapData?.elements || [];

  const getTotwScore = (p) => {
    const ep = parseFloat(p.ep_next) || 0;
    const form = parseFloat(p.form) || 0;
    const ppg = parseFloat(p.points_per_game) || 0;
    const xgi90 = parseFloat(p.expected_goal_involvements_per_90) || 0;
    const dtCount = p.dreamteam_count || 0;
    const inSeasonDt = p.in_dreamteam ? 1 : 0;
    const totwBonus = (dtCount * 2.2) + (inSeasonDt * 3.0);
    const minutesFactor = (p.minutes || 0) >= 270 ? 1.0 : (p.minutes || 0) >= 120 ? 0.8 : 0.35;
    return +(((ep * 1.4) + (form * 0.9) + (ppg * 0.6) + (xgi90 * 3.0) + totwBonus) * minutesFactor).toFixed(1);
  };
  
  const filteredPlayers = useMemo(() => {
    let result = [...players];
    
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.web_name.toLowerCase().includes(lower) || 
        p.first_name.toLowerCase().includes(lower) || 
        p.second_name.toLowerCase().includes(lower)
      );
    }
    
    if (posFilter !== '0') {
      result = result.filter(p => p.element_type === parseInt(posFilter));
    }

    if (totwOnly) {
      result = result.filter(p => p.in_dreamteam || (p.dreamteam_count > 0));
    }
    
    // Sort descending
    result.sort((a, b) => {
      if (sortBy === 'totw_score') {
        return getTotwScore(b) - getTotwScore(a);
      }
      const valA = parseFloat(a[sortBy]) || 0;
      const valB = parseFloat(b[sortBy]) || 0;
      return valB - valA;
    });
    
    return result.slice(0, 50); // Limit to top 50 for performance
  }, [players, searchTerm, posFilter, sortBy, totwOnly]);

  return (
    <div className="fpl-player-explorer">
      <div className="fpl-card" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Search players..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: '1 1 200px', padding: '10px', background: '#222', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
        />
        
        <select 
          value={posFilter} 
          onChange={(e) => setPosFilter(e.target.value)}
          style={{ padding: '10px', background: '#222', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
        >
          <option value="0">All Positions</option>
          <option value="1">Goalkeepers</option>
          <option value="2">Defenders</option>
          <option value="3">Midfielders</option>
          <option value="4">Forwards</option>
        </select>
        
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: '10px', background: '#222', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
        >
          <option value="totw_score">AI + TOTW Transfer Score</option>
          <option value="dreamteam_count">Team of the Week Count</option>
          <option value="total_points">Total Points</option>
          <option value="form">Form</option>
          <option value="now_cost">Price</option>
          <option value="selected_by_percent">Selected By %</option>
          <option value="expected_goal_involvements">xGI</option>
        </select>

        <button
          onClick={() => setTotwOnly(prev => !prev)}
          style={{
            padding: '10px 14px',
            background: totwOnly ? 'linear-gradient(135deg, #d4af37 0%, #b48a1e 100%)' : '#222',
            border: totwOnly ? '1px solid #fbbf24' : '1px solid #333',
            color: totwOnly ? '#000' : '#fbbf24',
            fontWeight: 'bold',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          ⭐ Team of the Week ({players.filter(p => p.in_dreamteam || p.dreamteam_count > 0).length})
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '15px' }}>
        {filteredPlayers.map(player => (
          <div key={player.id} className="fpl-card" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '15px', border: player.in_dreamteam ? '1px solid rgba(212, 175, 55, 0.5)' : undefined }}>
            <PlayerCard player={player} size="small" />
            <div style={{ flex: 1 }}>
              {(player.in_dreamteam || player.dreamteam_count > 0) && (
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  {player.in_dreamteam && (
                    <span style={{ background: 'rgba(212, 175, 55, 0.2)', border: '1px solid #d4af37', color: '#fbbf24', fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                      🏆 Dream Team
                    </span>
                  )}
                  {player.dreamteam_count > 0 && (
                    <span style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', color: '#38bdf8', fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                      ⭐ {player.dreamteam_count}x TOTW
                    </span>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#888', fontSize: '0.8rem' }}>AI + TOTW Score</span>
                <span style={{ color: '#00ff87', fontWeight: 'bold' }}>{getTotwScore(player)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#888', fontSize: '0.8rem' }}>Form</span>
                <span style={{ color: '#e0e0e0', fontWeight: 'bold' }}>{player.form}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#888', fontSize: '0.8rem' }}>Selected</span>
                <span style={{ color: '#e0e0e0' }}>{player.selected_by_percent}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888', fontSize: '0.8rem' }}>xGI</span>
                <span style={{ color: '#e0e0e0' }}>{player.expected_goal_involvements || '0.0'}</span>
              </div>
            </div>
          </div>
        ))}
        {filteredPlayers.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#888' }}>
            No players found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerExplorer;
