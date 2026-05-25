import React from 'react';
import PaintingCanvas from '../../components/PaintingCanvas/PaintingCanvas';
import './PaintingCanvasPage.css';

const PaintingCanvasPage = () => {
    return (
        <div className="canvas-page-container">
            <header className="canvas-page-header">
                <h1 className="canvas-page-title">PAINTING CANVAS</h1>
                <p className="canvas-page-tagline">Unleash your creativity inside Digital Zen</p>
            </header>

            <div className="canvas-game-card">
                <div className="canvas-game-container">
                    <PaintingCanvas />
                </div>
            </div>
        </div>
    );
};

export default PaintingCanvasPage;
