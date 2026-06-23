import React, { useState, useEffect } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EditTaskModal = ({ isOpen, onClose, onSuccess, allTasks, allProjects, allUsers, initialTaskId }) => {
    const userFullName = localStorage.getItem('userFullName') || 'System';
    const [editSelectedTaskId, setEditSelectedTaskId] = useState('');
    const [editFormData, setEditFormData] = useState({
        title: '', description: '', priority: 'MEDIUM',
        project: '', assignee: 'AI Agent', status: 'BACKLOG', prompt: '', reminderDate: ''
    });
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialTaskId) {
                handleEditTaskSelect(initialTaskId);
            } else {
                setEditSelectedTaskId('');
                setEditFormData({
                    title: '', description: '', priority: 'MEDIUM',
                    project: '', assignee: 'AI Agent', status: 'BACKLOG', prompt: '', reminderDate: ''
                });
            }
            setEditError('');
            setEditSuccess('');
        }
    }, [isOpen, initialTaskId, allTasks]);

    if (!isOpen) return null;

    const handleEditTaskSelect = (taskId) => {
        const task = allTasks.find(t => t.id === taskId || t._id === taskId);
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
                reminderDate: task.reminderDate ? task.reminderDate.substring(0, 16) : '',
            });
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editSelectedTaskId) { setEditError('Please select a task.'); return; }
        setEditLoading(true);
        setEditError('');
        setEditSuccess('');
        
        const selectedProject = allProjects.find(p => p.projectName === editFormData.project);
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/tasks/${editSelectedTaskId}?updatedBy=${encodeURIComponent(userFullName)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editFormData,
                    projectColorCode: selectedProject?.projectColorCode || ''
                })
            });
            if (!response.ok) throw new Error('Failed to update task');

            setEditSuccess('Task updated successfully!');
            setTimeout(() => {
                setEditSuccess('');
                setEditSelectedTaskId('');
                if (onSuccess) onSuccess();
                onClose();
            }, 1500);
        } catch (err) {
            setEditError(err.message || 'Something went wrong.');
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>
                <h2>Edit Task Details</h2>

                {editError && <div className="error-message">{editError}</div>}
                {editSuccess && <div className="success-message">{editSuccess}</div>}

                {!initialTaskId && (
                    <div className="form-group">
                        <label>Select Task to Edit</label>
                        <select
                            value={editSelectedTaskId}
                            onChange={(e) => handleEditTaskSelect(e.target.value)}
                            required
                        >
                            <option value="">-- Select a Task --</option>
                            {allTasks.map(task => (
                                <option key={task.id || task._id} value={task.id || task._id}>
                                    {task.title} ({task.project})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {editSelectedTaskId && (
                    <form onSubmit={handleEditSubmit}>
                        <div className="form-group">
                            <label>Project</label>
                            <select name="project" value={editFormData.project} onChange={handleEditChange} required>
                                <option value="">-- Select Project --</option>
                                {allProjects.map(proj => (
                                    <option key={proj.id || proj._id} value={proj.projectName}>{proj.projectName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Title</label>
                            <input type="text" name="title" value={editFormData.title} onChange={handleEditChange} required />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea name="description" value={editFormData.description} onChange={handleEditChange} required rows="4" />
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
                                <label>Assignee</label>
                                <select name="assignee" value={editFormData.assignee} onChange={handleEditChange} required>
                                    <option value="AI Agent">AI Agent</option>
                                    {allUsers
                                        .filter(u => u.access === 'Admin')
                                        .map(u => {
                                            const fullName = `${u.firstName} ${u.lastName}`;
                                            return (
                                                <option key={u.id || u._id} value={fullName}>
                                                    {fullName}
                                                </option>
                                            );
                                        })}
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
                        </div>

                        {editFormData.assignee === 'AI Agent' && (
                            <div className="form-group">
                                <label>Prompt</label>
                                <textarea name="prompt" value={editFormData.prompt} onChange={handleEditChange} rows="3" />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Reminder Date & Time</label>
                            <input type="datetime-local" name="reminderDate" value={editFormData.reminderDate} onChange={handleEditChange} />
                        </div>

                        <button type="submit" className="submit-btn" disabled={editLoading}>
                            {editLoading ? 'Updating...' : 'Update Task'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditTaskModal;
