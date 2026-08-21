import React, { useState, useEffect } from 'react';
import './FPLManager.css';
import { fplService } from '../../services/fplService';
import Dashboard from './components/Dashboard';
import SquadView from './components/SquadView';
import AiAdvisor from './components/AiAdvisor';
import LiveGameweek from './components/LiveGameweek';
import LeagueStandings from './components/LeagueStandings';
import PlayerExplorer from './components/PlayerExplorer';

const FPLManager = () => {
  const [managerData, setManagerData] = useState(null);
  const [bootstrapData, setBootstrapData] = useState(null);
  const [currentGw, setCurrentGw] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [selectedGw, setSelectedGw] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [manager, bootstrap, gw, history] = await Promise.all([
          fplService.getTeam(),
          fplService.getBootstrap(),
          fplService.getCurrentGameweek(),
          fplService.getAnalysisHistory(7487347) // hardcoding managerId for now since it's used below
        ]);
        
        if (!manager || !bootstrap || !gw) {
          throw new Error('Failed to load critical data. Check API connection.');
        }

        setManagerData(manager);
        setBootstrapData(bootstrap);
        setCurrentGw(gw);
        
        if (history && history.length > 0) {
          setAnalysisHistory(history);
          // Auto-select the most recent gameweek analysis available
          setSelectedGw(history[0].gameweek);
        } else {
          setSelectedGw(gw.id || 1);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  if (loading) {
    return (
      <div className="fpl-container">
        <div className="fpl-loading">Loading FPL Manager data...</div>
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

  return (
    <div className="fpl-container">
      <div className="fpl-content">
        <div className="fpl-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>{managerData?.name || 'FPL Manager'}</h1>
            <p>Manager: {managerData?.player_first_name} {managerData?.player_last_name}</p>
          </div>
          <div style={{ background: '#111', padding: '10px 15px', borderRadius: '8px', border: '1px solid #333' }}>
            <label style={{ color: '#d4af37', marginRight: '10px', fontWeight: 'bold' }}>Viewing Gameweek:</label>
            <select 
              value={selectedGw} 
              onChange={(e) => setSelectedGw(Number(e.target.value))}
              style={{ background: '#222', color: '#fff', border: '1px solid #444', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
            >
              {analysisHistory.length > 0 
                ? analysisHistory.map(h => (
                    <option key={h.gameweek} value={h.gameweek}>GW {h.gameweek}</option>
                  ))
                : <option value={selectedGw}>GW {selectedGw}</option>
              }
            </select>
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
            <div style={{ flex: '1.8', minWidth: '600px' }}>
              <SquadView 
                managerData={managerData} 
                currentGw={currentGw} 
                bootstrapData={bootstrapData} 
                selectedAnalysis={analysisHistory.find(h => h.gameweek === selectedGw)}
              />
            </div>
            
            <div style={{ flex: '1', minWidth: '350px' }}>
              <AiAdvisor 
                managerData={managerData} 
                currentGw={currentGw} 
                selectedAnalysis={analysisHistory.find(h => h.gameweek === selectedGw)}
                gameweekHistory={analysisHistory.filter(h => h.gameweek === selectedGw)}
                bootstrapData={bootstrapData}
                layoutMode="insights"
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
              layoutMode="dashboard"
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default FPLManager;
