import React from 'react';
import { Link } from 'react-router-dom';
import './home.css';
import scrumLogo from '../../assets/agentic_ai_scrum_logo.png';
import gccAppLogo from '../../assets/GCC_App_Logo.png';
import sixtyHourLogo from '../../assets/SixtyHour_Logo.png';

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

                <div className="project-grid">
                    <ProjectCard
                        title="Agentic AI Scrum Board"
                        icon={scrumLogo}
                        iconColor="#d4af37"
                        description="AI agents in Antigravity can create and assign tasks on the scrum board, execute them by writing code and then update status automatically. Works across multiple projects simultaneously."
                        tag="Antigravity / React / Spring Boot / MongoDB"
                        link="/scrum"
                    />
                    <ProjectCard
                        title="Global Coin Collections"
                        icon={gccAppLogo}
                        iconColor="#d4af37"
                        description="Built, as a solo developer, a zero-cost, serverless inventory system coupled with a customer-facing e-commerce Android app to showcase the inventory for sale with frugal API calls using Firestore DB and Node.js Cloud Functions as admin scripts."
                        tag="Android / Firebase"
                        link="https://play.google.com/store/apps/details?id=com.thadaladi.globalcoincollections"
                    />
                    <ProjectCard
                        title="The 24-Minute Hour"
                        icon={sixtyHourLogo}
                        iconColor="#d4af37"
                        description="A web-based custom time system featuring 24-minute hours & 60-hour days. Built with React and themed with Matrix/Cyberpunk aesthetics."
                        tag="React"
                        link="/clock"
                    />
                </div>
            </section>
            {/* 4. FOOTER / SOURCE CODE */}
            <footer style={styles.footer}>
                <svg
                    height="24"
                    viewBox="0 0 16 16"
                    version="1.1"
                    width="24"
                    aria-hidden="true"
                    fill="#888"
                    style={{ marginRight: '10px' }}
                >
                    <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                </svg>
                <span>
                    Source Code available at - {' '}
                    <a
                        href="https://github.com/Sharath-Prabakar/sharath-prabakar.github.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.footerLink}
                    >
                        https://github.com/Sharath-Prabakar/sharath-prabakar.github.io
                    </a>
                </span>
            </footer>
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
    const imageStyle = {
        display: 'flex',
        objectFit: 'fill',
        width: '40px',
        height: '40px',
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
                <img
                    src={icon}
                    alt="App Logo"
                    style={imageStyle}
                />
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
        marginBottom: '10px',
    },
    grid: {
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
        marginBottom: '10px',
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
    },
    footer: {
        marginTop: '60px',
        paddingTop: '20px',
        borderTop: '1px solid #333',
        width: '100%',
        maxWidth: '1000px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        fontSize: '0.85rem',
        textAlign: 'center',
        flexWrap: 'wrap',
    },
    footerLink: {
        color: '#888',
        textDecoration: 'none',
        transition: 'color 0.2s ease',
        borderBottom: '1px solid transparent'
    },
};

export default Home;