import React, { useState, useEffect } from 'react';
import './TvTracker.css';

const SAMPLE_DATA = [
    {
        id: '1',
        title: 'Breaking Bad',
        type: 'TV Series',
        season: 'Season 5',
        status: 'Completed',
        rating: 9.8,
        genre: 'Crime, Drama, Thriller',
        year: 2008,
        lastWatchedAt: '2025-10-15T12:00:00Z',
        notes: 'Masterpiece storytelling and character development.',
        seasons: [
            {
                number: 1,
                episodes: [
                    { number: 1, name: 'Pilot', is_watched: true, watched_at: '2025-10-15T12:00:00Z' },
                    { number: 2, name: 'Cat\'s in the Bag...', is_watched: true },
                    { number: 3, name: '...And the Bag\'s in the River', is_watched: true }
                ]
            }
        ]
    },
    {
        id: '2',
        title: 'Stranger Things',
        type: 'TV Series',
        season: 'Season 4',
        status: 'Watching',
        rating: 8.7,
        genre: 'Sci-Fi, Horror, Fantasy',
        year: 2016,
        lastWatchedAt: '2026-07-20T18:30:00Z',
        notes: 'Great 80s nostalgia and awesome soundtrack.',
        seasons: [
            {
                number: 1,
                episodes: [
                    { number: 1, name: 'Chapter One: The Vanishing of Will Byers', is_watched: true, watched_at: '2026-07-20T18:30:00Z' },
                    { number: 2, name: 'Chapter Two: The Weirdo on Maple Street', is_watched: false }
                ]
            }
        ]
    },
    {
        id: '3',
        title: 'Severance',
        type: 'TV Series',
        season: 'Season 2',
        status: 'Plan to Watch',
        rating: 8.7,
        genre: 'Sci-Fi, Mystery, Thriller',
        year: 2022,
        lastWatchedAt: '2024-01-01T00:00:00Z',
        notes: 'Mind-bending dystopian office thriller.'
    },
    {
        id: '4',
        title: 'Arcane',
        type: 'Anime',
        season: 'Season 2',
        status: 'Completed',
        rating: 9.0,
        genre: 'Animation, Action, Sci-Fi',
        year: 2021,
        lastWatchedAt: '2026-05-10T15:00:00Z',
        notes: 'Breathtaking visual animation style & emotional plot.'
    },
    {
        id: '5',
        title: 'Dune: Part Two',
        type: 'Movie',
        season: 'N/A',
        status: 'Completed',
        rating: 8.6,
        genre: 'Sci-Fi, Adventure',
        year: 2024,
        lastWatchedAt: '2026-04-01T10:00:00Z',
        notes: 'Epic cinematic scale and sound design.'
    },
    {
        id: '6',
        title: 'Interstellar',
        type: 'Movie',
        season: 'N/A',
        status: 'Plan to Watch',
        rating: 8.7,
        genre: 'Sci-Fi, Drama',
        year: 2014,
        lastWatchedAt: '2020-01-01T00:00:00Z',
        notes: 'Hans Zimmer score is legendary.'
    }
];

const API_BASE_URL = 'http://localhost:8080/api/media';

const TvTracker = () => {
    const [items, setItems] = useState(() => {
        const saved = localStorage.getItem('tv_tracker_data');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Error parsing saved JSON:", e);
            }
        }
        return SAMPLE_DATA;
    });

    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    
    // Default: TV Series with Watching status sorted by Recently Watched Time
    const [typeFilter, setTypeFilter] = useState('TV Series');
    const [statusFilter, setStatusFilter] = useState('Watching');
    const [sortBy, setSortBy] = useState('RECENTLY_WATCHED_DESC');
    
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

    // Modals state
    const [showImportModal, setShowImportModal] = useState(false);
    const [jsonInputText, setJsonInputText] = useState('');
    const [importError, setImportError] = useState('');
    const [importSuccess, setImportSuccess] = useState('');
    const [importingMongoDB, setImportingMongoDB] = useState(false);

    // Add Show / Movie Modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [addType, setAddType] = useState('TV Series');
    const [fetchingApi, setFetchingApi] = useState(false);
    const [newForm, setNewForm] = useState({
        title: '',
        genre: 'Drama',
        status: 'Plan to Watch',
        rating: '8.0',
        year: new Date().getFullYear(),
        notes: '',
        season: 'Season 1'
    });

    // Series/Movie Detail Modal state (for episode tracking)
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        fetchMediaFromBackend();
    }, []);

    useEffect(() => {
        localStorage.setItem('tv_tracker_data', JSON.stringify(items));
    }, [items]);

    const fetchMediaFromBackend = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/all`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.items && data.items.length > 0) {
                    setItems(data.items);
                }
            }
        } catch (err) {
            console.warn("Backend offline or unreachable, using localStorage/sample data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleTypeFilterChange = (newType) => {
        setTypeFilter(newType);
        if (newType === 'TV Series' || newType === 'Anime') {
            setStatusFilter('Watching');
            setSortBy('RECENTLY_WATCHED_DESC');
        } else if (newType === 'Movie') {
            setStatusFilter('Plan to Watch');
            setSortBy('YEAR_DESC');
        } else if (newType === 'ALL') {
            setStatusFilter('ALL');
            setSortBy('RECENTLY_WATCHED_DESC');
        }
    };

    const handleUpdateStatus = async (itemId, newStatus, itemType, e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        
        const updatedDate = newStatus === 'Watching' ? new Date().toISOString() : null;
        
        // Optimistic UI update for instant feedback
        setItems(prev => prev.map(item => {
            if (item.id === itemId || item.uuid === itemId) {
                return {
                    ...item,
                    status: newStatus,
                    lastWatchedAt: updatedDate || item.lastWatchedAt
                };
            }
            return item;
        }));

        if (selectedItem && (selectedItem.id === itemId || selectedItem.uuid === itemId)) {
            setSelectedItem(prev => ({ ...prev, status: newStatus }));
        }

        try {
            const res = await fetch(`${API_BASE_URL}/${itemId}/status?status=${encodeURIComponent(newStatus)}&type=${encodeURIComponent(itemType || '')}`, {
                method: 'PATCH'
            });
            if (res.ok) {
                const data = await res.json();
                if (data && data.items) {
                    setItems(data.items);
                }
            }
        } catch (err) {
            console.warn("Backend offline or unreachable, status updated locally.");
        }
    };

    const handleImportFromMongoDB = async () => {
        if (!window.confirm("This will import ~1,600 movies and TV series from D:/2026/ into MongoDB and refresh your watchlist. Proceed?")) return;
        setImportingMongoDB(true);
        try {
            const res = await fetch(`${API_BASE_URL}/import-local`, { method: 'POST' });
            if (res.ok) {
                const stats = await res.json();
                alert(`✅ Successfully imported ${stats.moviesImported} movies and ${stats.seriesImported} TV series into MongoDB!`);
                await fetchMediaFromBackend();
            } else {
                alert("❌ Failed to import from server. Please check if Spring Boot backend is running.");
            }
        } catch (err) {
            alert("❌ Error connecting to backend server at http://localhost:8080/api/media/import-local.");
        } finally {
            setImportingMongoDB(false);
        }
    };

    const handleOpenAddModal = (type) => {
        setAddType(type);
        setNewForm({
            title: '',
            genre: type === 'Movie' ? 'Action / Adventure' : 'Drama',
            status: 'Plan to Watch',
            rating: '8.0',
            year: new Date().getFullYear(),
            notes: '',
            season: type === 'Movie' ? 'N/A' : 'Season 1'
        });
        setShowAddModal(true);
    };

    const handleAutoFillFromFreeApi = async () => {
        if (!newForm.title.trim()) {
            alert("Please enter a title first to search!");
            return;
        }
        setFetchingApi(true);
        try {
            if (addType === 'Anime') {
                const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(newForm.title)}&limit=1`);
                const data = await res.json();
                if (data && data.data && data.data.length > 0) {
                    const anime = data.data[0];
                    setNewForm(prev => ({
                        ...prev,
                        title: anime.title || prev.title,
                        rating: anime.score ? String(anime.score) : prev.rating,
                        year: anime.year || (anime.aired?.from ? new Date(anime.aired.from).getFullYear() : prev.year),
                        genre: anime.genres ? anime.genres.map(g => g.name).join(', ') : prev.genre,
                        notes: anime.synopsis ? anime.synopsis.slice(0, 200) + '...' : prev.notes
                    }));
                } else {
                    alert("No anime found with that title on Jikan API.");
                }
            } else {
                const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(newForm.title)}`);
                const data = await res.json();
                if (data && data.length > 0) {
                    const show = data[0].show;
                    setNewForm(prev => ({
                        ...prev,
                        title: show.name || prev.title,
                        rating: show.rating?.average ? String(show.rating.average) : prev.rating,
                        year: show.premiered ? new Date(show.premiered).getFullYear() : prev.year,
                        genre: show.genres && show.genres.length > 0 ? show.genres.join(', ') : prev.genre,
                        notes: show.summary ? show.summary.replace(/<[^>]*>?/gm, '').slice(0, 200) + '...' : prev.notes
                    }));
                } else {
                    alert("No TV series found with that title on TVmaze API.");
                }
            }
        } catch (err) {
            alert("Error fetching from free public API. Please fill details manually.");
        } finally {
            setFetchingApi(false);
        }
    };

    const handleSubmitNewMedia = async (e) => {
        e.preventDefault();
        if (!newForm.title.trim()) return;
        const payload = {
            ...newForm,
            rating: Number(newForm.rating) || 0,
            year: Number(newForm.year) || new Date().getFullYear(),
            id: `local_${Date.now()}`
        };
        try {
            const endpoint = addType === 'Movie' ? `${API_BASE_URL}/movies` : `${API_BASE_URL}/series`;
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const saved = await res.json();
                setItems(prev => [saved, ...prev]);
                setShowAddModal(false);
                return;
            }
        } catch (err) {
            console.warn("Backend offline, saving locally...");
        }
        setItems(prev => [payload, ...prev]);
        setShowAddModal(false);
    };

    const handleToggleEpisode = async (seriesId, seasonNo, episodeNo) => {
        try {
            const res = await fetch(`${API_BASE_URL}/series/${seriesId}/episodes/${seasonNo}/${episodeNo}`, {
                method: 'PATCH'
            });
            if (res.ok) {
                const updatedSeries = await res.json();
                setSelectedItem(updatedSeries);
                setItems(prev => prev.map(item => (item.id === seriesId || item.uuid === seriesId) ? {
                    ...item,
                    seasons: updatedSeries.seasons
                } : item));
                return;
            }
        } catch (err) {
            console.warn("Backend offline, toggling episode locally...");
        }
        toggleEpisodeLocally(seriesId, seasonNo, episodeNo);
    };

    const toggleEpisodeLocally = (seriesId, seasonNo, episodeNo) => {
        const updateFn = (s) => {
            if (!s || !s.seasons) return s;
            const newSeasons = s.seasons.map(season => {
                if (season.number !== seasonNo || !season.episodes) return season;
                const newEpisodes = season.episodes.map(ep => {
                    if (ep.number !== episodeNo) return ep;
                    const cur = ep.is_watched || ep.isWatched;
                    return { ...ep, is_watched: !cur, isWatched: !cur };
                });
                return { ...season, episodes: newEpisodes };
            });
            return { ...s, seasons: newSeasons };
        };
        setSelectedItem(prev => updateFn(prev));
        setItems(prev => prev.map(item => (item.id === seriesId || item.uuid === seriesId) ? updateFn(item) : item));
    };

    const handleImportJsonText = (jsonStr) => {
        setImportError('');
        setImportSuccess('');
        try {
            const parsed = JSON.parse(jsonStr);
            const rawArray = Array.isArray(parsed) ? parsed : [parsed];
            
            const formatted = rawArray.map((item, idx) => ({
                id: item.id || `imported_${Date.now()}_${idx}`,
                title: item.title || item.name || 'Untitled',
                type: item.type || (item.season && item.season !== 'N/A' ? 'TV Series' : 'Movie'),
                season: item.season || item.seasons || (item.currentSeason ? `Season ${item.currentSeason}` : 'N/A'),
                status: normalizeStatus(item.status),
                rating: Number(item.rating || item.score || 0),
                genre: Array.isArray(item.genre) ? item.genre.join(', ') : (item.genre || 'General'),
                year: item.year || item.releaseYear || new Date().getFullYear(),
                notes: item.notes || item.review || '',
                seasons: item.seasons || null
            }));

            setItems(formatted);
            setImportSuccess(`Successfully imported ${formatted.length} item(s)!`);
            setTimeout(() => {
                setShowImportModal(false);
                setImportSuccess('');
            }, 1200);
        } catch (err) {
            setImportError('Invalid JSON format. Please check your syntax and try again.');
        }
    };

    const normalizeStatus = (rawStatus) => {
        if (!rawStatus) return 'Plan to Watch';
        const str = String(rawStatus).toLowerCase();
        if (str === 'continuing' || (str.includes('watch') && !str.includes('plan') && !str.includes('later'))) return 'Watching';
        if (str === 'up_to_date' || str.includes('complet') || str.includes('finish') || str.includes('done')) return 'Completed';
        if (str === 'not_started_yet' || str === 'watch_later' || str.includes('plan') || str.includes('want')) return 'Plan to Watch';
        if (str.includes('hold') || str.includes('pause')) return 'On Hold';
        if (str.includes('drop') || str === 'stopped') return 'Dropped';
        return rawStatus;
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            setJsonInputText(content);
            handleImportJsonText(content);
        };
        reader.readAsText(file);
    };

    const handleLoadSample = () => {
        setItems(SAMPLE_DATA);
        setJsonInputText(JSON.stringify(SAMPLE_DATA, null, 2));
    };

    const handleExportJson = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `tv_movies_tracker_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    const handleClearData = () => {
        if (window.confirm("Are you sure you want to clear all TV/Movie tracker data?")) {
            setItems([]);
            localStorage.removeItem('tv_tracker_data');
        }
    };

    // Filter and Sort items
    const filteredItems = items.filter(item => {
        const titleStr = item.title ? item.title.toLowerCase() : '';
        const genreStr = item.genre ? item.genre.toLowerCase() : '';
        const notesStr = item.notes ? item.notes.toLowerCase() : '';
        const searchLow = search.toLowerCase();
        const matchesSearch = titleStr.includes(searchLow) || genreStr.includes(searchLow) || notesStr.includes(searchLow);
        const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
        const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    }).sort((a, b) => {
        if (sortBy === 'RECENTLY_WATCHED_DESC') {
            const dateA = String(a.lastWatchedAt || a.watched_at || a.created_at || '1970-01-01');
            const dateB = String(b.lastWatchedAt || b.watched_at || b.created_at || '1970-01-01');
            return dateB.localeCompare(dateA);
        }
        if (sortBy === 'YEAR_DESC') return (b.year || 0) - (a.year || 0);
        if (sortBy === 'YEAR_ASC') return (a.year || 0) - (b.year || 0);
        if (sortBy === 'RATING_DESC') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'RATING_ASC') return (a.rating || 0) - (b.rating || 0);
        if (sortBy === 'TITLE_ASC') return (a.title || '').localeCompare(b.title || '');
        if (sortBy === 'TITLE_DESC') return (b.title || '').localeCompare(a.title || '');
        return 0;
    });

    // Compute stats
    const totalCount = items.length;
    const watchingCount = items.filter(i => i.status === 'Watching').length;
    const completedCount = items.filter(i => i.status === 'Completed').length;
    const planCount = items.filter(i => i.status === 'Plan to Watch').length;
    const avgRating = totalCount > 0 ? (items.reduce((acc, curr) => acc + (curr.rating || 0), 0) / totalCount).toFixed(1) : '0.0';

    const getStatusClass = (status) => {
        switch (status) {
            case 'Watching': return 'status-watching';
            case 'Completed': return 'status-completed';
            case 'Plan to Watch': return 'status-plan';
            case 'On Hold': return 'status-hold';
            case 'Dropped': return 'status-dropped';
            default: return 'status-plan';
        }
    };

    return (
        <div className="tv-tracker-container">
            <header className="tv-tracker-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h1 className="tv-tracker-title">🎬 MY ENTERTAINMENT (TV & MOVIE TRACKER)</h1>
                        <p className="tv-tracker-subtitle">
                            Track episodes, manage watchlists, and import your complete MongoDB media collection.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="tv-btn tv-btn-primary" onClick={() => handleOpenAddModal('TV Series')}>
                            + Add TV Show
                        </button>
                        <button className="tv-btn tv-btn-gold" onClick={() => handleOpenAddModal('Movie')}>
                            + Add Movie
                        </button>
                    </div>
                </div>
            </header>

            <div className="tv-tracker-content">
                {/* Stats Grid */}
                <div className="tv-stats-grid">
                    <div className="tv-stat-card">
                        <div className="tv-stat-val">{totalCount}</div>
                        <div className="tv-stat-label">Total Titles</div>
                    </div>
                    <div className="tv-stat-card">
                        <div className="tv-stat-val" style={{ color: '#4da3ff' }}>{watchingCount}</div>
                        <div className="tv-stat-label">Watching</div>
                    </div>
                    <div className="tv-stat-card">
                        <div className="tv-stat-val" style={{ color: '#52c41a' }}>{completedCount}</div>
                        <div className="tv-stat-label">Completed</div>
                    </div>
                    <div className="tv-stat-card">
                        <div className="tv-stat-val" style={{ color: '#faad14' }}>{planCount}</div>
                        <div className="tv-stat-label">Plan to Watch</div>
                    </div>
                    <div className="tv-stat-card">
                        <div className="tv-stat-val" style={{ color: '#d4af37' }}>⭐ {avgRating}</div>
                        <div className="tv-stat-label">Avg Rating</div>
                    </div>
                </div>

                {/* Type Filter Tabs (Quick Switchers) */}
                <div className="tv-type-tabs">
                    <button className={`tv-type-tab ${typeFilter === 'TV Series' ? 'active' : ''}`} onClick={() => handleTypeFilterChange('TV Series')}>
                        📺 TV Series (Default: Watching)
                    </button>
                    <button className={`tv-type-tab ${typeFilter === 'Movie' ? 'active' : ''}`} onClick={() => handleTypeFilterChange('Movie')}>
                        🎬 Movies (Default: Plan to Watch)
                    </button>
                    <button className={`tv-type-tab ${typeFilter === 'Anime' ? 'active' : ''}`} onClick={() => handleTypeFilterChange('Anime')}>
                        ✨ Anime
                    </button>
                    <button className={`tv-type-tab ${typeFilter === 'ALL' ? 'active' : ''}`} onClick={() => handleTypeFilterChange('ALL')}>
                        🌐 All Media Collection
                    </button>
                </div>

                {/* Controls & Toolbar */}
                <div className="tv-controls-panel">
                    <div className="tv-toolbar-row">
                        <input
                            type="text"
                            placeholder="🔍 Search title, genre, notes..."
                            className="tv-input-search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <select
                            className="tv-select-filter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="Watching">Watching</option>
                            <option value="Completed">Completed</option>
                            <option value="Plan to Watch">Plan to Watch</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Dropped">Dropped</option>
                        </select>

                        <select
                            className="tv-select-filter"
                            value={typeFilter}
                            onChange={(e) => handleTypeFilterChange(e.target.value)}
                        >
                            <option value="ALL">All Types</option>
                            <option value="TV Series">TV Series</option>
                            <option value="Movie">Movie</option>
                            <option value="Anime">Anime</option>
                        </select>

                        <select
                            className="tv-select-filter"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="RECENTLY_WATCHED_DESC">🕒 Recently Watched Time</option>
                            <option value="YEAR_DESC">📅 Release Date (Newest First)</option>
                            <option value="YEAR_ASC">📅 Release Date (Oldest First)</option>
                            <option value="RATING_DESC">⭐ Rating: High to Low</option>
                            <option value="RATING_ASC">⭐ Rating: Low to High</option>
                            <option value="TITLE_ASC">🔤 Title: A to Z</option>
                            <option value="TITLE_DESC">🔤 Title: Z to A</option>
                        </select>
                    </div>

                    <div className="tv-toolbar-row" style={{ paddingTop: '10px', borderTop: '1px solid #1f1f1f' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                className={`tv-btn ${viewMode === 'grid' ? 'tv-btn-active' : 'tv-btn-outline'}`}
                                onClick={() => setViewMode('grid')}
                            >
                                🎴 Cards View
                            </button>
                            <button
                                className={`tv-btn ${viewMode === 'table' ? 'tv-btn-active' : 'tv-btn-outline'}`}
                                onClick={() => setViewMode('table')}
                            >
                                📊 Table View
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <button className="tv-btn tv-btn-primary" onClick={handleImportFromMongoDB} disabled={importingMongoDB}>
                                {importingMongoDB ? '⏳ Importing...' : '📥 Import TVTime (MongoDB)'}
                            </button>
                            <button className="tv-btn tv-btn-outline" onClick={() => setShowImportModal(true)}>
                                📋 Paste JSON
                            </button>
                            <button className="tv-btn tv-btn-gold" onClick={handleExportJson} disabled={items.length === 0}>
                                📤 Export JSON
                            </button>
                            <button className="tv-btn tv-btn-outline" onClick={handleLoadSample}>
                                🔄 Load Sample
                            </button>
                            <button className="tv-btn tv-btn-outline" style={{ color: '#ff4d4f' }} onClick={handleClearData}>
                                🗑️ Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Items Display */}
                {loading ? (
                    <div className="tv-empty-state">
                        <div className="tv-empty-icon">⏳</div>
                        <h3>Loading Watchlist from Backend...</h3>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="tv-empty-state">
                        <div className="tv-empty-icon">📺</div>
                        <h3>No TV Shows or Movies Found</h3>
                        <p style={{ color: '#777', maxWidth: '400px', margin: '10px auto' }}>
                            {items.length === 0
                                ? "Your watchlist is empty. Click 'Import TVTime (MongoDB)' or '+ Add TV Show' to populate your collection!"
                                : "No items match your active filters or search terms."}
                        </p>
                        {items.length === 0 && (
                            <button className="tv-btn tv-btn-gold" onClick={handleLoadSample} style={{ marginTop: '15px' }}>
                                Load Sample Watchlist
                            </button>
                        )}
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="tv-items-grid">
                        {filteredItems.map(item => (
                            <div key={item.id || item.uuid} className="tv-card" onClick={() => setSelectedItem(item)} style={{ cursor: 'pointer' }}>
                                <div>
                                    <div className="tv-card-top">
                                        <h3 className="tv-item-title">{item.title}</h3>
                                        <span className="tv-badge-type">{item.type}</span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0' }}>
                                        <span className={`tv-badge-status ${getStatusClass(item.status)}`}>
                                            {item.status}
                                        </span>
                                        {(item.rating || 0) > 0 && <span style={{ color: '#d4af37', fontWeight: 600, fontSize: '0.9rem' }}>⭐ {item.rating}</span>}
                                    </div>

                                    <div className="tv-card-meta">
                                        {item.season && item.season !== 'N/A' && <span>📺 {item.season}</span>}
                                        {item.year && <span>📅 {item.year}</span>}
                                    </div>

                                    <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '8px' }}>
                                        <strong>Genre:</strong> {item.genre}
                                    </div>
                                </div>

                                {item.notes && (
                                    <div className="tv-card-notes">
                                        "{item.notes}"
                                    </div>
                                )}

                                {/* Status Change Buttons Bar */}
                                <div className="tv-card-actions" onClick={(e) => e.stopPropagation()}>
                                    <span className="tv-action-label">Change Status:</span>
                                    <div className="tv-status-btn-group">
                                        {['Watching', 'Completed', 'Plan to Watch', 'On Hold', 'Dropped'].map((st) => (
                                            <button
                                                key={st}
                                                className={`tv-status-chip ${item.status === st ? 'active' : ''}`}
                                                onClick={(e) => handleUpdateStatus(item.id || item.uuid, st, item.type, e)}
                                                title={`Set to ${st}`}
                                            >
                                                {st === 'Watching' ? '▶️ Watching' : st === 'Completed' ? '✅ Completed' : st === 'Plan to Watch' ? '📅 Plan' : st === 'On Hold' ? '⏸️ Hold' : '🗑️ Drop'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#4da3ff' }}>
                                    <span>{item.seasons ? `📋 ${item.seasons.length} Season(s)` : 'ℹ️ View Details'}</span>
                                    <span>Click to track episodes →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="tv-table-wrapper">
                        <table className="tv-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Type</th>
                                    <th>Season / Info</th>
                                    <th>Status & Quick Change</th>
                                    <th>Rating</th>
                                    <th>Genre</th>
                                    <th>Year</th>
                                    <th>Notes</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map(item => (
                                    <tr key={item.id || item.uuid} onClick={() => setSelectedItem(item)} style={{ cursor: 'pointer' }}>
                                        <td style={{ fontWeight: '600', color: '#fff' }}>{item.title}</td>
                                        <td><span className="tv-badge-type">{item.type}</span></td>
                                        <td>{item.season}</td>
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <select
                                                className={`tv-table-status-select ${getStatusClass(item.status)}`}
                                                value={item.status}
                                                onChange={(e) => handleUpdateStatus(item.id || item.uuid, e.target.value, item.type, e)}
                                            >
                                                <option value="Watching">▶️ Watching</option>
                                                <option value="Completed">✅ Completed</option>
                                                <option value="Plan to Watch">📅 Plan to Watch</option>
                                                <option value="On Hold">⏸️ On Hold</option>
                                                <option value="Dropped">🗑️ Dropped</option>
                                            </select>
                                        </td>
                                        <td style={{ color: '#d4af37', fontWeight: '600' }}>⭐ {item.rating || 'N/A'}</td>
                                        <td>{item.genre}</td>
                                        <td>{item.year}</td>
                                        <td style={{ fontStyle: 'italic', color: '#888', maxWidth: '200px' }}>{item.notes || '-'}</td>
                                        <td>
                                            <button className="tv-btn tv-btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}>
                                                Episodes
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add TV Show / Movie Modal */}
            {showAddModal && (
                <div className="tv-modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="tv-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="tv-modal-title">
                            <span>{addType === 'Movie' ? '🎬 Add New Movie' : '📺 Add New TV Show / Anime'}</span>
                            <button style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.4rem', cursor: 'pointer' }} onClick={() => setShowAddModal(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSubmitNewMedia}>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>Title *</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        required
                                        className="tv-input-search"
                                        style={{ flex: 1 }}
                                        placeholder="Enter title (e.g. Arcane, Inception)..."
                                        value={newForm.title}
                                        onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        className="tv-btn tv-btn-outline"
                                        style={{ whiteSpace: 'nowrap', borderColor: '#4da3ff', color: '#4da3ff' }}
                                        onClick={handleAutoFillFromFreeApi}
                                        disabled={fetchingApi}
                                    >
                                        {fetchingApi ? '⏳ Searching...' : '🔍 Auto-Fill API'}
                                    </button>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#666' }}>
                                    💡 Click "Auto-Fill API" to fetch free genre, rating & summary from TVmaze / Jikan!
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>Type</label>
                                    <select
                                        className="tv-select-filter"
                                        style={{ width: '100%' }}
                                        value={addType}
                                        onChange={(e) => setAddType(e.target.value)}
                                    >
                                        <option value="TV Series">TV Series</option>
                                        <option value="Anime">Anime</option>
                                        <option value="Movie">Movie</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>Status</label>
                                    <select
                                        className="tv-select-filter"
                                        style={{ width: '100%' }}
                                        value={newForm.status}
                                        onChange={(e) => setNewForm({ ...newForm, status: e.target.value })}
                                    >
                                        <option value="Plan to Watch">Plan to Watch</option>
                                        <option value="Watching">Watching</option>
                                        <option value="Completed">Completed</option>
                                        <option value="On Hold">On Hold</option>
                                        <option value="Dropped">Dropped</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>Rating (0-10)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="10"
                                        className="tv-input-search"
                                        style={{ width: '100%' }}
                                        value={newForm.rating}
                                        onChange={(e) => setNewForm({ ...newForm, rating: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>Year</label>
                                    <input
                                        type="number"
                                        className="tv-input-search"
                                        style={{ width: '100%' }}
                                        value={newForm.year}
                                        onChange={(e) => setNewForm({ ...newForm, year: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>Season / Info</label>
                                    <input
                                        type="text"
                                        className="tv-input-search"
                                        style={{ width: '100%' }}
                                        placeholder="e.g. Season 2"
                                        value={newForm.season}
                                        onChange={(e) => setNewForm({ ...newForm, season: e.target.value })}
                                        disabled={addType === 'Movie'}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>Genre</label>
                                <input
                                    type="text"
                                    className="tv-input-search"
                                    style={{ width: '100%' }}
                                    placeholder="e.g. Action, Sci-Fi, Thriller"
                                    value={newForm.genre}
                                    onChange={(e) => setNewForm({ ...newForm, genre: e.target.value })}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>Notes / Thoughts</label>
                                <textarea
                                    className="tv-json-textarea"
                                    style={{ height: '70px', width: '100%' }}
                                    placeholder="Add personal review or notes..."
                                    value={newForm.notes}
                                    onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" className="tv-btn tv-btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="tv-btn tv-btn-primary">Save to Watchlist</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Series Detail & Episode Tracking Modal */}
            {selectedItem && (
                <div className="tv-modal-overlay" onClick={() => setSelectedItem(null)}>
                    <div className="tv-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', maxHeight: '85vh', overflowY: 'auto' }}>
                        <div className="tv-modal-title">
                            <span>{selectedItem.type === 'Movie' ? '🎬' : '📺'} {selectedItem.title} ({selectedItem.year})</span>
                            <button style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.4rem', cursor: 'pointer' }} onClick={() => setSelectedItem(null)}>✕</button>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                            <span className={`tv-badge-status ${getStatusClass(selectedItem.status)}`}>{selectedItem.status}</span>
                            <span className="tv-badge-type">{selectedItem.type}</span>
                            <span style={{ color: '#d4af37', fontWeight: 600 }}>⭐ {selectedItem.rating || 'N/A'}</span>
                            <span style={{ color: '#aaa', fontSize: '0.85rem' }}><strong>Genre:</strong> {selectedItem.genre}</span>
                        </div>

                        {/* Quick Status Change in Modal */}
                        <div className="tv-modal-status-bar">
                            <span style={{ fontSize: '0.85rem', color: '#aaa' }}>Set Status:</span>
                            <div className="tv-status-btn-group">
                                {['Watching', 'Completed', 'Plan to Watch', 'On Hold', 'Dropped'].map((st) => (
                                    <button
                                        key={st}
                                        className={`tv-status-chip ${selectedItem.status === st ? 'active' : ''}`}
                                        onClick={(e) => handleUpdateStatus(selectedItem.id || selectedItem.uuid, st, selectedItem.type, e)}
                                    >
                                        {st === 'Watching' ? '▶️ Watching' : st === 'Completed' ? '✅ Completed' : st === 'Plan to Watch' ? '📅 Plan to Watch' : st === 'On Hold' ? '⏸️ On Hold' : '🗑️ Dropped'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedItem.notes && (
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid #4da3ff', fontStyle: 'italic', marginBottom: '16px', color: '#ccc', fontSize: '0.9rem' }}>
                                "{selectedItem.notes}"
                            </div>
                        )}

                        {selectedItem.type === 'Movie' ? (
                            <div style={{ padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', textAlign: 'center', margin: '10px 0' }}>
                                <h4>🎥 Movie Status</h4>
                                <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                                    You can update this movie's watch status using the buttons above!
                                </p>
                            </div>
                        ) : (
                            <>
                                <h4 style={{ margin: '15px 0 10px 0', borderBottom: '1px solid #222', paddingBottom: '6px', color: '#4da3ff', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>📋 Season & Episode Tracking</span>
                                    <span style={{ fontSize: '0.8rem', color: '#777', fontWeight: 'normal' }}>Click checkboxes to mark as watched</span>
                                </h4>

                                {selectedItem.seasons && selectedItem.seasons.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {selectedItem.seasons.map((season) => (
                                            <details key={season.number} className="tv-season-accordion" open={season.number === 1 || selectedItem.seasons.length <= 2}>
                                                <summary style={{ cursor: 'pointer', padding: '10px 14px', background: '#1c1c1c', borderRadius: '6px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', color: '#fff', userSelect: 'none' }}>
                                                    <span>Season {season.number} {season.is_specials || season.isSpecials ? '(Specials)' : ''}</span>
                                                    <span style={{ color: '#4da3ff', fontSize: '0.85rem' }}>
                                                        {season.episodes ? season.episodes.filter(e => e.is_watched || e.isWatched).length : 0} / {season.episodes ? season.episodes.length : 0} Watched
                                                    </span>
                                                </summary>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '8px', padding: '10px 4px' }}>
                                                    {season.episodes && season.episodes.map((ep) => {
                                                        const isWatched = !!(ep.is_watched || ep.isWatched);
                                                        return (
                                                            <label key={ep.number} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: isWatched ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255,255,255,0.02)', border: isWatched ? '1px solid rgba(82, 196, 26, 0.3)' : '1px solid #222', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem', color: isWatched ? '#52c41a' : '#ddd' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isWatched}
                                                                    onChange={() => handleToggleEpisode(selectedItem.id || selectedItem.uuid, season.number, ep.number)}
                                                                />
                                                                <strong style={{ minWidth: '24px' }}>E{ep.number}.</strong>
                                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: isWatched ? 'line-through' : 'none' }}>{ep.name || `Episode ${ep.number}`}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </details>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', color: '#777', fontStyle: 'italic' }}>
                                        No episode list available in database for this series.
                                    </div>
                                )}
                            </>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid #222', paddingTop: '12px' }}>
                            <button className="tv-btn tv-btn-gold" onClick={() => setSelectedItem(null)}>Close Details</button>
                        </div>
                    </div>
                </div>
            )}

            {/* JSON Import Modal */}
            {showImportModal && (
                <div className="tv-modal-overlay" onClick={() => setShowImportModal(false)}>
                    <div className="tv-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="tv-modal-title">
                            <span>📋 Paste or Upload JSON Watchlist</span>
                            <button
                                style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.4rem', cursor: 'pointer' }}
                                onClick={() => setShowImportModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <p style={{ color: '#aaa', fontSize: '0.9rem', margin: 0 }}>
                            Upload a <code>.json</code> file or paste a JSON array of movies/TV series below.
                        </p>

                        <div className="tv-dropzone">
                            <label style={{ cursor: 'pointer', display: 'block' }}>
                                📁 <strong>Click here to upload a .json file</strong>
                                <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
                            </label>
                        </div>

                        <div style={{ textAlign: 'center', color: '#555', fontSize: '0.85rem' }}>— OR PASTE JSON —</div>

                        <textarea
                            className="tv-json-textarea"
                            placeholder='[&#10;  {&#10;    "title": "Breaking Bad",&#10;    "type": "TV Series",&#10;    "season": "Season 5",&#10;    "status": "Completed",&#10;    "rating": 9.8,&#10;    "genre": "Crime, Drama",&#10;    "notes": "Amazing series!"&#10;  }&#10;]'
                            value={jsonInputText}
                            onChange={(e) => setJsonInputText(e.target.value)}
                        />

                        {importError && (
                            <div style={{ color: '#ff4d4f', fontSize: '0.85rem', background: 'rgba(255,77,79,0.1)', padding: '8px 12px', borderRadius: '6px' }}>
                                ⚠️ {importError}
                            </div>
                        )}

                        {importSuccess && (
                            <div style={{ color: '#52c41a', fontSize: '0.85rem', background: 'rgba(82,196,26,0.1)', padding: '8px 12px', borderRadius: '6px' }}>
                                ✅ {importSuccess}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                            <button className="tv-btn tv-btn-outline" onClick={() => setShowImportModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="tv-btn tv-btn-gold"
                                onClick={() => handleImportJsonText(jsonInputText)}
                                disabled={!jsonInputText.trim()}
                            >
                                Import JSON
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TvTracker;
