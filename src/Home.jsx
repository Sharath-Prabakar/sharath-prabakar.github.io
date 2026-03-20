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

            {/* 2. SKILLS / TECH STACK */}
            <section style={styles.skills}>
                <div style={styles.skillBadge}>Java</div>
                <div style={styles.skillBadge}>Android</div>
                <div style={styles.skillBadge}>React</div>
                <div style={styles.skillBadge}>Spring Boot</div>
                <div style={styles.skillBadge}>Adobe Experience Manager</div>
            </section>

            {/* 3. FEATURED PROJECTS SECTION */}
            <section style={styles.projectSection}>
                <h2 style={styles.sectionTitle}>Featured Projects</h2>

                <div style={styles.grid}>
                    <ProjectCard
                        title="Global Coin Collections"
                        icon="🪙"
                        iconColor="#d4af37"
                        description="Built, as a solo developer, a zero-cost, serverless inventory system coupled with a customer-facing e-commerce Android app to showcase the inventory for sale with frugal API calls using Firestore DB and Node.js Cloud Functions as admin scripts."
                        tag="Android / Java"
                        link="https://play.google.com/store/apps/details?id=com.thadaladi.globalcoincollections"
                    />
                    <ProjectCard
                        title="Naazhigai Clock"
                        icon="⌚"
                        iconColor="#00FF41"
                        description="A web-based custom time system featuring 60-hour days. Built with React and themed with Matrix/Cyberpunk aesthetics."
                        tag="React"
                        link="/clock"
                    />
                </div>
            </section>

        </div>
    );
};

//Components
const ProjectCard = ({ title, icon, description, tag, iconColor, link }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const cardStyle = {
        backgroundColor: '#111',
        border: `1px solid ${isHovered ? '#444' : '#222'}`,
        padding: '30px',
        borderRadius: '8px',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: isHovered
            ? '0 15px 30px rgba(0,0,0,0.6)'
            : '0 4px 10px rgba(0,0,0,0.3)',
        position: 'relative', // Necessary to anchor the arrow
        display: 'flex',
        flexDirection: 'column'
    };

    const headerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '15px'
    };

    const arrowStyle = {
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        fontSize: '1.2rem',
        color: isHovered ? iconColor : '#444', // Arrow lights up with the project's theme color
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateX(5px)' : 'translateX(0)', // Subtle nudge animation
        opacity: isHovered ? 1 : 0.6
    };

    const Wrapper = link ? Link : 'div';

    return (
        <Wrapper
            to={link}
            style={cardStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={headerStyle}>
                <div style={{
                    fontSize: '2rem',
                    color: iconColor,
                    transition: 'transform 0.3s ease',
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                }}>
                    {icon}
                </div>
                <h3 style={{ margin: 0, letterSpacing: '1px' }}>{title}</h3>
            </div>

            <p style={{ color: '#bbb', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '20px' }}>
                {description}
            </p>

            <div style={{ marginTop: 'auto' }}>
                <span style={styles.tag}>{tag}</span>
            </div>

            {/* The Redirect Arrow */}
            {link && <div style={arrowStyle}>→</div>}
        </Wrapper>
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
        marginBottom: '10px',
    },
    name: {
        fontSize: 'clamp(2rem, 8vw, 3.5rem)', // Scales between 2rem and 3.5rem based on screen
        letterSpacing: '5px',
        textAlign: 'center',
        color: '#fff',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', // Changed from 300px to 280px
        gap: '20px',
        width: '100%',
    },
    projectSection: {
        width: '90%', // Use percentages for mobile padding
        maxWidth: '1000px',
    },
    badge: {
        display: 'inline-block',
        padding: '5px 15px',
        backgroundColor: '#333',
        fontSize: '0.8rem',
        borderRadius: '20px',
        marginBottom: '20px',
        color: "#d4af37",
    },
    bio: {
        fontSize: '1.2rem',
        lineHeight: '1.6',
        color: '#bbb',
    },
    sectionTitle: {
        borderBottom: '1px solid #333',
        paddingBottom: '10px',
        marginBottom: '30px',
        fontSize: '1.5rem',
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
        marginTop: '10px',
        marginBottom: '10px',
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
        color: "#d4af37",
    }
};

export default Home;