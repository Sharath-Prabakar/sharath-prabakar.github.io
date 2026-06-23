import React, { useState, useEffect } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const hexToRgba = (hex, alpha) => {
    if (!hex) return `rgba(30, 58, 95, ${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const ProjectPriorityModal = ({ isOpen, onClose, onSuccess }) => {
    const [allProjects, setAllProjects] = useState([]);
    const [projectRanks, setProjectRanks] = useState({});
    const [priorityLoading, setPriorityLoading] = useState(false);
    const [priorityError, setPriorityError] = useState('');
    const [prioritySuccess, setPrioritySuccess] = useState('');

    const openPriorityPopup = async () => {
        setPriorityLoading(true);
        setPriorityError('');
        try {
            const projRes = await fetch(`${API_BASE_URL}/api/projects`);
            if (!projRes.ok) throw new Error('Failed to fetch projects');
            const projects = await projRes.json();
            
            projects.sort((a, b) => (a.rank || 0) - (b.rank || 0));
            setAllProjects(projects);
            
            const initialRanks = {};
            projects.forEach(p => {
                initialRanks[p.id || p._id] = p.rank || 0;
            });
            setProjectRanks(initialRanks);
        } catch (err) {
            setPriorityError('Failed to load projects');
        } finally {
            setPriorityLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            openPriorityPopup();
        } else {
            setAllProjects([]);
            setProjectRanks({});
            setPriorityError('');
            setPrioritySuccess('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePriorityChange = (projectId, delta) => {
        setProjectRanks(prev => {
            const currentVal = prev[projectId] || 0;
            const newVal = Math.max(0, currentVal + delta);
            return { ...prev, [projectId]: newVal };
        });
    };

    const handlePrioritySubmit = async (e) => {
        e.preventDefault();
        setPriorityLoading(true);
        setPriorityError('');
        setPrioritySuccess('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/projects/ranks`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectRanks)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || 'Failed to update project priorities');
            }

            setPrioritySuccess('Project priorities updated successfully!');
            setTimeout(() => {
                setPrioritySuccess('');
                if (onSuccess) onSuccess();
                onClose();
            }, 1500);

        } catch (err) {
            setPriorityError(err.message || 'Something went wrong.');
        } finally {
            setPriorityLoading(false);
        }
    };

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content priority-popup-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>
                <h2>Set Project Priority</h2>

                {priorityError && <div className="error-message">{priorityError}</div>}
                {prioritySuccess && <div className="success-message">{prioritySuccess}</div>}

                <div className="priority-list">
                    {allProjects.map(proj => {
                        const projId = proj.id || proj._id;
                        return (
                            <div key={projId} className="priority-item">
                                <span 
                                    className="project-badge" 
                                    style={{ 
                                        backgroundColor: hexToRgba(proj.projectColorCode, 0.25), 
                                        color: '#fff', 
                                        border: `1px solid ${proj.projectColorCode || '#4da3ff'}`,
                                        boxShadow: `0 0 12px ${hexToRgba(proj.projectColorCode, 0.5)}`,
                                        textShadow: `0 0 5px ${proj.projectColorCode || '#4da3ff'}`
                                    }}
                                >
                                    {proj.projectName}
                                </span>
                                <div className="priority-controls">
                                    <button type="button" className="priority-btn" onClick={() => handlePriorityChange(projId, -1)}>-</button>
                                    <span className="priority-value">{projectRanks[projId] || 0}</span>
                                    <button type="button" className="priority-btn" onClick={() => handlePriorityChange(projId, 1)}>+</button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button className="submit-btn" onClick={handlePrioritySubmit} disabled={priorityLoading}>
                    {priorityLoading ? 'Saving...' : 'Save Priorities'}
                </button>
            </div>
        </div>
    );
};

export default ProjectPriorityModal;
