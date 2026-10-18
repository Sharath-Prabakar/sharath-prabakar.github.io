import React, { useState, useEffect, useMemo } from 'react';
import { fplService } from '../../../services/fplService';

const USER_ENTRY_ID = 7487347;

const LeagueStandings = ({ managerData, selectedAnalysis }) => {
  const classicLeagues = useMemo(() => {
    const raw = managerData?.leagues?.classic || [];
    // Sort so VM2K15 comes first, then private leagues ('x'), then public leagues ('s')
    return [...raw].sort((a, b) => {
      const aIsVm = a.name?.toUpperCase().includes('VM2K15') ? 1 : 0;
      const bIsVm = b.name?.toUpperCase().includes('VM2K15') ? 1 : 0;
      if (aIsVm !== bIsVm) return bIsVm - aIsVm;
      if (a.league_type !== b.league_type) return a.league_type === 'x' ? -1 : 1;
      return (a.entry_rank || 9999999) - (b.entry_rank || 9999999);
    });
  }, [managerData]);

  const defaultLeagueId = useMemo(() => {
    const vmLeague = classicLeagues.find(l => l.name?.toUpperCase().includes('VM2K15'));
    if (vmLeague) return vmLeague.id;
    const firstPrivate = classicLeagues.find(l => l.league_type === 'x');
    if (firstPrivate) return firstPrivate.id;
    return classicLeagues[0]?.id || 1769989;
  }, [classicLeagues]);

  const [selectedLeagueId, setSelectedLeagueId] = useState(defaultLeagueId);
  const [page, setPage] = useState(1);
  const [standingsData, setStandingsData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (defaultLeagueId && !selectedLeagueId) {
      setSelectedLeagueId(defaultLeagueId);
    }
  }, [defaultLeagueId, selectedLeagueId]);

  useEffect(() => {
    if (!selectedLeagueId) return;
    let isMounted = true;
    const fetchStandings = async () => {
      setLoading(true);
      const data = await fplService.getLeagueStandings(selectedLeagueId, page);
      if (isMounted) {
        setStandingsData(data);
        setLoading(false);
      }
    };
    fetchStandings();
    return () => {
      isMounted = false;
    };
  }, [selectedLeagueId, page]);

  const handleSelectLeague = (id) => {
    setSelectedLeagueId(id);
    setPage(1);
  };

  if (!classicLeagues.length) {
    return null;
  }

  const activeLeagueMeta = classicLeagues.find(l => l.id === selectedLeagueId) || classicLeagues[0];
  const results = standingsData?.standings?.results || [];
  const hasNextPage = standingsData?.standings?.has_next || false;

  const leaderRow = results[0];
  const userRow = results.find(r => r.entry === USER_ENTRY_ID);
  const rankAboveRow = userRow ? results.find(r => r.rank === userRow.rank - 1) : null;

  return (
    <div className="fpl-card" style={{ padding: '24px', border: '1px solid #222', background: '#0c0c0c' }}>
      {/* Header & League Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '16px' }}>
        <div>
          <h3 style={{ color: '#d4af37', margin: '0 0 6px 0', fontSize: '1.1rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🏆</span> Competing Leagues & Standings
          </h3>
          <div style={{ color: '#888', fontSize: '0.82rem' }}>
            Viewing <strong style={{ color: '#fff' }}>{activeLeagueMeta?.name}</strong> ({activeLeagueMeta?.league_type === 'x' ? 'Private Mini-League' : 'Global / Regional League'})
          </div>
        </div>

        {/* League Selector Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {classicLeagues.map(league => {
            const isSelected = league.id === selectedLeagueId;
            const rankDiff = (league.entry_last_rank && league.entry_rank) ? (league.entry_last_rank - league.entry_rank) : 0;
            return (
              <button
                key={league.id}
                onClick={() => handleSelectLeague(league.id)}
                style={{
                  background: isSelected ? 'linear-gradient(135deg, #d4af37 0%, #b48a1e 100%)' : '#141414',
                  color: isSelected ? '#000' : '#ccc',
                  border: isSelected ? '1px solid #fbbf24' : '1px solid #2a2a2a',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <span>{league.name}</span>
                {league.entry_rank && (
                  <span style={{
                    background: isSelected ? 'rgba(0,0,0,0.2)' : '#222',
                    color: isSelected ? '#000' : '#d4af37',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 'bold'
                  }}>
                    #{league.entry_rank.toLocaleString()}
                    {rankDiff > 0 ? ' ▲' : rankDiff < 0 ? ' ▼' : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick League KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '12px' }}>
          <div style={{ color: '#888', fontSize: '0.72rem', textTransform: 'uppercase' }}>Your League Rank</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 'bold', color: '#d4af37', marginTop: '4px' }}>
            #{activeLeagueMeta?.entry_rank?.toLocaleString() || '-'}
            {activeLeagueMeta?.rank_count ? <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 'normal' }}> / {activeLeagueMeta.rank_count.toLocaleString()}</span> : null}
          </div>
          {activeLeagueMeta?.entry_last_rank ? (
            <div style={{ fontSize: '0.75rem', marginTop: '2px', color: activeLeagueMeta.entry_last_rank > activeLeagueMeta.entry_rank ? '#00ff87' : activeLeagueMeta.entry_last_rank < activeLeagueMeta.entry_rank ? '#ff4444' : '#888' }}>
              {activeLeagueMeta.entry_last_rank > activeLeagueMeta.entry_rank
                ? `▲ Up ${activeLeagueMeta.entry_last_rank - activeLeagueMeta.entry_rank} from last GW`
                : activeLeagueMeta.entry_last_rank < activeLeagueMeta.entry_rank
                  ? `▼ Down ${activeLeagueMeta.entry_rank - activeLeagueMeta.entry_last_rank} from last GW`
                  : '• Unchanged from last GW'}
            </div>
          ) : null}
        </div>

        {leaderRow && (
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '12px' }}>
            <div style={{ color: '#888', fontSize: '0.72rem', textTransform: 'uppercase' }}>League Leader</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#fff', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              🥇 {leaderRow.entry_name}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#aaa', marginTop: '2px' }}>
              {leaderRow.player_name} · <strong style={{ color: '#00ff87' }}>{leaderRow.total} pts</strong>
            </div>
          </div>
        )}

        {userRow && leaderRow && (
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '12px' }}>
            <div style={{ color: '#888', fontSize: '0.72rem', textTransform: 'uppercase' }}>Gap to 1st Place</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 'bold', color: userRow.entry === leaderRow.entry ? '#00ff87' : '#ff7070', marginTop: '4px' }}>
              {userRow.entry === leaderRow.entry ? 'Leading!' : `-${leaderRow.total - userRow.total} pts`}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>
              Your Total: <strong style={{ color: '#e0e0e0' }}>{userRow.total} pts</strong>
            </div>
          </div>
        )}

        {userRow && rankAboveRow && (
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '12px' }}>
            <div style={{ color: '#888', fontSize: '0.72rem', textTransform: 'uppercase' }}>Next Target (#{rankAboveRow.rank})</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#38bdf8', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {rankAboveRow.entry_name}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '2px' }}>
              Need <strong style={{ color: '#fbbf24' }}>+{rankAboveRow.total - userRow.total} pts</strong> to overtake
            </div>
          </div>
        )}
      </div>

      {/* Standings Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
          Loading {activeLeagueMeta?.name} standings...
        </div>
      ) : results.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
          No standings data available for this league.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a', color: '#888', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 12px' }}>Rank</th>
                <th style={{ padding: '10px 12px' }}>Team & Manager</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>GW Pts</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Total Pts</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Gap to 1st</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row) => {
                const isUser = row.entry === USER_ENTRY_ID;
                const move = row.last_rank ? row.last_rank - row.rank : 0;
                const gapToFirst = leaderRow ? leaderRow.total - row.total : 0;

                return (
                  <tr
                    key={row.entry}
                    style={{
                      borderBottom: '1px solid #1a1a1a',
                      background: isUser ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                      borderLeft: isUser ? '3px solid #d4af37' : '3px solid transparent'
                    }}
                  >
                    <td style={{ padding: '11px 12px', fontWeight: 'bold', color: isUser ? '#d4af37' : '#e0e0e0', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-block', minWidth: '28px' }}>
                        {row.rank === 1 ? '🥇 1' : row.rank === 2 ? '🥈 2' : row.rank === 3 ? '🥉 3' : `#${row.rank}`}
                      </span>
                      {move > 0 && (
                        <span style={{ color: '#00ff87', fontSize: '0.74rem', marginLeft: '6px' }}>▲{move}</span>
                      )}
                      {move < 0 && (
                        <span style={{ color: '#ff4444', fontSize: '0.74rem', marginLeft: '6px' }}>▼{Math.abs(move)}</span>
                      )}
                      {move === 0 && (
                        <span style={{ color: '#555', fontSize: '0.74rem', marginLeft: '6px' }}>•</span>
                      )}
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 'bold', color: isUser ? '#fff' : '#e0e0e0' }}>
                          {row.entry_name}
                        </span>
                        {isUser && (
                          <span style={{
                            background: '#d4af37',
                            color: '#000',
                            fontSize: '0.65rem',
                            fontWeight: 'bold',
                            padding: '1px 6px',
                            borderRadius: '4px'
                          }}>
                            YOU
                          </span>
                        )}
                      </div>
                      <div style={{ color: '#888', fontSize: '0.76rem', marginTop: '2px' }}>
                        {row.player_name}
                      </div>
                    </td>
                    <td style={{ padding: '11px 12px', textAlign: 'center', color: '#00ff87', fontWeight: 'bold' }}>
                      {row.event_total}
                    </td>
                    <td style={{ padding: '11px 12px', textAlign: 'right', fontWeight: 'bold', color: '#fff', fontSize: '0.95rem' }}>
                      {row.total}
                    </td>
                    <td style={{ padding: '11px 12px', textAlign: 'right', color: gapToFirst === 0 ? '#00ff87' : '#888', fontSize: '0.82rem' }}>
                      {gapToFirst === 0 ? '—' : `-${gapToFirst}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination controls for larger leagues */}
          {(page > 1 || hasNextPage) && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', marginTop: '14px' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  color: page <= 1 ? '#555' : '#e0e0e0',
                  padding: '5px 12px',
                  borderRadius: '4px',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                ← Prev
              </button>
              <span style={{ color: '#888', fontSize: '0.8rem' }}>Page {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!hasNextPage}
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  color: !hasNextPage ? '#555' : '#e0e0e0',
                  padding: '5px 12px',
                  borderRadius: '4px',
                  cursor: !hasNextPage ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Next →
              </button>
            </div>
          )}

          {/* VM2K15 Rival Transfer Radar: Best Players from Teams Above You */}
          {activeLeagueMeta?.name?.toUpperCase().includes('VM2K15') &&
            selectedAnalysis?.chipForecast?.vm2k15RivalRadar?.topUnownedTargets?.length > 0 && (
              <div style={{
                marginTop: '24px',
                background: '#141414',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '10px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#d4af37', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🎯</span> Best Players from Teams Above You in VM2K15 (Transfer Radar)
                    </h3>
                    <p style={{ margin: '4px 0 0 0', color: '#888', fontSize: '0.8rem' }}>
                      Top-performing unowned assets started by the {selectedAnalysis.chipForecast.vm2k15RivalRadar.rivalsAboveCount} managers ranked above you — prioritized by the AI Transfer Engine.
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '10px'
                }}>
                  {selectedAnalysis.chipForecast.vm2k15RivalRadar.topUnownedTargets.slice(0, 6).map((t, idx) => (
                    <div
                      key={t.id}
                      style={{
                        background: '#1c1c1c',
                        border: idx < 2 ? '1px solid rgba(0, 255, 135, 0.35)' : '1px solid #2a2a2a',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#00ff87', fontWeight: 'bold', fontSize: '0.82rem' }}>#{idx + 1}</span>
                          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.92rem' }}>{t.name}</span>
                          <span style={{ color: '#888', fontSize: '0.75rem' }}>({t.team} · {t.pos})</span>
                        </div>
                        <span style={{ color: '#d4af37', fontWeight: 'bold', fontSize: '0.82rem' }}>£{Number(t.cost).toFixed(1)}m</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: '#bbb' }}>
                        <span>
                          Started by <strong style={{ color: '#00ff87' }}>{t.startersCount}/{t.rivalsAboveCount}</strong> rivals above ({t.ownersCount} own)
                        </span>
                        <span>
                          Form: <strong style={{ color: '#fff' }}>{t.form}</strong> · Pts: <strong style={{ color: '#fff' }}>{t.totalPoints}</strong>
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#888' }}>
                        <span>AI Score: <strong style={{ color: '#38bdf8' }}>{t.score}</strong> (+{t.vm2k15Bonus} VM2K15)</span>
                        {t.totwBadge && (
                          <span style={{ color: '#d4af37', background: 'rgba(212, 175, 55, 0.12)', padding: '1px 6px', borderRadius: '4px' }}>
                            ⭐ {t.totwBadge.split(' | ')[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedAnalysis.chipForecast.vm2k15RivalRadar.sharedCoreAssets?.length > 0 && (
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #242424', fontSize: '0.78rem', color: '#999' }}>
                    <strong style={{ color: '#00ff87' }}>🛡️ Shared Core Covered in Your Squad: </strong>
                    {selectedAnalysis.chipForecast.vm2k15RivalRadar.sharedCoreAssets
                      .filter(s => s.startersCount > 0)
                      .map(s => `${s.name} (${s.startersCount}/${selectedAnalysis.chipForecast.vm2k15RivalRadar.rivalsAboveCount} start)`)
                      .join(' · ')}
                  </div>
                )}
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default LeagueStandings;
