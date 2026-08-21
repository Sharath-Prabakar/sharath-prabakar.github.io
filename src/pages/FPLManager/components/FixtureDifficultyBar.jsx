import React from 'react';

const FixtureDifficultyBar = ({ fixtures }) => {
  if (!fixtures || !fixtures.length) return null;

  return (
    <div style={{ display: 'flex', gap: '2px', marginTop: '5px' }}>
      {fixtures.map((fix, idx) => (
        <div 
          key={idx} 
          className={`fdr-${fix.difficulty}`}
          style={{ 
            padding: '2px 4px', 
            fontSize: '0.7rem', 
            fontWeight: 'bold',
            borderRadius: '2px',
            textAlign: 'center',
            flex: 1
          }}
          title={`Difficulty: ${fix.difficulty}`}
        >
          {fix.opponent_short} {fix.is_home ? '(H)' : '(A)'}
        </div>
      ))}
    </div>
  );
};

export default FixtureDifficultyBar;
