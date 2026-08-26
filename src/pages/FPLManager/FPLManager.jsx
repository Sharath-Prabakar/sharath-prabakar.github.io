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

const FPLManager = () => {
  const [managerData, setManagerData] = useState(null);
  const [bootstrapData, setBootstrapData] = useState(null);
  const [currentGw, setCurrentGw] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [selectedGw, setSelectedGw] = useState(1);
  const [chipsUsed, setChipsUsed] = useState([]);
  const [gwFixtures, setGwFixtures] = useState([]);
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Calculate transfers (placeholders until auth API is available)
  let freeTransfers = '1';
  let transfersMade = '0';
  if (selectedGw === 1) {
    freeTransfers = 'Unlimited';
    transfersMade = '0';
  } else {
    freeTransfers = '1 (Est)';
    transfersMade = '0 (Est)';
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
              selectedAnalysis={analysisHistory.find(h => h.gameweek === selectedGw)}
              layoutMode="stats" 
            />
          </div>

          <div style={{ display: 'flex', gap: '30px', alignItems: 'stretch', flexWrap: 'wrap' }}>
            <div style={{ flex: '1.3', minWidth: 'min(100%, 420px)' }}>
              <AiAdvisor 
                managerData={managerData} 
                currentGw={currentGw} 
                selectedAnalysis={analysisHistory.find(h => h.gameweek === selectedGw)}
                gameweekHistory={analysisHistory.filter(h => h.gameweek === selectedGw)}
                bootstrapData={bootstrapData}
                liveData={liveData}
                layoutMode="insights"
              />
            </div>

            <div style={{ flex: '1.5', minWidth: 'min(100%, 500px)' }}>
              <SquadView 
                managerData={managerData} 
                currentGw={currentGw} 
                bootstrapData={bootstrapData} 
                selectedAnalysis={analysisHistory.find(h => h.gameweek === selectedGw)}
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
              selectedAnalysis={analysisHistory.find(h => h.gameweek === selectedGw)}
              gameweekHistory={analysisHistory.filter(h => h.gameweek === selectedGw)}
              bootstrapData={bootstrapData}
              liveData={liveData}
              layoutMode="dashboard"
            />
          </div>

          <div>
            <AiAdvisor 
              managerData={managerData} 
              currentGw={currentGw} 
              selectedAnalysis={analysisHistory.find(h => h.gameweek === selectedGw)}
              gameweekHistory={analysisHistory.filter(h => h.gameweek === selectedGw)}
              bootstrapData={bootstrapData}
              liveData={liveData}
              layoutMode="player_analysis"
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default FPLManager;
