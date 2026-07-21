import React, { useState } from 'react';
import './Pallanguzhi.css';

const boardData = [
  {
    "totalPits": 14,
    "startPit": 2,
    "captured": 7,
    "opponentSeeds": 29,
    "before": [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    "after": [1, 7, 2, 8, 8, 8, 0, 0, 1, 7, 7, 7, 7, 0]
  },
  {
    "totalPits": 13,
    "startPit": 2,
    "captured": 1,
    "opponentSeeds": 29,
    "before": [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, "Dead"],
    "after": [7, 0, 0, 7, 7, 7, 7, 0, 1, 7, 7, 7, 7, "Dead"]
  },
  {
    "totalPits": 12,
    "startPit": 1,
    "captured": 6,
    "opponentSeeds": 24,
    "before": [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, "Dead", "Dead"],
    "after": [6, 0, 0, 6, 6, 6, 6, 0, 6, 6, 6, 6, "Dead", "Dead"]
  },
  {
    "totalPits": 11,
    "startPit": 6,
    "captured": 9,
    "opponentSeeds": 1,
    "before": [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, "Dead", "Dead", "Dead"],
    "after": [9, 3, 9, 2, 9, 9, 4, 0, 0, 0, 1, "Dead", "Dead", "Dead"]
  },
  {
    "totalPits": 10,
    "startPit": 1,
    "captured": 8,
    "opponentSeeds": 0,
    "before": [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, "Dead", "Dead", "Dead", "Dead"],
    "after": [1, 3, 9, 2, 9, 9, 9, 0, 0, 0, "Dead", "Dead", "Dead", "Dead"]
  },
  {
    "totalPits": 9,
    "startPit": 2,
    "captured": 3,
    "opponentSeeds": 0,
    "before": [5, 5, 5, 5, 5, 5, 5, 5, 5, "Dead", "Dead", "Dead", "Dead", "Dead"],
    "after": [9, 9, 1, 2, 10, 1, 10, 0, 0, "Dead", "Dead", "Dead", "Dead", "Dead"]
  },
  {
    "totalPits": 8,
    "startPit": 3,
    "captured": 1,
    "opponentSeeds": 0,
    "before": [5, 5, 5, 5, 5, 5, 5, 5, "Dead", "Dead", "Dead", "Dead", "Dead", "Dead"],
    "after": [8, 2, 8, 3, 9, 9, 0, 0, "Dead", "Dead", "Dead", "Dead", "Dead", "Dead"]
  }
];

const losingBoardData = [
  {
    "totalPits": 13,
    "startPit": 7,
    "captured": 1,
    "mySeeds": 28,
    "before": [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, "Dead"],
    "after": [1, 7, 7, 7, 7, 7, 0, 0, 7, 7, 7, 7, 0, "Dead"]
  },
  {
    "totalPits": 12,
    "startPit": 11,
    "captured": 6,
    "mySeeds": 24,
    "before": [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, "Dead", "Dead"],
    "after": [0, 6, 6, 6, 6, 0, 6, 6, 6, 6, 6, 0, "Dead", "Dead"]
  },
  {
    "totalPits": 11,
    "startPit": 10,
    "captured": 9,
    "mySeeds": 24,
    "before": [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, "Dead", "Dead", "Dead"],
    "after": [0, 0, 0, 1, 9, 3, 9, 2, 9, 9, 4, "Dead", "Dead", "Dead"]
  },
  {
    "totalPits": 10,
    "startPit": 7,
    "captured": 8,
    "mySeeds": 14,
    "before": [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, "Dead", "Dead", "Dead", "Dead"],
    "after": [9, 9, 9, 0, 0, 0, 1, 3, 9, 2, "Dead", "Dead", "Dead", "Dead"]
  },
  {
    "totalPits": 9,
    "startPit": 8,
    "captured": 3,
    "mySeeds": 10,
    "before": [5, 5, 5, 5, 5, 5, 5, 5, 5, "Dead", "Dead", "Dead", "Dead", "Dead"],
    "after": [2, 10, 1, 10, 0, 0, 9, 9, 1, "Dead", "Dead", "Dead", "Dead", "Dead"]
  },
  {
    "totalPits": 8,
    "startPit": 7,
    "captured": 1,
    "mySeeds": 3,
    "before": [5, 5, 5, 5, 5, 5, 5, 5, "Dead", "Dead", "Dead", "Dead", "Dead", "Dead"],
    "after": [9, 9, 0, 0, 8, 2, 8, 3, "Dead", "Dead", "Dead", "Dead", "Dead", "Dead"]
  }
];

const PallanguzhiBoard = ({ stateArray, startPit = -1 }) => {
    // Player A is indices 0-6 (bottom row, left to right)
    const playerA = stateArray.slice(0, 7);
    
    // Player B is indices 7-13 (top row, left to right is visually indices 13 down to 7)
    // Actually, traditionally top row is right to left for player A's perspective, but let's render it 
    // such that it forms a continuous circle:
    // Top Row (Player B): 13, 12, 11, 10, 9, 8, 7
    // Bottom Row (Player A): 0, 1, 2, 3, 4, 5, 6
    const topRowIndices = [13, 12, 11, 10, 9, 8, 7];
    const bottomRowIndices = [0, 1, 2, 3, 4, 5, 6];

    return (
        <div className="board-visual">
            <div className="board-row opponent-row">
                {topRowIndices.map((idx) => {
                    const val = stateArray[idx];
                    const isDead = val === 'Dead';
                    const isHighlight = idx === startPit;
                    return (
                        <div key={`top-${idx}`} className={`pit ${isDead ? 'dead' : ''} ${isHighlight ? 'highlight' : ''}`}>
                            {isDead ? 'X' : val}
                            {isHighlight && <div className="pit-label" style={{ top: '-25px', bottom: 'auto' }}>Start Here</div>}
                        </div>
                    );
                })}
            </div>
            <div className="board-row player-row">
                {bottomRowIndices.map((idx) => {
                    const val = stateArray[idx];
                    const isDead = val === 'Dead';
                    const isHighlight = idx === startPit;
                    return (
                        <div key={`bottom-${idx}`} className={`pit ${isDead ? 'dead' : ''} ${isHighlight ? 'highlight' : ''}`}>
                            {isDead ? 'X' : val}
                            {isHighlight && <div className="pit-label">Start Here</div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const Pallanguzhi = () => {
    const [openAccordion, setOpenAccordion] = useState(null);
    const [openLosingAccordion, setOpenLosingAccordion] = useState(null);

    const toggleAccordion = (index) => {
        setOpenAccordion(openAccordion === index ? null : index);
    };

    const toggleLosingAccordion = (index) => {
        setOpenLosingAccordion(openLosingAccordion === index ? null : index);
    };

    return (
        <div className="pallanguzhi-container">
            <header className="hero-section">
                <h1 className="hero-title">PALLANGUZHI ANALYSIS</h1>
                <p className="hero-bio">A mathematical exploration of opening moves in the traditional Tamil mancala game.</p>
            </header>

            <section className="content-section">
                <h2>House Rules Overview</h2>
                <p>
                    In this specific variation, the game is played on the standard 14-pit board, but with a unique setup and mechanics:
                </p>
                <ul>
                    <li><strong>Setup:</strong> Only <strong>5 seeds</strong> are placed in each pit initially (70 total seeds).</li>
                    <li><strong>Sowing & Continuing:</strong> When the last seed of a hand is dropped, you do <strong>not</strong> pick up from that pit. Instead, you pick up all seeds from the <strong>following pit</strong> and continue sowing.</li>
                    <li><strong>Capturing:</strong> If the last seed is dropped and the following pit is <strong>empty</strong>, the turn ends, and you capture all the seeds in the pit <em>immediately after</em> the empty following pit.</li>
                </ul>

                <h2>Terminology & Mechanics</h2>
                <ul>
                    <li><strong>Chains (Moves):</strong> A single "turn" in Pallanguzhi is made up of multiple continuous "chains" (or laps). When you pick up seeds and drop them one by one, that is one chain. If your last seed allows you to pick up more seeds and keep going, you start a second chain, all within the same turn. The turn only ends when you finally hit an empty pit.</li>
                    <li><strong>Reduced Active Pits:</strong> As the game goes into later rounds, players use their captured seeds to refill their pits. If a player doesn't have enough seeds, they leave some of their pits empty. These empty pits become "dead" for the rest of the game, effectively shrinking the board into a smaller circle of active pits. Our table analyzes scenarios down to 6 total active pits, representing a late-game state where many pits have died.</li>
                </ul>

                <h2>Late Game Analysis (Reduced Pits)</h2>
                <p>
                    As the game progresses to subsequent rounds, players who captured fewer seeds may not be able to fill all their pits. The unfilled pits become "dead" for that round, effectively shrinking the board into a smaller circle of <em>active</em> pits.
                </p>
                <p>
                    <strong>Mathematical Boundary:</strong> Since there are 70 total seeds in the game (14 pits × 5 seeds), and 35 seeds are required to fill one side (7 pits), at least one player will <em>always</em> have 35 or more seeds. That means one player will always be able to fill their full 7 pits. To continue playing, the opponent must be able to fill at least 1 pit (5 seeds). Therefore, the absolute minimum number of active pits on the board is <strong>8</strong> (7 from the winning player + 1 from the losing player).
                </p>
                <p>
                    <strong>Strategic First Move:</strong> Even though any active pit yields the <em>same</em> number of captured seeds due to symmetry, the final distribution of seeds across the board will differ. The <strong>Best Move</strong> is the one that minimizes the number of seeds remaining on the opponent's side (top row) after your turn ends.
                </p>

                <div className="accordion-container">
                    {boardData.map((data, idx) => (
                        <div key={idx} className={`accordion-item ${openAccordion === idx ? 'open' : ''}`}>
                            <div className="accordion-header" onClick={() => toggleAccordion(idx)}>
                                <h3>{data.totalPits} Active Pits (Minimizing Opponent Seeds)</h3>
                                <span className="accordion-icon">{openAccordion === idx ? '−' : '+'}</span>
                            </div>
                            {openAccordion === idx && (
                                <div className="accordion-content">
                                    <div className="analysis-summary">
                                        <p><strong>Best Move:</strong> Pit {data.startPit + 1}</p>
                                        <p><strong>Captured Seeds:</strong> {data.captured}</p>
                                        <p><strong>Opponent's Remaining Seeds:</strong> {data.opponentSeeds}</p>
                                    </div>
                                    
                                    <div className="board-section">
                                        <h4>Before Move</h4>
                                        <PallanguzhiBoard stateArray={data.before} startPit={data.startPit} />
                                    </div>

                                    <div className="board-arrow">⬇️ After playing Pit {data.startPit + 1} ⬇️</div>

                                    <div className="board-section">
                                        <h4>After Move</h4>
                                        <PallanguzhiBoard stateArray={data.after} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <h2 style={{ marginTop: '50px' }}>Losing Player Analysis (Maximizing Own Seeds)</h2>
                <p>
                    If you are the losing player (Player B, top row), your goal is to maximize the number of seeds that remain on your own side of the board at the end of your turn. The table below shows the best move for Player B for configurations between 13 and 8 active pits.
                </p>

                <div className="accordion-container">
                    {losingBoardData.map((data, idx) => (
                        <div key={`lose-${idx}`} className={`accordion-item ${openLosingAccordion === idx ? 'open' : ''}`}>
                            <div className="accordion-header" onClick={() => toggleLosingAccordion(idx)}>
                                <h3>{data.totalPits} Active Pits (Maximizing Your Seeds)</h3>
                                <span className="accordion-icon">{openLosingAccordion === idx ? '−' : '+'}</span>
                            </div>
                            {openLosingAccordion === idx && (
                                <div className="accordion-content">
                                    <div className="analysis-summary">
                                        <p><strong>Best Move:</strong> Pit {data.startPit + 1}</p>
                                        <p><strong>Captured Seeds:</strong> {data.captured}</p>
                                        <p><strong>Your Remaining Seeds:</strong> {data.mySeeds}</p>
                                    </div>
                                    
                                    <div className="board-section">
                                        <h4>Before Move</h4>
                                        <PallanguzhiBoard stateArray={data.before} startPit={data.startPit} />
                                    </div>

                                    <div className="board-arrow">⬇️ After playing Pit {data.startPit + 1} ⬇️</div>

                                    <div className="board-section">
                                        <h4>After Move</h4>
                                        <PallanguzhiBoard stateArray={data.after} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Pallanguzhi;
