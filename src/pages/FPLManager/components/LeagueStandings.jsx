import React from 'react';

const LeagueStandings = ({ managerData }) => {
  // Simple mock display since we might not fetch full league details in the initial call
  const classicLeagues = managerData?.leagues?.classic || [];
  
  if (!classicLeagues.length) {
    return (
      <div className="fpl-card" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
        No classic leagues found for this manager.
      </div>
    );
  }

  return (
    <div className="fpl-leagues">
      <h2 style={{ color: '#d4af37', marginBottom: '20px' }}>Classic Leagues</h2>
      <div style={{ display: 'grid', gap: '15px' }}>
        {classicLeagues.map(league => (
          <div key={league.id} className="fpl-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#e0e0e0' }}>{league.name}</div>
              <div style={{ color: '#888', fontSize: '0.9rem', marginTop: '4px' }}>Rank: {league.entry_rank?.toLocaleString() || '-'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#d4af37', fontSize: '1.2rem', fontWeight: 'bold' }}>{league.entry_rank === 1 ? '🥇' : league.entry_rank === 2 ? '🥈' : league.entry_rank === 3 ? '🥉' : `#${league.entry_rank}`}</div>
              {league.entry_last_rank && league.entry_last_rank > league.entry_rank && (
                <div style={{ color: '#4caf50', fontSize: '0.8rem', marginTop: '4px' }}>▲ Up {league.entry_last_rank - league.entry_rank}</div>
              )}
              {league.entry_last_rank && league.entry_last_rank < league.entry_rank && (
                <div style={{ color: '#f44336', fontSize: '0.8rem', marginTop: '4px' }}>▼ Down {league.entry_rank - league.entry_last_rank}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeagueStandings;
