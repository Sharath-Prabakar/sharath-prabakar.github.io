import React from 'react';

const myBooks = [
    {
        title: "The Boy Who Wished to Meet His Mother",
        link: "https://www.goodreads.com/book/show/244579846-the-boy-who-wished-to-meet-his-mother",
        description: "When the wishes made by a widowed writer and his son on a shooting star come true, the resulting magical adventure changes their strained relationship forever.",
        coverColor: "#1a1a1a",
        borderColor: "#d4af37", // Gold accent to match the coin project
        tags: ["Fiction", "Fantasy", "Cozy"]
    },
    {
        title: "Six Hours To Doomsday: A Time Travel Conspiracy",
        link:"https://www.goodreads.com/book/show/227760936-six-hours-to-doomsday",
        description: "From Earth to Moon, Mars and Neptune, the story unfolds in a fast-paced, non-linear fashion to explore the thrilling adventures involving a cunning spy with a personal vendetta, an ambitious emperor with a political agenda, and a group of humans battling for their planet’s survival.",
        coverColor: "#1a1a1a",
        borderColor: "#d4af37", // Gold accent to match the coin project
        tags: ["Sci-Fi", "Time Travel", "Thriller"]
    }

];

const Books = () => {
    return (
        <div style={styles.container}>
            <header style={styles.hero}>
                <h1 style={styles.name}>AUTHOR PROFILE</h1>
                <div style={styles.badge}>SCI-FI & FANTASY</div>
                <p style={styles.bio}>
                    After wavering for a few years, Sharath Prabakar took a sabbatical in 2025 to complete the 'Six Hours To Doomsday' novella, inspired by a recurring alien invasion dream.
                    You can find him writing code or reading the classics when he’s not working on the sequel.
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
                        <div key={index} style={styles.bookCard}>
                            <div style={{...styles.bookCover, borderLeft: `4px solid ${book.borderColor}`}}>
                                <div style={styles.coverArt}>
                                    {/* This placeholder mimics a clean, minimalist book spine */}
                                    <span style={styles.verticalTitle}>{book.title}</span>
                                </div>
                            </div>

                            <div style={styles.bookInfo}>
                                <h3 style={styles.bookTitle}>{book.title}</h3>
                                <p style={styles.description}>{book.description}</p>
                                <div style={styles.tagContainer}>
                                    {book.tags.map(tag => <span key={tag} style={styles.tag}>{tag}</span>)}
                                </div>
                                <a
                                    href={book.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={styles.link}
                                >
                                    VIEW ON GOODREADS
                                </a>
                            </div>
                        </div>
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
            width: '100%',
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
        marginBottom: '60px',
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
        marginBottom: '20px',
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
        backgroundColor: '#0c0c0c',
        border: '1px solid #1a1a1a',
        borderRadius: '4px',
        overflow: 'hidden',
        transition: 'border-color 0.3s ease',
    },
    bookCover: {
        width: '180px',
        backgroundColor: '#111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
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
        lineHeight: '1.6',
        color: '#aaa',
        fontSize: '0.95rem',
        marginBottom: '20px'
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