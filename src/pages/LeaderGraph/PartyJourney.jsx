import React from 'react';
import './PartyJourney.css';

const PartyJourney = ({ journeyData }) => {
    if (!journeyData || !Array.isArray(journeyData)) return null;

    return (
        <div className="party-journey-container">
            <div className="journey-path">
                {journeyData.map((item, index) => (
                    <div key={index} className="journey-item">
                        <div className="journey-marker">
                            <div 
                                className="party-logo-wrapper" 
                                style={{ borderColor: item.color }}
                            >
                                <img src={item.logo} alt={item.party} className="party-logo-small" />
                            </div>
                            {index !== journeyData.length - 1 && (
                                <div className="journey-line" style={{ backgroundColor: item.color }}></div>
                            )}
                        </div>
                        <div className="journey-details">
                            <div className="journey-period">{item.period}</div>
                            <div className="journey-party-name" style={{ color: item.color }}>{item.party}</div>
                            <div className="journey-role">{item.role}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PartyJourney;
