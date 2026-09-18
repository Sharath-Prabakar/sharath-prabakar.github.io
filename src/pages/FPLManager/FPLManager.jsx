import React, { useState, useEffect } from 'react';
import './FPLManager.css';
import { fplService } from '../../services/fplService';
import Dashboard from './components/Dashboard';
import SquadView from './components/SquadView';
import AiAdvisor from './components/AiAdvisor';
import LiveGameweek from './components/LiveGameweek';
import LeagueStandings from './components/LeagueStandings';
import PlayerExplorer from './components/PlayerExplorer';
import LoadingPopup from './components/LoadingPopup';
import LineupSimulator from './components/LineupSimulator';
import MultiGwRoadmap from './components/MultiGwRoadmap';
import PressNewsDigest from './components/PressNewsDigest';

const FPLManager = () => {
  // Helper: find the best analysis record for a given GW.
  // Prefers records with squad data; falls back to any record if none have squad.
  // Also merges endOfGwAnalysis from a separate end-of-GW record if available.
  const findBestAnalysis = (history, gw) => {
    const gwRecords = history.filter(h => h.gameweek === gw);
    if (gwRecords.length === 0) return undefined;
    const withSquad = gwRecords.find(h => h.squad && h.squad.length > 0);
    const base = withSquad || gwRecords[0];
    
    // If the selected record doesn't have endOfGwAnalysis, find it from another record
    if (!base.endOfGwAnalysis) {
      const endOfGwRecord = gwRecords.find(h => h.endOfGwAnalysis);
      if (endOfGwRecord) {
        return { ...base, endOfGwAnalysis: endOfGwRecord.endOfGwAnalysis };
      }
    }
    return base;
  };
  const [managerData, setManagerData] = useState(null);
  const [bootstrapData, setBootstrapData] = useState(null);
  const [currentGw, setCurrentGw] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [selectedGw, setSelectedGw] = useState(1);
  const [chipsUsed, setChipsUsed] = useState([]);
  const [teamHistoryData, setTeamHistoryData] = useState(null);
  const [gwFixtures, setGwFixtures] = useState([]);
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suiteActiveTab, setSuiteActiveTab] = useState('all');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [manager, bootstrap, gw, history, teamHistory] = await Promise.all([
          fplService.getTeam(),
          fplService.getBootstrap(),
          fplService.getCurrentGameweek(),
          fplService.getAnalysisHistory(7487347),
          fplService.getTeamHistory(7487347)
        ]);
        
        if (!manager || !bootstrap || !gw) {
          throw new Error('Failed to load critical data. Check API connection.');
        }

        setManagerData(manager);
        setBootstrapData(bootstrap);
        setCurrentGw(gw);
        
        if (teamHistory && teamHistory.chips) {
          setChipsUsed(teamHistory.chips);
        }
        
        let initialGw = gw.id || 1;
        if (history && history.length > 0) {
          setAnalysisHistory(history);
          initialGw = history[0].gameweek;
        }
        setSelectedGw(initialGw);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchGwSpecificData = async () => {
      if (selectedGw) {
        const [fixtures, live] = await Promise.all([
          fplService.getFixtures(selectedGw),
          fplService.getLiveEvent(selectedGw)
        ]);
        if (fixtures) setGwFixtures(fixtures);
        if (live) setLiveData(live);
      }
    };
    fetchGwSpecificData();
  }, [selectedGw]);

  if (loading) {
    return (
      <div className="fpl-container">
        <LoadingPopup />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fpl-container">
        <div className="fpl-error">Error: {error}</div>
      </div>
    );
  }

  // Calculate gameweek start and end based on fixtures
  let gwStartStr = '';
  let gwEndStr = '';
  
  // Real deadline from bootstrap
  if (bootstrapData && selectedGw) {
    const ev = bootstrapData.events.find(e => e.id === selectedGw);
    if (ev && ev.deadline_time) {
      gwStartStr = new Date(ev.deadline_time).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  }

  // End date from last fixture
  if (gwFixtures && gwFixtures.length > 0) {
    const sortedFixtures = [...gwFixtures].sort((a, b) => new Date(a.kickoff_time) - new Date(b.kickoff_time));
    const lastMatch = new Date(sortedFixtures[sortedFixtures.length - 1].kickoff_time);
    gwEndStr = lastMatch.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  // Calculate transfers dynamically from live analysis or FPL history
  const selectedAnalysisRecord = findBestAnalysis(analysisHistory, selectedGw);
  let freeTransfers = '1';
  let transfersMade = '0';

  if (selectedGw === 1) {
    freeTransfers = 'Unlimited';
    transfersMade = '0';
  } else {
    const transfersInfo = selectedAnalysisRecord?.chipForecast?.transfersInfo || selectedAnalysisRecord?.transfersInfo;
    if (transfersInfo) {
      freeTransfers = String(transfersInfo.freeTransfers ?? 0);
      transfersMade = String(transfersInfo.made ?? transfersInfo.transfersMade ?? 0);
    } else if (teamHistoryData && teamHistoryData.current) {
      const pastGw = teamHistoryData.current.find(h => h.event === selectedGw);
      if (pastGw) {
        transfersMade = String(pastGw.event_transfers);
        let accumulated = 1;
        for (let g = 2; g <= selectedGw; g++) {
          const entry = teamHistoryData.current.find(h => h.event === g);
          if (g === selectedGw) {
            freeTransfers = String(accumulated);
            break;
          }
          const made = entry ? entry.event_transfers : 0;
          accumulated = Math.min(5, Math.max(0, accumulated - made) + 1);
        }
      } else {
        let accumulated = 1;
        for (let g = 2; g <= selectedGw; g++) {
          const entry = teamHistoryData.current.find(h => h.event === g);
          if (g === selectedGw) {
            freeTransfers = String(accumulated);
            break;
          }
          const made = entry ? entry.event_transfers : 0;
          accumulated = Math.min(5, Math.max(0, accumulated - made) + 1);
        }
        transfersMade = '0';
      }
    }
  }

  return (
    <div className="fpl-container">
      <div className="fpl-content">
        <div className="fpl-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1>{managerData?.name || 'FPL Manager'}</h1>
            <p>Manager: {managerData?.player_first_name} {managerData?.player_last_name}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {gwStartStr && (
              <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#aaa', lineHeight: '1.4' }}>
                <div><span style={{ color: '#d4af37', fontWeight: 'bold' }}>Deadline:</span> {gwStartStr}</div>
                {gwEndStr && <div><span style={{ color: '#d4af37', fontWeight: 'bold' }}>Ends:</span> {gwEndStr}</div>}
              </div>
            )}
            <div style={{ background: '#111', padding: '10px 15px', borderRadius: '8px', border: '1px solid #333' }}>
              <label style={{ color: '#d4af37', marginRight: '10px', fontWeight: 'bold' }}>Viewing Gameweek:</label>
              <select 
                value={selectedGw} 
                onChange={(e) => setSelectedGw(Number(e.target.value))}
                style={{ background: '#222', color: '#fff', border: '1px solid #444', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
              >
                {analysisHistory.length > 0 
                  ? [...new Set(analysisHistory.map(h => h.gameweek))].map((gw) => (
                      <option key={gw} value={gw}>GW {gw}</option>
                    ))
                  : <option value={selectedGw}>GW {selectedGw}</option>
                }
              </select>
            </div>
          </div>
        </div>

        <div className="fpl-main-view" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          <div>
            <Dashboard 
              managerData={managerData} 
              currentGw={currentGw} 
              bootstrapData={bootstrapData} 
              selectedAnalysis={findBestAnalysis(analysisHistory, selectedGw)}
              layoutMode="stats" 
            />
          </div>

          <div style={{ display: 'flex', gap: '30px', alignItems: 'stretch', flexWrap: 'wrap' }}>
            <div style={{ flex: '1.3', minWidth: 'min(100%, 420px)' }}>
              <AiAdvisor 
                managerData={managerData} 
                currentGw={currentGw} 
                selectedAnalysis={findBestAnalysis(analysisHistory, selectedGw)}
                gameweekHistory={analysisHistory.filter(h => h.gameweek === selectedGw)}
                bootstrapData={bootstrapData}
                liveData={liveData}
                chipsUsed={chipsUsed}
                layoutMode="insights"
              />
            </div>

            <div style={{ flex: '1.5', minWidth: 'min(100%, 500px)' }}>
              <SquadView 
                managerData={managerData} 
                currentGw={currentGw} 
                bootstrapData={bootstrapData} 
                liveData={liveData}
                selectedAnalysis={findBestAnalysis(analysisHistory, selectedGw)}
                chipsUsed={chipsUsed}
                freeTransfers={freeTransfers}
                transfersMade={transfersMade}
              />
            </div>
          </div>
          
          <div>
            <AiAdvisor 
              managerData={managerData} 
              currentGw={currentGw} 
              selectedAnalysis={findBestAnalysis(analysisHistory, selectedGw)}
              gameweekHistory={analysisHistory.filter(h => h.gameweek === selectedGw)}
              bootstrapData={bootstrapData}
              liveData={liveData}
                chipsUsed={chipsUsed}
                layoutMode="dashboard"
            />
          </div>

          <div>
            <AiAdvisor 
              managerData={managerData} 
              currentGw={currentGw} 
              selectedAnalysis={findBestAnalysis(analysisHistory, selectedGw)}
              gameweekHistory={analysisHistory.filter(h => h.gameweek === selectedGw)}
              bootstrapData={bootstrapData}
              liveData={liveData}
                chipsUsed={chipsUsed}
                layoutMode="player_analysis"
            />
          </div>

          {/* Advanced FPL Management Suite */}
          <div className="fpl-advanced-suite" style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Section Header & View Filter Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '15px',
              borderBottom: '1px solid #222',
              paddingBottom: '15px'
            }}>
              <div>
                <h2 style={{ color: '#d4af37', margin: 0, fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>⚡</span> Advanced Management Suite
                </h2>
                <p style={{ margin: '4px 0 0 0', color: '#888', fontSize: '0.9rem' }}>
                  Interactive lineup simulation, multi-gameweek transfer planning, and live Premier League press briefings.
                </p>
              </div>

              {/* Segmented Filter Pills */}
              <div style={{ display: 'flex', gap: '6px', background: '#111', padding: '4px', borderRadius: '8px', border: '1px solid #222' }}>
                <button
                  onClick={() => setSuiteActiveTab('all')}
                  style={{
                    background: suiteActiveTab === 'all' ? '#d4af37' : 'none',
                    color: suiteActiveTab === 'all' ? '#000' : '#aaa',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: suiteActiveTab === 'all' ? 'bold' : 'normal',
                    transition: 'all 0.2s'
                  }}
                >
                  🌟 All Tools
                </button>
                <button
                  onClick={() => setSuiteActiveTab('simulator')}
                  style={{
                    background: suiteActiveTab === 'simulator' ? '#00ff87' : 'none',
                    color: suiteActiveTab === 'simulator' ? '#000' : '#aaa',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: suiteActiveTab === 'simulator' ? 'bold' : 'normal',
                    transition: 'all 0.2s'
                  }}
                >
                  🎮 Lineup Simulator
                </button>
                <button
                  onClick={() => setSuiteActiveTab('roadmap')}
                  style={{
                    background: suiteActiveTab === 'roadmap' ? '#38bdf8' : 'none',
                    color: suiteActiveTab === 'roadmap' ? '#000' : '#aaa',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: suiteActiveTab === 'roadmap' ? 'bold' : 'normal',
                    transition: 'all 0.2s'
                  }}
                >
                  🗺️ Multi-GW Roadmap
                </button>
                <button
                  onClick={() => setSuiteActiveTab('news')}
                  style={{
                    background: suiteActiveTab === 'news' ? '#818cf8' : 'none',
                    color: suiteActiveTab === 'news' ? '#000' : '#aaa',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: suiteActiveTab === 'news' ? 'bold' : 'normal',
                    transition: 'all 0.2s'
                  }}
                >
                  📰 Press & Team News
                </button>
              </div>
            </div>

            {/* Tool 1: Interactive Lineup & Auto-Sub Simulator */}
            {(suiteActiveTab === 'all' || suiteActiveTab === 'simulator') && (
              <LineupSimulator 
                selectedAnalysis={selectedAnalysisRecord}
                bootstrapData={bootstrapData}
                liveData={liveData}
              />
            )}

            {/* Tool 2: Multi-Gameweek Transfer Roadmap & Sandbox */}
            {(suiteActiveTab === 'all' || suiteActiveTab === 'roadmap') && (
              <MultiGwRoadmap 
                selectedAnalysis={selectedAnalysisRecord}
                bootstrapData={bootstrapData}
                chipsUsed={chipsUsed}
                currentGw={currentGw}
                selectedGw={selectedGw}
              />
            )}

            {/* Tool 3: Press Conference Digest & Team News Feed */}
            {(suiteActiveTab === 'all' || suiteActiveTab === 'news') && (
              <PressNewsDigest 
                selectedAnalysis={selectedAnalysisRecord}
                bootstrapData={bootstrapData}
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default FPLManager;
