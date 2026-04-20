import React, { useState } from 'react';
import './admin.css';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PROJECT_COLORS = [
    "#007788", "#DDAA33", "#9966AA", "#666666", "#0047AB", "#014421", "#9B111E",
    "#DAA520", "#A1008F", "#D15F5F", "#007F5F", "#1ABC9C", "#8B4513", "#2F4F4F"
];

const Admin = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        project: '',
        assignee: 'AI Agent',
        projectColorCode: '#d4af37',
        status: 'BACKLOG',
        prompt: ''
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

    // Edit Task Popup state
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [editSelectedTaskId, setEditSelectedTaskId] = useState('');
    const [editFilterProject, setEditFilterProject] = useState('');
    const [editFormData, setEditFormData] = useState({
        title: '', description: '', priority: 'MEDIUM',
        project: '', assignee: 'AI Agent', status: 'BACKLOG', prompt: ''
    });
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState('');

    // Delete Task Popup state
    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
    const [deleteSelectedTaskId, setDeleteSelectedTaskId] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState('');

    const fetchProjects = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/projects`);
            if (res.ok) {
                const projects = await res.json();
                setAllProjects(projects);
            }
        } catch (err) {
            console.error("Failed to fetch projects", err);
        }
    };

    React.useEffect(() => {
        fetchProjects();
        (async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/tasks`);
                if (res.ok) setAllTasks(await res.json());
            } catch (e) { console.error('Failed to fetch tasks', e); }
        })();
    }, []);

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
            setProjectFormData({ projectName: '', projectColorCode: '#d4af37' });
            fetchProjects(); // Refresh project list after creation
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

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditTaskSelect = (taskId) => {
        const task = allTasks.find(t => t.id === taskId);
        setEditSelectedTaskId(taskId);
        if (task) {
            setEditFormData({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'MEDIUM',
                project: task.project || '',
                assignee: task.assignee || 'AI Agent',
                status: task.status || 'BACKLOG',
                prompt: task.prompt || '',
            });
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editSelectedTaskId) { setEditError('Please select a task.'); return; }
        setEditLoading(true);
        setEditError('');
        setEditSuccess('');
        const selectedProject = allProjects.find(p => p.projectName === editFormData.project);
        try {
            const response = await fetch(`${API_BASE_URL}/api/tasks/${editSelectedTaskId}?updatedBy=Sharath`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editFormData,
                    projectColorCode: selectedProject?.projectColorCode || ''
                })
            });
            if (!response.ok) throw new Error('Failed to update task');
            const updated = await response.json();

            setAllTasks(prev => prev.map(t => t.id === editSelectedTaskId ? updated : t));
            setEditSuccess('Task updated successfully!');
            setTimeout(() => { setIsEditPopupOpen(false); setEditSuccess(''); setEditSelectedTaskId(''); }, 1500);
        } catch (err) {
            setEditError(err.message || 'Something went wrong.');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteSubmit = async (e) => {
        e.preventDefault();
        if (!deleteSelectedTaskId) { setDeleteError('Please select a task to delete.'); return; }
        if (!window.confirm('Are you sure you want to delete this task?')) return;

        setDeleteLoading(true);
        setDeleteError('');
        setDeleteSuccess('');

        try {
            const doomedTask = allTasks.find(t => t.id === deleteSelectedTaskId);
            const response = await fetch(`${API_BASE_URL}/api/tasks/${deleteSelectedTaskId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete task');

            if (doomedTask) {
                await fetch(`${API_BASE_URL}/api/logs`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        taskId: doomedTask.id,
                        taskTitle: doomedTask.title,
                        status: doomedTask.status,
                        assignee: 'Sharath',
                        actionType: 'DELETE',
                        timestamp: new Date().toISOString()
                    })
                });
            }

            setAllTasks(prev => prev.filter(t => t.id !== deleteSelectedTaskId));
            setDeleteSuccess('Task deleted successfully!');
            setTimeout(() => {
                setIsDeletePopupOpen(false);
                setDeleteSuccess('');
                setDeleteSelectedTaskId('');
            }, 1500);
        } catch (err) {
            setDeleteError(err.message || 'Something went wrong.');
        } finally {
            setDeleteLoading(false);
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

        // Find the selected project object
        // The project field in formData currently holds the projectName due to the dropdown value
        const selectedProject = allProjects.find(p => p.projectName === formData.project);

        if (!selectedProject) {
            setError('Please select a valid project');
            setLoading(false);
            return;
        }

        // Calculate the next order based on total tasks across all projects
        let totalCount = 0;
        allProjects.forEach(proj => {
            if (proj.tasks) totalCount += proj.tasks.length;
        });
        const newOrder = totalCount + 1;

        try {
            // 1. Create the Task
            const response = await fetch(`${API_BASE_URL}/api/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    order: newOrder,
                    projectColorCode: selectedProject.projectColorCode,
                    status: formData.status,
                    project: selectedProject.projectName // Ensure ID is stored as requested earlier
                })
            });

            if (!response.ok) throw new Error('Failed to create task');
            const newTask = await response.json();
            const newTaskId = newTask.id || newTask._id;

            // 2. Link the Task to the Project
            const projId = selectedProject.id || selectedProject._id;
            const projectResponse = await fetch(`${API_BASE_URL}/api/projects/${projId}/tasks`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([newTaskId])
            });

            if (!projectResponse.ok) throw new Error('Failed to link task to project');

            await fetch(`${API_BASE_URL}/api/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskId: newTaskId,
                    taskTitle: newTask.title,
                    status: newTask.status,
                    assignee: 'Sharath',
                    actionType: 'CREATE',
                    timestamp: new Date().toISOString()
                })
            });

            setSuccess('Task created and linked successfully!');
            setFormData({
                title: '',
                description: '',
                priority: 'MEDIUM',
                project: '',
                assignee: 'AI Agent',
                projectColorCode: '#d4af37',
                status: 'BACKLOG',
                prompt: ''
            });
            //fetchProjects(); // Refresh projects to get updated task lists
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

                <button className="create-task-btn" onClick={() => setIsEditPopupOpen(true)}>
                    <span>✎ Edit Task</span>
                </button>

                <button className="create-task-btn" onClick={() => setIsDeletePopupOpen(true)}>
                    <span>🗑 Delete Task</span>
                </button>
            </div>

            {isPopupOpen && (
                <div className="popup-overlay">
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setIsPopupOpen(false)}>×</button>
                        <h2>New Task Details</h2>

                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Project</label>
                                <select
                                    name="project"
                                    value={formData.project}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">-- Select Project --</option>
                                    {allProjects.map(proj => (
                                        <option key={proj.id || proj._id} value={proj.projectName}>{proj.projectName}</option>
                                    ))}
                                </select>
                            </div>

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
                                        <label>Assignee</label>
                                        <select
                                            name="assignee"
                                            value={formData.assignee}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="AI Agent">AI Agent</option>
                                            <option value="Sharath">Sharath</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select name="status" value={formData.status} onChange={handleChange}>
                                            <option value="BACKLOG">Backlog</option>
                                            <option value="TODO">To Do</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="REVIEW">Review</option>
                                            <option value="DONE">Done</option>
                                        </select>
                                    </div>
                                </div>

                            {formData.assignee === 'AI Agent' && (
                                <div className="form-group">
                                    <label>Prompt</label>
                                    <textarea
                                        name="prompt"
                                        value={formData.prompt}
                                        onChange={handleChange}
                                        placeholder="Describe what you want AI Agent to implement..."
                                        rows="3"
                                    />
                                </div>
                            )}

                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? 'Creating...' : 'Submit Task'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {isProjectPopupOpen && (
                <div className="popup-overlay">
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
                                <div className="color-grid">
                                    {PROJECT_COLORS.map(color => (
                                        <div
                                            key={color}
                                            className={`color-square ${projectFormData.projectColorCode === color ? 'selected' : ''}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setProjectFormData(prev => ({ ...prev, projectColorCode: color }))}
                                            title={color}
                                        />
                                    ))}
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
                <div className="popup-overlay">
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
                                            <option key={proj.id || proj._id} value={proj.id || proj._id}>{proj.projectName}</option>
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

            {isEditPopupOpen && (
                <div className="popup-overlay">
                    <div className="popup-content edit-popup" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => { setIsEditPopupOpen(false); setEditSelectedTaskId(''); }}>×</button>
                        <h2>Edit Task</h2>

                        {editError && <div className="error-message">{editError}</div>}
                        {editSuccess && <div className="success-message">{editSuccess}</div>}

                        <div className="form-group">
                            <label>Select Project to Filter</label>
                            <select
                                value={editFilterProject}
                                onChange={(e) => {
                                    setEditFilterProject(e.target.value);
                                    setEditSelectedTaskId('');
                                }}
                            >
                                <option value="">-- All Projects --</option>
                                {allProjects.map(proj => (
                                    <option key={proj.id || proj._id} value={proj.projectName}>{proj.projectName}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Select Task to Edit</label>
                            <select
                                value={editSelectedTaskId}
                                onChange={(e) => handleEditTaskSelect(e.target.value)}
                            >
                                <option value="">-- Choose a Task --</option>
                                {allTasks
                                    .filter(task => !editFilterProject || task.project === editFilterProject)
                                    .map(task => (
                                        <option key={task.id} value={task.id}>{task.title}</option>
                                    ))}
                            </select>
                        </div>

                        {editSelectedTaskId && (
                            <form onSubmit={handleEditSubmit}>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea name="description" value={editFormData.description} onChange={handleEditChange} rows="4" placeholder="Task description" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Priority</label>
                                        <select name="priority" value={editFormData.priority} onChange={handleEditChange}>
                                            <option value="HIGH">High</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="LOW">Low</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select name="status" value={editFormData.status} onChange={handleEditChange}>
                                            <option value="BACKLOG">Backlog</option>
                                            <option value="TODO">To Do</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="REVIEW">Review</option>
                                            <option value="DONE">Done</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Project</label>
                                        <select name="project" value={editFormData.project} onChange={handleEditChange}>
                                            <option value="">-- Select Project --</option>
                                            {allProjects.map(proj => (
                                                <option key={proj.id || proj._id} value={proj.projectName}>{proj.projectName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Assignee</label>
                                        <select name="assignee" value={editFormData.assignee} onChange={handleEditChange}>
                                            <option value="AI Agent">AI Agent</option>
                                            <option value="Sharath">Sharath</option>
                                        </select>
                                    </div>
                                </div>
                                {editFormData.assignee === 'AI Agent' && (
                                    <div className="form-group">
                                        <label>Prompt</label>
                                        <textarea
                                            name="prompt"
                                            value={editFormData.prompt}
                                            onChange={handleEditChange}
                                            placeholder="Describe what you want AI Agent to implement..."
                                            rows="3"
                                        />
                                    </div>
                                )}
                                <button type="submit" className="submit-btn" disabled={editLoading}>
                                    {editLoading ? 'Updating...' : 'Update Task'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {isDeletePopupOpen && (
                <div className="popup-overlay">
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => { setIsDeletePopupOpen(false); setDeleteSelectedTaskId(''); }}>×</button>
                        <h2>Delete Task</h2>
                        <p style={{ color: '#888', marginBottom: '20px' }}>Only tasks with status "DONE" can be deleted.</p>

                        {deleteError && <div className="error-message">{deleteError}</div>}
                        {deleteSuccess && <div className="success-message">{deleteSuccess}</div>}

                        <form onSubmit={handleDeleteSubmit}>
                            <div className="form-group">
                                <label>Select Task to Delete</label>
                                <select
                                    value={deleteSelectedTaskId}
                                    onChange={(e) => setDeleteSelectedTaskId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Choose a "DONE" Task --</option>
                                    {allTasks
                                        .filter(task => task.status === 'DONE')
                                        .map(task => (
                                            <option key={task.id} value={task.id}>{task.title}</option>
                                        ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="submit-btn"
                                style={{ backgroundColor: '#cc0000' }}
                                disabled={deleteLoading || !deleteSelectedTaskId}
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete Task Permanently'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
