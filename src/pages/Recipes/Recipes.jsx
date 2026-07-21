import React, { useState, useEffect } from 'react';
import './recipes.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800';

const Recipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');
    const [dietFilter, setDietFilter] = useState('');

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/recipes`);
            if (!response.ok) {
                throw new Error('Failed to fetch recipes');
            }
            const data = await response.json();
            setRecipes(data);
            setError('');
        } catch (err) {
            console.error('Error fetching recipes:', err);
            setError('Could not load recipes. Please make sure the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    // Extract all unique dietary tags from all recipes for the filter dropdown
    const allDietaryTags = Array.from(
        new Set(recipes.flatMap(r => r.dietaryTags || []))
    );

    // Filter logic
    const filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (recipe.description && recipe.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (recipe.cuisine && recipe.cuisine.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (recipe.course && recipe.course.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesDifficulty = difficultyFilter === '' || 
            (recipe.difficulty && recipe.difficulty.toLowerCase() === difficultyFilter.toLowerCase());

        const matchesDiet = dietFilter === '' || 
            (recipe.dietaryTags && recipe.dietaryTags.some(tag => tag.toLowerCase() === dietFilter.toLowerCase()));

        return matchesSearch && matchesDifficulty && matchesDiet;
    });

    return (
        <div className="recipes-page">
            <header className="recipes-header">
                <h1 className="recipes-title">RECIPES REPOSITORY</h1>
                <p className="recipes-subtitle">Explore a curated collection of culinary formulas, detailed workflows, and nutritional specifications.</p>
            </header>

            {/* Filters Section */}
            <div className="recipes-filters">
                <div className="filter-group">
                    <label htmlFor="search">Search</label>
                    <input
                        id="search"
                        type="text"
                        placeholder="Search by title, cuisine, course..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <label htmlFor="difficulty">Difficulty</label>
                    <select
                        id="difficulty"
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                    >
                        <option value="">All Difficulties</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="diet">Dietary Preference</label>
                    <select
                        id="diet"
                        value={dietFilter}
                        onChange={(e) => setDietFilter(e.target.value)}
                    >
                        <option value="">All Diets</option>
                        {allDietaryTags.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
                    <div style={{ fontSize: '1.2rem', color: '#d4af37' }}>Loading culinary formulas...</div>
                </div>
            ) : error ? (
                <div className="empty-state">
                    <h3>⚠️ Error Connection</h3>
                    <p>{error}</p>
                    <button 
                        onClick={fetchRecipes} 
                        style={{
                            marginTop: '20px',
                            background: '#d4af37',
                            border: 'none',
                            color: '#000',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Retry
                    </button>
                </div>
            ) : filteredRecipes.length === 0 ? (
                <div className="empty-state">
                    <h3>No Recipes Found</h3>
                    <p>Try adjusting your search query or filters.</p>
                </div>
            ) : (
                <div className="recipes-grid">
                    {filteredRecipes.map(recipe => {
                        const coverUrl = recipe.media && recipe.media.coverImageUrl 
                            ? recipe.media.coverImageUrl 
                            : DEFAULT_COVER;

                        return (
                            <div 
                                key={recipe.id || recipe.recipeId} 
                                className="recipe-card"
                                onClick={() => setSelectedRecipe(recipe)}
                            >
                                <div className="recipe-card-image-wrapper">
                                    <img 
                                        src={coverUrl} 
                                        alt={recipe.title} 
                                        className="recipe-card-image"
                                        onError={(e) => { e.target.src = DEFAULT_COVER; }}
                                    />
                                    <div className="recipe-card-badge-container">
                                        {recipe.difficulty && (
                                            <span className={`difficulty-badge ${recipe.difficulty.toLowerCase()}`}>
                                                {recipe.difficulty}
                                            </span>
                                        )}
                                        {recipe.course && (
                                            <span className="course-badge">
                                                {recipe.course}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="recipe-card-content">
                                    <h3 className="recipe-card-title">{recipe.title}</h3>
                                    <p className="recipe-card-description">{recipe.description}</p>
                                    
                                    <div className="recipe-card-metrics">
                                        {recipe.prepTimeMinutes !== undefined && (
                                            <span className="recipe-card-metric">
                                                <span className="recipe-card-metric-icon">⏱</span> {recipe.prepTimeMinutes + (recipe.cookTimeMinutes || 0)}m
                                            </span>
                                        )}
                                        {recipe.servings !== undefined && (
                                            <span className="recipe-card-metric">
                                                <span className="recipe-card-metric-icon">👥</span> {recipe.servings} Servings
                                            </span>
                                        )}
                                        {recipe.cuisine && (
                                            <span className="recipe-card-metric">
                                                <span className="recipe-card-metric-icon">🍳</span> {recipe.cuisine}
                                            </span>
                                        )}
                                    </div>

                                    {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
                                        <div className="recipe-card-tags">
                                            {recipe.dietaryTags.map(tag => (
                                                <span key={tag} className="recipe-card-tag">{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Recipe Details Modal */}
            {selectedRecipe && (
                <RecipeModal 
                    recipe={selectedRecipe} 
                    onClose={() => setSelectedRecipe(null)} 
                />
            )}
        </div>
    );
};

const RecipeModal = ({ recipe, onClose }) => {
    // Prevent background scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const coverUrl = recipe.media && recipe.media.coverImageUrl 
        ? recipe.media.coverImageUrl 
        : DEFAULT_COVER;

    // Sort steps by stepNumber just to be safe
    const sortedSteps = recipe.preparationSteps 
        ? [...recipe.preparationSteps].sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0))
        : [];

    return (
        <div className="recipe-modal-overlay" onClick={onClose}>
            <div className="recipe-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="recipe-modal-close" onClick={onClose}>×</button>

                {/* Hero Header Banner */}
                <div 
                    className="recipe-modal-hero" 
                    style={{ backgroundImage: `url(${coverUrl})` }}
                >
                    <div className="recipe-modal-hero-overlay"></div>
                </div>

                {/* Body Details */}
                <div className="recipe-modal-body">
                    <div className="recipe-modal-header-info">
                        <div className="recipe-modal-meta-row">
                            {recipe.difficulty && (
                                <span className={`difficulty-badge ${recipe.difficulty.toLowerCase()}`}>
                                    {recipe.difficulty}
                                </span>
                            )}
                            {recipe.cuisine && <span className="course-badge">{recipe.cuisine}</span>}
                            {recipe.course && <span className="course-badge">{recipe.course}</span>}
                        </div>
                        
                        <h2 className="recipe-modal-title">{recipe.title}</h2>
                        
                        <div className="recipe-modal-meta-row" style={{ marginTop: '5px' }}>
                            {recipe.author && <span className="recipe-modal-author">Created by {recipe.author}</span>}
                            {recipe.prepTimeMinutes !== undefined && (
                                <span style={{ color: '#888', fontSize: '0.9rem' }}>
                                    • Prep: {recipe.prepTimeMinutes}m | Cook: {recipe.cookTimeMinutes || 0}m | Total: {recipe.totalTimeMinutes || (recipe.prepTimeMinutes + (recipe.cookTimeMinutes || 0))}m
                                </span>
                            )}
                        </div>

                        {recipe.media && recipe.media.videoTutorialUrl && (
                            <div style={{ marginTop: '15px' }}>
                                <a 
                                    href={recipe.media.videoTutorialUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="video-btn"
                                >
                                    <span>▶ Watch Video Tutorial</span>
                                </a>
                            </div>
                        )}
                    </div>

                    {recipe.description && (
                        <p className="recipe-modal-description">{recipe.description}</p>
                    )}

                    {/* Section Grid */}
                    <div className="recipe-modal-section-grid">
                        {/* Ingredients Column */}
                        <div>
                            <h3 className="recipe-modal-section-title">
                                <span className="recipe-modal-section-title-icon">🛒</span> Ingredients
                            </h3>
                            {recipe.ingredients && recipe.ingredients.length > 0 ? (
                                <table className="ingredients-table">
                                    <tbody>
                                        {recipe.ingredients.map((ing, index) => (
                                            <tr key={ing.ingredientId || index}>
                                                <td className="ingredient-name">
                                                    {ing.name}
                                                    {ing.preparationNotes && (
                                                        <span className="ingredient-notes">({ing.preparationNotes})</span>
                                                    )}
                                                </td>
                                                <td className="ingredient-quantity">
                                                    {ing.quantity !== undefined && ing.quantity !== 0 ? ing.quantity : ''} {ing.unit || ''}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p style={{ color: '#777' }}>No ingredients listed.</p>
                            )}
                        </div>

                        {/* Steps Column */}
                        <div>
                            <h3 className="recipe-modal-section-title">
                                <span className="recipe-modal-section-title-icon">🍳</span> Preparation Steps
                            </h3>
                            {sortedSteps.length > 0 ? (
                                <div className="recipe-steps-list">
                                    {sortedSteps.map((step, index) => (
                                        <div key={index} className="recipe-step-item">
                                            <div className="recipe-step-number">{step.stepNumber || (index + 1)}</div>
                                            <div className="recipe-step-body">
                                                <div className="recipe-step-instruction">{step.instruction}</div>
                                                <div className="recipe-step-meta">
                                                    {step.durationMinutes !== undefined && step.durationMinutes > 0 && (
                                                        <span>⏱ {step.durationMinutes}m</span>
                                                    )}
                                                    {step.temperature && (
                                                        <span>🔥 {step.temperature}</span>
                                                    )}
                                                    {step.mediaUrl && (
                                                        <a href={step.mediaUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#d4af37', textDecoration: 'none' }}>
                                                            🖼 View Image
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#777' }}>No preparation steps listed.</p>
                            )}
                        </div>
                    </div>

                    {/* Footer Info (Equipment & Nutrition) */}
                    <div style={{ borderTop: '1px solid #222', paddingTop: '30px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {recipe.equipment && recipe.equipment.length > 0 && (
                                <div>
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#fff' }}>Required Equipment</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {recipe.equipment.map(eq => (
                                            <span key={eq} style={{ background: '#222', color: '#ccc', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>
                                                🛠 {eq}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {recipe.nutrition && (
                                <div>
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#fff' }}>Nutritional Facts <span style={{ fontSize: '0.8rem', color: '#888' }}>(Per Serving)</span></h4>
                                    <div className="nutrition-grid">
                                        <div className="nutrition-item">
                                            <span className="nutrition-val">{recipe.nutrition.calories || 0}</span>
                                            <span className="nutrition-label">Calories</span>
                                        </div>
                                        <div className="nutrition-item">
                                            <span className="nutrition-val">{recipe.nutrition.carbohydrates || 0}g</span>
                                            <span className="nutrition-label">Carbs</span>
                                        </div>
                                        <div className="nutrition-item">
                                            <span className="nutrition-val">{recipe.nutrition.protein || 0}g</span>
                                            <span className="nutrition-label">Protein</span>
                                        </div>
                                        <div className="nutrition-item">
                                            <span className="nutrition-val">{recipe.nutrition.fat || 0}g</span>
                                            <span className="nutrition-label">Fat</span>
                                        </div>
                                        <div className="nutrition-item">
                                            <span className="nutrition-val">{recipe.nutrition.sodium || 0}mg</span>
                                            <span className="nutrition-label">Sodium</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Recipes;
