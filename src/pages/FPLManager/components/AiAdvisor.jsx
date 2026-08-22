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

  const getPlayerActualPoints = (p) => {
    const el = bootstrapData?.elements?.find(e => e.id === p.id || e.web_name === p.name);
    const raw = p.actual ?? p.actual_points ?? el?.event_points ?? 0;
    return Number(raw);
  };

  const xiActual = top11.reduce((sum, p) => sum + getPlayerActualPoints(p) * (p.is_captain ? 2 : 1), 0);
  const totalActual = squad.reduce((sum, p) => sum + getPlayerActualPoints(p), 0);

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

  const renderCaptaincyDetails = (rec) => {
    if (!rec) return null;

    const matchV = rec.match(/^(.*?)\s*\((?:V|Vice|Vice-Captain):\s*(.*?)\)$/i);
    if (matchV) {
      const cap = matchV[1].replace(/👑|\(C\)/g, '').trim();
      const vice = matchV[2].replace(/🥈|\(V\)/g, '').trim();
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>Captain:</span>
            <span style={{ color: '#d4af37', fontWeight: 'bold', fontSize: '1rem' }}>{cap}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>Vice-Captain:</span>
            <span style={{ color: '#e0e0e0', fontWeight: 'bold', fontSize: '1rem' }}>{vice}</span>
          </div>
        </div>
      );
    }

    if (rec.includes('\n') || rec.includes(' | ')) {
      const parts = rec.split(/\n| \| /);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
          {parts.map((p, i) => (
            <div key={i} style={{ color: i === 0 ? '#d4af37' : '#e0e0e0', fontWeight: 'bold', fontSize: '0.95rem' }}>
              {p.replace(/👑|🥈|\(C\)|\(V\)/g, '').trim()}
            </div>
          ))}
        </div>
      );
    }

    return <p style={{ color: '#e0e0e0', fontSize: '1rem', margin: 0 }}>{rec.replace(/👑|🥈|\(C\)|\(V\)/g, '').trim()}</p>;
  };

  const renderDashboard = () => (
    <>
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <div className="fpl-card" style={{ padding: '20px', flex: '1.8', minWidth: '320px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ color: '#d4af37', margin: 0, fontSize: '1.2rem' }}>AI Projections (GW {latestAnalysis.gameweek})</h2>
          <span style={{ color: '#888', fontSize: '0.8rem' }}>Analyzed: {new Date(latestAnalysis.analyzedAt).toLocaleString()}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '4px' }}>
          <div style={{ background: '#111', padding: '12px 8px', borderRadius: '8px', flex: 1, minWidth: '60px', textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '0.72rem' }}>XI Projected</div>
            <div style={{ color: '#4caf50', fontSize: '1.4rem', fontWeight: 'bold' }}>{xiExpected}</div>
          </div>
          <div style={{ background: '#111', padding: '12px 8px', borderRadius: '8px', flex: 1, minWidth: '60px', textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '0.72rem' }}>XI Actual</div>
            <div style={{ color: xiActual > 0 ? '#00ff87' : '#e0e0e0', fontSize: '1.4rem', fontWeight: 'bold' }}>{xiActual}</div>
          </div>
          <div style={{ background: '#111', padding: '12px 8px', borderRadius: '8px', flex: 1, minWidth: '60px', textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '0.72rem' }}>Squad Total</div>
            <div style={{ color: '#d4af37', fontSize: '1.4rem', fontWeight: 'bold' }}>{totalExpected}</div>
          </div>
          <div style={{ background: '#111', padding: '12px 8px', borderRadius: '8px', flex: 1, minWidth: '60px', textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '0.72rem' }}>Squad Actual</div>
            <div style={{ color: totalActual > 0 ? '#00ff87' : '#e0e0e0', fontSize: '1.4rem', fontWeight: 'bold' }}>{totalActual}</div>
          </div>
          <div style={{ background: '#111', padding: '12px 8px', borderRadius: '8px', flex: 1, minWidth: '60px', textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '0.72rem' }}>Bank</div>
            <div style={{ color: '#e0e0e0', fontSize: '1.4rem', fontWeight: 'bold' }}>£{latestAnalysis.bank}m</div>
          </div>
        </div>

        <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #333', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {latestAnalysis.captainRecommendation && (
            <div style={{ flex: '1', minWidth: '180px' }}>
              <h3 style={{ color: '#d4af37', margin: '0 0 6px 0', fontSize: '0.85rem', textTransform: 'uppercase' }}>Suggested Captaincy</h3>
              {renderCaptaincyDetails(latestAnalysis.captainRecommendation)}
            </div>
          )}

          <div style={{ flex: '1.2', minWidth: '220px', borderLeft: '1px solid #222', paddingLeft: '20px' }}>
            <h3 style={{ color: '#d4af37', margin: '0 0 8px 0', fontSize: '0.85rem', textTransform: 'uppercase' }}>Squad Health</h3>
            {latestAnalysis.injuries && latestAnalysis.injuries.length > 0 ? (
              <ul style={{ color: '#e0e0e0', paddingLeft: '18px', margin: 0, fontSize: '0.85rem' }}>
                {latestAnalysis.injuries.map((inj, i) => (
                  <li key={i} style={{ marginBottom: '4px' }}>{inj}</li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#4caf50', margin: 0, fontSize: '0.85rem' }}>Fully fit squad! No injuries or suspensions reported.</p>
            )}
          </div>
        </div>
      </div>

      <div className="fpl-card" style={{ padding: '20px', flex: '1', minWidth: '260px' }}>
        <h3 style={{ color: '#d4af37', margin: '0 0 10px 0', fontSize: '0.9rem', textTransform: 'uppercase' }}>Suggested Transfers</h3>
        <div style={{ color: '#e0e0e0', fontSize: '0.95rem', margin: '0 0 20px 0', lineHeight: '1.6' }}>
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

        <h3 style={{ color: '#d4af37', margin: '0 0 10px 0', fontSize: '0.9rem', textTransform: 'uppercase' }}>Power Chip Strategy</h3>
        <div style={{ color: '#e0e0e0', fontSize: '0.95rem', margin: 0, lineHeight: '1.6' }}>
          {latestAnalysis.chipRecommendation && latestAnalysis.chipRecommendation !== 'NONE' ? (
            <div>
              <div style={{ color: '#00ff87', fontWeight: 'bold', marginBottom: '5px' }}>
                {latestAnalysis.chipRecommendation} RECOMMENDED
              </div>
              <div style={{ fontSize: '0.85rem', color: '#aaa' }}>{latestAnalysis.chipReason}</div>
            </div>
          ) : (
            <div style={{ color: '#888' }}>No chip recommended for this Gameweek.</div>
          )}
        </div>
      </div>
    </div>
    
    {latestAnalysis.explanation && (
      <div className="fpl-card" style={{ padding: '20px', marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ color: '#d4af37', margin: 0, fontSize: '0.95rem', textTransform: 'uppercase' }}>Current Strategy</h3>
          <span style={{ color: '#888', fontSize: '0.8rem' }}>
            {latestAnalysis.analyzedAt ? new Date(latestAnalysis.analyzedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : ''}
          </span>
        </div>
        <p style={{ color: '#ddd', fontSize: '1rem', margin: '0 0 20px 0', lineHeight: '1.6' }}>{latestAnalysis.explanation}</p>
        
        {latestAnalysis.chipForecast && (
          <div style={{ marginTop: '20px', borderTop: '1px solid #333', paddingTop: '20px' }}>
            <h3 style={{ color: '#d4af37', margin: '0 0 15px 0', fontSize: '0.85rem', textTransform: 'uppercase' }}>Chip Forecast (Season Outlook)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              
              {/* Half 1 */}
              <div style={{ background: '#111', padding: '12px', borderRadius: '8px', border: '1px solid #222' }}>
                <h4 style={{ color: '#888', margin: '0 0 10px 0', fontSize: '0.75rem', textTransform: 'uppercase' }}>Half 1 (GW1-19)</h4>
                {latestAnalysis.chipForecast.half1 && Object.entries(latestAnalysis.chipForecast.half1).map(([chipKey, data]) => (
                  <div key={chipKey} style={{ marginBottom: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#d4af37', fontWeight: 'bold', textTransform: 'capitalize' }}>
                      {chipKey.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>{' '}
                    <span style={{ color: '#00ff87' }}>GW{data.bestGw}</span>
                    <div style={{ color: '#aaa', fontSize: '0.75rem', marginTop: '2px' }}>{data.reason}</div>
                  </div>
                ))}
              </div>

              {/* Half 2 */}
              <div style={{ background: '#111', padding: '12px', borderRadius: '8px', border: '1px solid #222' }}>
                <h4 style={{ color: '#888', margin: '0 0 10px 0', fontSize: '0.75rem', textTransform: 'uppercase' }}>Half 2 (GW20-38)</h4>
                {latestAnalysis.chipForecast.half2 && Object.entries(latestAnalysis.chipForecast.half2).map(([chipKey, data]) => (
                  <div key={chipKey} style={{ marginBottom: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#d4af37', fontWeight: 'bold', textTransform: 'capitalize' }}>
                      {chipKey.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>{' '}
                    <span style={{ color: '#00ff87' }}>GW{data.bestGw}</span>
                    <div style={{ color: '#aaa', fontSize: '0.75rem', marginTop: '2px' }}>{data.reason}</div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}
        
        {gameweekHistory && gameweekHistory.length > 0 && (
          <div style={{ marginTop: '30px', borderTop: '1px solid #333', paddingTop: '20px' }}>
            <h3 style={{ color: '#888', margin: '0 0 15px 0', fontSize: '0.85rem', textTransform: 'uppercase' }}>Strategy Timeline (Updates)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {gameweekHistory.length === 1 ? (
                <div style={{ color: '#666', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  No previous updates for this gameweek.
                </div>
              ) : (
                gameweekHistory.slice(1).map((historyItem, index) => {
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
                })
              )}
            </div>
          </div>
        )}
      </div>
    )}
    </>
  );

  const renderInsights = () => (
    <div className="fpl-card" style={{ padding: '10px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px 8px 10px', borderBottom: '1px solid #333', marginBottom: '8px' }}>
        <span style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Player</span>
        <div style={{ display: 'flex', gap: '12px', textAlign: 'right' }}>
          <span style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold', minWidth: '45px', textAlign: 'right' }}>Exp</span>
          <span style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold', minWidth: '45px', textAlign: 'right' }}>Actual</span>
        </div>
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

          const rawActual = getPlayerActualPoints(player);
          const actualPts = rawActual * (player.is_captain ? 2 : 1);
          
          return (
            <div key={player.id} style={{ background: '#111', padding: '6px 10px', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {teamCode && (
                    <img 
                      src={`https://resources.premierleague.com/premierleague25/badges-alt/${teamCode}.svg`} 
                      alt={player.team}
                      style={{ width: '16px', height: '16px', objectFit: 'contain', flexShrink: 0 }}
                    />
                  )}
                  <span style={{ fontWeight: 'bold', color: '#e0e0e0', fontSize: '0.85rem' }}>
                    {player.name}
                  </span>
                  <span style={{ color: '#888', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
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
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0, textAlign: 'right' }}>
                  <span style={{ color: '#d4af37', fontWeight: 'bold', fontSize: '0.9rem', minWidth: '45px', textAlign: 'right' }}>
                    {player.expected}
                  </span>
                  <span style={{ 
                    color: actualPts > 0 ? '#00ff87' : '#aaa', 
                    fontWeight: 'bold', 
                    fontSize: '0.9rem', 
                    minWidth: '45px', 
                    textAlign: 'right' 
                  }}>
                    {actualPts}
                  </span>
                </div>
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
