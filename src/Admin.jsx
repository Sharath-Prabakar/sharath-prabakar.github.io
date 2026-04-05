import React, { useState } from 'react';
import './admin.css';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
//const API_BASE_URL = "http://localhost:8080";

const Admin = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        project: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [isProjectPopupOpen, setIsProjectPopupOpen] = useState(false);
    const [projectFormData, setProjectFormData] = useState({
        projectName: '',
        projectColorCode: '#d4af37'
    });
    const [projectLoading, setProjectLoading] = useState(false);
    const [projectError, setProjectError] = useState('');
    const [projectSuccess, setProjectSuccess] = useState('');

    const [isLinkPopupOpen, setIsLinkPopupOpen] = useState(false);
    const [linkLoading, setLinkLoading] = useState(false);
    const [linkSubmitLoading, setLinkSubmitLoading] = useState(false);
    const [linkError, setLinkError] = useState('');
    const [linkSuccess, setLinkSuccess] = useState('');
    const [allProjects, setAllProjects] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [selectedTaskIds, setSelectedTaskIds] = useState([]);
    const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProjectChange = (e) => {
        const { name, value } = e.target;
        setProjectFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProjectSubmit = async (e) => {
        e.preventDefault();
        setProjectLoading(true);
        setProjectError('');
        setProjectSuccess('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(projectFormData)
            });

            if (!response.ok) {
                throw new Error('Failed to create project');
            }

            setProjectSuccess('Project created successfully!');
            setProjectFormData(JSON.stringify(projectFormData));
            setTimeout(() => {
                setIsProjectPopupOpen(false);
                setProjectSuccess('');
            }, 1500);

        } catch (err) {
            setProjectError(err.message || 'Something went wrong while pushing data to MongoDB.');
        } finally {
            setProjectLoading(false);
        }
    };

    const openLinkPopup = async () => {
        setIsLinkPopupOpen(true);
        setLinkLoading(true);
        setLinkError('');
        setSelectedProjectId('');
        setSelectedTaskIds([]);
        try {
            const [projRes, taskRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/projects`),
                fetch(`${API_BASE_URL}/api/tasks`)
            ]);
            if (!projRes.ok || !taskRes.ok) throw new Error('Failed to fetch data');
            const projects = await projRes.json();
            const tasks = await taskRes.json();
            setAllProjects(projects);
            setAllTasks(tasks);
            console.log(tasks)
        } catch (err) {
            setLinkError('Failed to load projects/tasks');
        } finally {
            setLinkLoading(false);
        }
    };

    const handleLinkSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProjectId) {
            setLinkError("Please select a project.");
            return;
        }
        setLinkSubmitLoading(true);
        setLinkError('');
        setLinkSuccess('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/projects/${selectedProjectId}/tasks`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedTaskIds)
            });

            if (!response.ok) throw new Error('Failed to link tasks to project');

            setLinkSuccess('Tasks linked successfully!');
            setTimeout(() => {
                setIsLinkPopupOpen(false);
                setLinkSuccess('');
            }, 1500);

        } catch (err) {
            setLinkError(err.message || 'Something went wrong.');
        } finally {
            setLinkSubmitLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    status: 'BACKLOG',
                    assignee: 'Unassigned'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create task');
            }

            setSuccess('Task created successfully!');
            setFormData({ title: '', description: '', priority: 'MEDIUM', project: '' });
            setTimeout(() => {
                setIsPopupOpen(false);
                setSuccess('');
            }, 1500);

        } catch (err) {
            setError(err.message || 'Something went wrong while pushing data to MongoDB.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-container">
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Manage tasks and operations seamlessly</p>

            <div className="admin-actions">
                <button className="create-task-btn" onClick={() => setIsPopupOpen(true)}>
                    <span>+ Create Task</span>
                </button>

                <button className="create-task-btn" onClick={() => setIsProjectPopupOpen(true)}>
                    <span>+ Create Project</span>
                </button>

                <button className="create-task-btn" onClick={openLinkPopup}>
                    <span>+ Link Project to Tasks</span>
                </button>
            </div>

            {isPopupOpen && (
                <div className="popup-overlay" onClick={() => setIsPopupOpen(false)}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setIsPopupOpen(false)}>×</button>
                        <h2>New Task Details</h2>

                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter task title"
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter task description"
                                    rows="4"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select name="priority" value={formData.priority} onChange={handleChange}>
                                        <option value="HIGH">High</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="LOW">Low</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Project</label>
                                    <input
                                        type="text"
                                        name="project"
                                        value={formData.project}
                                        onChange={handleChange}
                                        required
                                        placeholder="E.g., Frontend Revamp"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? 'Creating...' : 'Submit Task'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {isProjectPopupOpen && (
                <div className="popup-overlay" onClick={() => setIsProjectPopupOpen(false)}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setIsProjectPopupOpen(false)}>×</button>
                        <h2>New Project Details</h2>

                        {projectError && <div className="error-message">{projectError}</div>}
                        {projectSuccess && <div className="success-message">{projectSuccess}</div>}

                        <form onSubmit={handleProjectSubmit}>
                            <div className="form-group">
                                <label>Project Title</label>
                                <input
                                    type="text"
                                    name="projectName"
                                    value={projectFormData.projectName}
                                    onChange={handleProjectChange}
                                    required
                                    placeholder="Enter project title"
                                />
                            </div>

                            <div className="form-group">
                                <label>Project Color Code</label>
                                <div className="color-picker-container">
                                    <input
                                        type="color"
                                        name="projectColorCode"
                                        value={projectFormData.projectColorCode}
                                        onChange={handleProjectChange}
                                        required
                                        className="color-picker-input"
                                    />
                                    <input
                                        type="text"
                                        name="projectColorCode"
                                        value={projectFormData.projectColorCode}
                                        onChange={handleProjectChange}
                                        required
                                        className="color-text-input"
                                        pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                        placeholder="#FFFFFF"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="submit-btn" disabled={projectLoading}>
                                {projectLoading ? 'Creating...' : 'Submit Project'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isLinkPopupOpen && (
                <div className="popup-overlay" onClick={() => setIsLinkPopupOpen(false)}>
                    <div className="popup-content link-popup" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setIsLinkPopupOpen(false)}>×</button>
                        <h2>Link Project to Tasks</h2>

                        {linkError && <div className="error-message">{linkError}</div>}
                        {linkSuccess && <div className="success-message">{linkSuccess}</div>}

                        {linkLoading ? (
                            <div className="loading-msg">Loading data...</div>
                        ) : (
                            <form onSubmit={handleLinkSubmit}>
                                <div className="form-group">
                                    <label>Select Project</label>
                                    <select
                                        value={selectedProjectId}
                                        onChange={(e) => setSelectedProjectId(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Choose a Project --</option>
                                        {allProjects.map(proj => (
                                            <option key={proj.id} value={proj.id}>{proj.projectName}</option>
                                        ))}
                                    </select>
                                </div>

                                {selectedProjectId && (() => {
                                    const selectedProj = allProjects.find(p => p.id.toString() === selectedProjectId.toString());
                                    console.log(selectedProj);
                                    const existingTasks = allTasks.filter(t => t.project === selectedProj.projectName);
                                    console.log(existingTasks);
                                    return (
                                        <div className="form-group existing-tasks-group">
                                            <label>Existing Tasks in Project</label>
                                            <div className="existing-tasks-list">
                                                {existingTasks.length > 0 ? (
                                                    existingTasks.map(t => <div key={t.id} className="existing-task-item">• {t.title}</div>)
                                                ) : (
                                                    <div className="empty-msg">No tasks linked yet.</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div className="form-group">
                                    <label>Assign Tasks</label>
                                    <div className="custom-dropdown">
                                        <div
                                            className="custom-dropdown-header"
                                            onClick={() => setIsTaskDropdownOpen(!isTaskDropdownOpen)}
                                        >
                                            {selectedTaskIds.length === 0 ? "Select Tasks..." : `${selectedTaskIds.length} tasks selected`}
                                            <span className="dropdown-arrow">{isTaskDropdownOpen ? '▲' : '▼'}</span>
                                        </div>
                                        {isTaskDropdownOpen && (
                                            <div className="custom-dropdown-list">
                                                {allTasks.map(task => (
                                                    <label key={task.id} className="custom-dropdown-item">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedTaskIds.includes(task.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setSelectedTaskIds([...selectedTaskIds, task.id]);
                                                                else setSelectedTaskIds(selectedTaskIds.filter(id => id !== task.id));
                                                            }}
                                                        />
                                                        {task.title}
                                                    </label>
                                                ))}
                                                {allTasks.length === 0 && <div className="custom-dropdown-item">No tasks available</div>}
                                            </div>
                                        )}
                                    </div>

                                    {selectedTaskIds.length > 0 && (
                                        <div className="selected-tasks-chips">
                                            {selectedTaskIds.map(id => {
                                                const t = allTasks.find(t => t.id === id);
                                                if (!t) return null;
                                                return (
                                                    <span key={id} className="task-chip">
                                                        {t.title}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setSelectedTaskIds(selectedTaskIds.filter(tid => tid !== id));
                                                            }}
                                                        >×</button>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <button type="submit" className="submit-btn" disabled={linkSubmitLoading}>
                                    {linkSubmitLoading ? 'Linking...' : 'Link Tasks'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
