import React, { useState, useCallback } from 'react';
import './BookClub.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BookClub = () => {
    const [profileUrl, setProfileUrl] = useState('');
    const [profile, setProfile] = useState(null);
    const [friendShelves, setFriendShelves] = useState({});
    const [ownerShelf, setOwnerShelf] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expandedFriends, setExpandedFriends] = useState({});

    const handleDiscover = useCallback(async () => {
        if (!profileUrl.trim()) return;
        setError('');
        setLoading(true);
        setProfile(null);
        setFriendShelves({});
        setOwnerShelf([]);
        setExpandedFriends({});

        try {
            // Step 1: Parse profile to get friends
            const profileRes = await fetch(
                `${API_BASE_URL}/api/bookclub/profile?url=${encodeURIComponent(profileUrl.trim())}`
            );
            if (!profileRes.ok) throw new Error('Could not parse profile. Make sure the URL is a valid Goodreads profile.');
            const profileData = await profileRes.json();
            setProfile(profileData);
            setLoading(false);

            // Step 2: Fetch owner's shelf
            if (profileData.userId) {
                fetch(`${API_BASE_URL}/api/bookclub/shelf?userId=${profileData.userId}&shelf=to-read&per_page=infinite`)
                    .then(res => res.json())
                    .then(books => setOwnerShelf(books))
                    .catch(() => setOwnerShelf([]));
            }

            // Step 3: Fetch each friend's shelf progressively
            const initialShelves = {};
            profileData.friends.forEach(f => {
                initialShelves[f.userId] = { status: 'loading', books: [] };
            });
            setFriendShelves(initialShelves);

            profileData.friends.forEach(friend => {
                fetch(`${API_BASE_URL}/api/bookclub/shelf?userId=${friend.userId}&shelf=to-read&per_page=infinite`)
                    .then(res => res.json())
                    .then(books => {
                        setFriendShelves(prev => ({
                            ...prev,
                            [friend.userId]: {
                                status: books.length > 0 ? 'loaded' : 'private',
                                books
                            }
                        }));
                    })
                    .catch(() => {
                        setFriendShelves(prev => ({
                            ...prev,
                            [friend.userId]: { status: 'private', books: [] }
                        }));
                    });
            });
        } catch (err) {
            setError(err.message || 'Something went wrong.');
            setLoading(false);
        }
    }, [profileUrl]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleDiscover();
    };

    const toggleFriend = (userId) => {
        setExpandedFriends(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
    };

    // Calculate overlapping books (Anchored to the user's shelf)
    const getOverlaps = () => {
        const bookCounts = {};

        // 1. Initialize with the owner's shelf (The baseline)
        ownerShelf.forEach(book => {
            const key = book.title.toLowerCase().trim();
            if (!bookCounts[key]) {
                bookCounts[key] = { book, members: [profile.userName] };
            }
        });

        // 2. Include friends' shelves ONLY if they match an owner's book
        if (profile?.friends) {
            profile.friends.forEach(friend => {
                const shelf = friendShelves[friend.userId];
                if (shelf?.status === 'loaded') {
                    shelf.books.forEach(book => {
                        const key = book.title.toLowerCase().trim();
                        // Only add the friend if the user (owner) also wants to read this book
                        if (bookCounts[key]) {
                            // Prevent a friend from being added twice for the same book (edge case)
                            if (!bookCounts[key].members.includes(friend.name)) {
                                bookCounts[key].members.push(friend.name);
                            }
                        }
                    });
                }
            });
        }

        // Filter to books wanted by the owner PLUS at least 1 friend (2+ members)
        return Object.values(bookCounts)
            .filter(item => item.members.length >= 2)
            .sort((a, b) => b.members.length - a.members.length);
    };

    const allFriendsLoaded = profile?.friends?.every(
        f => friendShelves[f.userId]?.status === 'loaded' || friendShelves[f.userId]?.status === 'private'
    );

    const overlaps = profile && allFriendsLoaded ? getOverlaps() : [];
    
    // Group overlaps by member count
    const groupedOverlaps = {};
    overlaps.forEach(item => {
        const count = item.members.length;
        if (!groupedOverlaps[count]) groupedOverlaps[count] = [];
        groupedOverlaps[count].push(item);
    });
    const sortedCounts = Object.keys(groupedOverlaps).map(Number).sort((a, b) => b - a);

    const overlapTitles = new Set(overlaps.map(o => o.book.title.toLowerCase().trim()));
    const totalMembers = profile ? 1 + (profile.friends?.length || 0) : 0;

    return (
        <div className="bookclub-container">
            {/* Hero */}
            <header className="bookclub-hero">
                <h1 className="bookclub-title">BOOK CLUB</h1>
                <p className="bookclub-tagline">
                    Paste a Goodreads profile URL to discover what your friends want to read — and find overlapping picks for your next book club session.
                </p>
                <div className="bookclub-search">
                    <input
                        className="bookclub-input"
                        type="text"
                        placeholder="https://www.goodreads.com/author/show/..."
                        value={profileUrl}
                        onChange={(e) => setProfileUrl(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        className="bookclub-discover-btn"
                        onClick={handleDiscover}
                        disabled={loading || !profileUrl.trim()}
                    >
                        {loading ? 'Discovering...' : 'Discover'}
                    </button>
                </div>
            </header>

            {/* Error */}
            {error && <div className="bookclub-error">{error}</div>}

            {/* Loading */}
            {loading && (
                <div className="bookclub-loading-overlay">
                    <div className="bookclub-loading-spinner" />
                    <span className="bookclub-loading-text">Parsing Goodreads Profile...</span>
                </div>
            )}

            {/* Results */}
            {profile && (
                <div className="bookclub-content">
                    {/* Profile Card */}
                    <div className="bookclub-profile-card">
                        <div className="bookclub-profile-avatar">
                            {profile.userName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="bookclub-profile-info">
                            <h2>{profile.userName}</h2>
                            <p>{profile.friends?.length || 0} friends discovered · {totalMembers} club members</p>
                        </div>
                    </div>

                    {/* Friends Grid */}
                    <h3 className="bookclub-section-title">Friends</h3>
                    <div className="bookclub-friends-grid">
                        {profile.friends?.map(friend => {
                            const shelf = friendShelves[friend.userId];
                            const status = shelf?.status || 'loading';
                            return (
                                <div key={friend.userId} className={`bookclub-friend-card ${status}`}>
                                    <div className="bookclub-friend-avatar">
                                        {friend.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div className="bookclub-friend-name" title={friend.name}>
                                        {friend.name}
                                    </div>
                                    {status === 'loading' && (
                                        <>
                                            <div className="bookclub-spinner" />
                                            <div className="bookclub-friend-status loading">Loading...</div>
                                        </>
                                    )}
                                    {status === 'loaded' && (
                                        <div className="bookclub-friend-status success">
                                            ✓ {shelf.books.length} books
                                        </div>
                                    )}
                                    {status === 'private' && (
                                        <div className="bookclub-friend-status private">
                                            🔒 Private
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Overlap Recommendations */}
                    {allFriendsLoaded && (
                        <div className="bookclub-overlap-section">
                            <h3 className="bookclub-section-title">
                                {overlaps.length > 0
                                    ? `Recommended Picks · ${overlaps.length} overlapping books`
                                    : 'Recommended Picks'}
                            </h3>
                            {overlaps.length > 0 ? (
                                <div className="bookclub-overlap-groups">
                                    {sortedCounts.map(count => (
                                        <div key={count} className="bookclub-overlap-group">
                                            <h4 className="bookclub-overlap-group-title">Wanted by {count} members</h4>
                                            <div className="bookclub-overlap-grid">
                                                {groupedOverlaps[count].map((item, i) => (
                                                    <a
                                                        key={i}
                                                        href={item.book.link}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="bookclub-overlap-card"
                                                    >
                                                        {item.book.imageUrl && (
                                                            <img
                                                                className="bookclub-overlap-cover"
                                                                src={item.book.imageUrl}
                                                                alt={item.book.title}
                                                            />
                                                        )}
                                                        <div className="bookclub-overlap-info">
                                                            <div className="bookclub-overlap-title" title={item.book.title}>{item.book.title}</div>
                                                            <div className="bookclub-overlap-author">{item.book.author}</div>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bookclub-empty">
                                    No overlapping books found among the club members' "Want to Read" lists. Try adding more friends or broadening the club!
                                </div>
                            )}
                        </div>
                    )}

                    {/* Individual Shelves */}
                    {allFriendsLoaded && (
                        <div>
                            <h3 className="bookclub-section-title">Individual Shelves</h3>

                            {/* Owner shelf */}
                            {ownerShelf.length > 0 && (
                                <div className="bookclub-shelf-toggle">
                                    <div
                                        className="bookclub-shelf-header"
                                        onClick={() => toggleFriend('owner')}
                                    >
                                        <span className="bookclub-shelf-header-name">
                                            {profile.userName} (You)
                                        </span>
                                        <div className="bookclub-shelf-header-info">
                                            <span className="bookclub-shelf-header-count">
                                                {ownerShelf.length} books {overlapTitles.size > 0 ? `· ${overlapTitles.size} overlaps` : ''}
                                            </span>
                                            <span className={`bookclub-shelf-header-arrow ${expandedFriends['owner'] ? 'open' : ''}`}>
                                                ▼
                                            </span>
                                        </div>
                                    </div>
                                    {expandedFriends['owner'] && (
                                        <div className="bookclub-shelf-books">
                                            {ownerShelf.map((book, i) => {
                                                const isOverlap = overlapTitles.has(book.title.toLowerCase().trim());
                                                return (
                                                <a key={i} href={book.link} target="_blank" rel="noreferrer" className={`bookclub-shelf-book ${isOverlap ? 'overlap-match' : ''}`}>
                                                    {book.imageUrl && (
                                                        <img className="bookclub-shelf-book-cover" src={book.imageUrl} alt={book.title} />
                                                    )}
                                                    <div className="bookclub-shelf-book-title" title={book.title}>{book.title}</div>
                                                    <div className="bookclub-shelf-book-author">{book.author}</div>
                                                </a>
                                            )})}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Friend shelves */}
                            {profile.friends?.map(friend => {
                                const shelf = friendShelves[friend.userId];
                                if (!shelf || shelf.status !== 'loaded' || shelf.books.length === 0) return null;
                                
                                const overlapCount = shelf.books.filter(b => overlapTitles.has(b.title.toLowerCase().trim())).length;
                                
                                return (
                                    <div key={friend.userId} className="bookclub-shelf-toggle">
                                        <div
                                            className="bookclub-shelf-header"
                                            onClick={() => toggleFriend(friend.userId)}
                                        >
                                            <span className="bookclub-shelf-header-name">{friend.name}</span>
                                            <div className="bookclub-shelf-header-info">
                                                <span className="bookclub-shelf-header-count">
                                                    {shelf.books.length} books {overlapCount > 0 ? `· ${overlapCount} overlaps` : ''}
                                                </span>
                                                <span className={`bookclub-shelf-header-arrow ${expandedFriends[friend.userId] ? 'open' : ''}`}>
                                                    ▼
                                                </span>
                                            </div>
                                        </div>
                                        {expandedFriends[friend.userId] && (
                                            <div className="bookclub-shelf-books">
                                                {shelf.books.map((book, i) => {
                                                    const isOverlap = overlapTitles.has(book.title.toLowerCase().trim());
                                                    return (
                                                    <a key={i} href={book.link} target="_blank" rel="noreferrer" className={`bookclub-shelf-book ${isOverlap ? 'overlap-match' : ''}`}>
                                                        {book.imageUrl && (
                                                            <img className="bookclub-shelf-book-cover" src={book.imageUrl} alt={book.title} />
                                                        )}
                                                        <div className="bookclub-shelf-book-title" title={book.title}>{book.title}</div>
                                                        <div className="bookclub-shelf-book-author">{book.author}</div>
                                                    </a>
                                                )})}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BookClub;
