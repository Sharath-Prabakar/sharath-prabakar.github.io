import React, { useState, useEffect } from 'react';
import { fplService } from '../../../services/fplService';
import PointsTrendChart from './PointsTrendChart';

const Dashboard = ({ managerData, currentGw, bootstrapData, selectedAnalysis, layoutMode = 'all' }) => {
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (managerData?.id) {
        const history = await fplService.getTeamHistory(managerData.id);
        if (history && history.current) {
          setHistoryData(history.current);
        }
      }
    };
    fetchHistory();
  }, [managerData]);

  if (!managerData || !currentGw) return null;

  // Calculate live team value and bank if available in analysis
  let displayValue = (managerData.last_deadline_value / 10).toFixed(1);
  let displayBank = (managerData.last_deadline_bank / 10).toFixed(1);

  if (selectedAnalysis && selectedAnalysis.squad) {
    const squadCost = selectedAnalysis.squad.reduce((sum, p) => sum + (p.cost || 0), 0);
    const bank = selectedAnalysis.bank || 0;
    displayValue = (squadCost + bank).toFixed(1);
    displayBank = bank.toFixed(1);
  }

  const renderStats = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
      <div className="fpl-card fpl-stat-card">
        <div className="label">Overall Points</div>
        <div className="value gold">{managerData.summary_overall_points}</div>
      </div>
      <div className="fpl-card fpl-stat-card">
        <div className="label">GW Points</div>
        <div className="value">{managerData.summary_event_points}</div>
      </div>
      <div className="fpl-card fpl-stat-card">
        <div className="label">Team Value</div>
        <div className="value">£{displayValue}m</div>
      </div>
      <div className="fpl-card fpl-stat-card">
        <div className="label">Bank</div>
        <div className="value">£{displayBank}m</div>
      </div>
    </div>
  );

  const renderCharts = () => (
    <>
      <div className="fpl-card" style={{ marginBottom: '30px', padding: '20px' }}>
        <h3 style={{ marginTop: 0, color: '#d4af37' }}>Points Trend</h3>
        <div style={{ height: '300px' }}>
          {historyData.length > 0 ? (
            <PointsTrendChart historyData={historyData} />
          ) : (
            <div style={{ color: '#888', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>Loading chart data...</div>
          )}
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="fpl-card">
          <h3 style={{ marginTop: 0, color: '#d4af37' }}>Chips Used</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '8px 0', borderBottom: '1px solid #222' }}>Wildcard: <span style={{ float: 'right', color: '#888' }}>Available</span></li>
            <li style={{ padding: '8px 0', borderBottom: '1px solid #222' }}>Free Hit: <span style={{ float: 'right', color: '#888' }}>Available</span></li>
            <li style={{ padding: '8px 0', borderBottom: '1px solid #222' }}>Triple Captain: <span style={{ float: 'right', color: '#888' }}>Available</span></li>
            <li style={{ padding: '8px 0' }}>Bench Boost: <span style={{ float: 'right', color: '#888' }}>Available</span></li>
          </ul>
        </div>
        <div className="fpl-card">
          <h3 style={{ marginTop: 0, color: '#d4af37' }}>Transfers</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '8px 0', borderBottom: '1px solid #222' }}>Free Transfers: <span style={{ float: 'right' }}>1</span></li>
            <li style={{ padding: '8px 0', borderBottom: '1px solid #222' }}>Made this GW: <span style={{ float: 'right' }}>0</span></li>
            <li style={{ padding: '8px 0' }}>Cost: <span style={{ float: 'right' }}>0 pts</span></li>
          </ul>
        </div>
      </div>
    </>
  );

  return (
    <div className="fpl-dashboard">
      {layoutMode === 'all' && (
        <>
          <div style={{ marginBottom: '30px' }}>{renderStats()}</div>
          {renderCharts()}
        </>
      )}
      {layoutMode === 'stats' && renderStats()}
      {layoutMode === 'charts' && renderCharts()}
    </div>
  );
};

export default Dashboard;
