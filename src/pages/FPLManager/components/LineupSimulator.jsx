import React, { useState, useEffect } from 'react';

const POSITION_NAMES = { 1: 'GKP', 2: 'DEF', 3: 'MID', 4: 'FWD' };
const POSITION_COLORS = { 1: '#d4af37', 2: '#4caf50', 3: '#2196f3', 4: '#f44336' };

const LineupSimulator = ({ selectedAnalysis, bootstrapData, liveData }) => {
  const [starters, setStarters] = useState([]);
  const [benchGK, setBenchGK] = useState(null);
  const [benchOutfield, setBenchOutfield] = useState([]);
  const [playerStatus, setPlayerStatus] = useState({});
  const [captainId, setCaptainId] = useState(null);
  const [viceId, setViceId] = useState(null);

  useEffect(() => {
    if (!selectedAnalysis || !selectedAnalysis.squad) return;

    const squad = selectedAnalysis.squad;
    const initialStarters = squad.slice(0, 11);
    const initialBench = squad.slice(11, 15);

    setStarters(initialStarters);

    const bgk = initialBench.find(p => p.pos === 1) || initialBench[0];
    const bOutfield = initialBench.filter(p => p.id !== bgk?.id);

    setBenchGK(bgk);
    setBenchOutfield(bOutfield);

    const cap = squad.find(p => p.is_captain);
    const vice = squad.find(p => p.is_vice);
    setCaptainId(cap ? cap.id : initialStarters[0]?.id);
    setViceId(vice ? vice.id : initialStarters[1]?.id);

    const statusMap = {};
    squad.forEach(p => {
      const bPlayer = bootstrapData?.elements?.find(e => e.id === p.id);
      if (bPlayer?.status === 'i' || bPlayer?.status === 'u') {
        statusMap[p.id] = 'out';
      } else if (bPlayer?.status === 'd' || (bPlayer?.chance_of_playing_next_round !== null && bPlayer?.chance_of_playing_next_round < 100)) {
        statusMap[p.id] = 'doubt';
      } else {
        statusMap[p.id] = 'active';
      }
    });
    setPlayerStatus(statusMap);
  }, [selectedAnalysis, bootstrapData]);

  const getPlayerExpectedPoints = (player) => {
    if (!player) return 0;
    if (player.expected !== undefined && player.expected !== null) return Number(player.expected);
    const bPlayer = bootstrapData?.elements?.find(e => e.id === player.id);
    if (bPlayer && bPlayer.ep_next) return parseFloat(bPlayer.ep_next);
    return 3.0;
  };

  const setStatus = (playerId, status) => {
    setPlayerStatus(prev => ({
      ...prev,
      [playerId]: status
    }));
  };

  const moveBenchPlayer = (index, direction) => {
    const newBench = [...benchOutfield];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newBench.length) return;
    const temp = newBench[index];
    newBench[index] = newBench[targetIdx];
    newBench[targetIdx] = temp;
    setBenchOutfield(newBench);
  };

  const resetAll = () => {
    const statusMap = {};
    if (selectedAnalysis?.squad) {
      selectedAnalysis.squad.forEach(p => {
        statusMap[p.id] = 'active';
      });
    }
    setPlayerStatus(statusMap);
  };

  const runSimulation = () => {
    if (starters.length === 0) return null;

    const activeStarters = [];
    const missingStarters = [];

    starters.forEach(p => {
      const st = playerStatus[p.id] || 'active';
      if (st === 'out') {
        missingStarters.push(p);
      } else {
        activeStarters.push(p);
      }
    });

    const subsTriggered = [];
    const usedBenchIds = new Set();
    const currentLineup = [...activeStarters];

    missingStarters.forEach(missing => {
      if (missing.pos === 1) {
        if (benchGK && !usedBenchIds.has(benchGK.id) && (playerStatus[benchGK.id] || 'active') !== 'out') {
          subsTriggered.push({
            out: missing,
            in: benchGK,
            reason: 'Backup Goalkeeper Sub'
          });
          usedBenchIds.add(benchGK.id);
          currentLineup.push(benchGK);
        }
      } else {
        for (const candidate of benchOutfield) {
          if (usedBenchIds.has(candidate.id)) continue;
          if ((playerStatus[candidate.id] || 'active') === 'out') continue;

          const testLineup = [...currentLineup, candidate];
          const defCount = testLineup.filter(p => p.pos === 2).length;

          const remainingBenchEligible = benchOutfield.filter(b => !usedBenchIds.has(b.id) && b.id !== candidate.id && (playerStatus[b.id] || 'active') !== 'out');
          const couldBeValid = defCount + remainingBenchEligible.filter(b => b.pos === 2).length >= 3;

          if (couldBeValid) {
            subsTriggered.push({
              out: missing,
              in: candidate,
              reason: `Bench Priority Auto-Sub (${POSITION_NAMES[candidate.pos]} in for ${POSITION_NAMES[missing.pos]})`
            });
            usedBenchIds.add(candidate.id);
            currentLineup.push(candidate);
            break;
          }
        }
      }
    });

    const defs = currentLineup.filter(p => p.pos === 2).length;
    const mids = currentLineup.filter(p => p.pos === 3).length;
    const fwds = currentLineup.filter(p => p.pos === 4).length;
    const currentFormation = `${defs}-${mids}-${fwds}`;

    const baseDefs = starters.filter(p => p.pos === 2).length;
    const baseMids = starters.filter(p => p.pos === 3).length;
    const baseFwds = starters.filter(p => p.pos === 4).length;
    const baseFormation = `${baseDefs}-${baseMids}-${baseFwds}`;

    const isCapOut = (playerStatus[captainId] || 'active') === 'out';
    const effectiveCapId = isCapOut ? viceId : captainId;
    const effectiveCap = [...starters, benchGK, ...benchOutfield].find(p => p.id === effectiveCapId);

    let baselineXp = 0;
    starters.forEach(p => {
      let xp = getPlayerExpectedPoints(p);
      if (p.id === captainId) xp *= 2;
      baselineXp += xp;
    });

    let simulatedXp = 0;
    currentLineup.forEach(p => {
      let xp = getPlayerExpectedPoints(p);
      const st = playerStatus[p.id] || 'active';
      if (st === 'doubt') xp *= 0.6;
      if (p.id === effectiveCapId) xp *= 2;
      simulatedXp += xp;
    });

    const xpDelta = simulatedXp - baselineXp;

    return {
      currentLineup,
      missingStarters,
      subsTriggered,
      usedBenchIds,
      baseFormation,
      currentFormation,
      isCapOut,
      effectiveCap,
      baselineXp: baselineXp.toFixed(1),
      simulatedXp: simulatedXp.toFixed(1),
      xpDelta: xpDelta.toFixed(1)
    };
  };

  const simResult = runSimulation();

  return (
    <div className="fpl-card" style={{ border: '1px solid #2e7d32', borderRadius: '12px', background: '#0a0d0a', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #1b381e', paddingBottom: '15px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.6rem' }}>🎮</span>
            <h2 style={{ margin: 0, color: '#00ff87', fontSize: '1.35rem' }}>
              Interactive Auto-Sub & Lineup Scenario Simulator
            </h2>
          </div>
          <p style={{ margin: '6px 0 0 0', color: '#8fbc8f', fontSize: '0.86rem' }}>
            Toggle starter availability to simulate official FPL auto-subs, formation shifts, captaincy rollovers, and xP impact.
          </p>
        </div>
        <button
          onClick={resetAll}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid #444',
            color: '#e0e0e0',
            padding: '6px 14px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.82rem',
            transition: 'all 0.2s'
          }}
        >
          🔄 Reset Starters
        </button>
      </div>

      {simResult && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '22px'
        }}>
          <div style={{ background: '#111811', border: '1px solid #1e3820', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Formation</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#00ff87', marginTop: '4px' }}>
              {simResult.currentFormation}
              {simResult.currentFormation !== simResult.baseFormation && (
                <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: '6px' }}>(was {simResult.baseFormation})</span>
              )}
            </div>
          </div>

          <div style={{ background: '#111811', border: '1px solid #1e3820', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Simulated xP</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#d4af37', marginTop: '4px' }}>
              {simResult.simulatedXp} pts
              <span style={{
                fontSize: '0.8rem',
                marginLeft: '6px',
                color: parseFloat(simResult.xpDelta) >= 0 ? '#00ff87' : '#ff4444'
              }}>
                ({parseFloat(simResult.xpDelta) >= 0 ? `+${simResult.xpDelta}` : simResult.xpDelta})
              </span>
            </div>
          </div>

          <div style={{ background: '#111811', border: '1px solid #1e3820', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Auto-Subs Active</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: simResult.subsTriggered.length > 0 ? '#00ff87' : '#aaa', marginTop: '4px' }}>
              {simResult.subsTriggered.length} Triggered
            </div>
          </div>

          <div style={{ background: '#111811', border: '1px solid #1e3820', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Captain</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ffb700', marginTop: '5px' }}>
              {simResult.effectiveCap?.name || 'Haaland'} 👑
              {simResult.isCapOut && (
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#ff4444', fontWeight: 'normal' }}>
                  (Rollover from Captain)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {simResult && simResult.subsTriggered.length > 0 && (
        <div style={{
          background: 'rgba(0, 255, 135, 0.08)',
          border: '1px solid rgba(0, 255, 135, 0.3)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px'
        }}>
          <div style={{ color: '#00ff87', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔄</span> Auto-Sub Engine Activations:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {simResult.subsTriggered.map((sub, idx) => (
              <div key={idx} style={{ fontSize: '0.85rem', color: '#e0e0e0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ color: '#ff6b6b', textDecoration: 'line-through' }}>{sub.out.name} ({POSITION_NAMES[sub.out.pos]})</span>
                <span style={{ color: '#00ff87' }}>➔</span>
                <span style={{ color: '#00ff87', fontWeight: 'bold' }}>{sub.in.name} ({POSITION_NAMES[sub.in.pos]})</span>
                <span style={{ color: '#888', fontSize: '0.78rem' }}>— {sub.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ color: '#d4af37', fontSize: '1rem', margin: 0 }}>
            Starting XI (Click status to simulate absences)
          </h3>
          <span style={{ color: '#888', fontSize: '0.78rem' }}>
            Current Formation: {simResult?.currentFormation}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: '10px'
        }}>
          {starters.map(p => {
            const currentStatus = playerStatus[p.id] || 'active';
            const isOut = currentStatus === 'out';
            const isDoubt = currentStatus === 'doubt';
            const isCap = p.id === captainId;
            const isVice = p.id === viceId;
            const xp = getPlayerExpectedPoints(p);

            return (
              <div
                key={p.id}
                style={{
                  background: isOut ? '#1e1111' : isDoubt ? '#1e1a11' : '#141714',
                  border: isOut ? '1px solid #5a2020' : isDoubt ? '1px solid #5a4b1e' : '1px solid #233524',
                  borderRadius: '8px',
                  padding: '10px',
                  opacity: isOut ? 0.65 : 1,
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 'bold',
                    padding: '2px 5px',
                    borderRadius: '3px',
                    background: POSITION_COLORS[p.pos] || '#888',
                    color: '#000'
                  }}>
                    {POSITION_NAMES[p.pos]}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {isCap && (
                      <span style={{
                        background: '#ffd700',
                        color: '#000',
                        fontSize: '0.68rem',
                        fontWeight: 'bold',
                        padding: '1px 5px',
                        borderRadius: '3px'
                      }}>
                        {isOut ? 'C (OUT)' : '👑 C'}
                      </span>
                    )}
                    {isVice && (
                      <span style={{
                        background: '#c0c0c0',
                        color: '#000',
                        fontSize: '0.68rem',
                        fontWeight: 'bold',
                        padding: '1px 5px',
                        borderRadius: '3px'
                      }}>
                        {simResult?.isCapOut ? '👑 C (Active)' : '🥈 V'}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{
                  fontWeight: 'bold',
                  fontSize: '0.92rem',
                  color: isOut ? '#ff8888' : '#fff',
                  textDecoration: isOut ? 'line-through' : 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {p.name}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '0.78rem', marginTop: '4px' }}>
                  <span>{p.team || ''} · £{p.cost}m</span>
                  <span style={{ color: '#00ff87', fontWeight: 'bold' }}>{xp} xP</span>
                </div>

                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  <button
                    onClick={() => setStatus(p.id, 'active')}
                    style={{
                      flex: 1,
                      padding: '3px 0',
                      fontSize: '0.7rem',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      background: currentStatus === 'active' ? '#00ff87' : '#222',
                      color: currentStatus === 'active' ? '#000' : '#888',
                      fontWeight: currentStatus === 'active' ? 'bold' : 'normal'
                    }}
                  >
                    Fit
                  </button>
                  <button
                    onClick={() => setStatus(p.id, 'doubt')}
                    style={{
                      flex: 1,
                      padding: '3px 0',
                      fontSize: '0.7rem',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      background: currentStatus === 'doubt' ? '#ffd700' : '#222',
                      color: currentStatus === 'doubt' ? '#000' : '#888',
                      fontWeight: currentStatus === 'doubt' ? 'bold' : 'normal'
                    }}
                  >
                    Doubt
                  </button>
                  <button
                    onClick={() => setStatus(p.id, 'out')}
                    style={{
                      flex: 1,
                      padding: '3px 0',
                      fontSize: '0.7rem',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      background: currentStatus === 'out' ? '#ff4444' : '#222',
                      color: currentStatus === 'out' ? '#fff' : '#888',
                      fontWeight: currentStatus === 'out' ? 'bold' : 'normal'
                    }}
                  >
                    Out
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ color: '#00ff87', fontSize: '1rem', margin: 0 }}>
            Substitutes Bench (Reorder Priority to test Auto-Sub sequence)
          </h3>
          <span style={{ color: '#888', fontSize: '0.78rem' }}>
            Official FPL auto-sub evaluates Sub 1 ➔ Sub 2 ➔ Sub 3
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px'
        }}>
          {benchGK && (
            <div style={{
              background: simResult?.usedBenchIds?.has(benchGK.id) ? 'rgba(0, 255, 135, 0.12)' : '#111',
              border: simResult?.usedBenchIds?.has(benchGK.id) ? '1px solid #00ff87' : '1px solid #222',
              borderRadius: '8px',
              padding: '12px',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.7rem', background: '#d4af37', color: '#000', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold' }}>
                  BENCH GK
                </span>
                {simResult?.usedBenchIds?.has(benchGK.id) && (
                  <span style={{ fontSize: '0.68rem', background: '#00ff87', color: '#000', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold' }}>
                    🔄 SUBBED ON
                  </span>
                )}
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#fff' }}>
                {benchGK.name}
              </div>
              <div style={{ color: '#888', fontSize: '0.78rem', marginTop: '3px' }}>
                {benchGK.team} · £{benchGK.cost}m · {getPlayerExpectedPoints(benchGK)} xP
              </div>
            </div>
          )}

          {benchOutfield.map((sub, idx) => {
            const isSubbedOn = simResult?.usedBenchIds?.has(sub.id);
            const xp = getPlayerExpectedPoints(sub);

            return (
              <div
                key={sub.id}
                style={{
                  background: isSubbedOn ? 'rgba(0, 255, 135, 0.12)' : '#111',
                  border: isSubbedOn ? '1px solid #00ff87' : '1px solid #222',
                  borderRadius: '8px',
                  padding: '12px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 'bold',
                      padding: '2px 5px',
                      borderRadius: '3px',
                      background: POSITION_COLORS[sub.pos] || '#888',
                      color: '#000'
                    }}>
                      {POSITION_NAMES[sub.pos]}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#aaa', fontWeight: 'bold' }}>
                      SUB {idx + 1}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => moveBenchPlayer(idx, -1)}
                      disabled={idx === 0}
                      style={{
                        background: '#222',
                        border: '1px solid #333',
                        color: idx === 0 ? '#555' : '#fff',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        cursor: idx === 0 ? 'default' : 'pointer',
                        fontSize: '0.7rem'
                      }}
                      title="Move up priority"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveBenchPlayer(idx, 1)}
                      disabled={idx === benchOutfield.length - 1}
                      style={{
                        background: '#222',
                        border: '1px solid #333',
                        color: idx === benchOutfield.length - 1 ? '#555' : '#fff',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        cursor: idx === benchOutfield.length - 1 ? 'default' : 'pointer',
                        fontSize: '0.7rem'
                      }}
                      title="Move down priority"
                    >
                      ▼
                    </button>
                  </div>
                </div>

                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#fff' }}>
                  {sub.name}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '0.78rem', marginTop: '3px' }}>
                  <span>{sub.team} · £{sub.cost}m</span>
                  <span style={{ color: '#00ff87', fontWeight: 'bold' }}>{xp} xP</span>
                </div>

                {isSubbedOn && (
                  <div style={{
                    marginTop: '8px',
                    background: '#00ff87',
                    color: '#000',
                    fontSize: '0.68rem',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    textAlign: 'center'
                  }}>
                    🔄 ACTIVATED AUTO-SUB
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LineupSimulator;
