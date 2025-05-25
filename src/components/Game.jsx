import {useEffect, useRef, useState} from 'react';
import Board from './Board';

const Game = () => {
    const [difficulty, setDifficulty] = useState('easy');
    const [gameTime, setGameTime] = useState(0);
    const [gameStatus, setGameStatus] = useState('waiting'); // waiting, playing
    const timerRef = useRef(null);

    // Start the timer when game begins
    const startTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        const startTime = Date.now();
        timerRef.current = setInterval(() =>
            setGameTime(Math.floor((Date.now() - startTime) / 1000)), 1000);
    };

    // Stop the timer
    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const handleReset = () => {
        setGameTime(0);
        stopTimer();
        setGameStatus('waiting');
    };

    const handleInteraction = () => {
        if (gameStatus === 'waiting') {
            startTimer();
            setGameStatus('playing');
        }
    };

    // Cleanup timer on unmount
    useEffect(() => () => stopTimer(), []);

    return (
        <div className="minesweeper-game">
            <a href='https://github.com/NuclearMissile/react-minesweeper' target='_blank' rel='noopener noreferrer'>
                <h1>Minesweeper</h1>
            </a>

            <div className="game-controls">
                <div className="difficulty-selector">
                    <button
                        className={difficulty === 'easy' ? 'active' : ''}
                        onClick={() => setDifficulty('easy')}
                    >
                        Easy
                    </button>
                    <button
                        className={difficulty === 'medium' ? 'active' : ''}
                        onClick={() => setDifficulty('medium')}
                    >
                        Medium
                    </button>
                    <button
                        className={difficulty === 'hard' ? 'active' : ''}
                        onClick={() => setDifficulty('hard')}
                    >
                        Hard
                    </button>
                </div>

                <div className="timer">Time: {gameTime}</div>
            </div>

            <Board
                difficulty={difficulty}
                onGameOver={stopTimer}
                onGameWin={stopTimer}
                onReset={handleReset}
                onInteraction={handleInteraction}
            />
        </div>
    );
};

export default Game;
