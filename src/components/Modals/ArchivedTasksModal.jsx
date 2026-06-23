import React, { useState, useEffect } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ArchivedTasksModal = ({ isOpen, onClose }) => {
    const [archivedTasks, setArchivedTasks] = useState([]);
    const [archivedLoading, setArchivedLoading] = useState(false);

    const fetchArchivedTasks = async () => {
        setArchivedLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/tasks/archived`);
            if (res.ok) setArchivedTasks(await res.json());
        } catch (err) {
            console.error("Failed to fetch archived tasks", err);
        } finally {
            setArchivedLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchArchivedTasks();
        } else {
            setArchivedTasks([]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleDelete = async (taskId) => {
        if (window.confirm('Are you sure you want to permanently delete this archived task?')) {
            const userFullName = localStorage.getItem('userFullName') || 'System';
            try {
                const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}?updatedBy=${encodeURIComponent(userFullName)}`, { method: 'DELETE' });
                if (res.ok) {
                    fetchArchivedTasks();
                } else {
                    console.error('Failed to delete archived task');
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" style={{ maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>
                <h2>📦 Archived Tasks</h2>
                {archivedLoading ? (
                    <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>Loading archived tasks...</p>
                ) : archivedTasks.length === 0 ? (
                    <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>No archived tasks found.</p>
                ) : (
                    (() => {
                        const grouped = archivedTasks.reduce((acc, task) => {
                            const proj = task.project || 'Unknown';
                            if (!acc[proj]) acc[proj] = [];
                            acc[proj].push(task);
                            return acc;
                        }, {});
                        return Object.entries(grouped).map(([project, tasks]) => (
                            <div key={project} style={{ marginBottom: '24px' }}>
                                <h3 style={{ color: tasks[0]?.projectColorCode || '#d4af37', fontSize: '0.95rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px', borderBottom: `1px solid ${tasks[0]?.projectColorCode || '#333'}`, paddingBottom: '6px' }}>
                                    {project} <span style={{ color: '#555', fontSize: '0.75rem' }}>({tasks.length} tasks)</span>
                                </h3>
                                {tasks.map(task => (
                                    <div key={task.id || task._id} style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '6px', padding: '12px', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ color: '#e0e0e0', fontWeight: 'bold', marginBottom: '4px' }}>{task.title}</div>
                                                {task.description && <div style={{ color: '#666', fontSize: '0.8rem' }}>{task.description}</div>}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
                                                <span style={{ backgroundColor: 'rgba(108,92,231,0.15)', color: '#a29bfe', border: '1px solid #6c5ce7', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem' }}>ARCHIVED</span>
                                                <span style={{ color: task.priority === 'HIGH' ? '#ff4d4f' : task.priority === 'MEDIUM' ? '#faad14' : '#52c41a', fontSize: '0.75rem', fontWeight: 'bold' }}>{task.priority}</span>
                                                <span
                                                    style={{ cursor: 'pointer', color: '#ff4d4f', fontSize: '1rem', marginLeft: '4px' }}
                                                    title="Permanently Delete"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(task.id || task._id);
                                                    }}
                                                >
                                                    🗑️
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ color: '#555', fontSize: '0.75rem', marginTop: '6px' }}>Assignee: {task.assignee || '—'}</div>
                                    </div>
                                ))}
                            </div>
                        ));
                    })()
                )}
            </div>
        </div>
    );
};

export default ArchivedTasksModal;
