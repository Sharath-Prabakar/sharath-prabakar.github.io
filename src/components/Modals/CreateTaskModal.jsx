import React, { useState } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CreateTaskModal = ({ isOpen, onClose, onSuccess, allProjects, allUsers }) => {
    const userFullName = localStorage.getItem('userFullName') || 'System';
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        project: '',
        assignee: 'AI Agent',
        projectColorCode: '#d4af37',
        status: 'BACKLOG',
        prompt: '',
        reminderDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const selectedProject = allProjects.find(p => p.projectName === formData.project);

        if (!selectedProject) {
            setError('Please select a valid project');
            setLoading(false);
            return;
        }

        let totalCount = 0;
        allProjects.forEach(proj => {
            if (proj.tasks) totalCount += proj.tasks.length;
        });
        const newOrder = totalCount + 1;

        try {
            const response = await fetch(`${API_BASE_URL}/api/tasks?createdBy=${encodeURIComponent(userFullName)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    order: newOrder,
                    projectColorCode: selectedProject.projectColorCode,
                    status: formData.status,
                    project: selectedProject.projectName 
                })
            });

            if (!response.ok) throw new Error('Failed to create task');
            const newTask = await response.json();
            const newTaskId = newTask.id || newTask._id;

            const projId = selectedProject.id || selectedProject._id;
            const projectResponse = await fetch(`${API_BASE_URL}/api/projects/${projId}/tasks`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([newTaskId])
            });

            if (!projectResponse.ok) throw new Error('Failed to link task to project');

            setSuccess('Task created and linked successfully!');
            setFormData({
                title: '', description: '', priority: 'MEDIUM', project: '',
                assignee: 'AI Agent', projectColorCode: '#d4af37', status: 'BACKLOG', prompt: '', reminderDate: ''
            });
            setTimeout(() => {
                setSuccess('');
                if (onSuccess) onSuccess();
                onClose();
            }, 1500);

        } catch (err) {
            setError(err.message || 'Something went wrong while pushing data to MongoDB.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>
                <h2>New Task Details</h2>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Project</label>
                        <select name="project" value={formData.project} onChange={handleChange} required>
                            <option value="">-- Select Project --</option>
                            {allProjects.map(proj => (
                                <option key={proj.id || proj._id} value={proj.projectName}>{proj.projectName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Enter task title" />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} required placeholder="Enter task description" rows="4" />
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
                            <select name="assignee" value={formData.assignee} onChange={handleChange} required>
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
                            <textarea name="prompt" value={formData.prompt} onChange={handleChange} placeholder="Describe what you want AI Agent to implement..." rows="3" />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Reminder Date & Time</label>
                        <input type="datetime-local" name="reminderDate" value={formData.reminderDate} onChange={handleChange} />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Creating...' : 'Submit Task'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;
