import React, { useState, useEffect } from 'react';
import './playground.css';
import PaintingCanvas from '../../components/PaintingCanvas/PaintingCanvas';
import SnakeGame from '../../components/SnakeGame/SnakeGame';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SummaryModal = ({ summary, onClose }) => {
    if (!summary) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="glass-card modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <div className="modal-header">
                    <span className="summary-date">{new Date(summary.createdAt).toLocaleString()}</span>
                    <h2 className="modal-title">{summary.title}</h2>
                </div>
                <div className="modal-body">
                    <div className="full-content">{summary.content}</div>
                </div>
            </div>
        </div>
    );
};

const Playground = () => {
    const [summaries, setSummaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSummary, setSelectedSummary] = useState(null);

    useEffect(() => {
        const fetchSummaries = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/playground/summaries`);
                const data = await response.json();
                setSummaries(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            } catch (err) {
                console.error('Failed to fetch summaries:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSummaries();
    }, []);

    return (
        <div className="playground-container">
            <SummaryModal
                summary={selectedSummary}
                onClose={() => setSelectedSummary(null)}
            />

            <header className="playground-header">
                <h1 className="playground-title">AI PLAYGROUND</h1>
                <p className="playground-tagline">Experiment. Automate. Relax.</p>
            </header>

            <div className="playground-grid">
                {/* 1. DIGITAL ZEN SECTION (TOP) */}
                <section className="playground-section zen-section">
                    <h2 className="section-title">
                        <span className="icon">🧘</span> Digital Zen
                    </h2>
                    <div className="zen-grid">
                        <div className="glass-card zen-card canvas-card">
                            <div className="card-badge">Next Gen</div>
                            <h3>Painting Canvas</h3>
                            <PaintingCanvas />
                        </div>
                        <div className="glass-card zen-card">
                            <div className="card-badge">Classic</div>
                            <h3>Snake Game</h3>
                            <SnakeGame />
                        </div>
                    </div>
                </section>

                {/* 2. EXECUTION SUMMARY SECTION (LEFT) */}
                <section className="playground-section summary-section">
                    <h2 className="section-title">
                        <span className="icon">📊</span> Agentic AI Execution Summary
                    </h2>
                    <div className="glass-card summary-card">
                        {loading ? (
                            <p className="placeholder-text">Loading autonomous activity...</p>
                        ) : summaries.length > 0 ? (
                            <div className="summaries-list">
                                {summaries.map((summary) => (
                                    <div
                                        key={summary.id}
                                        className="summary-item interactive"
                                        onClick={() => setSelectedSummary(summary)}
                                    >
                                        <div className="summary-header">
                                            <span className="summary-date">{new Date(summary.createdAt).toLocaleString()}</span>
                                            <h4 className="summary-title">{summary.title}</h4>
                                        </div>
                                        <div className="summary-content-preview">
                                            {summary.content.length > 150 ? summary.content.substring(0, 150) + '...' : summary.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="placeholder-text">No autonomous activities recorded yet.</p>
                        )}
                        <div className="status-indicator">
                            <span className="pulse"></span> System Active
                        </div>
                    </div>
                </section>

                {/* 3. CHAT INTERFACE SECTION (RIGHT) */}
                <section className="playground-section chat-section">
                    <h2 className="section-title">
                        <span className="icon">💬</span> AI Explorer
                    </h2>
                    <div className="glass-card chat-placeholder">
                        <div className="mock-messages">
                            <div className="message bot">Hello! How can I assist you today?</div>
                            <div className="message user">Show me the latest system logs.</div>
                            <div className="message bot">Fetching logs... One moment please.</div>
                        </div>
                        <div className="chat-input-mock">
                            <span>Message Antigravity...</span>
                            <div className="send-btn-mock"></div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Playground;
