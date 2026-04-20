import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import NavBar from './components/NavBar/NavBar';
import Home from './pages/Home/Home';
import Books from './pages/Books/Books';
import Scrum from './pages/Scrum/Scrum';
import Admin from './pages/Admin/Admin';
import SixtyHourClock from './pages/Clock/SixtyHourClock';

const App = () => {
    return (
        <Router>
            <NavBar />
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

export default App;