import React, { useState, useEffect } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ServerStatusIndicator = () => {
    const [status, setStatus] = useState('loading'); // 'loading', 'online', 'offline'

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/health`);
                if (response.ok) {
                    setStatus('online');
                } else {
                    setStatus('offline');
                }
            } catch (error) {
                setStatus('offline');
            }
        };

        checkStatus();
        const intervalId = setInterval(checkStatus, 30000); // Poll every 30 seconds
        return () => clearInterval(intervalId);
    }, []);

    const getIndicatorStyle = () => {
        const baseStyle = {
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            display: 'inline-block',
            marginRight: '8px',
            transition: 'all 0.3s ease'
        };

        switch (status) {
            case 'online':
                return { ...baseStyle, backgroundColor: '#4CAF50', boxShadow: '0 0 8px #4CAF50' };
            case 'offline':
                return { ...baseStyle, backgroundColor: '#F44336', boxShadow: '0 0 8px #F44336' };
            case 'loading':
            default:
                return {
                    ...baseStyle,
                    backgroundColor: 'transparent',
                    border: '2px solid #d4af37',
                    borderTopColor: 'transparent',
                    animation: 'spin 1s linear infinite'
                };
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', position: 'absolute', left: '20px', color: '#fff', fontSize: '0.8rem', fontFamily: '"Inter", sans-serif' }}>
            <style>
                {`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                `}
            </style>
            <div style={getIndicatorStyle()}></div>
            <span style={{ color: '#aaa' }}>{status === 'loading' ? 'Waking Server...' : status === 'online' ? 'Server Online' : 'Server Offline'}</span>
        </div>
    );
};

export default ServerStatusIndicator;
