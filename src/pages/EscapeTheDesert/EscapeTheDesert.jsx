import React, { useState } from 'react';
import CardGeneratorTab from './CardGeneratorTab';
import BoardSimulator from './BoardSimulator';
import './EscapeTheDesert.css';

const EscapeTheDesert = () => {
    const [activeTab, setActiveTab] = useState('card-generator');

    return (
        <div className="escape-desert-page">
            {/* Hero Banner */}
            <header className="desert-hero">
                <div className="hero-content">
                    <h1 className="hero-title">🏜️ ESCAPE THE DESERT</h1>
                    <p className="hero-subtitle">
                        Official Board Game Design Studio & Interactive Simulator
                    </p>
                    
                    {/* Tab Navigation */}
                    <div className="tab-navigation">
                        <button
                            className={`tab-button ${activeTab === 'card-generator' ? 'active' : ''}`}
                            onClick={() => setActiveTab('card-generator')}
                        >
                            🎴 Card Generator
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'board-simulator' ? 'active' : ''}`}
                            onClick={() => setActiveTab('board-simulator')}
                        >
                            🗺️ 10×10 Board Setup
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="desert-content">
                {activeTab === 'card-generator' && <CardGeneratorTab />}
                {activeTab === 'board-simulator' && <BoardSimulator />}
            </main>
        </div>
    );
};

export default EscapeTheDesert;
