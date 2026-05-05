import React from 'react';
import './InfoList.css';

const KeyInfo = ({ data }) => {
    if (!data) return null;

    const items = [
        { label: "Assets", value: data.assets, icon: "💰" },
        { label: "Liabilities", value: data.liabilities, icon: "📉" },
        { label: "Criminal Cases", value: data.criminalCases, icon: "⚖️" },
        { label: "PAN Status", value: data.panStatus, icon: "🆔" }
    ];

    return (
        <div className="info-list-container">
            <h3 className="info-list-title">
                <span className="info-list-icon">💼</span>
                Other Key Info (Financials/Legal)
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

export default KeyInfo;
