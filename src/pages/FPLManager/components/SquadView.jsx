import React, { useState, useEffect } from 'react';
import { fplService } from '../../../services/fplService';

const POSITION_LABELS = { 1: 'GKP', 2: 'DEF', 3: 'MID', 4: 'FWD' };
const POSITION_COLORS = { 1: '#d4af37', 2: '#4caf50', 3: '#2196f3', 4: '#f44336' };

const CHIP_CONFIG = [
  { apiName: 'wildcard', label: 'WC', fullName: 'Wildcard', emoji: '🔄', color: '#d4af37' },
  { apiName: 'freehit', label: 'FH', fullName: 'Free Hit', emoji: '⚡', color: '#2196f3' },
  { apiName: 'bboost', label: 'BB', fullName: 'Bench Boost', emoji: '💪', color: '#4caf50' },
  { apiName: '3xc', label: 'TC', fullName: 'Triple Captain', emoji: '👑', color: '#f44336' },
];

const SquadView = ({ managerData, currentGw, bootstrapData, selectedAnalysis, chipsUsed = [], freeTransfers = '1', transfersMade = '0' }) => {
  const [picks, setPicks] = useState([]);

  useEffect(() => {
    if (selectedAnalysis && selectedAnalysis.squad) {
      const mappedPicks = selectedAnalysis.squad.map((p, index) => ({
        element: p.id,
        position: index + 1,
        is_captain: p.is_captain || p.is_captain === true,
        is_vice_captain: p.is_vice || p.is_vice_captain === true
      }));
      setPicks(mappedPicks);
    } else {
      setPicks([]);
    }
  }, [selectedAnalysis]);

  const getPlayer = (elementId) => {
    if (!bootstrapData?.elements) return null;
    return bootstrapData.elements.find(p => p.id === elementId);
  };

  const getTeamShortName = (teamId) => {
    if (!bootstrapData?.teams) return '';
    const team = bootstrapData.teams.find(t => t.id === teamId);
    return team?.short_name || '';
  };

  if (!selectedAnalysis || picks.length === 0) {
    return (
      <div className="fpl-card" style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '2rem', marginBottom: '15px' }}>⚽</div>
        <h3 style={{ color: '#d4af37', marginBottom: '10px' }}>No Squad Data for This Gameweek</h3>
        <p style={{ color: '#888', maxWidth: '400px', margin: '0 auto', lineHeight: '1.6' }}>
          Squad picks are not available for this selected gameweek.
        </p>
      </div>
    );
  }

  // Split into starting XI (positions 1-11) and bench (12-15)
  const startingXI = picks.filter(p => p.position <= 11);
  const bench = picks.filter(p => p.position > 11);

  // Group starting XI by position type
  const gks = startingXI.filter(p => getPlayer(p.element)?.element_type === 1);
  const defs = startingXI.filter(p => getPlayer(p.element)?.element_type === 2);
  const mids = startingXI.filter(p => getPlayer(p.element)?.element_type === 3);
  const fwds = startingXI.filter(p => getPlayer(p.element)?.element_type === 4);

  const renderPlayerBadge = (pick, isBench = false) => {
    const player = getPlayer(pick.element);
    if (!player) return null;

    const posColor = POSITION_COLORS[player.element_type] || '#888';
    const teamName = getTeamShortName(player.team);
    const points = player.event_points ?? player.total_points ?? 0;
    const price = (player.now_cost / 10).toFixed(1);

    const teamCode = bootstrapData?.teams?.find(t => t.id === player.team)?.code;

    return (
      <div
        key={pick.element}
        className="fpl-player-badge"
        style={{
          position: 'relative',
          background: isBench ? '#1a1a1a' : '#111',
          border: `1px solid ${posColor}33`,
          borderRadius: '8px',
          padding: '8px 10px',
          minWidth: '82px',
          maxWidth: '105px',
          textAlign: 'center',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'default',
        }}
      >
        {/* Captain / Vice badge */}
        {pick.is_captain && (
          <div style={{
            position: 'absolute', top: '-7px', right: '-5px',
            background: '#d4af37', color: '#000', borderRadius: '50%',
            width: '20px', height: '20px', fontSize: '10px', fontWeight: 'bold',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(212,175,55,0.5)', zIndex: 2
          }}>C</div>
        )}
        {pick.is_vice_captain && (
          <div style={{
            position: 'absolute', top: '-7px', right: '-5px',
            background: '#666', color: '#fff', borderRadius: '50%',
            width: '20px', height: '20px', fontSize: '10px', fontWeight: 'bold',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2
          }}>V</div>
        )}

        {/* Position tag */}
        <div style={{
          fontSize: '0.58rem', color: posColor, fontWeight: 'bold',
          letterSpacing: '1px', marginBottom: '4px'
        }}>
          {POSITION_LABELS[player.element_type]}
        </div>

        {/* Team Badge */}
        {teamCode && (
          <img 
            src={`https://resources.premierleague.com/premierleague25/badges-alt/${teamCode}.svg`} 
            alt={teamName}
            style={{ width: '28px', height: '28px', objectFit: 'contain', marginBottom: '4px' }}
          />
        )}

        {/* Player name */}
        <div style={{
          fontWeight: 'bold', fontSize: '0.8rem', color: '#e0e0e0',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
          {player.web_name}
        </div>

        {/* Team Name */}
        <div style={{ fontSize: '0.68rem', color: '#888', marginBottom: '3px' }}>
          {teamName}
        </div>

        {/* Price & Points */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', fontSize: '0.68rem' }}>
          <span style={{ color: '#4caf50' }}>£{price}m</span>
          <span style={{ color: '#d4af37' }}>{points}pts</span>
        </div>
      </div>
    );
  };

  const renderRow = (players) => (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {players.map(p => renderPlayerBadge(p))}
      </div>
    </div>
  );

  const formation = `${defs.length}-${mids.length}-${fwds.length}`;

  return (
    <div className="fpl-squad-view">
      {/* Pitch */}
      <div className="fpl-pitch" style={{
        background: 'linear-gradient(180deg, #1a4d2e 0%, #143d24 20%, #1a4d2e 40%, #143d24 60%, #1a4d2e 80%, #143d24 100%)',
        borderRadius: '12px',
        padding: '16px 12px',
        border: '2px solid #2a6e3f',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '520px',
      }}>
        {/* Formation badge inside pitch */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '8px',
          position: 'relative',
          zIndex: 5
        }}>
          <span style={{
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            color: '#d4af37',
            padding: '3px 14px',
            borderRadius: '14px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            letterSpacing: '1.5px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
          }}>
            FORMATION {formation}
          </span>
        </div>

        {/* Pitch line decorations */}
        <div style={{
          position: 'absolute', top: '50%', left: '10%', right: '10%',
          height: '1px', background: '#ffffff15'
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '60px', height: '60px', borderRadius: '50%', border: '1px solid #ffffff15'
        }} />

        {renderRow(fwds)}
        {renderRow(mids)}
        {renderRow(defs)}
        {renderRow(gks)}

        {/* Chips Available - bottom right corner */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          zIndex: 5,
          alignItems: 'flex-end',
        }}>
          {CHIP_CONFIG.map(chip => {
            const usedCount = chipsUsed.filter(c => c.name === chip.apiName).length;
            const totalAvailable = 2;
            const remaining = totalAvailable - usedCount;
            
            if (remaining <= 0) return null;

            return (
              <div
                key={chip.apiName}
                title={`${chip.fullName}: ${remaining}/${totalAvailable} available`}
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(4px)',
                  border: `1px solid ${chip.color}55`,
                  borderRadius: '6px',
                  padding: '3px 7px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'default',
                }}
              >
                <span style={{ color: chip.color, fontSize: '0.65rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                  {chip.fullName}
                </span>
                <span style={{
                  background: chip.color + '33',
                  color: chip.color,
                  fontSize: '0.6rem',
                  fontWeight: 'bold',
                  borderRadius: '3px',
                  padding: '0 3px',
                  lineHeight: '1.3'
                }}>
                  x{remaining}
                </span>
              </div>
            );
          })}
        </div>

        {/* Transfers Info - bottom left corner */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          zIndex: 5,
        }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            padding: '3px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span style={{ color: '#aaa', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Free Transfers:</span>
            <span style={{ color: '#00ff87', fontSize: '0.75rem', fontWeight: 'bold' }}>{freeTransfers || '1'}</span>
          </div>
          <div style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            padding: '3px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span style={{ color: '#aaa', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Transfers Done:</span>
            <span style={{ color: '#ffb800', fontSize: '0.75rem', fontWeight: 'bold' }}>{transfersMade || '0'}</span>
          </div>
        </div>
      </div>

      {/* Bench */}
      <div className="fpl-card" style={{ marginTop: '16px', backgroundColor: '#0d0d0d', border: '1px solid #222', borderRadius: '12px', padding: '16px' }}>
        <h3 style={{ marginTop: 0, textAlign: 'center', color: '#666', fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
          Substitutes
        </h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {bench.map(p => renderPlayerBadge(p, true))}
        </div>
      </div>
    </div>
  );
};

export default SquadView;
