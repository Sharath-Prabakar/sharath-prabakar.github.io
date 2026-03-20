import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SixtyHourClock from './SixtyHourClock'; // We'll move your clock code here
import Home from './Home';
import Books from './Books';

const App = () => {
    return (
        <Router>
            <nav style={navStyle}>
                <NavItem to="/" label="Developer Portfolio"/>
                <NavItem to="/books" label="Books"/>
                <NavItem to="/clock" label="Sixty Hour Clock" borderColor="#00FF41"/>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/books" element={<Books />} />
                <Route path="/clock" element={<SixtyHourClock />} />
            </Routes>
        </Router>
    );
};

const NavItem = ({ to, label,borderColor }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const linkStyle = {
        color: isHovered ? borderColor?borderColor :'#fff' : '#888', // Fades from grey to white
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '0.9rem',
        fontFamily: '"Inter", sans-serif',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        transition: 'all 0.3s ease',
        position: 'relative',
        padding: '5px 0',
        textShadow: isHovered ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
    };

    // The sliding underline effect
    const underlineStyle = {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: '50%',
        width: isHovered ? '100%' : '0%',
        height: '1px',
        backgroundColor: borderColor?borderColor:'#d4af37', // Gold accent to match your portfolio theme
        transition: 'all 0.3s ease',
        transform: 'translateX(-50%)',
    };

    return (
        <Link
            to={to}
            style={linkStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {label}
            <div style={underlineStyle} />
        </Link>
    );
};

const navStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap', // Allow links to wrap if screen is very narrow
    gap: '15px', // Tighter gap for mobile
    padding: '15px 0',
    zIndex: 2000,
    backgroundColor: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(10px)',
};

export default App;