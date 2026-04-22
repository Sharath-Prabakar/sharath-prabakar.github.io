import React from 'react';
import { NavLink } from 'react-router-dom';

const NavBar = () => {
    return (
        <nav style={navStyle}>
            <NavItem to="/" label="Developer Portfolio" />
            <NavItem to="/books" label="Books" />
            <NavItem to="/scrum" label="Agentic AI Scrum Board" />
            <NavItem to="/playground" label="AI Playground" />
        </nav>
    );
};

const NavItem = ({ to, label }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <NavLink to={to} style={{ textDecoration: 'none' }}>
            {({ isActive }) => {
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
                    backgroundColor: '#d4af37',
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
    flexWrap: 'wrap',
    gap: '15px',
    padding: '15px 0',
    zIndex: 2000,
    backgroundColor: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(10px)',
};

export default NavBar;
