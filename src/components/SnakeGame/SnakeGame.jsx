import React, { useState, useEffect, useRef, useCallback } from 'react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_FOOD = { x: 15, y: 15 };

const SnakeGame = () => {
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [direction, setDirection] = useState(INITIAL_DIRECTION);
    const [food, setFood] = useState(INITIAL_FOOD);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(localStorage.getItem('snakeHighScore') || 0);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const gameLoopRef = useRef();

    const generateFood = useCallback(() => {
        let newFood;
        while (true) {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
            const onSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
            if (!onSnake) break;
        }
        return newFood;
    }, [snake]);

    const moveSnake = useCallback(() => {
        if (gameOver || !gameStarted) return;

        setSnake(prevSnake => {
            const head = prevSnake[0];
            const newHead = {
                x: (head.x + direction.x + GRID_SIZE) % GRID_SIZE,
                y: (head.y + direction.y + GRID_SIZE) % GRID_SIZE
            };

            // Check collision with self
            if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                setGameOver(true);
                return prevSnake;
            }

            const newSnake = [newHead, ...prevSnake];

            // Check food collision
            if (newHead.x === food.x && newHead.y === food.y) {
                setScore(s => {
                    const newScore = s + 10;
                    if (newScore > highScore) {
                        setHighScore(newScore);
                        localStorage.setItem('snakeHighScore', newScore);
                    }
                    return newScore;
                });
                setFood(generateFood());
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    }, [direction, food, gameOver, gameStarted, generateFood, highScore]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            switch (e.key) {
                case 'ArrowUp': if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
                case 'ArrowDown': if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
                case 'ArrowLeft': if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
                case 'ArrowRight': if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
                default: break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [direction]);

    useEffect(() => {
        if (gameStarted && !gameOver) {
            gameLoopRef.current = setInterval(moveSnake, 150);
        } else {
            clearInterval(gameLoopRef.current);
        }
        return () => clearInterval(gameLoopRef.current);
    }, [gameStarted, gameOver, moveSnake]);

    const startGame = () => {
        setSnake(INITIAL_SNAKE);
        setDirection(INITIAL_DIRECTION);
        setFood(INITIAL_FOOD);
        setScore(0);
        setGameOver(false);
        setGameStarted(true);
    };

    return (
        <div className="snake-game-container">
            <div className="game-stats">
                <div className="stat-item">
                    <span className="label">Score</span>
                    <span className="value">{score}</span>
                </div>
                <div className="stat-item">
                    <span className="label">High</span>
                    <span className="value">{highScore}</span>
                </div>
            </div>
            
            <div className="game-viewport">
                <div className="game-grid">
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                        const x = i % GRID_SIZE;
                        const y = Math.floor(i / GRID_SIZE);
                        const isSnake = snake.some(s => s.x === x && s.y === y);
                        const isHead = snake[0].x === x && snake[0].y === y;
                        const isFood = food.x === x && food.y === y;

                        return (
                            <div 
                                key={i} 
                                className={`grid-cell ${isSnake ? 'snake' : ''} ${isHead ? 'head' : ''} ${isFood ? 'food' : ''}`}
                            />
                        );
                    })}
                </div>

                {!gameStarted && !gameOver && (
                    <div className="game-overlay">
                        <button onClick={startGame} className="btn-game">Start Game</button>
                    </div>
                )}

                {gameOver && (
                    <div className="game-overlay">
                        <div className="game-over-text">System Failure</div>
                        <button onClick={startGame} className="btn-game">Retry</button>
                    </div>
                )}
            </div>

            <div className="mobile-controls">
                <button onClick={() => direction.y === 0 && setDirection({ x: 0, y: -1 })} className="ctrl-btn up">▲</button>
                <div className="row">
                    <button onClick={() => direction.x === 0 && setDirection({ x: -1, y: 0 })} className="ctrl-btn left">◀</button>
                    <button onClick={() => direction.x === 0 && setDirection({ x: 1, y: 0 })} className="ctrl-btn right">▶</button>
                </div>
                <button onClick={() => direction.y === 0 && setDirection({ x: 0, y: 1 })} className="ctrl-btn down">▼</button>
            </div>
        </div>
    );
};

export default SnakeGame;
