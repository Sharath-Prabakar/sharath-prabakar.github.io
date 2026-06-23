import React, { useState } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddRecipeModal = ({ isOpen, onClose }) => {
    const userFullName = localStorage.getItem('userFullName') || 'System';
    const [recipeActiveTab, setRecipeActiveTab] = useState('general');
    const [recipeFormData, setRecipeFormData] = useState({
        title: '', description: '', author: '', coverImageUrl: '', videoTutorialUrl: '',
        prepTimeMinutes: '', cookTimeMinutes: '', totalTimeMinutes: '', servings: '',
        yieldQuantity: '', yieldUnit: '', difficulty: 'Easy', dietaryTags: '',
        keywords: '', cuisine: '', course: '', equipment: '', ingredients: [],
        preparationSteps: [], calories: '', carbohydrates: '', protein: '', fat: '', sodium: ''
    });
    const [newIng, setNewIng] = useState({ name: '', quantity: '', unit: '', preparationNotes: '' });
    const [newStep, setNewStep] = useState({ instruction: '', durationMinutes: '', temperature: '', mediaUrl: '' });
    const [recipeLoading, setRecipeLoading] = useState(false);
    const [recipeError, setRecipeError] = useState('');
    const [recipeSuccess, setRecipeSuccess] = useState('');

    if (!isOpen) return null;

    const addIngredient = () => {
        if (!newIng.name.trim()) return;
        setRecipeFormData(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, { ...newIng, id: 'ing_' + Date.now() }]
        }));
        setNewIng({ name: '', quantity: '', unit: '', preparationNotes: '' });
    };

    const removeIngredient = (id) => {
        setRecipeFormData(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter(ing => ing.id !== id)
        }));
    };

    const addStep = () => {
        if (!newStep.instruction.trim()) return;
        setRecipeFormData(prev => ({
            ...prev,
            preparationSteps: [...prev.preparationSteps, { ...newStep, id: 'step_' + Date.now() }]
        }));
        setNewStep({ instruction: '', durationMinutes: '', temperature: '', mediaUrl: '' });
    };

    const removeStep = (id) => {
        setRecipeFormData(prev => ({
            ...prev,
            preparationSteps: prev.preparationSteps.filter(step => step.id !== id)
        }));
    };

    const handleRecipeSubmit = async (e) => {
        e.preventDefault();
        setRecipeLoading(true);
        setRecipeError('');
        setRecipeSuccess('');

        if (!recipeFormData.title.trim()) {
            setRecipeError('Title is required');
            setRecipeLoading(false); return;
        }
        if (!recipeFormData.servings) {
            setRecipeError('Servings is required');
            setRecipeLoading(false); return;
        }
        if (recipeFormData.ingredients.length === 0) {
            setRecipeError('At least one ingredient is required');
            setRecipeLoading(false); return;
        }
        if (recipeFormData.preparationSteps.length === 0) {
            setRecipeError('At least one preparation step is required');
            setRecipeLoading(false); return;
        }

        const formattedRecipe = {
            title: recipeFormData.title.trim(),
            description: recipeFormData.description.trim(),
            author: recipeFormData.author.trim() || userFullName,
            media: {
                coverImageUrl: recipeFormData.coverImageUrl.trim(),
                videoTutorialUrl: recipeFormData.videoTutorialUrl.trim()
            },
            prepTimeMinutes: recipeFormData.prepTimeMinutes ? parseInt(recipeFormData.prepTimeMinutes) : null,
            cookTimeMinutes: recipeFormData.cookTimeMinutes ? parseInt(recipeFormData.cookTimeMinutes) : null,
            totalTimeMinutes: recipeFormData.totalTimeMinutes ? parseInt(recipeFormData.totalTimeMinutes) : null,
            servings: parseInt(recipeFormData.servings),
            yieldQuantity: recipeFormData.yieldQuantity ? parseFloat(recipeFormData.yieldQuantity) : null,
            yieldUnit: recipeFormData.yieldUnit.trim(),
            difficulty: recipeFormData.difficulty,
            dietaryTags: recipeFormData.dietaryTags ? recipeFormData.dietaryTags.split(',').map(s => s.trim()).filter(Boolean) : [],
            keywords: recipeFormData.keywords ? recipeFormData.keywords.split(',').map(s => s.trim()).filter(Boolean) : [],
            cuisine: recipeFormData.cuisine.trim(),
            course: recipeFormData.course.trim(),
            equipment: recipeFormData.equipment ? recipeFormData.equipment.split(',').map(s => s.trim()).filter(Boolean) : [],
            ingredients: recipeFormData.ingredients.map((ing, index) => ({
                ingredientId: ing.id || `ing_${index}`,
                name: ing.name.trim(),
                quantity: ing.quantity ? parseFloat(ing.quantity) : null,
                unit: ing.unit.trim(),
                preparationNotes: ing.preparationNotes.trim() || null
            })),
            preparationSteps: recipeFormData.preparationSteps.map((step, index) => ({
                stepNumber: index + 1,
                instruction: step.instruction.trim(),
                durationMinutes: step.durationMinutes ? parseInt(step.durationMinutes) : null,
                temperature: step.temperature.trim() || null,
                mediaUrl: step.mediaUrl.trim() || null
            })),
            nutrition: {
                calories: recipeFormData.calories ? parseInt(recipeFormData.calories) : null,
                carbohydrates: recipeFormData.carbohydrates ? parseInt(recipeFormData.carbohydrates) : null,
                protein: recipeFormData.protein ? parseInt(recipeFormData.protein) : null,
                fat: recipeFormData.fat ? parseInt(recipeFormData.fat) : null,
                sodium: recipeFormData.sodium ? parseInt(recipeFormData.sodium) : null
            }
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/recipes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formattedRecipe)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create recipe');
            }

            setRecipeSuccess('Recipe created successfully!');
            setTimeout(() => {
                setRecipeSuccess('');
                setRecipeFormData({
                    title: '', description: '', author: '', coverImageUrl: '', videoTutorialUrl: '',
                    prepTimeMinutes: '', cookTimeMinutes: '', totalTimeMinutes: '', servings: '',
                    yieldQuantity: '', yieldUnit: '', difficulty: 'Easy', dietaryTags: '',
                    keywords: '', cuisine: '', course: '', equipment: '', ingredients: [],
                    preparationSteps: [], calories: '', carbohydrates: '', protein: '', fat: '', sodium: ''
                });
                setRecipeActiveTab('general');
                onClose();
            }, 1500);
        } catch (err) {
            setRecipeError(err.message || 'Failed to create recipe');
        } finally {
            setRecipeLoading(false);
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                <button className="close-btn" onClick={onClose}>×</button>
                <h2>New Recipe Details</h2>

                {recipeError && <div className="error-message">{recipeError}</div>}
                {recipeSuccess && <div className="success-message">{recipeSuccess}</div>}

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '10px', flexWrap: 'wrap' }}>
                    {['general', 'metrics', 'ingredients', 'steps', 'nutrition'].map(tab => (
                        <button key={tab} type="button" onClick={() => setRecipeActiveTab(tab)}
                            style={{
                                background: recipeActiveTab === tab ? 'linear-gradient(90deg, #d4af37, #f1c40f)' : 'transparent',
                                color: recipeActiveTab === tab ? '#000' : '#888',
                                border: recipeActiveTab === tab ? 'none' : '1px solid #222',
                                padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
                                fontWeight: '600', textTransform: 'uppercase', fontSize: '0.8rem'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleRecipeSubmit}>
                    {recipeActiveTab === 'general' && (
                        <div>
                            <div className="form-group">
                                <label>Recipe Title *</label>
                                <input type="text" value={recipeFormData.title} onChange={(e) => setRecipeFormData({ ...recipeFormData, title: e.target.value })} required placeholder="e.g. Classic Margherita Pizza" />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea value={recipeFormData.description} onChange={(e) => setRecipeFormData({ ...recipeFormData, description: e.target.value })} placeholder="Enter recipe description" rows="3" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Author / Chef</label>
                                    <input type="text" value={recipeFormData.author} onChange={(e) => setRecipeFormData({ ...recipeFormData, author: e.target.value })} placeholder={userFullName} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Cover Image URL</label>
                                <input type="url" value={recipeFormData.coverImageUrl} onChange={(e) => setRecipeFormData({ ...recipeFormData, coverImageUrl: e.target.value })} placeholder="https://example.com/pizza.jpg" />
                            </div>
                            <div className="form-group">
                                <label>Video Tutorial URL</label>
                                <input type="url" value={recipeFormData.videoTutorialUrl} onChange={(e) => setRecipeFormData({ ...recipeFormData, videoTutorialUrl: e.target.value })} placeholder="https://youtube.com/..." />
                            </div>
                        </div>
                    )}
                    {recipeActiveTab === 'metrics' && (
                        <div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Prep Time (Minutes)</label>
                                    <input type="number" value={recipeFormData.prepTimeMinutes} onChange={(e) => setRecipeFormData({ ...recipeFormData, prepTimeMinutes: e.target.value })} placeholder="20" />
                                </div>
                                <div className="form-group">
                                    <label>Cook Time (Minutes)</label>
                                    <input type="number" value={recipeFormData.cookTimeMinutes} onChange={(e) => setRecipeFormData({ ...recipeFormData, cookTimeMinutes: e.target.value })} placeholder="10" />
                                </div>
                                <div className="form-group">
                                    <label>Total Time (Minutes)</label>
                                    <input type="number" value={recipeFormData.totalTimeMinutes} onChange={(e) => setRecipeFormData({ ...recipeFormData, totalTimeMinutes: e.target.value })} placeholder="30" />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Servings *</label>
                                    <input type="number" value={recipeFormData.servings} onChange={(e) => setRecipeFormData({ ...recipeFormData, servings: e.target.value })} required placeholder="2" />
                                </div>
                                <div className="form-group">
                                    <label>Yield Quantity</label>
                                    <input type="number" step="any" value={recipeFormData.yieldQuantity} onChange={(e) => setRecipeFormData({ ...recipeFormData, yieldQuantity: e.target.value })} placeholder="1" />
                                </div>
                                <div className="form-group">
                                    <label>Yield Unit</label>
                                    <input type="text" value={recipeFormData.yieldUnit} onChange={(e) => setRecipeFormData({ ...recipeFormData, yieldUnit: e.target.value })} placeholder="Pizza" />
                                </div>
                                <div className="form-group">
                                    <label>Difficulty</label>
                                    <select value={recipeFormData.difficulty} onChange={(e) => setRecipeFormData({ ...recipeFormData, difficulty: e.target.value })}>
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Cuisine</label>
                                    <input type="text" value={recipeFormData.cuisine} onChange={(e) => setRecipeFormData({ ...recipeFormData, cuisine: e.target.value })} placeholder="Italian" />
                                </div>
                                <div className="form-group">
                                    <label>Course</label>
                                    <input type="text" value={recipeFormData.course} onChange={(e) => setRecipeFormData({ ...recipeFormData, course: e.target.value })} placeholder="Main Course" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Dietary Tags (Comma-separated)</label>
                                <input type="text" value={recipeFormData.dietaryTags} onChange={(e) => setRecipeFormData({ ...recipeFormData, dietaryTags: e.target.value })} placeholder="Vegetarian, Gluten-Free" />
                            </div>

                            <div className="form-group">
                                <label>Keywords (Comma-separated)</label>
                                <input type="text" value={recipeFormData.keywords} onChange={(e) => setRecipeFormData({ ...recipeFormData, keywords: e.target.value })} placeholder="Pizza, Italian, Baking, Cheese" />
                            </div>

                            <div className="form-group">
                                <label>Required Equipment (Comma-separated)</label>
                                <input type="text" value={recipeFormData.equipment} onChange={(e) => setRecipeFormData({ ...recipeFormData, equipment: e.target.value })} placeholder="Pizza Stone, Oven, Pizza Cutter" />
                            </div>
                        </div>
                    )}
                    {recipeActiveTab === 'ingredients' && (
                        <div>
                            <label>Ingredients List * ({recipeFormData.ingredients.length} added)</label>
                            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '15px', border: '1px solid #222', borderRadius: '8px', padding: '10px' }}>
                                {recipeFormData.ingredients.length === 0 ? (
                                    <p style={{ color: '#777', fontSize: '0.9rem', margin: 0 }}>No ingredients added yet. Use the fields below to add ingredients.</p>
                                ) : (
                                    recipeFormData.ingredients.map(ing => (
                                        <div key={ing.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #1a1a1a' }}>
                                            <span style={{ fontSize: '0.9rem' }}>
                                                <strong>{ing.name}</strong> {ing.quantity ? `(${ing.quantity} ${ing.unit || ''})` : ''} {ing.preparationNotes ? `- ${ing.preparationNotes}` : ''}
                                            </span>
                                            <button type="button" onClick={() => removeIngredient(ing.id)} style={{ background: 'transparent', border: 'none', color: '#ff4757', cursor: 'pointer', fontSize: '1rem' }}>🗑</button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '8px', border: '1px solid #222' }}>
                                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#fff' }}>Add New Ingredient</h4>
                                <div className="form-row">
                                    <div className="form-group" style={{ flex: 2 }}>
                                        <label style={{ fontSize: '0.75rem' }}>Name *</label>
                                        <input type="text" value={newIng.name} onChange={(e) => setNewIng({ ...newIng, name: e.target.value })} placeholder="Pizza Dough" />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.75rem' }}>Qty</label>
                                        <input type="number" step="any" value={newIng.quantity} onChange={(e) => setNewIng({ ...newIng, quantity: e.target.value })} placeholder="250" />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.75rem' }}>Unit</label>
                                        <input type="text" value={newIng.unit} onChange={(e) => setNewIng({ ...newIng, unit: e.target.value })} placeholder="grams" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.75rem' }}>Preparation Notes</label>
                                    <input type="text" value={newIng.preparationNotes} onChange={(e) => setNewIng({ ...newIng, preparationNotes: e.target.value })} placeholder="rolled out (optional)" />
                                </div>
                                <button type="button" onClick={addIngredient} style={{ background: '#222', border: '1px solid #d4af37', color: '#d4af37', padding: '8px 16px', fontSize: '0.9rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>+ Add to List</button>
                            </div>
                        </div>
                    )}
                    {recipeActiveTab === 'steps' && (
                        <div>
                            <label>Preparation Steps * ({recipeFormData.preparationSteps.length} added)</label>
                            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '15px', border: '1px solid #222', borderRadius: '8px', padding: '10px' }}>
                                {recipeFormData.preparationSteps.length === 0 ? (
                                    <p style={{ color: '#777', fontSize: '0.9rem', margin: 0 }}>No steps added yet. Use the fields below to add steps.</p>
                                ) : (
                                    recipeFormData.preparationSteps.map((step, idx) => (
                                        <div key={step.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid #1a1a1a' }}>
                                            <span style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                                                <strong>Step {idx + 1}:</strong> {step.instruction} {step.durationMinutes ? `(${step.durationMinutes} mins)` : ''} {step.temperature ? `[${step.temperature}]` : ''}
                                            </span>
                                            <button type="button" onClick={() => removeStep(step.id)} style={{ background: 'transparent', border: 'none', color: '#ff4757', cursor: 'pointer', fontSize: '1rem', marginLeft: '10px' }}>🗑</button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '8px', border: '1px solid #222' }}>
                                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#fff' }}>Add New Step</h4>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.75rem' }}>Instruction *</label>
                                    <textarea value={newStep.instruction} onChange={(e) => setNewStep({ ...newStep, instruction: e.target.value })} placeholder="Preheat your oven with the pizza stone inside..." rows="2" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.75rem' }}>Duration (Minutes)</label>
                                        <input type="number" value={newStep.durationMinutes} onChange={(e) => setNewStep({ ...newStep, durationMinutes: e.target.value })} placeholder="30" />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.75rem' }}>Temperature</label>
                                        <input type="text" value={newStep.temperature} onChange={(e) => setNewStep({ ...newStep, temperature: e.target.value })} placeholder="250°C" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.75rem' }}>Step Media URL</label>
                                    <input type="url" value={newStep.mediaUrl} onChange={(e) => setNewStep({ ...newStep, mediaUrl: e.target.value })} placeholder="https://example.com/step1.jpg" />
                                </div>
                                <button type="button" onClick={addStep} style={{ background: '#222', border: '1px solid #d4af37', color: '#d4af37', padding: '8px 16px', fontSize: '0.9rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>+ Add to List</button>
                            </div>
                        </div>
                    )}
                    {recipeActiveTab === 'nutrition' && (
                        <div>
                            <div className="form-row">
                                <div className="form-group"><label>Calories</label><input type="number" value={recipeFormData.calories} onChange={(e) => setRecipeFormData({ ...recipeFormData, calories: e.target.value })} placeholder="550" /></div>
                                <div className="form-group"><label>Carbohydrates (g)</label><input type="number" value={recipeFormData.carbohydrates} onChange={(e) => setRecipeFormData({ ...recipeFormData, carbohydrates: e.target.value })} placeholder="75" /></div>
                                <div className="form-group"><label>Protein (g)</label><input type="number" value={recipeFormData.protein} onChange={(e) => setRecipeFormData({ ...recipeFormData, protein: e.target.value })} placeholder="22" /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Fat (g)</label><input type="number" value={recipeFormData.fat} onChange={(e) => setRecipeFormData({ ...recipeFormData, fat: e.target.value })} placeholder="18" /></div>
                                <div className="form-group"><label>Sodium (mg)</label><input type="number" value={recipeFormData.sodium} onChange={(e) => setRecipeFormData({ ...recipeFormData, sodium: e.target.value })} placeholder="980" /></div>
                            </div>
                            <button type="submit" className="submit-btn" disabled={recipeLoading} style={{ marginTop: '30px' }}>{recipeLoading ? 'Creating Recipe...' : 'Create Recipe'}</button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AddRecipeModal;
