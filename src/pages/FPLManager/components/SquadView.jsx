import React, { useState, useEffect } from 'react';
import { fplService } from '../../../services/fplService';

const POSITION_LABELS = { 1: 'GKP', 2: 'DEF', 3: 'MID', 4: 'FWD' };
const POSITION_COLORS = { 1: '#d4af37', 2: '#4caf50', 3: '#2196f3', 4: '#f44336' };

const SquadView = ({ managerData, currentGw, bootstrapData, selectedAnalysis }) => {
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
          padding: '10px 14px',
          minWidth: '90px',
          maxWidth: '120px',
          textAlign: 'center',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'default',
        }}
      >
        {/* Captain / Vice badge */}
        {pick.is_captain && (
          <div style={{
            position: 'absolute', top: '-8px', right: '-6px',
            background: '#d4af37', color: '#000', borderRadius: '50%',
            width: '22px', height: '22px', fontSize: '11px', fontWeight: 'bold',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(212,175,55,0.5)'
          }}>C</div>
        )}
        {pick.is_vice_captain && (
          <div style={{
            position: 'absolute', top: '-8px', right: '-6px',
            background: '#666', color: '#fff', borderRadius: '50%',
            width: '22px', height: '22px', fontSize: '11px', fontWeight: 'bold',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>V</div>
        )}

        {/* Position tag */}
        <div style={{
          fontSize: '0.6rem', color: posColor, fontWeight: 'bold',
          letterSpacing: '1px', marginBottom: '6px'
        }}>
          {POSITION_LABELS[player.element_type]}
        </div>

        {/* Team Badge */}
        {teamCode && (
          <img 
            src={`https://resources.premierleague.com/premierleague25/badges-alt/${teamCode}.svg`} 
            alt={teamName}
            style={{ width: '32px', height: '32px', objectFit: 'contain', marginBottom: '6px' }}
          />
        )}

        {/* Player name */}
        <div style={{
          fontWeight: 'bold', fontSize: '0.82rem', color: '#e0e0e0',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
          {player.web_name}
        </div>

        {/* Team Name */}
        <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '4px' }}>
          {teamName}
        </div>

        {/* Price & Points */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.7rem' }}>
          <span style={{ color: '#4caf50' }}>£{price}m</span>
          <span style={{ color: '#d4af37' }}>{points}pts</span>
        </div>
      </div>
    );
  };

  const renderRow = (players, label) => (
    <div style={{ marginBottom: '12px' }}>
      {label && (
        <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#ffffff55', letterSpacing: '2px', marginBottom: '6px', textTransform: 'uppercase' }}>
          {label}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {players.map(p => renderPlayerBadge(p))}
      </div>
    </div>
  );

  const formation = `${defs.length}-${mids.length}-${fwds.length}`;

  return (
    <div className="fpl-squad-view">
      {/* Formation label */}
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <span style={{
          background: '#d4af3722', color: '#d4af37', padding: '4px 16px',
          borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '2px'
        }}>
          {formation}
        </span>
      </div>

      {/* Pitch */}
      <div className="fpl-pitch" style={{
        background: 'linear-gradient(180deg, #1a4d2e 0%, #143d24 20%, #1a4d2e 40%, #143d24 60%, #1a4d2e 80%, #143d24 100%)',
        borderRadius: '12px',
        padding: '30px 15px',
        border: '2px solid #2a6e3f',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Pitch line decorations */}
        <div style={{
          position: 'absolute', top: '50%', left: '10%', right: '10%',
          height: '1px', background: '#ffffff15'
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '60px', height: '60px', borderRadius: '50%', border: '1px solid #ffffff15'
        }} />

        {renderRow(fwds, 'Forwards')}
        {renderRow(mids, 'Midfielders')}
        {renderRow(defs, 'Defenders')}
        {renderRow(gks, 'Goalkeeper')}
      </div>

      {/* Bench */}
      <div className="fpl-card" style={{ marginTop: '20px', backgroundColor: '#0d0d0d', border: '1px solid #222', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ marginTop: 0, textAlign: 'center', color: '#666', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Substitutes
        </h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {bench.map(p => renderPlayerBadge(p, true))}
        </div>
      </div>
    </div>
  );
};

export default SquadView;
