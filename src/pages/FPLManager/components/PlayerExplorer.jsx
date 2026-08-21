import React, { useState, useMemo } from 'react';
import PlayerCard from './PlayerCard';

const PlayerExplorer = ({ bootstrapData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posFilter, setPosFilter] = useState('0'); // 0 = all
  const [sortBy, setSortBy] = useState('total_points');
  
  const players = bootstrapData?.elements || [];
  
  const filteredPlayers = useMemo(() => {
    let result = players;
    
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
    
    // Sort descending
    result.sort((a, b) => {
      const valA = parseFloat(a[sortBy]) || 0;
      const valB = parseFloat(b[sortBy]) || 0;
      return valB - valA;
    });
    
    return result.slice(0, 50); // Limit to top 50 for performance
  }, [players, searchTerm, posFilter, sortBy]);

  return (
    <div className="fpl-player-explorer">
      <div className="fpl-card" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
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
          <option value="total_points">Total Points</option>
          <option value="form">Form</option>
          <option value="now_cost">Price</option>
          <option value="selected_by_percent">Selected By %</option>
          <option value="expected_goal_involvements">xGI</option>
        </select>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
        {filteredPlayers.map(player => (
          <div key={player.id} className="fpl-card" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '15px' }}>
            <PlayerCard player={player} size="small" />
            <div style={{ flex: 1 }}>
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
