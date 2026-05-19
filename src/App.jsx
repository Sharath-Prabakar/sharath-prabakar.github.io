import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import NavBar from './components/NavBar/NavBar';
import Home from './pages/Home/Home';
import Books from './pages/Books/Books';
import Scrum from './pages/Scrum/Scrum';
import Admin from './pages/Admin/Admin';
import SixtyHourClock from './pages/Clock/SixtyHourClock';
import Playground from './pages/Playground/Playground';
import SnakeGame from './pages/SnakeGame/SnakeGame';
import MiniProjects from './pages/MiniProjects/MiniProjects';
import LeaderGraph from './pages/LeaderGraph/LeaderGraph';
import BookClub from './pages/BookClub/BookClub';

const App = () => {
    return (
        <Router>
            <NavBar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/books" element={<Books />} />
                <Route path="/scrum" element={<Scrum />} />
                <Route path="/clock" element={<SixtyHourClock />} />
                <Route path="/playground" element={<Playground />} />
                <Route path="/snake" element={<SnakeGame />} />
                <Route path="/mini-projects" element={<MiniProjects />} />
                <Route path="/leaderGraph" element={<LeaderGraph />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/bookclub" element={<BookClub />} />
            </Routes>
        </Router>
    );
};

export default App;
