import React from 'react';
import './InfoList.css';

const ConstituencyInfo = ({ data }) => {
    if (!data) return null;

    const items = [
        { label: "State", value: data.state, icon: "🗺️" },
        { label: "District", value: data.district, icon: "🏙️" },
        { label: "Type", value: data.type, icon: "🏷️" },
        { label: "Total Voters", value: data.totalVoters?.toLocaleString(), icon: "👥" },
        { label: "Last Turnout", value: data.lastTurnout, icon: "🗳️" }
    ];

    return (
        <div className="info-list-container">
            <h3 className="info-list-title">
                <span className="info-list-icon">📍</span>
                Constituency Info
            </h3>
            <div className="info-list-items">
                {items.map((item, index) => (
                    <div key={index} className="info-list-item">
                        <div className="info-item-left">
                            <span className="item-icon">{item.icon}</span>
                            <span className="info-item-label">{item.label}</span>
                        </div>
                        <span className="info-item-value">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ConstituencyInfo;
