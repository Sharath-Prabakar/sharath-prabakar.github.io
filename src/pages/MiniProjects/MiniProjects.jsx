import React from 'react';
import { Link } from 'react-router-dom';
import './MiniProjects.css';
import sixtyHourLogo from '../../assets/SixtyHour_Logo.png';
import snakeLogo from '../../assets/snake_game_logo.png';
import bookclubLogo from '../../assets/bookclub_logo.png';
import recipeLogo from '../../assets/recipe_logo.png';
import pallanguzhiLogo from '../../assets/pallanguzhi_logo.jpg';
import entertainmentLogo from '../../assets/literature_logo.jpg';
import habitStackerLogo from '../../assets/habit_stacker_logo.jpg';

const MiniProjects = () => {
    const projects = [
        {
            id: 'habit-stacker',
            title: 'Habit Stacker',
            description: 'Build and track daily, weekly, and monthly habits on a visual calendar with streaks, heat maps, and completion stats.',
            icon: habitStackerLogo,
            path: '/habit-stacker',
            tags: ['React', 'Tracker']
        },
        {
            id: 'my-entertainment',
            title: 'My Entertainment',
            description: 'Track and manage your watched TV series, anime, movies, and books. Rate, review, and keep track of episode progress.',
            icon: entertainmentLogo,
            path: '/my-entertainment',
            tags: ['React', 'Spring Boot']
        },
        {
            id: 'recipes',
            title: 'Recipes Repository',
            description: 'A comprehensive recipe management system featuring detailed preparation steps, nested ingredients, dietary classifications, and nutritional information.',
            icon: recipeLogo,
            path: '/recipes',
            tags: ['React', 'Spring Boot', 'MongoDB']
        },
        {
            id: 'bookclub',
            title: 'Goodreads Book Club',
            description: 'Paste a Goodreads profile URL to discover overlapping "Want to Read" books among your friends. Find your next group read instantly!',
            icon: bookclubLogo,
            path: '/bookclub',
            tags: ['React', 'Spring Boot']
        },
        {
            id: 'snake',
            title: 'Classic Snake Game',
            description: 'A nostalgic retro snake game built with React. Navigate the grid, eat the apples, and beat your high score without hitting the walls!',
            icon: snakeLogo,
            path: '/snake',
            tags: ['React']
        },
        {
            id: 'clock',
            title: 'The 24-Minute Hour',
            description: 'A web-based custom time system featuring 24-minute hours & 60-hour days. Built with React and themed with Matrix/Cyberpunk aesthetics.',
            icon: sixtyHourLogo,
            path: '/clock',
            tags: ['React']
        },
        {
            id: 'pallanguzhi',
            title: 'Pallanguzhi Analysis',
            description: 'A mathematical exploration of opening moves and strategy in the traditional Tamil mancala game.',
            icon: pallanguzhiLogo,
            path: '/pallanguzhi',
            tags: ['React', 'Analysis']
        }
    ];

    return (
        <div style={styles.container}>
            <header style={styles.hero}>
                <h1 style={styles.name}>MINI PROJECTS</h1>
                <p style={styles.bio}>Small experiments, fun games, and creative code snippets.</p>
            </header>

            <section style={styles.projectSection}>
                <div className="project-grid">
                    {projects.map(project => (
                        <ProjectCard
                            key={project.id}
                            title={project.title}
                            icon={project.icon}
                            description={project.description}
                            tag={project.tags.join(' / ')}
                            link={project.path}
                            iconColor="#d4af37"
                        />
                    ))}
                </div>
            </section>
        </div>
    );
};

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
        position: 'relative',
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
        color: isHovered ? iconColor : '#444',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateX(5px)' : 'translateX(0)',
        opacity: isHovered ? 1 : 0.6
    };

    const isExternal = link.startsWith('http');
    const CardContent = (
        <>
            <div style={headerStyle}>
                <img src={icon} alt="" style={imageStyle} />
                <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: '700' }}>{title}</h2>
            </div>
            <p style={{ fontSize: '0.95rem', color: '#888', lineHeight: '1.5', margin: 0 }}>
                {description}
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                <span style={{ fontSize: '0.8rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {tag}
                </span>
            </div>
            <div style={arrowStyle}>
                {isExternal ? '↗' : '→'}
            </div>
        </>
    );

    return isExternal ? (
        <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={cardStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {CardContent}
        </a>
    ) : (
        <Link
            to={link}
            style={cardStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {CardContent}
        </Link>
    );
};

const styles = {
    container: {
        backgroundColor: '#050505',
        color: '#e0e0e0',
        minHeight: '100vh',
        padding: '120px 20px 60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: '"Inter", sans-serif',
    },
    hero: {
        maxWidth: '800px',
        textAlign: 'center',
        marginBottom: '40px',
    },
    name: {
        fontSize: 'clamp(2rem, 8vw, 3.5rem)',
        letterSpacing: '5px',
        textAlign: 'center',
        color: '#fff',
        marginBottom: '10px',
    },
    bio: {
        fontSize: '1.2rem',
        lineHeight: '1.6',
        color: '#bbb',
    },
    projectSection: {
        width: '90%',
        maxWidth: '1000px',
    },
    tag: {
        fontSize: '0.7rem',
        backgroundColor: '#222',
        padding: '3px 8px',
        borderRadius: '4px',
        color: '#888',
    },
};

export default MiniProjects;
