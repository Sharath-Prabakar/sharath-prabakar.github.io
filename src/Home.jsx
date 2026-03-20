import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div style={styles.container}>
            {/* 1. HERO SECTION / ABOUT ME */}
            <section style={styles.hero}>
                <h1 style={styles.name}>SHARATH PRABAKAR</h1>
                <div style={styles.badge}>SOFTWARE DEVELOPER | AUTHOR</div>
                <p style={styles.bio}>
                    Sharath Prabakar is an enthusiastic problem-solver with 5+ years of experience in Android and AEM frameworks.
                    He's currently vibe coding React along with Spring Boot to develop this website using Gemini.
                    When he’s not writing code, he’ll be writing sci-fi stories.
                </p>
            </section>

            {/* 2. FEATURED PROJECTS SECTION */}
            <section style={styles.projectSection}>
                <h2 style={styles.sectionTitle}>Featured Projects</h2>

                <div style={styles.grid}>
                    {/* Project 1: Global Coin Collections */}
                    <Link to="https://play.google.com/store/apps/details?id=com.thadaladi.globalcoincollections" style={styles.card}>
                        <div style={{...styles.cardIcon, color: '#d4af37'}}>🪙</div>
                        <h3>Global Coin Collections App</h3>
                        <p>Built, as a solo developer, a zero-cost, serverless inventory system coupled with a customer-facing e-commerce Android app to showcase the inventory for sale with frugal API calls using Firestore DB and Node.js Cloud Functions as admin scripts.</p>
                        <span style={styles.tag}>Android / Firebase</span>
                    </Link>

                    {/* Project 2: Sixty Hour Clock */}
                    <Link to="/clock" style={styles.card}>
                        <div style={{...styles.cardIcon, color: '#00FF41'}}>⌚</div>
                        <h3>Sixty Hour Clock</h3>
                        <p>A web-based custom time system featuring 60-hour days. Built with React and themed with Matrix/Cyberpunk aesthetics.</p>
                        <span style={styles.tag}>React</span>
                    </Link>
                </div>
            </section>

            {/* 3. SKILLS / TECH STACK */}
            <section style={styles.skills}>
                <div style={styles.skillBadge}>Java</div>
                <div style={styles.skillBadge}>Android</div>
                <div style={styles.skillBadge}>React</div>
                <div style={styles.skillBadge}>Spring Boot</div>
            </section>
        </div>
    );
};

// --- STYLES ---
const styles = {
    container: {
        backgroundColor: '#050505',
        color: '#e0e0e0',
        minHeight: '100vh',
        padding: '120px 20px 60px', // Top padding for the fixed Nav
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: '"Inter", sans-serif',
    },
    hero: {
        maxWidth: '800px',
        textAlign: 'center',
        marginBottom: '60px',
    },
    name: {
        fontSize: '3rem',
        letterSpacing: '5px',
        margin: '0 0 10px 0',
        color: '#fff',
    },
    badge: {
        display: 'inline-block',
        padding: '5px 15px',
        backgroundColor: '#333',
        fontSize: '0.8rem',
        borderRadius: '20px',
        marginBottom: '20px',
        color: '#aaa',
    },
    bio: {
        fontSize: '1.2rem',
        lineHeight: '1.6',
        color: '#bbb',
    },
    projectSection: {
        width: '100%',
        maxWidth: '1000px',
    },
    sectionTitle: {
        borderBottom: '1px solid #333',
        paddingBottom: '10px',
        marginBottom: '30px',
        fontSize: '1.5rem',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
    },
    card: {
        backgroundColor: '#111',
        border: '1px solid #222',
        padding: '30px',
        borderRadius: '8px',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'transform 0.2s ease, border-color 0.2s ease',
        cursor: 'pointer',
    },
    cardIcon: {
        fontSize: '2rem',
        marginBottom: '15px',
    },
    tag: {
        fontSize: '0.7rem',
        backgroundColor: '#222',
        padding: '3px 8px',
        borderRadius: '4px',
        color: '#888',
    },
    skills: {
        marginTop: '60px',
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    skillBadge: {
        border: '1px solid #444',
        padding: '8px 20px',
        borderRadius: '4px',
        fontSize: '0.9rem',
    }
};

export default Home;