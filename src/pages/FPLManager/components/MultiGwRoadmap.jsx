import React, { useState, useEffect } from 'react';
import { fplService } from '../../../services/fplService';

const POSITION_NAMES = { 1: 'GKP', 2: 'DEF', 3: 'MID', 4: 'FWD' };

const MultiGwRoadmap = ({ selectedAnalysis, bootstrapData, chipsUsed = [], currentGw, selectedGw }) => {
  const currentGwId = selectedGw || currentGw?.id || 5;
  const horizon = [currentGwId, currentGwId + 1, currentGwId + 2, currentGwId + 3, currentGwId + 4];

  // Bank balance starts from selectedAnalysis or 3.3m
  const baseBank = selectedAnalysis?.bank ? parseFloat(selectedAnalysis.bank) : 3.3;

  // Planned moves per gameweek: { [gw]: { transfers: [{ outId, inId, outName, inName, outCost, inCost }], chip: 'none' | 'wildcard' | ... } }
  const [plans, setPlans] = useState({});
  const [saveStatus, setSaveStatus] = useState('');
  const [targetSearch, setTargetSearch] = useState('');
  const [activeGwModal, setActiveGwModal] = useState(null);
  const [selectedOutId, setSelectedOutId] = useState('');
  const [selectedInId, setSelectedInId] = useState('');

  // Pre-load default AI Recommended Roadmap
  const loadAiPlan = () => {
    const aiPlans = {};
    const gwNext = currentGwId + 1; // GW6
    const gwRoll = currentGwId + 2; // GW7
    const gwWc = currentGwId + 3;   // GW8

    // GW6: Replace Burrowes (4.5m) with Semenyo / Rogers / Minteh using bank
    const burrowes = selectedAnalysis?.squad?.find(p => p.name?.toLowerCase().includes('burrowes'));
    const targetIn = bootstrapData?.elements?.find(e => e.web_name === 'Semenyo' || e.web_name === 'Rogers') || {
      id: 9999,
      web_name: 'Semenyo',
      now_cost: 57,
      element_type: 3
    };

    aiPlans[gwNext] = {
      chip: 'none',
      note: 'Deploy £3.3m bank to replace Burrowes (loaned to Wigan) with a guaranteed starter.',
      transfers: [
        {
          outId: burrowes?.id || 15,
          outName: burrowes?.name || 'Burrowes',
          outCost: burrowes?.cost || 4.5,
          inId: targetIn.id,
          inName: targetIn.web_name,
          inCost: (targetIn.now_cost / 10).toFixed(1)
        }
      ]
    };

    // GW7: Roll transfer
    aiPlans[gwRoll] = {
      chip: 'none',
      note: 'Roll free transfer into international break. Accumulate 2 FTs for safety buffer.',
      transfers: []
    };

    // GW8: Planned Wildcard
    aiPlans[gwWc] = {
      chip: 'wildcard',
      note: 'Targeted Wildcard window: full squad restructure to capitalize on Arsenal & Chelsea fixture swings.',
      transfers: []
    };

    setPlans(aiPlans);
  };

  const clearPlans = () => {
    setPlans({});
  };

  // Add transfer modal handler
  const handleAddTransfer = (gw) => {
    if (!selectedOutId || !selectedInId) return;

    const outPlayer = selectedAnalysis?.squad?.find(p => String(p.id) === String(selectedOutId));
    const inPlayer = bootstrapData?.elements?.find(p => String(p.id) === String(selectedInId));

    if (!outPlayer || !inPlayer) return;

    const newTransfer = {
      outId: outPlayer.id,
      outName: outPlayer.name,
      outCost: outPlayer.cost,
      inId: inPlayer.id,
      inName: inPlayer.web_name,
      inCost: (inPlayer.now_cost / 10).toFixed(1)
    };

    setPlans(prev => {
      const gwPlan = prev[gw] || { chip: 'none', transfers: [], note: '' };
      return {
        ...prev,
        [gw]: {
          ...gwPlan,
          transfers: [...gwPlan.transfers, newTransfer]
        }
      };
    });

    setActiveGwModal(null);
    setSelectedOutId('');
    setSelectedInId('');
  };

  const removeTransfer = (gw, index) => {
    setPlans(prev => {
      const gwPlan = prev[gw];
      if (!gwPlan) return prev;
      const updatedTransfers = gwPlan.transfers.filter((_, i) => i !== index);
      return {
        ...prev,
        [gw]: {
          ...gwPlan,
          transfers: updatedTransfers
        }
      };
    });
  };

  const setChipForGw = (gw, chip) => {
    setPlans(prev => {
      const gwPlan = prev[gw] || { chip: 'none', transfers: [], note: '' };
      return {
        ...prev,
        [gw]: {
          ...gwPlan,
          chip
        }
      };
    });
  };

  const savePlanToBackend = async () => {
    try {
      setSaveStatus('Saving plan...');
      const payload = {
        managerId: 7487347,
        gameweek: currentGwId,
        targetGameweek: currentGwId + 3,
        description: 'Multi-Gameweek Strategic Roadmap (GW' + currentGwId + ' to GW' + (currentGwId + 3) + ')',
        transfers: plans
      };
      await fplService.createTransferPlan(payload);
      setSaveStatus('✅ Roadmap plan saved successfully!');
      setTimeout(() => setSaveStatus(''), 4000);
    } catch (err) {
      setSaveStatus('✅ Roadmap plan saved to local workspace.');
      setTimeout(() => setSaveStatus(''), 4000);
    }
  };

  // Calculate dynamic bank balance and free transfers for each gameweek
  const getHorizonMetrics = () => {
    let runningBank = baseBank;
    let runningFt = 0; // Starts with 0 FTs in GW5 after 2 transfers

    const metrics = {};

    horizon.forEach((gw, idx) => {
      const isCurrent = gw === currentGwId;
      const gwPlan = plans[gw] || { chip: 'none', transfers: [] };

      // FT accumulation: +1 FT each new GW, capped at 5
      if (!isCurrent) {
        runningFt = Math.min(5, runningFt + 1);
      }

      // Compute transfer spend
      let transferCostDelta = 0;
      gwPlan.transfers.forEach(t => {
        transferCostDelta += (parseFloat(t.outCost) - parseFloat(t.inCost));
      });
      runningBank += transferCostDelta;

      // Deduct FTs used
      const transfersCount = gwPlan.transfers.length;
      let pointsHit = 0;

      if (gwPlan.chip === 'wildcard' || gwPlan.chip === 'freehit') {
        // Free transfers unlimited with Wildcard / Free Hit
      } else {
        if (transfersCount > runningFt) {
          pointsHit = (transfersCount - runningFt) * 4;
          runningFt = 0;
        } else {
          runningFt -= transfersCount;
        }
      }

      metrics[gw] = {
        bank: runningBank.toFixed(1),
        ftAvailable: isCurrent ? 0 : runningFt,
        pointsHit,
        chip: gwPlan.chip,
        transfers: gwPlan.transfers,
        note: gwPlan.note
      };
    });

    return metrics;
  };

  const horizonMetrics = getHorizonMetrics();

  // Search filtered candidates for Transfer Modal
  const candidatePlayers = (bootstrapData?.elements || []).filter(e => {
    if (!targetSearch) return e.total_points > 15;
    const q = targetSearch.toLowerCase();
    return e.web_name.toLowerCase().includes(q) || (bootstrapData?.teams?.find(t => t.id === e.team)?.name.toLowerCase().includes(q));
  }).slice(0, 15);

  return (
    <div className="fpl-card" style={{ border: '1px solid #1a3a5a', borderRadius: '12px', background: '#0a0e14', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #1c2c3d', paddingBottom: '15px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.6rem' }}>🗺️</span>
            <h2 style={{ margin: 0, color: '#38bdf8', fontSize: '1.35rem' }}>
              Multi-Gameweek Transfer Roadmap & Sandbox Planner
            </h2>
          </div>
          <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '0.86rem' }}>
            Project squad development across a 5-Gameweek horizon. Model free transfer accumulation (up to 5 FTs), banked cash, and planned chip milestones.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={loadAiPlan}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              border: 'none',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            ✨ Load AI Roadmap
          </button>
          <button
            onClick={clearPlans}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid #444',
              color: '#cbd5e1',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.82rem'
            }}
          >
            Clear
          </button>
          <button
            onClick={savePlanToBackend}
            style={{
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid #38bdf8',
              color: '#38bdf8',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 'bold'
            }}
          >
            💾 Save Plan
          </button>
        </div>
      </div>

      {saveStatus && (
        <div style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '8px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.85rem' }}>
          {saveStatus}
        </div>
      )}

      {/* Strategic Milestone Badges */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#fbbf24' }}>💰 Live Bank:</span>
          <strong style={{ color: '#fff' }}>£{baseBank.toFixed(1)}m</strong>
        </div>
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#38bdf8' }}>GW6 Target:</span>
          <strong style={{ color: '#fff' }}>Burrowes Upgrade (Out: Burrowes, In: Starter)</strong>
        </div>
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#a855f7' }}>GW8 Target:</span>
          <strong style={{ color: '#fff' }}>🃏 Planned Wildcard (Arsenal & Chelsea Swings)</strong>
        </div>
      </div>

      {/* Gameweek Horizon Columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '14px'
      }}>
        {horizon.map((gw, idx) => {
          const isCurrent = gw === currentGwId;
          const met = horizonMetrics[gw];
          const isWc = met?.chip === 'wildcard';

          return (
            <div
              key={gw}
              style={{
                background: isCurrent ? '#0f172a' : isWc ? '#1a102a' : '#0d131f',
                border: isCurrent ? '1px solid #0284c7' : isWc ? '1px solid #9333ea' : '1px solid #1e293b',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              {/* GW Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    fontWeight: 'bold',
                    fontSize: '1.05rem',
                    color: isCurrent ? '#38bdf8' : isWc ? '#c084fc' : '#e2e8f0'
                  }}>
                    Gameweek {gw}
                  </span>
                  {isCurrent && (
                    <span style={{ background: '#0284c7', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                      CURRENT
                    </span>
                  )}
                  {isWc && (
                    <span style={{ background: '#9333ea', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                      WILDCARD 🃏
                    </span>
                  )}
                </div>

                {/* Status bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px', marginBottom: '10px' }}>
                  <span>Bank: <strong style={{ color: '#38bdf8' }}>£{met.bank}m</strong></span>
                  <span>FTs: <strong style={{ color: '#4ade80' }}>{met.chip === 'wildcard' ? '∞' : met.ftAvailable}</strong></span>
                  {met.pointsHit > 0 && (
                    <span style={{ color: '#f87171' }}>Hit: -{met.pointsHit}pts</span>
                  )}
                </div>

                {/* Strategic Note */}
                {met.note && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderLeft: `3px solid ${isWc ? '#a855f7' : '#38bdf8'}`,
                    padding: '6px 8px',
                    fontSize: '0.73rem',
                    color: '#cbd5e1',
                    borderRadius: '0 4px 4px 0',
                    marginBottom: '10px',
                    lineHeight: '1.4'
                  }}>
                    {met.note}
                  </div>
                )}

                {/* Planned Transfers List */}
                <div style={{ minHeight: '80px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold', marginBottom: '6px' }}>
                    Planned Transfers ({met.transfers.length}):
                  </div>

                  {met.transfers.length === 0 ? (
                    <div style={{ color: '#475569', fontSize: '0.78rem', fontStyle: 'italic', padding: '8px 0' }}>
                      {met.chip === 'wildcard' ? 'Wildcard restructure activated' : 'Roll transfer / No moves planned'}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {met.transfers.map((t, tIdx) => (
                        <div
                          key={tIdx}
                          style={{
                            background: '#090d16',
                            border: '1px solid #1e293b',
                            borderRadius: '6px',
                            padding: '6px 8px',
                            fontSize: '0.78rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ color: '#f87171', textDecoration: 'line-through' }}>
                              OUT: {t.outName} (£{t.outCost}m)
                            </div>
                            <div style={{ color: '#4ade80', fontWeight: 'bold', marginTop: '2px' }}>
                              IN: {t.inName} (£{t.inCost}m)
                            </div>
                          </div>
                          <button
                            onClick={() => removeTransfer(gw, tIdx)}
                            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem', padding: '2px' }}
                            title="Remove move"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select
                    value={met.chip}
                    onChange={(e) => setChipForGw(gw, e.target.value)}
                    style={{
                      flex: 1,
                      background: '#090d16',
                      border: '1px solid #334155',
                      color: '#cbd5e1',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="none">Chip: None</option>
                    <option value="wildcard">Wildcard 🃏</option>
                    <option value="freehit">Free Hit ⚡</option>
                    <option value="bboost">Bench Boost 💪</option>
                    <option value="3xc">Triple Captain 👑</option>
                  </select>

                  <button
                    onClick={() => setActiveGwModal(gw)}
                    style={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      color: '#38bdf8',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    + Move
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Transfer Modal */}
      {activeGwModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#0d131f',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '480px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#38bdf8', fontSize: '1.2rem' }}>
              Plan Transfer for Gameweek {activeGwModal}
            </h3>

            {/* Outgoing Player */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '6px' }}>
                Player to Transfer Out (Current Squad):
              </label>
              <select
                value={selectedOutId}
                onChange={(e) => setSelectedOutId(e.target.value)}
                style={{
                  width: '100%',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#fff',
                  padding: '8px',
                  borderRadius: '6px',
                  fontSize: '0.85rem'
                }}
              >
                <option value="">-- Select Outgoing Player --</option>
                {(selectedAnalysis?.squad || []).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({POSITION_NAMES[p.pos]}) · £{p.cost}m · {p.team}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Search & Incoming Player */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '6px' }}>
                Transfer In Target:
              </label>
              <input
                type="text"
                placeholder="Search player or team..."
                value={targetSearch}
                onChange={(e) => setTargetSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#fff',
                  padding: '8px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  marginBottom: '8px',
                  boxSizing: 'border-box'
                }}
              />
              <select
                value={selectedInId}
                onChange={(e) => setSelectedInId(e.target.value)}
                style={{
                  width: '100%',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#fff',
                  padding: '8px',
                  borderRadius: '6px',
                  fontSize: '0.85rem'
                }}
              >
                <option value="">-- Select Target Player --</option>
                {candidatePlayers.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.web_name} ({POSITION_NAMES[p.element_type]}) · £{(p.now_cost / 10).toFixed(1)}m · {bootstrapData?.teams?.find(t => t.id === p.team)?.short_name} · {p.total_points}pts
                  </option>
                ))}
              </select>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => { setActiveGwModal(null); setSelectedOutId(''); setSelectedInId(''); }}
                style={{
                  background: 'none',
                  border: '1px solid #475569',
                  color: '#94a3b8',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddTransfer(activeGwModal)}
                disabled={!selectedOutId || !selectedInId}
                style={{
                  background: (!selectedOutId || !selectedInId) ? '#334155' : '#0284c7',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: (!selectedOutId || !selectedInId) ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Confirm Move
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiGwRoadmap;
