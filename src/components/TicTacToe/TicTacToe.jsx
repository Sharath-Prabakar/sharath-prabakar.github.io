import React, { useState, useEffect } from 'react';
import './TicTacToe.css';

const TicTacToe = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [gameMode, setGameMode] = useState('AI'); // 'AI' or 'Player'
    const [scores, setScores] = useState({ X: 0, O: 0, Ties: 0 });
    const [winner, setWinner] = useState(null);
    const [winningLine, setWinningLine] = useState([]);

    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    const checkWinner = (currentBoard) => {
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
                return { player: currentBoard[a], pattern };
            }
        }
        return null;
    };

    const handleClick = (index) => {
        if (board[index] || winner || (gameMode === 'AI' && !isXNext)) return;

        const newBoard = [...board];
        newBoard[index] = isXNext ? 'X' : 'O';
        setBoard(newBoard);

        const winResult = checkWinner(newBoard);
        if (winResult) {
            setWinner(winResult.player);
            setWinningLine(winResult.pattern);
            setScores(prev => ({ ...prev, [winResult.player]: prev[winResult.player] + 1 }));
        } else if (newBoard.every(cell => cell !== null)) {
            setWinner('Tie');
            setScores(prev => ({ ...prev, Ties: prev.Ties + 1 }));
        } else {
            setIsXNext(!isXNext);
        }
    };

    // AI Turn (Minimax or random choice for O)
    useEffect(() => {
        if (gameMode === 'AI' && !isXNext && !winner) {
            const timer = setTimeout(() => {
                makeAIMove();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isXNext, gameMode, winner]);

    const makeAIMove = () => {
        // Simple Minimax or strategic choice
        const emptyIndices = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        if (emptyIndices.length === 0) return;

        let bestMove = -1;

        // 1. Try to win
        for (let idx of emptyIndices) {
            const testBoard = [...board];
            testBoard[idx] = 'O';
            if (checkWinner(testBoard)) {
                bestMove = idx;
                break;
            }
        }

        // 2. Block user X from winning
        if (bestMove === -1) {
            for (let idx of emptyIndices) {
                const testBoard = [...board];
                testBoard[idx] = 'X';
                const testWin = checkWinner(testBoard);
                if (testWin) {
                    bestMove = idx;
                    break;
                }
            }
        }

        // 3. Take center if available
        if (bestMove === -1 && emptyIndices.includes(4)) {
            bestMove = 4;
        }

        // 4. Take corners if available
        if (bestMove === -1) {
            const corners = [0, 2, 6, 8].filter(c => emptyIndices.includes(c));
            if (corners.length > 0) {
                bestMove = corners[Math.floor(Math.random() * corners.length)];
            }
        }

        // 5. Choose random empty space
        if (bestMove === -1) {
            bestMove = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        }

        const newBoard = [...board];
        newBoard[bestMove] = 'O';
        setBoard(newBoard);

        const winResult = checkWinner(newBoard);
        if (winResult) {
            setWinner(winResult.player);
            setWinningLine(winResult.pattern);
            setScores(prev => ({ ...prev, O: prev.O + 1 }));
        } else if (newBoard.every(cell => cell !== null)) {
            setWinner('Tie');
            setScores(prev => ({ ...prev, Ties: prev.Ties + 1 }));
        } else {
            setIsXNext(true);
        }
    };

    const handleReset = () => {
        setBoard(Array(9).fill(null));
        setWinner(null);
        setWinningLine([]);
        setIsXNext(true);
    };

    const handleResetScores = () => {
        setScores({ X: 0, O: 0, Ties: 0 });
        handleReset();
    };

    return (
        <div className="tictactoe-container">
            <div className="game-modes">
                <button 
                    className={`mode-btn ${gameMode === 'AI' ? 'active' : ''}`} 
                    onClick={() => { setGameMode('AI'); handleResetScores(); }}
                >
                    🤖 vs Computer
                </button>
                <button 
                    className={`mode-btn ${gameMode === 'Player' ? 'active' : ''}`} 
                    onClick={() => { setGameMode('Player'); handleResetScores(); }}
                >
                    👥 2-Player (Local)
                </button>
            </div>

            <div className="tictactoe-scores">
                <div className="score-box x-score">
                    <span className="player-label">Player X</span>
                    <span className="score-val">{scores.X}</span>
                </div>
                <div className="score-box tie-score">
                    <span className="player-label">Ties</span>
                    <span className="score-val">{scores.Ties}</span>
                </div>
                <div className="score-box o-score">
                    <span className="player-label">{gameMode === 'AI' ? 'Computer' : 'Player O'}</span>
                    <span className="score-val">{scores.O}</span>
                </div>
            </div>

            <div className="tictactoe-viewport">
                <div className="tictactoe-board">
                    {board.map((cell, idx) => {
                        const isWinningCell = winningLine.includes(idx);
                        return (
                            <button
                                key={idx}
                                className={`cell-btn ${cell ? cell.toLowerCase() : ''} ${isWinningCell ? 'winner-cell' : ''}`}
                                onClick={() => handleClick(idx)}
                                disabled={cell !== null || winner !== null}
                            >
                                <span className="cell-content">{cell}</span>
                            </button>
                        );
                    })}
                </div>

                {winner && (
                    <div className="game-overlay">
                        <div className="winner-announcement">
                            {winner === 'Tie' ? (
                                <span className="tie-label">🤝 It's a Draw!</span>
                            ) : (
                                <span className={`win-label ${winner.toLowerCase()}`}>
                                    🎉 {winner === 'X' ? 'Player X wins!' : gameMode === 'AI' ? 'Computer wins!' : 'Player O wins!'}
                                </span>
                            )}
                        </div>
                        <button className="play-again-btn" onClick={handleReset}>Play Again</button>
                    </div>
                )}
            </div>

            <button className="reset-game-btn" onClick={handleReset}>Reset Board</button>
        </div>
    );
};

export default TicTacToe;
