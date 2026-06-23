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

const CreateProjectModal = ({ isOpen, onClose, onSuccess, allProjects = [] }) => {
    const userFullName = localStorage.getItem('userFullName') || 'System';
    const [projectFormData, setProjectFormData] = useState({
        projectName: '',
        projectColorCode: '#007788',
        status: 'BRAINSTORM',
        description: ''
    });

    const usedColors = (allProjects || []).map(p => (p.projectColorCode || '').toLowerCase());

    useEffect(() => {
        if (isOpen) {
            const firstUnused = PROJECT_COLORS.find(c => !usedColors.includes(c.toLowerCase())) || PROJECT_COLORS[0];
            setProjectFormData({
                projectName: '',
                projectColorCode: firstUnused,
                status: 'BRAINSTORM',
                description: ''
            });
        }
    }, [isOpen, allProjects]);
    const [projectLoading, setProjectLoading] = useState(false);
    const [projectError, setProjectError] = useState('');
    const [projectSuccess, setProjectSuccess] = useState('');

    if (!isOpen) return null;

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
            const response = await fetch(`${API_BASE_URL}/api/projects?createdBy=${encodeURIComponent(userFullName)}`, {
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
            setProjectFormData({ projectName: '', projectColorCode: '#d4af37', status: 'BRAINSTORM', description: '' });
            setTimeout(() => {
                setProjectSuccess('');
                if (onSuccess) onSuccess();
                onClose();
            }, 1500);

        } catch (err) {
            setProjectError(err.message || 'Something went wrong while pushing data to MongoDB.');
        } finally {
            setProjectLoading(false);
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>
                <h2>New Project Details</h2>

                {projectError && <div className="error-message">{projectError}</div>}
                {projectSuccess && <div className="success-message">{projectSuccess}</div>}

                <form onSubmit={handleProjectSubmit}>
                    <div className="form-group">
                        <label>Project Title</label>
                        <input type="text" name="projectName" value={projectFormData.projectName} onChange={handleProjectChange} required placeholder="Enter project title" />
                    </div>
                    <div className="form-group">
                        <label>Project Status</label>
                        <select name="status" value={projectFormData.status} onChange={handleProjectChange} required>
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
                                        className={`color-square ${projectFormData.projectColorCode === color ? 'selected' : ''} ${isUsed ? 'disabled' : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => {
                                            if (!isUsed) {
                                                setProjectFormData(prev => ({ ...prev, projectColorCode: color }));
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
                        <textarea name="description" value={projectFormData.description} onChange={handleProjectChange} placeholder="Optional project description..." rows="3" />
                    </div>

                    <button type="submit" className="submit-btn" disabled={projectLoading}>
                        {projectLoading ? 'Creating...' : 'Submit Project'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectModal;
