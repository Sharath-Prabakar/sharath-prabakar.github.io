import React, { useState, useEffect } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const formatLastLogin = (lastLoginStr) => {
    if (!lastLoginStr) return null;
    const date = new Date(lastLoginStr);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleString();
};

const UserAccessModal = ({ isOpen, onClose }) => {
    const [allUsers, setAllUsers] = useState([]);
    const [userUpdates, setUserUpdates] = useState([]);
    const [userAccessLoading, setUserAccessLoading] = useState(false);
    const [userAccessError, setUserAccessError] = useState('');
    const [userAccessSuccess, setUserAccessSuccess] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users`);
            if (res.ok) {
                const users = await res.json();
                setAllUsers(users);
                setUserUpdates([]);
            }
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        } else {
            setAllUsers([]);
            setUserUpdates([]);
            setUserAccessError('');
            setUserAccessSuccess('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleUserAccessChange = (userId, newAccess) => {
        setAllUsers(prev => prev.map(u => (u.id === userId || u._id === userId) ? { ...u, access: newAccess } : u));
        
        setUserUpdates(prev => {
            const existingIndex = prev.findIndex(u => u.id === userId);
            if (existingIndex >= 0) {
                const newUpdates = [...prev];
                newUpdates[existingIndex] = { id: userId, access: newAccess };
                return newUpdates;
            } else {
                return [...prev, { id: userId, access: newAccess }];
            }
        });
    };

    const handleUserAccessSubmit = async (e) => {
        e.preventDefault();
        if (userUpdates.length === 0) {
            setUserAccessSuccess('No changes to save.');
            return;
        }

        setUserAccessLoading(true);
        setUserAccessError('');
        setUserAccessSuccess('');

        try {
            const res = await fetch(`${API_BASE_URL}/api/users/access`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userUpdates)
            });

            if (!res.ok) throw new Error('Failed to update user access');

            setUserAccessSuccess('User access updated successfully!');
            setUserUpdates([]);
            setTimeout(() => {
                setUserAccessSuccess('');
                onClose();
            }, 1500);

        } catch (err) {
            setUserAccessError(err.message || 'Failed to update user access');
        } finally {
            setUserAccessLoading(false);
        }
    };

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>
                <h2>👥 User Access</h2>
                
                {userAccessError && <div className="error-message">{userAccessError}</div>}
                {userAccessSuccess && <div className="success-message">{userAccessSuccess}</div>}
                
                <form onSubmit={handleUserAccessSubmit}>
                    {allUsers.length === 0 ? (
                        <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>Loading users...</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                            {allUsers.map(user => {
                                const userId = user.id || user._id;
                                return (
                                    <div key={userId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '10px 15px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <strong style={{ color: '#e0e0e0', fontSize: '1rem' }}>{user.firstName} {user.lastName}</strong>
                                            <span style={{ color: '#888', fontSize: '0.85rem' }}>{user.email}</span>
                                            {user.lastLogin && formatLastLogin(user.lastLogin) && (
                                                <span style={{ color: '#81ecec', fontSize: '0.75rem', marginTop: '4px' }}>
                                                    📅 Last Login: {formatLastLogin(user.lastLogin)}
                                                </span>
                                            )}
                                        </div>
                                        <select
                                            value={user.access || 'Request'}
                                            onChange={(e) => handleUserAccessChange(userId, e.target.value)}
                                            style={{ width: 'auto', padding: '8px 12px' }}
                                        >
                                            <option value="Admin">Admin</option>
                                            <option value="Request">Request (Guest)</option>
                                        </select>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={userAccessLoading || userUpdates.length === 0}
                    >
                        {userAccessLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserAccessModal;
