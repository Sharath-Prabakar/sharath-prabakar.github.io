import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SixtyHourClock from './SixtyHourClock'; // We'll move your clock code here
import Home from './Home';
import Books from './Books';
import Scrum from './Scrum'; // Import your new Scrum component
import Admin from './Admin';
import { NavLink } from 'react-router-dom';

const App = () => {
    return (
        <Router>
            <nav style={navStyle}>
                <NavItem to="/" label="Developer Portfolio"/>
                <NavItem to="/books" label="Books"/>
                <NavItem to="/scrum" label="Scrum Board" />
                <NavItem to="/clock" label="The 24-Minute Hour" borderColor="#00FF41"/>
                <NavItem to="/admin" label="Admin"/>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/books" element={<Books />} />
                <Route path="/scrum" element={<Scrum />} />
                <Route path="/clock" element={<SixtyHourClock />} />
                <Route path="/admin" element={<Admin />} />
            </Routes>
        </Router>
    );
};

const NavItem = ({ to, label }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <NavLink to={to} style={{ textDecoration: 'none' }}>
            {({ isActive }) => {
                // We combine the hover state OR the active state to trigger the highlight
                const showHighlight = isHovered || isActive;

                const linkStyle = {
                    color: showHighlight ? '#fff' : '#888',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    fontFamily: '"Inter", sans-serif',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    padding: '5px 0',
                    textShadow: showHighlight ? '0 0 10px rgba(255,255,255,0.3)' : 'none',
                    display: 'inline-block'
                };

                const underlineStyle = {
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    width: showHighlight ? '100%' : '0%',
                    height: '2px',
                    backgroundColor: '#d4af37', // Your signature gold
                    transition: 'all 0.3s ease',
                    transform: 'translateX(-50%)',
                };

                return (
                    <div
                        style={linkStyle}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        {label}
                        <div style={underlineStyle} />
                    </div>
                );
            }}
        </NavLink>
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