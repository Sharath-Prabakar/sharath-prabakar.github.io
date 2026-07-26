import React, { useState } from 'react';

// 10x10 concentric zone calculator
// Zone 0: Oasis (Rows 4,5; Cols 4,5)
// Zone 1: Chebyshev distance 1 from Oasis
// Zone 2: Chebyshev distance 2
// Zone 3: Chebyshev distance 3
// Zone 4: Chebyshev distance 4 (Outer ring)
const getZone = (r, c) => {
    if ((r === 4 || r === 5) && (c === 4 || c === 5)) return 0;
    const distR = Math.max(0, 4 - r, r - 5);
    const distC = Math.max(0, 4 - c, c - 5);
    return Math.max(distR, distC);
};

// Map predefined elements based on Rules.txt
const generateMapGrid = () => {
    const grid = [];
    let cellCounter = 1;

    for (let r = 0; r < 10; r++) {
        const row = [];
        for (let c = 0; c < 10; c++) {
            const zone = getZone(r, c);
            let id = `cell-${r}-${c}`;
            let type = 'Desert';
            let label = zone === 0 ? 'Oasis' : `Tile ${cellCounter}`;
            let itemOrEvent = null;
            let icon = '🏜️';

            if (zone === 0) {
                type = 'Oasis';
                icon = '🌴';
                itemOrEvent = { name: 'Oasis Hub', effect: 'Refill Water to 6. Safe trade center with 5 starting money.' };
            } else {
                cellCounter++;
                // Place key elements
                if (r === 0 && c === 8) {
                    type = 'Airstrip';
                    icon = '✈️';
                    itemOrEvent = { name: 'Airstrip', effect: 'Escape Ticket costs 10 money. Increases by +1 per round for subsequent players.' };
                } else if ((r === 2 && c === 3) || (r === 7 && c === 6)) {
                    type = 'Cactus';
                    icon = '🌵';
                    itemOrEvent = { name: 'Cactus', effect: 'Refill Water token.' };
                } else if ((r === 1 && c === 1) || (r === 8 && c === 2)) {
                    type = 'DeadBody';
                    icon = '💀';
                    itemOrEvent = { name: 'Dead Body', effect: 'Contains 5 money left behind by past travellers.' };
                } else if ((r === 3 && c === 8) || (r === 6 && c === 1)) {
                    type = 'Snake';
                    icon = '🐍';
                    itemOrEvent = { name: 'Viper / Snake', effect: 'Requires Gun/Sword or causes poison debuff until Oasis/Cactus.' };
                } else if (r === 0 && c === 4) {
                    type = 'Thief';
                    icon = '🥷';
                    itemOrEvent = { name: 'Desert Thief', effect: 'Steals Camel, Item, or 3 Money.' };
                } else if (r === 9 && c === 9) {
                    type = 'Sandstorm';
                    icon = '🌪️';
                    itemOrEvent = { name: 'Sandstorm', effect: 'Lose 3 Money or get displaced 2 tiles.' };
                } else if (r === 1 && c === 7) {
                    type = 'Mountain';
                    icon = '⛰️';
                    itemOrEvent = { name: 'Mountain Range', effect: 'Blocks movement. Cannot enter tile.' };
                } else if (r === 4 && c === 2) {
                    type = 'GemStones';
                    icon = '💎';
                    itemOrEvent = { name: 'Gem Stones', effect: 'Emerald/Ruby/Diamond (1 wt). Worth 2-5 money.' };
                }
            }

            row.push({
                r,
                c,
                id,
                zone,
                label,
                type,
                icon,
                itemOrEvent,
                revealed: zone === 0 // Oasis uncovered by default
            });
        }
        grid.push(row);
    }
    return grid;
};

const INITIAL_PLAYERS = [
    { id: 1, name: 'Player 1', color: '#e74c3c', r: 4, c: 4, water: 6, money: 5, capacity: 6, escaped: false },
    { id: 2, name: 'Player 2', color: '#3498db', r: 4, c: 5, water: 6, money: 5, capacity: 6, escaped: false },
    { id: 3, name: 'Player 3', color: '#f1c40f', r: 5, c: 4, water: 6, money: 5, capacity: 6, escaped: false },
    { id: 4, name: 'Player 4', color: '#2ecc71', r: 5, c: 5, water: 6, money: 5, capacity: 6, escaped: false },
];

const BoardSimulator = () => {
    const [grid, setGrid] = useState(generateMapGrid);
    const [players, setPlayers] = useState(INITIAL_PLAYERS);
    const [activePlayerId, setActivePlayerId] = useState(1);
    const [selectedTile, setSelectedTile] = useState(null);
    const [revealAll, setRevealAll] = useState(false);

    const activePlayer = players.find(p => p.id === activePlayerId) || players[0];

    const toggleRevealTile = (r, c) => {
        setGrid(prev => prev.map((row, ri) =>
            row.map((cell, ci) => {
                if (ri === r && ci === c) {
                    const updated = { ...cell, revealed: !cell.revealed };
                    setSelectedTile(updated);
                    return updated;
                }
                return cell;
            })
        ));
    };

    const handleTileClick = (cell) => {
        setSelectedTile(cell);
    };

    const movePlayer = (dr, dc) => {
        if (activePlayer.escaped) return;
        if (activePlayer.water <= 0) {
            alert(`${activePlayer.name} is out of water! Refill at Oasis or Cactus.`);
            return;
        }

        const nr = activePlayer.r + dr;
        const nc = activePlayer.c + dc;

        if (nr < 0 || nr >= 10 || nc < 0 || nc >= 10) return;

        const targetCell = grid[nr][nc];
        if (targetCell.type === 'Mountain') {
            alert("Movement blocked by Mountain Range!");
            return;
        }

        // Move player
        setPlayers(prev => prev.map(p => {
            if (p.id === activePlayerId) {
                let newWater = p.water - 1;
                // Oasis or Cactus refills water
                if (targetCell.type === 'Oasis' || targetCell.type === 'Cactus') {
                    newWater = 6;
                }
                return { ...p, r: nr, c: nc, water: newWater };
            }
            return p;
        }));

        // Automatically reveal tile when entered
        setGrid(prev => prev.map((row, ri) =>
            row.map((cell, ci) => {
                if (ri === nr && ci === nc) {
                    const rev = { ...cell, revealed: true };
                    setSelectedTile(rev);
                    return rev;
                }
                return cell;
            })
        ));
    };

    const toggleRevealAll = () => {
        const nextState = !revealAll;
        setRevealAll(nextState);
        setGrid(prev => prev.map(row => row.map(cell => ({ ...cell, revealed: nextState || cell.zone === 0 }))));
    };

    const resetBoard = () => {
        setGrid(generateMapGrid());
        setPlayers(INITIAL_PLAYERS);
        setSelectedTile(null);
        setRevealAll(false);
    };

    return (
        <div className="board-simulator-container">
            {/* Top Stats & Controls Bar */}
            <div className="board-controls-header">
                <div className="player-selector">
                    <span className="label">Active Explorer:</span>
                    {players.map(p => (
                        <button
                            key={p.id}
                            className={`player-tab ${p.id === activePlayerId ? 'active' : ''}`}
                            style={{ borderColor: p.color, backgroundColor: p.id === activePlayerId ? p.color : 'transparent' }}
                            onClick={() => setActivePlayerId(p.id)}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>

                <div className="player-stats-hud">
                    <span className="stat-item">💧 Water: <strong>{activePlayer.water}/6</strong></span>
                    <span className="stat-item">💰 Money: <strong>${activePlayer.money}</strong></span>
                    <span className="stat-item">🎒 Bag: <strong>{activePlayer.capacity} wt</strong></span>
                </div>

                <div className="board-action-buttons">
                    <button className="action-btn toggle-fog-btn" onClick={toggleRevealAll}>
                        {revealAll ? '🌫️ Hide Unexplored' : '👁️ Reveal Full Map'}
                    </button>
                    <button className="action-btn reset-btn" onClick={resetBoard}>
                        🔄 Reset Game
                    </button>
                </div>
            </div>

            {/* Main Area: 10x10 Grid + Sidebar Info */}
            <div className="board-main-layout">
                {/* 10x10 Grid */}
                <div className="board-grid-wrapper">
                    <div className="grid-10x10">
                        {grid.map((row, r) => (
                            <div key={r} className="grid-row">
                                {row.map((cell) => {
                                    const isRevealed = cell.revealed || revealAll;
                                    const playersOnTile = players.filter(p => p.r === cell.r && p.c === cell.c);
                                    const isSelected = selectedTile?.r === cell.r && selectedTile?.c === cell.c;

                                    return (
                                        <div
                                            key={cell.id}
                                            className={`grid-cell zone-${cell.zone} ${isRevealed ? 'revealed' : 'covered'} ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleTileClick(cell)}
                                            onDoubleClick={() => toggleRevealTile(cell.r, cell.c)}
                                            title={`Zone ${cell.zone} - ${cell.label}`}
                                        >
                                            {isRevealed ? (
                                                <div className="cell-content">
                                                    <span className="cell-icon">{cell.icon}</span>
                                                    <span className="cell-type">{cell.type === 'Desert' ? '' : cell.type}</span>
                                                </div>
                                            ) : (
                                                <div className="cell-covered-content">
                                                    <span className="tile-number">{cell.label.replace('Tile ', '')}</span>
                                                </div>
                                            )}

                                            {/* Player Tokens on Tile */}
                                            {playersOnTile.length > 0 && (
                                                <div className="player-tokens-container">
                                                    {playersOnTile.map(p => (
                                                        <span key={p.id} className="player-token" style={{ backgroundColor: p.color }} title={p.name}>
                                                            P{p.id}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar: Navigation D-Pad & Tile Inspector */}
                <div className="board-sidebar">
                    {/* D-Pad Movement */}
                    <div className="dpad-box">
                        <h4>🚶 Walk Player ({activePlayer.name})</h4>
                        <p className="dpad-hint">Consumes 1 Water token per step</p>
                        <div className="dpad-grid">
                            <div></div>
                            <button className="dpad-btn" onClick={() => movePlayer(-1, 0)}>⬆️ Up</button>
                            <div></div>
                            <button className="dpad-btn" onClick={() => movePlayer(0, -1)}>⬅️ Left</button>
                            <div className="dpad-center">●</div>
                            <button className="dpad-btn" onClick={() => movePlayer(0, 1)}>➡️ Right</button>
                            <div></div>
                            <button className="dpad-btn" onClick={() => movePlayer(1, 0)}>⬇️ Down</button>
                            <div></div>
                        </div>
                    </div>

                    {/* Zone & Tile Info */}
                    <div className="tile-inspector-card">
                        <h4>📍 Tile Inspector</h4>
                        {selectedTile ? (
                            <div className="inspector-details">
                                <div className="inspector-header">
                                    <span className="inspector-icon">{selectedTile.icon}</span>
                                    <div>
                                        <h5>{selectedTile.label}</h5>
                                        <span className="zone-tag">Zone {selectedTile.zone}</span>
                                    </div>
                                </div>
                                <p><strong>Status:</strong> {selectedTile.revealed || revealAll ? '🔓 Uncovered' : '🔒 Unexplored (Double click to reveal)'}</p>
                                {selectedTile.itemOrEvent ? (
                                    <div className="event-info-box">
                                        <p><strong>{selectedTile.itemOrEvent.name}</strong></p>
                                        <p className="effect-desc">{selectedTile.itemOrEvent.effect}</p>
                                    </div>
                                ) : (
                                    <p className="effect-desc">Standard desert sand tile. Consumes 1 water to traverse.</p>
                                )}
                            </div>
                        ) : (
                            <p className="placeholder-text">Click any tile on the 10×10 board to inspect its zone, item, and rules.</p>
                        )}
                    </div>

                    {/* Zone Legend */}
                    <div className="zone-legend">
                        <h4>🗺️ Concentric Zone Legend</h4>
                        <ul>
                            <li><span className="legend-swatch zone-0-swatch"></span> <strong>Zone 0 (Oasis):</strong> Center 2×2 Start</li>
                            <li><span className="legend-swatch zone-1-swatch"></span> <strong>Zone 1:</strong> Cells 1–12 (Level 1)</li>
                            <li><span className="legend-swatch zone-2-swatch"></span> <strong>Zone 2:</strong> Cells 13–32 (Level 2)</li>
                            <li><span className="legend-swatch zone-3-swatch"></span> <strong>Zone 3:</strong> Cells 33–60 (Level 3)</li>
                            <li><span className="legend-swatch zone-4-swatch"></span> <strong>Zone 4:</strong> Outer Edge (Level 4 & Airstrip)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoardSimulator;
