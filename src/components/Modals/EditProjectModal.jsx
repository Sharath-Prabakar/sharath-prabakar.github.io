import React, { useState, useEffect } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PROJECT_COLORS = [
    // Row 1 (Teals / Blues / Purples)
    "#007788", "#1ABC9C", "#06B6D4", "#0047AB", "#1E3A8A", "#5B21B6", "#9966AA",
    // Row 2 (Magentas / Reds / Pinks / Warm Colors)
    "#A1008F", "#E11D48", "#9B111E", "#DC2626", "#D15F5F", "#F97316", "#DDAA33",
    // Row 3 (Golds / Browns / Greens / Neutrals)
    "#DAA520", "#8B4513", "#10B981", "#007F5F", "#014421", "#2F4F4F", "#666666"
];

const EditProjectModal = ({ isOpen, onClose, onSuccess, allProjects }) => {
    const userFullName = localStorage.getItem('userFullName') || 'System';
    const [editProjectSelectedId, setEditProjectSelectedId] = useState('');
    const [editProjectFormData, setEditProjectFormData] = useState({
        projectName: '',
        projectColorCode: '#d4af37',
        status: 'BRAINSTORM',
        description: ''
    });
    const [editProjectLoading, setEditProjectLoading] = useState(false);
    const [editProjectError, setEditProjectError] = useState('');
    const [editProjectSuccess, setEditProjectSuccess] = useState('');

    const usedColors = (allProjects || [])
        .filter(p => (p.id || p._id) !== editProjectSelectedId)
        .map(p => (p.projectColorCode || '').toLowerCase());

    useEffect(() => {
        if (!isOpen) {
            setEditProjectSelectedId('');
            setEditProjectFormData({ projectName: '', projectColorCode: '#d4af37', status: 'BRAINSTORM', description: '' });
            setEditProjectError('');
            setEditProjectSuccess('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleEditProjectChange = (e) => {
        const { name, value } = e.target;
        setEditProjectFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditProjectSelect = (projectId) => {
        const project = allProjects.find(p => p.id === projectId || p._id === projectId);
        setEditProjectSelectedId(projectId);
        if (project) {
            setEditProjectFormData({
                projectName: project.projectName || '',
                projectColorCode: project.projectColorCode || '#d4af37',
                status: project.status || 'BRAINSTORM',
                description: project.description || ''
            });
        }
    };

    const handleEditProjectSubmit = async (e) => {
        e.preventDefault();
        if (!editProjectSelectedId) return;

        setEditProjectLoading(true);
        setEditProjectError('');
        setEditProjectSuccess('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/projects/${editProjectSelectedId}?updatedBy=${encodeURIComponent(userFullName)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editProjectFormData)
            });

            if (!response.ok) throw new Error('Failed to update project');

            setEditProjectSuccess('Project updated successfully!');
            setTimeout(() => {
                setEditProjectSuccess('');
                if (onSuccess) onSuccess();
                onClose();
            }, 1500);
        } catch (err) {
            setEditProjectError(err.message);
        } finally {
            setEditProjectLoading(false);
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>
                <h2>Edit Project Details</h2>

                {editProjectError && <div className="error-message">{editProjectError}</div>}
                {editProjectSuccess && <div className="success-message">{editProjectSuccess}</div>}

                <div className="form-group">
                    <label>Select Project to Edit</label>
                    <select
                        value={editProjectSelectedId}
                        onChange={(e) => handleEditProjectSelect(e.target.value)}
                        required
                    >
                        <option value="">-- Select a Project --</option>
                        {allProjects.map(proj => (
                            <option key={proj.id || proj._id} value={proj.id || proj._id}>
                                {proj.projectName}
                            </option>
                        ))}
                    </select>
                </div>

                {editProjectSelectedId && (
                    <form onSubmit={handleEditProjectSubmit}>
                        <div className="form-group">
                            <label>Project Title</label>
                            <input type="text" name="projectName" value={editProjectFormData.projectName} onChange={handleEditProjectChange} required />
                        </div>
                        <div className="form-group">
                            <label>Project Status</label>
                            <select name="status" value={editProjectFormData.status} onChange={handleEditProjectChange} required>
                                <option value="BRAINSTORM">Brainstorm</option>
                                <option value="IN_PROGRESS">In Progress</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Project Color Code</label>
                            <div className="color-grid">
                                {PROJECT_COLORS.map(color => {
                                    const isUsed = usedColors.includes(color.toLowerCase());
                                    return (
                                        <div
                                            key={color}
                                            className={`color-square ${editProjectFormData.projectColorCode === color ? 'selected' : ''} ${isUsed ? 'disabled' : ''}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => {
                                                if (!isUsed) {
                                                    setEditProjectFormData(prev => ({ ...prev, projectColorCode: color }));
                                                }
                                            }}
                                            title={isUsed ? `${color} (Already used)` : color}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea name="description" value={editProjectFormData.description} onChange={handleEditProjectChange} rows="3" />
                        </div>

                        <button type="submit" className="submit-btn" disabled={editProjectLoading}>
                            {editProjectLoading ? 'Updating...' : 'Update Project'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditProjectModal;
