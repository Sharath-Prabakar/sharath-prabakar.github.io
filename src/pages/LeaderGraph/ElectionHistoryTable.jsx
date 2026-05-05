import React from 'react';
import './ElectionHistoryTable.css';

const ElectionHistoryTable = ({ historyData = [] }) => {
  return (
    <div className="election-history-container">
      <h2 className="section-title">🗳️ Election History</h2>
      <div className="table-responsive">
        <table className="election-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Constituency</th>
              <th>Party</th>
              <th>Result</th>
              <th>Margin</th>
            </tr>
          </thead>
          <tbody>
            {historyData && historyData.length > 0 ? (
              historyData.map((item, index) => (
                <tr key={index}>
                  <td className="year-cell">{item.year}</td>
                  <td className="constituency-cell">{item.constituency}</td>
                  <td>
                    <span className={`party-badge ${item.party?.toLowerCase()}`}>
                      {item.party}
                    </span>
                  </td>
                  <td>
                    <span className={`result-badge ${item.result?.toLowerCase()}`}>
                      {item.result}
                    </span>
                  </td>
                  <td className="margin-cell">{item.margin}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data-cell">No election history available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ElectionHistoryTable;
