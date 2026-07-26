import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import desertBg from '../../assets/desert_bg.png';

const CARD_TYPES = [
    { id: 'Item', label: '🎒 Item', color: '#e67e22' },
    { id: 'Event', label: '⚡ Event', color: '#e74c3c' },
    { id: 'Obstacle', label: '⛰️ Obstacle', color: '#7f8c8d' },
    { id: 'Tool', label: '🛠️ Tool', color: '#3498db' },
    { id: 'Mobility', label: '🐫 Mobility', color: '#f39c12' }
];

const CardGeneratorTab = () => {
    const [cardData, setCardData] = useState({
        title: 'Solar Bike',
        type: 'Mobility',
        weight: 3,
        monetaryValue: 8,
        description: 'Move 3 spaces in any direction. Reveals all 3 spaces. Adds +3 carrying capacity. Cooldown: 2 rounds (bypass with Battery).',
        imagePrompt: 'Futuristic solar powered dune motorbike in a vast sandy desert, dramatic sunset lighting, high detail illustration',
        imageUrl: ''
    });

    const [apiKey, setApiKey] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const cardRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCardData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGenerateImage = async () => {
        if (!cardData.imagePrompt) {
            alert("Please enter an image prompt.");
            return;
        }

        // Use free Pollinations AI by default if no Gemini API key provided
        if (!apiKey) {
            const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cardData.imagePrompt)}?width=400&height=400&nologo=true`;
            setCardData(prev => ({
                ...prev,
                imageUrl: fallbackUrl
            }));
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey,
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: cardData.imagePrompt }]
                    }],
                    generationConfig: {
                        responseModalities: ["TEXT", "IMAGE"]
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API Error ${response.status}`);
            }

            const data = await response.json();
            const candidates = data.candidates;
            if (candidates && candidates.length > 0) {
                const parts = candidates[0].content?.parts || [];
                const imagePart = parts.find(p => p.inlineData);
                if (imagePart) {
                    const { mimeType, data: base64Data } = imagePart.inlineData;
                    setCardData(prev => ({
                        ...prev,
                        imageUrl: `data:${mimeType};base64,${base64Data}`
                    }));
                }
            }
        } catch (error) {
            console.error("Gemini API error, falling back to Pollinations:", error);
            const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cardData.imagePrompt)}?width=400&height=400&nologo=true`;
            setCardData(prev => ({
                ...prev,
                imageUrl: fallbackUrl
            }));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async () => {
        if (!cardRef.current) return;
        try {
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                scale: 2,
                backgroundColor: null
            });
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `${cardData.title.replace(/\s+/g, '_') || 'desert_card'}.png`;
            link.click();
        } catch (error) {
            console.error("Download error:", error);
            alert("Could not export PNG. Make sure image CORS is enabled.");
        }
    };

    const selectedTypeObj = CARD_TYPES.find(t => t.id === cardData.type) || CARD_TYPES[0];

    return (
        <div className="card-generator-container">
            {/* Form Left Column */}
            <div className="card-form-panel">
                <h3 className="panel-title">🎴 Card Attributes</h3>

                <div className="form-group">
                    <label>Card Title</label>
                    <input
                        type="text"
                        name="title"
                        value={cardData.title}
                        onChange={handleChange}
                        placeholder="e.g. Solar Bike, Cactus, Thief"
                    />
                </div>

                <div className="form-group">
                    <label>Card Type</label>
                    <select name="type" value={cardData.type} onChange={handleChange}>
                        {CARD_TYPES.map(t => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                    </select>
                </div>

                <div className="form-row">
                    <div className="form-group half">
                        <label>Weight (🎒 wt)</label>
                        <input
                            type="number"
                            name="weight"
                            value={cardData.weight}
                            onChange={handleChange}
                            min="0"
                            max="10"
                        />
                    </div>
                    <div className="form-group half">
                        <label>Value (💰 Coins)</label>
                        <input
                            type="number"
                            name="monetaryValue"
                            value={cardData.monetaryValue}
                            onChange={handleChange}
                            min="0"
                            max="50"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Description / Rules Text</label>
                    <textarea
                        name="description"
                        value={cardData.description}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Describe card abilities, water costs, or game effects..."
                    />
                </div>

                <div className="form-group">
                    <label>Art Prompt</label>
                    <textarea
                        name="imagePrompt"
                        value={cardData.imagePrompt}
                        onChange={handleChange}
                        rows="2"
                        placeholder="Describe the card illustration..."
                    />
                </div>

                <div className="form-group">
                    <label>Gemini API Key (Optional for AI Art)</label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Leave blank to use free AI art generator"
                    />
                </div>

                <button
                    className="action-btn generate-art-btn"
                    onClick={handleGenerateImage}
                    disabled={isGenerating}
                >
                    {isGenerating ? '⏳ Generating Art...' : '🎨 Render Card Art'}
                </button>
            </div>

            {/* Live Template Right Column */}
            <div className="card-preview-panel">
                <h3 className="panel-title">👁️ Live Desert Card Preview</h3>

                <div className="card-stage">
                    <div
                        className="desert-card-template"
                        ref={cardRef}
                        style={{ backgroundImage: `url(${desertBg})` }}
                    >
                        {/* Header Badge */}
                        <div className="card-top-bar">
                            <span className="card-type-badge" style={{ backgroundColor: selectedTypeObj.color }}>
                                {selectedTypeObj.label}
                            </span>
                            <div className="card-stat-badges">
                                <span className="stat-badge weight-badge" title="Weight">
                                    🎒 {cardData.weight}
                                </span>
                                <span className="stat-badge money-badge" title="Monetary Value">
                                    💰 {cardData.monetaryValue}
                                </span>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="card-title-frame">
                            <h2 className="desert-card-title">{cardData.title || 'Untitled Card'}</h2>
                        </div>

                        {/* Art Frame */}
                        <div className="card-art-box">
                            {cardData.imageUrl ? (
                                <img src={cardData.imageUrl} alt={cardData.title} className="card-art-img" crossOrigin="anonymous" />
                            ) : (
                                <div className="card-art-placeholder-box">
                                    <span>🏜️ Desert Art Placeholder</span>
                                    <small>Click "Render Card Art" to generate</small>
                                </div>
                            )}
                        </div>

                        {/* Text / Effect Box */}
                        <div className="card-text-box">
                            <p className="card-effect-text">{cardData.description || 'No effect text specified.'}</p>
                        </div>

                        {/* Footer / Border Trim */}
                        <div className="card-footer-trim">
                            <span>Escape the Desert • Physical Edition</span>
                        </div>
                    </div>
                </div>

                <button className="action-btn download-png-btn" onClick={handleDownload}>
                    📥 Download Card as PNG
                </button>
            </div>
        </div>
    );
};

export default CardGeneratorTab;
