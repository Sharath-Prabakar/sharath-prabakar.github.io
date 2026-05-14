import React, { useState, useEffect } from 'react';
import './playground.css';
import HorizontalCalendar from '../../components/HorizontalCalendar/HorizontalCalendar';
import PaintingCanvas from '../../components/PaintingCanvas/PaintingCanvas';
import { chatService } from '../../services/chatService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const formatTime = (totalSeconds) => {
    if (!totalSeconds || totalSeconds === 0) return '0s';
    if (totalSeconds < 60) return `${Math.round(totalSeconds)}s`;
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.round(totalSeconds % 60);
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
};

const getSenderName = (msg) => {
    if (msg.sender === 'user') {
        return (msg.senderName && msg.senderName.trim() !== '') ? msg.senderName : 'User';
    }
    if (msg.sender === 'bot') {
        return (msg.senderName && msg.senderName.trim() !== '') ? msg.senderName : 'Antigravity';
    }
    return msg.sender || 'Unknown';
};

const getSenderColor = (sender) => {
    const colors = {
        'user': '#d4af37', // Gold
        'bot': '#4da3ff',  // Blue
        'antigravity': '#4da3ff',
        'system': '#00ff88',
        'assistant': '#a855f7'
    };
    return colors[sender.toLowerCase()] || '#e0e0e0';
};

const SummaryModal = ({ summary, onClose }) => {
    const [tasks, setTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(false);

    useEffect(() => {
        if (summary?.taskIds?.length > 0) {
            const fetchTasks = async () => {
                setLoadingTasks(true);
                try {
                    const response = await fetch(`${API_BASE_URL}/api/tasks/batch/fetch`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },        
                        body: JSON.stringify(summary.taskIds)
                    });
                    const activeTasks = await response.json();
                    
                    // Check if any tasks are missing (e.g. they were archived)
                    const activeTaskIds = activeTasks.map(t => t.id);
                    const missingTaskIds = summary.taskIds.filter(id => !activeTaskIds.includes(id));
                    
                    let archivedTasks = [];
                    if (missingTaskIds.length > 0) {
                        const archiveResponse = await fetch(`${API_BASE_URL}/api/tasks/archived/batch/fetch`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(missingTaskIds)
                        });
                        if (archiveResponse.ok) {
                            archivedTasks = await archiveResponse.json();
                        }
                    }
                    
                    setTasks([...activeTasks, ...archivedTasks]);
                } catch (err) {
                    console.error('Failed to fetch tasks:', err);
                } finally {
                    setLoadingTasks(false);
                }
            };
            fetchTasks();
        } else {
            setTasks([]);
        }
    }, [summary]);

    if (!summary) return null;


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="glass-card modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>  
                <div className="modal-header">
                    <span className="summary-date">
                        {summary.isDaySummary
                            ? new Date(summary.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                            : new Date(summary.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                        }
                    </span>
                    <h2 className="modal-title">{summary.title}</h2>
                </div>
                <div className="modal-body">
                    <div className="summary-stats">
                        <div className="stat-block">
                            <span className="stat-label">Time Taken</span>      
                            <span className="stat-value">{formatTime(summary.totalTimeSeconds)}</span>
                        </div>
                        <div className="stat-block">
                            <span className="stat-label">Tasks Executed</span>  
                            <span className="stat-value">{summary.totalTasks || summary.taskIds?.length || 0}</span>
                        </div>
                    </div>

                    {summary.taskIds && summary.taskIds.length > 0 && (
                        <div className="tasks-summary-section">
                            <h3 className="section-subtitle">🛠️ Tasks Executed</h3>
                            {loadingTasks ? (
                                <p className="loading-mini">Fetching task details...</p>
                            ) : (
                                <div className="summary-tasks-table-wrapper">   
                                    <table className="summary-tasks-table">     
                                        <thead>
                                            <tr>
                                                <th>Task</th>
                                                <th>Project</th>
                                                <th>Assignee</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tasks.map(task => (
                                                <tr key={task.id}>
                                                    <td>{task.title}</td>       
                                                    <td>{task.project}</td>     
                                                    <td>{task.assignee}</td>    
                                                    <td><span className={`status-pill ${task.status}`}>{task.status}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="full-content">{summary.content}</div>
                </div>
            </div>
        </div>
    );
};

const Playground = () => {
    const [summaries, setSummaries] = useState([]);
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userAccess = localStorage.getItem('userAccess');
    const isGuestUser = !isAuthenticated || userAccess === 'Request';
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedSummary, setSelectedSummary] = useState(null);
    const messagesEndRef = React.useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

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

        const fetchMessages = async () => {
            try {
                const data = await chatService.getMessages();
                setMessages(data);
            } catch (err) {
                console.error('Failed to fetch messages:', err);
            }
        };

        fetchSummaries();
        fetchMessages();
    }, []);

    const handleSendMessage = async () => {
        if (!input.trim() || isGuestUser) return;
        
        const userFullName = localStorage.getItem('userFullName') || 'User';
        const userEmail = localStorage.getItem('userEmail') || '';

        const newMessage = { 
            content: input, 
            sender: 'user',
            senderName: userFullName,
            senderEmail: userEmail,
            createdAt: new Date().toISOString() 
        };
        
        setInput('');
        setMessages(prev => [...prev, newMessage]);
        try {
            await chatService.sendMessage(newMessage);
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSendMessage();
    };

    const handleDayClick = (dateStr) => {
        const daySummaries = summaries.filter(s => {
            if (!s.createdAt) return false;
            const sDateStr = new Date(s.createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
            return sDateStr === dateStr;
        });

        if (daySummaries.length === 0) return;

        const aggregatedTaskIds = [];
        let totalTimeSeconds = 0;
        let totalTasks = 0;

        daySummaries.forEach(s => {
            if (s.taskIds) aggregatedTaskIds.push(...s.taskIds);
            totalTimeSeconds += s.totalTimeSeconds || 0;
            totalTasks += s.totalTasks || (s.taskIds ? s.taskIds.length : 0);
        });

        const daySummary = {
            id: `day-${dateStr}`,
            createdAt: new Date(dateStr).toISOString(),
            isDaySummary: true,
            title: `Daily Agentic AI Task Summary`,
            content: `Aggregated execution summary for ${daySummaries.length} session(s) on this day.`,
            totalTimeSeconds,
            totalTasks,
            taskIds: aggregatedTaskIds
        };

        setSelectedSummary(daySummary);
    };

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

            <HorizontalCalendar summaries={summaries} onDayClick={handleDayClick} />

            <div className="playground-grid">
                {/* 1. EXECUTION SUMMARY SECTION (LEFT) */}
                <section className="playground-section summary-section">
                    <h2 className="section-title">
                        <span className="icon">📊</span> Agentic AI Task Summary
                    </h2>
                    <div className="glass-card summary-card">
                        {loading ? (
                            <p className="placeholder-text">Loading autonomous activity...</p>
                        ) : summaries.length > 0 ? (
                            <div className="summaries-list">
                                {summaries.slice(0, 10).map((summary) => (
                                    <div
                                        key={summary.id}
                                        className="summary-item interactive"
                                        onClick={() => setSelectedSummary(summary)}
                                    >
                                        <div className="summary-header">
                                            <span className="summary-date">{new Date(summary.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
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
                    </div>
                </section>

                {/* 2. CHAT INTERFACE SECTION (RIGHT) */}
                <section className="playground-section chat-section">
                    <h2 className="section-title">
                        <span className="icon">💬</span> AI Explorer
                    </h2>
                    <div className="glass-card chat-container">
                        <div className="chat-messages-area">
                            {messages.length > 0 ? messages.map((msg, idx) => (
                                <div key={idx} className={`message ${msg.sender}`}>
                                    <span className="sender-name" style={{ color: getSenderColor(msg.sender) }}>
                                        {getSenderName(msg)}
                                    </span>
                                    <div className="message-content">{msg.content}</div>
                                    <span className="message-time">
                                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }) : 'Just now'}
                                    </span>
                                </div>
                            )) : (
                                <div className="message bot">
                                    <span className="sender-name" style={{ color: getSenderColor('bot') }}>
                                        Antigravity
                                    </span>
                                    <div className="message-content">Hello! I am Antigravity. How can I assist your development today?</div>
                                    <span className="message-time">Just now</span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="chat-input-wrapper">
                                <input
                                    type="text"
                                    className="chat-input"
                                    placeholder={!isAuthenticated ? "Log in to chat with Antigravity" : isGuestUser ? "Access required to chat with Antigravity" : "Message Antigravity..."}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={isGuestUser}
                                />
                                <button className="chat-send-btn" onClick={handleSendMessage} disabled={!input.trim() || isGuestUser}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13"></line>
                                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                    </svg>
                                </button>
                        </div>
                    </div>
                </section>

                {/* 3. DIGITAL ZEN SECTION (BOTTOM) */}
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
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Playground;

