import React, { useState, useEffect } from 'react';

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

const naazhigaiInfo = {
    title: "Understanding Naazhigai",
    content: "Naazhigai is an ancient Tamil unit of time. Unlike the standard 24-hour system, a traditional day is divided into 60 equal parts called Naazhigais. Each Naazhigai lasts exactly 24 minutes, offering a unique perspective on temporal flow that serves as the foundation for the Naazhigai Clock project."
};

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
        opacity: isHovered ? 0.9 : 0.7,
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

    return (
        <div style={styles.container}>
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
    },
    sectionTitle: {
        borderBottom: '1px solid #222',
        paddingBottom: '10px',
        marginBottom: '40px',
        fontSize: '1.2rem',
        letterSpacing: '3px',
        color: '#888',
        textTransform: 'uppercase'
    },
    shelf: {
        display: 'flex',
        flexDirection: 'column',
        gap: '40px'
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
    }
};

export default Books;