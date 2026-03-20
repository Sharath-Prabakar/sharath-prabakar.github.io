import React, { useState, useEffect } from 'react';

// Define our Themes with CSS Variables
const themes = {
    matrix: {
        '--bg-color': '#000000',
        '--text-main': '#00FF41',
        '--text-glow': 'rgba(0, 255, 65, 0.7)',
        '--border-color': '#00FF41',
        '--shadow-color': '#00FF41',
        '--font-family': '"Courier New", Courier, monospace',
    },
    cyberpunk: {
        '--bg-color': '#0d0221', // Deep purple/black
        '--text-main': '#ff0055', // Neon Pink
        '--text-glow': 'rgba(255, 0, 85, 0.7)',
        '--border-color': '#00dfff', // Neon Cyan
        '--shadow-color': '#00dfff',
        '--font-family': '"Orbitron", sans-serif', // Needs to be loaded
    },
    solarized: {
        '--bg-color': '#fdf6e3', // Light base
        '--text-main': '#002b36', // Dark text
        '--text-glow': 'rgba(0, 43, 54, 0.1)', // Very faint glow
        '--border-color': '#cb4b16', // Orange
        '--shadow-color': '#cb4b16',
        '--font-family': 'Arial, sans-serif',
    },
};

const MultiThemeClock = () => {
    const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
    const [currentThemeKey, setCurrentThemeKey] = useState('matrix');

    useEffect(() => {
        // 1. Clock Logic (1 hour = 1440s, 1 min = 24s)
        const timer = setInterval(() => {
            const now = new Date();
            const totalMinutes = now.getHours() * 60 + now.getMinutes();

            setTime({
                h: Math.floor(totalMinutes / 24),
                m: Math.floor(totalMinutes % 24),
                s: now.getSeconds()
            });
        }, 1000);

        // 2. Load the Cyberpunk font (simple way for this example)
        if (currentThemeKey === 'cyberpunk') {
            const link = document.createElement('link');
            link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&display=swap';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        return () => clearInterval(timer);
    }, [currentThemeKey]); // Re-run effect if theme changes to load font

    const format = (n) => n.toString().padStart(2, '0');

    // Helper function to apply the current theme's variables
    const getThemeStyles = () => themes[currentThemeKey];

    // --- UI Inline Styles ---

    const appContainerStyle = {
        ...getThemeStyles(),
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-main)',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '60px', // Offset for the fixed Navbar
        boxSizing: 'border-box',
        fontFamily: 'var(--font-family)',
        transition: 'background-color 0.3s ease, color 0.3s ease',
    };

    const timeDisplayStyle = {
        fontSize: 'clamp(3rem, 18vw, 6rem)', // Massive on desktop, fits on mobile
        border: '3px solid var(--border-color)',
        padding: '10px 20px', // Reduced padding for mobile
        width: 'fit-content',
        textAlign: 'center',
        boxShadow: '0 0 15px var(--shadow-color), inset 0 0 10px var(--shadow-color)',
        textShadow: '0 0 10px var(--text-glow)',
        borderRadius: '12px',
        marginBottom: '20px',
    };

    // Inside SixtyHourClock component
    const ThemeSwitcher = () => (
        <div style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)', // Centered for mobile
            display: 'flex',
            flexWrap: 'wrap', // Allow wrapping
            justifyContent: 'center',
            gap: '10px',
            width: '90%'
        }}>
            {Object.keys(themes).map((key) => (
                <button
                    key={key}
                    onClick={() => setCurrentThemeKey(key)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: currentThemeKey === key ? 'var(--text-main)' : 'transparent',
                        color: currentThemeKey === key ? 'var(--bg-color)' : 'var(--text-main)',
                        border: '1px solid var(--text-main)',
                        borderRadius: '2px', // Sharper corners for a more technical look
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        letterSpacing: '1px',
                        transition: 'all 0.3s ease',
                        textTransform: 'uppercase'
                    }}
                >
                    {key}
                </button>
            ))}
        </div>
    );

    return (
        <div style={appContainerStyle}>
            <ThemeSwitcher />

            <div style={{ letterSpacing: '3px', marginBottom: '10px', opacity: 0.8 }}>
                NAAZHIGAI
            </div>

            <div style={timeDisplayStyle}>
                {format(time.h)}:{format(time.m)}:{format(time.s)}
            </div>

            <div style={{ opacity: 0.7, fontSize: '1.2rem', marginTop: '10px' }}>
                DAY CYCLE PROGRESS: {((((time.h * 24) +time.m) / 1440) * 100).toFixed(1)}%
            </div>
        </div>
    );
};

export default MultiThemeClock;