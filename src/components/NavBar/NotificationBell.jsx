import React, { useState, useEffect, useRef } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const NotificationBell = () => {
    const userFullName = localStorage.getItem('userFullName') || 'System';
    const userAccess = localStorage.getItem('userAccess') || 'Viewer';
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Only Admin gets notifications
    if (userAccess !== 'Admin') return null;

    const fetchNotifications = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/notifications/user/Admin`);
            if (response.ok) {
                const data = await response.json();
                
                // Compare new vs old to trigger browser notifications
                setNotifications(prev => {
                    const prevIds = new Set(prev.map(n => n.id));
                    data.forEach(n => {
                        if (!prevIds.has(n.id) && !n.read) {
                            showBrowserNotification(n.message);
                        }
                    });
                    return data;
                });
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const showBrowserNotification = (message) => {
        if (!("Notification" in window)) return;
        
        if (Notification.permission === "granted") {
            new Notification("Task Reminder", { body: message, icon: '/favicon.ico' });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification("Task Reminder", { body: message, icon: '/favicon.ico' });
                }
            });
        }
    };

    useEffect(() => {
        // Ask permission on mount
        if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }

        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 60000); // Check every minute
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, { method: 'PATCH' });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Failed to mark read', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div style={{ position: 'absolute', right: '30px', display: 'flex', alignItems: 'center' }} ref={dropdownRef}>
            <div 
                style={{ position: 'relative', cursor: 'pointer', fontSize: '1.2rem', color: '#fff' }}
                onClick={() => setShowDropdown(!showDropdown)}
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '-5px', right: '-10px',
                        backgroundColor: '#F44336', color: '#fff', fontSize: '0.7rem',
                        padding: '2px 6px', borderRadius: '50%', fontWeight: 'bold'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </div>

            {showDropdown && (
                <div style={{
                    position: 'absolute', top: '30px', right: '0', width: '300px',
                    backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 3000, overflow: 'hidden'
                }}>
                    <h4 style={{ margin: 0, padding: '10px 15px', borderBottom: '1px solid #333', color: '#d4af37' }}>Notifications</h4>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '15px', color: '#888', textAlign: 'center', fontSize: '0.9rem' }}>No notifications</div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} style={{
                                    padding: '12px 15px', borderBottom: '1px solid #333',
                                    backgroundColor: n.read ? 'transparent' : 'rgba(212, 175, 55, 0.1)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                                    gap: '10px'
                                }}>
                                    <div style={{ flex: 1, fontSize: '0.9rem', color: '#fff' }}>
                                        {n.message}
                                        <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>
                                            {new Date(n.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                    {!n.read && (
                                        <button 
                                            onClick={() => markAsRead(n.id)}
                                            style={{
                                                background: 'none', border: 'none', color: '#d4af37',
                                                cursor: 'pointer', fontSize: '0.8rem', padding: '0 5px'
                                            }}
                                        >
                                            Mark Read
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
