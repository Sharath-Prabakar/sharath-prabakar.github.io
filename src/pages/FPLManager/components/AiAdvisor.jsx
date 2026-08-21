import React, { useState, useEffect } from 'react';
import { fplService } from '../../../services/fplService';

const AiAdvisor = ({ managerData, currentGw, selectedAnalysis, bootstrapData, layoutMode = 'all', gameweekHistory }) => {
  if (!selectedAnalysis) {
    return (
      <div className="fpl-card">
        <h2 style={{ color: '#d4af37', margin: '0 0 15px 0' }}>No AI Reports Found</h2>
        <p style={{ color: '#888' }}>
          Run the weekly FPL Manager script to generate an AI report for this gameweek.
        </p>
      </div>
    );
  }

  const latestAnalysis = selectedAnalysis;
  const squad = latestAnalysis?.squad || [];
  const top11 = [...squad].sort((a, b) => b.expected - a.expected).slice(0, 11);
  const xiExpected = top11.reduce((sum, p) => sum + (p.expected || 0) * (p.is_captain ? 2 : 1), 0).toFixed(1);
  const totalExpected = squad.reduce((sum, p) => sum + (p.expected || 0), 0).toFixed(1);

  const getTeamCode = (teamIdOrName) => {
    if (!bootstrapData?.teams) return null;
    const team = bootstrapData.teams.find(t => t.id === teamIdOrName || t.name === teamIdOrName);
    return team?.code;
  };

  const getTeamShortName = (teamIdOrName) => {
    if (!bootstrapData?.teams) return null;
    const team = bootstrapData.teams.find(t => t.id === teamIdOrName || t.name === teamIdOrName);
    return team?.short_name;
  };
  const renderDashboard = () => (
    <>
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <div className="fpl-card" style={{ padding: '20px', flex: '1.5', minWidth: '300px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ color: '#d4af37', margin: 0, fontSize: '1.2rem' }}>AI Projections (GW {latestAnalysis.gameweek})</h2>
          <span style={{ color: '#888', fontSize: '0.8rem' }}>Analyzed: {new Date(latestAnalysis.analyzedAt).toLocaleString()}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ background: '#111', padding: '15px', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '0.85rem' }}>XI Projected</div>
            <div style={{ color: '#4caf50', fontSize: '1.8rem', fontWeight: 'bold' }}>{xiExpected}</div>
          </div>
          <div style={{ background: '#111', padding: '15px', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '0.85rem' }}>Squad Total</div>
            <div style={{ color: '#d4af37', fontSize: '1.8rem', fontWeight: 'bold' }}>{totalExpected}</div>
          </div>
          <div style={{ background: '#111', padding: '15px', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '0.85rem' }}>Bank</div>
            <div style={{ color: '#e0e0e0', fontSize: '1.8rem', fontWeight: 'bold' }}>£{latestAnalysis.bank}m</div>
          </div>
        </div>

        {latestAnalysis.summary && (
          <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #333' }}>
            <h3 style={{ color: '#d4af37', margin: '0 0 5px 0', fontSize: '0.85rem', textTransform: 'uppercase' }}>📝 Gameweek Strategy</h3>
            <p style={{ color: '#bbb', fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>{latestAnalysis.summary}</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: '1', minWidth: '250px' }}>
        <div className="fpl-card" style={{ padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
          <h3 style={{ color: '#d4af37', margin: '0 0 5px 0', fontSize: '0.85rem', textTransform: 'uppercase' }}>👑 Suggested Captaincy</h3>
          <p style={{ color: '#e0e0e0', fontSize: '1rem', margin: 0 }}>{latestAnalysis.captainRecommendation}</p>
        </div>

        <div className="fpl-card" style={{ padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
          <h3 style={{ color: '#d4af37', margin: '0 0 5px 0', fontSize: '0.85rem', textTransform: 'uppercase' }}>🏥 Squad Health</h3>
          {latestAnalysis.injuries && latestAnalysis.injuries.length > 0 ? (
            <ul style={{ color: '#e0e0e0', paddingLeft: '20px', margin: 0, fontSize: '0.85rem' }}>
              {latestAnalysis.injuries.map((inj, i) => (
                <li key={i} style={{ marginBottom: '5px' }}>{inj}</li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#4caf50', margin: 0, fontSize: '0.85rem' }}>Fully fit squad! No injuries or suspensions reported.</p>
          )}
        </div>
      </div>

      <div className="fpl-card" style={{ padding: '20px', flex: '1', minWidth: '250px' }}>
        <h3 style={{ color: '#d4af37', margin: '0 0 10px 0', fontSize: '0.9rem', textTransform: 'uppercase' }}>🔄 Suggested Transfers</h3>
        <div style={{ color: '#e0e0e0', fontSize: '0.95rem', margin: 0, lineHeight: '1.6' }}>
          {latestAnalysis.transferRecommendation ? (
            latestAnalysis.transferRecommendation.split(' | ').map((transfer, index) => (
              <div key={index} style={{ marginBottom: index < latestAnalysis.transferRecommendation.split(' | ').length - 1 ? '10px' : '0', paddingBottom: index < latestAnalysis.transferRecommendation.split(' | ').length - 1 ? '10px' : '0', borderBottom: index < latestAnalysis.transferRecommendation.split(' | ').length - 1 ? '1px solid #333' : 'none' }}>
                {transfer}
              </div>
            ))
          ) : (
            "HOLD"
          )}
        </div>
      </div>
    </div>
    
    {latestAnalysis.explanation && (
      <div className="fpl-card" style={{ padding: '20px', marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ color: '#d4af37', margin: 0, fontSize: '0.95rem', textTransform: 'uppercase' }}>🧠 Current Strategy</h3>
          <span style={{ color: '#888', fontSize: '0.8rem' }}>
            {latestAnalysis.analyzedAt ? new Date(latestAnalysis.analyzedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : ''}
          </span>
        </div>
        <p style={{ color: '#ddd', fontSize: '1rem', margin: 0, lineHeight: '1.6' }}>{latestAnalysis.explanation}</p>
        
        {gameweekHistory && gameweekHistory.length > 1 && (
          <div style={{ marginTop: '30px', borderTop: '1px solid #333', paddingTop: '20px' }}>
            <h3 style={{ color: '#888', margin: '0 0 15px 0', fontSize: '0.85rem', textTransform: 'uppercase' }}>⏳ Strategy Timeline (Updates)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {gameweekHistory.slice(1).map((historyItem, index) => {
                const date = historyItem.analyzedAt ? new Date(historyItem.analyzedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Unknown Date';
                
                return (
                  <div key={index} style={{ paddingLeft: '15px', borderLeft: '2px solid #444', opacity: 0.6 }}>
                    <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '5px', fontWeight: 'bold' }}>
                      {date}
                    </div>
                    <div style={{ color: '#ccc', fontSize: '0.85rem', lineHeight: '1.4' }}>
                      {historyItem.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    )}
    </>
  );

  const renderInsights = () => (
    <div className="fpl-card" style={{ padding: '10px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px 5px 10px', borderBottom: '1px solid #333', marginBottom: '5px' }}>
        <span style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Player</span>
        <span style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Exp Pts</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
        {latestAnalysis.squad && latestAnalysis.squad.sort((a, b) => b.expected - a.expected).map(player => {
          const teamCode = getTeamCode(player.team);
          const teamShort = getTeamShortName(player.team);
          
          let opp = player.fixture;
          let fdr = null;
          if (player.fixture) {
            const match = player.fixture.match(/(.*)\s\((\d)\)$/);
            if (match) {
              opp = match[1];
              fdr = parseInt(match[2], 10);
            }
          }
          
          return (
            <div key={player.id} style={{ background: '#111', padding: '6px 10px', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {teamCode && (
                    <img 
                      src={`https://resources.premierleague.com/premierleague25/badges-alt/${teamCode}.svg`} 
                      alt={player.team}
                      style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                    />
                  )}
                  <span style={{ fontWeight: 'bold', color: '#e0e0e0', fontSize: '0.85rem' }}>
                    {player.name}
                  </span>
                  <span style={{ color: '#888', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ({teamShort || player.team})
                    {fdr ? (
                      <span style={{ 
                        display: 'inline-block', 
                        padding: '2px 6px', 
                        borderRadius: '3px', 
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        backgroundColor: fdr <= 2 ? '#01fc7a' : fdr === 3 ? '#ebebe4' : fdr === 4 ? '#ff005a' : '#800000',
                        color: fdr <= 3 ? '#000' : '#fff'
                      }}>
                        {opp}
                      </span>
                    ) : (
                      <span style={{ color: '#ccc' }}>{opp}</span>
                    )}
                  </span>
                  {player.is_captain && <span style={{ color: '#d4af37', fontWeight: 'bold', fontSize: '0.75rem', marginLeft: '4px' }}>👑(C)</span>}
                  {player.is_vice && <span style={{ color: '#ccc', fontWeight: 'bold', fontSize: '0.75rem', marginLeft: '4px' }}>🥈(V)</span>}
                </div>
                <span style={{ color: '#d4af37', fontWeight: 'bold', fontSize: '0.9rem' }}>{player.expected}</span>
              </div>
              {player.reasoning && (
                <div style={{ marginTop: '2px', fontSize: '0.75rem', color: '#777', fontStyle: 'italic', lineHeight: '1.2' }}>
                  {player.reasoning}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fpl-ai-advisor">
      {layoutMode === 'all' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {renderDashboard()}
          {renderInsights()}
        </div>
      )}
      {layoutMode === 'dashboard' && renderDashboard()}
      {layoutMode === 'insights' && renderInsights()}
    </div>
  );
};
export default AiAdvisor;
