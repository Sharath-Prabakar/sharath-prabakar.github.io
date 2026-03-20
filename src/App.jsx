import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SixtyHourClock from './SixtyHourClock'; // We'll move your clock code here
import Home from './Home';
import Books from './Books';

const App = () => {
    return (
        <Router>
            <nav style={navStyle}>
                <Link style={linkStyle} to="/">Developer Portfolio</Link>
                <Link style={linkStyle} to="/books">Books</Link>
                <Link style={linkStyle} to="/clock">Sixty Hour Clock</Link>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/books" element={<Books />} />
                <Route path="/clock" element={<SixtyHourClock />} />
            </Routes>
        </Router>
    );
};

const navStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    padding: '20px 0',
    zIndex: 2000,
    backgroundColor: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(8px)',
};

const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontFamily: 'sans-serif'
};

export default App;