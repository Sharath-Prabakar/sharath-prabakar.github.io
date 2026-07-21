import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import './CardGenerator.css';
import desertBg from '../../assets/desert_bg.png';

const CardGenerator = () => {
    const [cardData, setCardData] = useState({
        title: 'Desert Nomad',
        subtitle: 'Scout',
        imagePrompt: 'A swift desert nomad scout, standing on a sand dune, wearing weathered robes and holding a wooden staff, fantasy illustration, highly detailed, dramatic lighting',
        imageUrl: '', // This will hold the generated image data/url
        description: 'A swift wanderer of the dunes, unburdened by heavy gear.',
        costBag: '1',
        costGold: '2',
        ability1: 'Discard 1 [water] -> Gain 2 [gold]',
        ability2: 'Pay 1 [gold] -> Increase [bag] by 1'
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
        if (!apiKey) {
            alert("Please enter your Gemini API Key first.");
            return;
        }
        if (!cardData.imagePrompt) {
            alert("Please enter an image prompt.");
            return;
        }

        setIsGenerating(true);
        try {
            // Using Gemini native image generation (Nano Banana)
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey,
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: cardData.imagePrompt
                        }]
                    }],
                    generationConfig: {
                        responseModalities: ["TEXT", "IMAGE"]
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Error: ${response.status} - ${errorData?.error?.message || response.statusText}`);
            }

            const data = await response.json();
            
            // Extract inline image data from the response
            const candidates = data.candidates;
            if (candidates && candidates.length > 0) {
                const parts = candidates[0].content?.parts || [];
                const imagePart = parts.find(p => p.inlineData);
                
                if (imagePart) {
                    const { mimeType, data: base64Data } = imagePart.inlineData;
                    const imageSrc = `data:${mimeType};base64,${base64Data}`;
                    
                    setCardData(prev => ({
                        ...prev,
                        imageUrl: imageSrc
                    }));
                } else {
                    alert("The model returned text but no image. Try rephrasing your prompt.");
                }
            } else {
                alert("No response was returned from the API.");
            }
        } catch (error) {
            console.error("Image generation failed:", error);
            alert("Failed to generate image. Please check your API key and console logs for details.");
            
            // Fallback for demonstration if API fails (Pollinations AI - free, no key needed)
            // Uncomment the lines below to use a free fallback if you don't have a valid Gemini Imagen key
            /*
            const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cardData.imagePrompt)}?width=400&height=400&nologo=true`;
            setCardData(prev => ({
                ...prev,
                imageUrl: fallbackUrl
            }));
            */
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
            link.download = `${cardData.title.replace(/\s+/g, '_') || 'boardgame_card'}.png`;
            link.click();
        } catch (error) {
            console.error("Error downloading image:", error);
            alert("Failed to download image. Make sure image URLs support CORS.");
        }
    };

    const renderTextWithIcons = (text) => {
        if (!text) return null;
        const parts = text.split(/(\[[a-zA-Z]+\]|->)/g);
        
        return parts.map((part, index) => {
            const lowerPart = part.toLowerCase();
            if (lowerPart === '[gold]') {
                return <span key={index} className="icon-resource icon-gold" title="Gold"></span>;
            } else if (lowerPart === '[water]') {
                return <span key={index} className="icon-resource icon-water" title="Water"></span>;
            } else if (lowerPart === '[bag]') {
                return <span key={index} className="icon-resource icon-bag" title="Carrying Capacity"></span>;
            } else if (part === '->') {
                return <span key={index} className="icon-arrow">➔</span>;
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <div className="card-generator-page">
            <header className="hero-section">
                <h1 className="hero-title">DESERT CARD GENERATOR</h1>
                <p className="hero-bio">Design custom cards for your desert-themed game.</p>
            </header>

            <div className="generator-layout">
                {/* Left Side: Form Controls */}
                <div className="generator-controls">
                    <h2>Card Details</h2>

                    <div className="form-group api-key-group">
                        <label>Gemini API Key</label>
                        <input 
                            type="password" 
                            value={apiKey} 
                            onChange={(e) => setApiKey(e.target.value)} 
                            placeholder="Enter API key for image generation" 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Card Title</label>
                        <input 
                            type="text" 
                            name="title" 
                            value={cardData.title} 
                            onChange={handleChange} 
                        />
                    </div>

                    <div className="form-group">
                        <label>Class / Subtitle</label>
                        <input 
                            type="text" 
                            name="subtitle" 
                            value={cardData.subtitle} 
                            onChange={handleChange} 
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group half">
                            <label>Bag Cost</label>
                            <input 
                                type="number" 
                                name="costBag" 
                                value={cardData.costBag} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div className="form-group half">
                            <label>Gold Cost</label>
                            <input 
                                type="number" 
                                name="costGold" 
                                value={cardData.costGold} 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Image Prompt</label>
                        <p className="help-text">Describe the character or item for the card art.</p>
                        <textarea 
                            name="imagePrompt" 
                            value={cardData.imagePrompt} 
                            onChange={handleChange} 
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description / Flavor Text</label>
                        <textarea 
                            name="description" 
                            value={cardData.description} 
                            onChange={handleChange} 
                            rows="2"
                        />
                    </div>

                    <div className="form-group">
                        <label>Ability 1</label>
                        <input 
                            type="text" 
                            name="ability1" 
                            value={cardData.ability1} 
                            onChange={handleChange} 
                        />
                    </div>

                    <div className="form-group">
                        <label>Ability 2</label>
                        <input 
                            type="text" 
                            name="ability2" 
                            value={cardData.ability2} 
                            onChange={handleChange} 
                        />
                    </div>
                </div>

                {/* Right Side: Live Card Preview & Download */}
                <div className="generator-preview-container">
                    <div className="generator-preview">
                        <div 
                            className="card-wrapper" 
                            ref={cardRef}
                            style={{ backgroundImage: `url(${desertBg})` }}
                        >
                            <div className="card-costs">
                                {cardData.costBag && (
                                    <div className="cost-item">
                                        <span className="icon-resource icon-bag"></span>
                                        <span className="cost-value">{cardData.costBag}</span>
                                    </div>
                                )}
                                {cardData.costGold && (
                                    <div className="cost-item">
                                        <span className="icon-resource icon-gold"></span>
                                        <span className="cost-value">{cardData.costGold}</span>
                                    </div>
                                )}
                            </div>

                            <div className="card-header">
                                <h3 className="card-title">{cardData.title || 'Title'}</h3>
                                <div className="card-subtitle-wrapper">
                                    <span className="card-subtitle">{cardData.subtitle || 'Class'}</span>
                                </div>
                            </div>

                            <div className="card-art-frame">
                                {cardData.imageUrl ? (
                                    <img crossOrigin="anonymous" src={cardData.imageUrl} alt="Card Art" className="card-art-image" />
                                ) : (
                                    <div className="card-art-placeholder">
                                        <span>Art Area</span>
                                    </div>
                                )}
                                
                                {/* Overlay Generate Button */}
                                <div className="generate-btn-overlay">
                                    <button 
                                        className="generate-img-btn" 
                                        onClick={handleGenerateImage}
                                        disabled={isGenerating}
                                    >
                                        {isGenerating ? '⏳ Generating...' : '✨ Generate Art'}
                                    </button>
                                </div>
                            </div>

                            {cardData.description && (
                                <div className="card-description">
                                    <p>{cardData.description}</p>
                                </div>
                            )}

                            <div className="card-abilities">
                                {cardData.ability1 && (
                                    <div className="ability-row">
                                        {renderTextWithIcons(cardData.ability1)}
                                    </div>
                                )}
                                {cardData.ability1 && cardData.ability2 && <div className="ability-divider"></div>}
                                {cardData.ability2 && (
                                    <div className="ability-row">
                                        {renderTextWithIcons(cardData.ability2)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <button className="download-btn" onClick={handleDownload}>
                        📥 Download Card Image
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CardGenerator;
