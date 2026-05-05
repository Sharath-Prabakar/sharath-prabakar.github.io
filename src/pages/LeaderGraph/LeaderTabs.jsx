import React from 'react';
import './LeaderTabs.css';

const LeaderTabs = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'overview', label: 'Overview', icon: '🏠' },
        { id: 'timeline', label: 'Career Timeline', icon: '⏳' },
        { id: 'elections', label: 'Elections', icon: '🗳️' },
        { id: 'party', label: 'Party Journey', icon: '🚩' },
        { id: 'news', label: 'News', icon: '📰' },
        { id: 'profile', label: 'Profile & Assets', icon: '👤' },
    ];

    return (
        <div className="leader-tabs-container">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-label">{tab.label}</span>
                </button>
            ))}
        </div>
    );
};

export default LeaderTabs;
