import React, { useState, useEffect } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DeleteTaskModal = ({ isOpen, onClose, onSuccess, allTasks }) => {
    const userFullName = localStorage.getItem('userFullName') || 'System';
    const [deleteSelectedTaskId, setDeleteSelectedTaskId] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setDeleteSelectedTaskId('');
            setDeleteError('');
            setDeleteSuccess('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleDeleteSubmit = async (e) => {
        e.preventDefault();
        if (!deleteSelectedTaskId) { setDeleteError('Please select a task to delete.'); return; }
        if (!window.confirm('Are you sure you want to delete this task?')) return;

        setDeleteLoading(true);
        setDeleteError('');
        setDeleteSuccess('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/tasks/${deleteSelectedTaskId}?updatedBy=${encodeURIComponent(userFullName)}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete task');

            setDeleteSuccess('Task deleted successfully!');
            setTimeout(() => {
                setDeleteSuccess('');
                setDeleteSelectedTaskId('');
                if (onSuccess) onSuccess();
                onClose();
            }, 1500);
        } catch (err) {
            setDeleteError(err.message || 'Something went wrong.');
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>
                <h2>Delete Task</h2>

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
                            <option value="">-- Select a Task --</option>
                            {allTasks.map(task => (
                                <option key={task.id || task._id} value={task.id || task._id}>
                                    {task.title} ({task.project})
                                </option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="submit-btn" disabled={deleteLoading} style={{ backgroundColor: '#e74c3c' }}>
                        {deleteLoading ? 'Deleting...' : 'Delete Task'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DeleteTaskModal;
