import React, { useState, useEffect } from 'react';
import './books.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
// Custom hook to handle responsive re-renders
const useWindowSize = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isMobile;
};

const LoadingPopup = ({ message }) => (
    <div style={styles.overlay}>
        <div style={styles.popup}>
            <div className="spinner"></div>
            <p style={styles.loadingText}>{message}</p>
        </div>
    </div>
);

const myBooks = [
    {
        title: "The Boy Who Wished to Meet His Mother",
        link: "https://www.goodreads.com/book/show/244579846-the-boy-who-wished-to-meet-his-mother",
        description: "When the wishes made by a widowed writer and his son on a shooting star come true, the resulting magical adventure changes their strained relationship forever.",
        borderColor: "#d4af37",
        image: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1764440370i/244579846.jpg",
        tags: ["Fiction", "Fantasy", "Cozy"]
    },
    {
        title: "Six Hours To Doomsday",
        link:"https://www.goodreads.com/book/show/227760936-six-hours-to-doomsday",
        description: "From Earth to Moon, Mars and Neptune, the story unfolds in a fast-paced, non-linear fashion to explore the thrilling adventures involving a cunning spy with a personal vendetta, an ambitious emperor with a political agenda, and a group of humans battling for their planet’s survival.",
        borderColor: "#d4af37",
        image:"https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1738902728i/227760936.jpg",
        tags: ["Sci-Fi", "Time Travel", "Thriller"]
    }
];

const BookCard = ({ book, isMobile }) => {
    const [isHovered, setIsHovered] = useState(false);

    const cardStyle = {
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        backgroundColor: '#0c0c0c',
        border: `1px solid ${isHovered ? '#444' : '#1a1a1a'}`,
        borderRadius: '8px',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        transform: isHovered && !isMobile ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 15px 30px rgba(0,0,0,0.6)' : '0 4px 10px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        position: 'relative'
    };

    const coverContainerStyle = {
        width: isMobile ? '100%' : '180px',
        height: isMobile ? '280px' : '260px',
        backgroundColor: '#111',
        position: 'relative',
        flexShrink: 0,
        overflow: 'hidden',
        borderLeft: isMobile ? 'none' : `4px solid ${book.borderColor}`,
        borderBottom: isMobile ? `4px solid ${book.borderColor}` : 'none',
    };

    const imageStyle = {
        width: '100%',
        height: '100%',
        objectFit: 'fill', // Ensures the book cover fills the space beautifully
        transition: 'all 0.4s ease',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
    };

    return (
        <a
            href={book.link}
            target="_blank"
            rel="noreferrer"
            style={cardStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={coverContainerStyle}>
                <img
                    src={book.image}
                    alt={book.title}
                    style={imageStyle}
                />
            </div>
            <div style={styles.bookInfo}>
                <h3 style={styles.bookTitle}>{book.title}</h3>
                <p style={styles.description}>{book.description}</p>
                <div style={styles.tagContainer}>
                    {book.tags.map(tag => <span key={tag} style={styles.tag}>{tag}</span>)}
                </div>
                <div style={styles.link}>VIEW ON GOODREADS {isHovered ? '→' : ''}</div>
            </div>
        </a>
    );
};

const Books = () => {
    const isMobile = useWindowSize();
    const [currentlyReading, setCurrentlyReading] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [loadingMessage, setLoadingMessage] = useState("");

    // Helper to format the ISO string from Java
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year:'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const fetchBooks = (isManualSync = false) => {
        setRefreshing(true);

        const messages = [
            "Warming up the Spring Boot Instance...",
            "Establishing connection to MongoDB...",
            "Fetching latest library data...",
            "Loading my bookshelf...",
            "Placing the books in order..."
        ];

        let msgIndex = 0;
        setLoadingMessage(messages[0]);

        const interval = setInterval(() => {
            msgIndex = (msgIndex + 1) % messages.length;
            setLoadingMessage(messages[msgIndex]);
        }, 3000);

        const endpoint = isManualSync ? "/api/books/currently-reading-latest" : "/api/books/currently-reading";

        fetch(`${API_BASE_URL}${endpoint}`)
            .then(res => res.json())
            .then(data => {
                setCurrentlyReading(data);
                // Get the timestamp from the first book (most recent)
                if (data.length > 0) {
                    setLastUpdated(data[0].refreshAt);
                }
                clearInterval(interval); // Stop the text cycling
                setLoading(false);
                setRefreshing(false);
            })
            .catch(() => {
                clearInterval(interval); // Stop the text cycling
                setLoading(false);
                setRefreshing(false);
            });
    };

    useEffect(() => {
        fetchBooks(false); // Initial load from DB
    }, []);

    return (
        <div style={styles.container}>
            {loading && <LoadingPopup message={loadingMessage} />}
            <header style={styles.hero}>
                <h1 style={{...styles.name, fontSize: isMobile ? '2rem' : '2.5rem'}}>AUTHOR PROFILE</h1>
                <div style={styles.badge}>SCI-FI & FANTASY</div>
                <p style={styles.bio}>
                    After wavering for a few years, Sharath Prabakar took a sabbatical in 2025 to complete the 'Six Hours To Doomsday' novella, inspired by a recurring alien invasion dream. You can find him writing code or reading the classics when he’s not working on the sequel.
                </p>
                <a
                    href="https://www.goodreads.com/author/show/54655809.Sharath_Prabakar"
                    target="_blank"
                    rel="noreferrer"
                    style={styles.link}
                >
                    VIEW GOODREADS PROFILE
                </a>
            </header>

            <section style={styles.projectSection}>
                <h2 style={styles.sectionTitle}>Published Titles</h2>
                <div style={styles.shelf}>
                    {myBooks.map((book, index) => (
                        <BookCard key={index} book={book} isMobile={isMobile} />
                    ))}
                </div>
            </section>

            {/* Dynamic Section: Currently Reading */}

            {(currentlyReading.length > 0 || !loading) && (
                <section style={styles.projectSection}>
                    <div style={styles.headerRow}>
                        <h2 style={styles.sectionTitle}>Currently Reading</h2>

                        <div style={styles.actionGroup}>
                            {lastUpdated && (
                                <span style={styles.timestamp}>
                    Last synced: {formatDate(lastUpdated)}
                </span>
                            )}
                            <button
                                onClick={() => fetchBooks(true)}
                                disabled={refreshing}
                                style={{
                                    ...styles.refreshButton,
                                    opacity: refreshing ? 0.5 : 1
                                }}
                            >
                                {refreshing ? "SYNCING..." : "REFRESH NOW"}
                            </button>
                        </div>
                    </div>
                    <div style={styles.readingGrid}>
                        {currentlyReading.map((book, i) => (

                            <a key={i} href={book.link} target="_blank" rel="noreferrer" className="currReadCards" style={styles.miniCard}>
                                <div style={styles.miniCoverHolder}>
                                    <img src={book.imageUrl} alt={book.title} style={styles.miniCover} />
                                </div>
                                <div style={styles.miniMeta}>
                                    <div style={styles.miniTitle}>{book.title}</div>
                                    <div style={styles.miniAuthor}>{book.author}</div>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>
            )}

        </div>
    );
};

const styles = {
        container: {
            backgroundColor: '#050505',
            color: '#e0e0e0',
            minHeight: '100vh', // Ensures it covers the screen but can grow
            padding: '120px 20px 80px', // Extra bottom padding so the last book isn't cramped
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontFamily: '"Inter", sans-serif',
            overflowY: 'visible', // Explicitly allow scrolling
        },
    hero: {
        maxWidth: '800px',
        textAlign: 'center',
        marginBottom: '20px',
    },
    name: {
        fontSize: '2.5rem',
        letterSpacing: '8px',
        margin: '0 0 10px 0',
        color: '#fff',
    },
    badge: {
        display: 'inline-block',
        padding: '5px 15px',
        backgroundColor: '#151515',
        fontSize: '0.7rem',
        letterSpacing: '2px',
        borderRadius: '2px',
        marginBottom: '10px',
        color: '#d4af37', // Gold accent
        border: '1px solid #333'
    },
    bio: {
        fontSize: '1.1rem',
        lineHeight: '1.6',
        color: '#bbb',
    },
    projectSection: {
        width: '100%',
        maxWidth: '900px',
        marginTop: '20px',
    },

    shelf: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    bookCard: {
        display: 'flex',
        flexDirection: window.innerWidth < 768 ? 'column' : 'row', // Quick responsive check
        backgroundColor: '#0c0c0c',
        border: '1px solid #1a1a1a',
        borderRadius: '4px',
        overflow: 'hidden',
    },
    bookCover: {
        width: window.innerWidth < 768 ? '100%' : '180px', // Full width on mobile
        height: window.innerWidth < 768 ? '200px' : 'auto',
        backgroundColor: '#111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    coverArt: {
        height: '80%',
        width: '60%',
        border: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px'
    },
    verticalTitle: {
        transform: 'rotate(-90deg)',
        whiteSpace: 'nowrap',
        fontSize: '0.8rem',
        letterSpacing: '2px',
        color: '#555',
        fontWeight: 'bold'
    },
    bookInfo: {
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    bookTitle: {
        fontSize: '1.8rem',
        margin: '0 0 15px 0',
        color: '#fff',
        letterSpacing: '1px'
    },
    description: {
        lineHeight: '1.5',
        color: '#aaa',
        fontSize: '0.95rem',
        marginBottom: '10px',
        // --- ADD THESE FOR ELLIPSIS ---
        display: '-webkit-box',
        WebkitLineClamp: 2,       /* Number of lines to show before truncating */
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    },
    tagContainer: { display: 'flex', gap: '8px', marginBottom: '25px' },
    tag: {
        fontSize: '0.7rem',
        backgroundColor: '#151515',
        padding: '4px 10px',
        borderRadius: '2px',
        color: '#777',
        border: '1px solid #222'
    },
    link: {
        color: '#d4af37',
        textDecoration: 'none',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        letterSpacing: '2px'
    },
    //Styles for Currently Reading
    readingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '25px' },
    miniCard: { textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' },
    miniCoverHolder: { aspectRatio: '2/3', backgroundColor: '#111', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' },
    miniCover: { width: '100%', height: '100%', objectFit: 'cover' },
    miniMeta: { marginTop: '10px', textAlign: 'center' },
    miniTitle: { fontSize: '0.85rem', color: '#fff', fontWeight: '600', whiteSpace: 'nowrap',overflow: 'hidden', textOverflow: 'ellipsis' },
    miniAuthor: { fontSize: '0.7rem', color: '#666', marginTop: '2px' },
    headerRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center', // Centers button and title vertically
    },
    sectionTitle: {
        paddingBottom: '10px',
        marginBottom: '10px',
        fontSize: '1.2rem',
        letterSpacing: '3px',
        color: '#888',
        textTransform: 'uppercase'
    },
    actionGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px' // Space between timestamp and button
    },
    timestamp: {
        fontSize: '0.6rem',
        color: '#666', // Very subtle so it doesn't compete with the button
        letterSpacing: '1px',
        textTransform: 'uppercase'
    },
    refreshButton: {
        backgroundColor: 'transparent',
        border: '1px solid #d4af37',
        color: '#d4af37',
        fontSize: '0.65rem',
        padding: '4px 10px',
        borderRadius: '2px',
        letterSpacing: '1px',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
    },
    //Loading popup
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    popup: {
        textAlign: 'center',
        padding: '40px',
        border: '1px solid #333',
        backgroundColor: '#0a0a0a',
    },
    loadingText: {
        color: '#d4af37', // Gold accent
        marginTop: '20px',
        fontSize: '0.8rem',
        letterSpacing: '2px',
        textTransform: 'uppercase',
    }
};

export default Books;