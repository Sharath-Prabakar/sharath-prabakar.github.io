import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

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
import Recipes from './pages/Recipes/Recipes';
import Pallanguzhi from './pages/Pallanguzhi/Pallanguzhi';
import CardGenerator from './pages/CardGenerator/CardGenerator';
import TvTracker from './pages/TvTracker/TvTracker';
import EscapeTheDesert from './pages/EscapeTheDesert/EscapeTheDesert';

const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

const App = () => {
    return (
        <Router>
            <ScrollToTop />
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
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/pallanguzhi" element={<Pallanguzhi />} />
                <Route path="/card-generator" element={<EscapeTheDesert />} />
                <Route path="/escape-the-desert" element={<EscapeTheDesert />} />
                <Route path="/tv-tracker" element={<TvTracker />} />
                <Route path="/my-entertainment" element={<TvTracker />} />
            </Routes>
        </Router>
    );
};

export default App;
