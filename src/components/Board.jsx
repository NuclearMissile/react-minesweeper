import React, {useState, useEffect} from 'react';
import Cell from './Cell';

const Board = ({difficulty, onGameOver, onGameWin, onReset, onInteraction}) => {
    // Game difficulty settings
    const difficultySettings = {
        easy: {rows: 9, cols: 9, mines: 10},
        medium: {rows: 16, cols: 16, mines: 40},
        hard: {rows: 16, cols: 30, mines: 99}
    };

    const {rows, cols, mines} = difficultySettings[difficulty] || difficultySettings.easy;

    // Game state
    const [board, setBoard] = useState([]);
    const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
    const [flagsPlaced, setFlagsPlaced] = useState(0);

    // Initialize the board
    useEffect(() => {
        initializeBoard();
    }, [difficulty]);

    const initializeBoard = () => {
        // Create empty board
        const newBoard = Array(rows).fill().map(() =>
            Array(cols).fill().map(() => ({
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            }))
        );

        // Place mines randomly
        let minesPlaced = 0;
        while (minesPlaced < mines) {
            const randomRow = Math.floor(Math.random() * rows);
            const randomCol = Math.floor(Math.random() * cols);

            if (!newBoard[randomRow][randomCol].isMine) {
                newBoard[randomRow][randomCol].isMine = true;
                minesPlaced++;
            }
        }

        // Calculate neighbor mines
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (!newBoard[row][col].isMine) {
                    let count = 0;
                    // Check all 8 neighbors
                    for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
                        for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
                            if (r !== row || c !== col) {
                                if (newBoard[r][c].isMine) {
                                    count++;
                                }
                            }
                        }
                    }
                    newBoard[row][col].neighborMines = count;
                }
            }
        }

        setBoard(newBoard);
        setGameStatus('playing');
        setFlagsPlaced(0);
    };

    // Handle cell click (reveal)
    const handleCellClick = (row, col) => {
        // Notify Game component about first interaction
        onInteraction();

        if (gameStatus !== 'playing' || board[row][col].isRevealed || board[row][col].isFlagged) {
            return;
        }

        const newBoard = [...board];

        // If clicked on a mine, game over
        if (newBoard[row][col].isMine) {
            revealAllMines();
            setGameStatus('lost');
            onGameOver();
            return;
        }

        // Reveal the cell and its neighbors if it has no adjacent mines
        revealCell(newBoard, row, col);

        if (winCheck(newBoard)) {
            setGameStatus('won');
            onGameWin();
        }

        setBoard(newBoard);
    };

    // Recursively reveal cells
    const revealCell = (board, row, col) => {
        if (
            row < 0 || row >= rows ||
            col < 0 || col >= cols ||
            board[row][col].isRevealed ||
            board[row][col].isFlagged
        ) {
            return;
        }

        board[row][col].isRevealed = true;

        // If this cell has no adjacent mines, reveal all adjacent cells
        if (board[row][col].neighborMines === 0) {
            for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
                    if (r !== row || c !== col) {
                        revealCell(board, r, c);
                    }
                }
            }
        }
    };

    // Handle right-click (flag)
    const handleCellRightClick = (e, row, col) => {
        e.preventDefault();

        // Notify Game component about first interaction
        onInteraction();

        if (gameStatus !== 'playing' || board[row][col].isRevealed) {
            return;
        }

        const newBoard = [...board];
        newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;

        setFlagsPlaced(prev => newBoard[row][col].isFlagged ? prev + 1 : prev - 1);

        if (winCheck(newBoard)) {
            setGameStatus('won');
            onGameWin();
        }

        setBoard(newBoard);
    };

    // Handle middle-click (chord)
    const handleCellMiddleClick = (row, col) => {
        // Notify Game component about first interaction
        onInteraction();

        if (gameStatus !== 'playing') {
            return;
        }

        const cell = board[row][col];

        // Only proceed if the cell is revealed and has a number
        if (!cell.isRevealed || cell.neighborMines === 0) {
            return;
        }

        // Count flagged cells around this cell
        let flaggedCount = 0;
        for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
                if ((r !== row || c !== col) && board[r][c].isFlagged) {
                    flaggedCount++;
                }
            }
        }

        // If the number of flagged cells equals the number on the cell,
        // reveal all unflagged and unrevealed cells around it
        if (flaggedCount === cell.neighborMines) {
            const newBoard = [...board];

            // Reveal all unflagged cells around this cell
            for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
                    if (r !== row || c !== col) {
                        const neighborCell = newBoard[r][c];
                        if (!neighborCell.isRevealed && !neighborCell.isFlagged) {
                            if (neighborCell.isMine) {
                                // If we hit a mine, game over
                                revealAllMines();
                                setGameStatus('lost');
                                onGameOver();
                                return;
                            } else {
                                // Otherwise, reveal the cell and its neighbors
                                revealCell(newBoard, r, c);
                            }
                        }
                    }
                }
            }

            if (winCheck(newBoard)) {
                setGameStatus('won');
                onGameWin();
            }

            setBoard(newBoard);
        }
    };

    const winCheck = (board) => {
        // Check if player has won
        // Count the number of revealed cells directly from the board
        let revealedCount = 0;
        let flaggedCount = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c].isRevealed && !board[r][c].isMine) {
                    revealedCount++;
                }
                if (board[r][c].isMine && board[r][c].isFlagged) {
                    flaggedCount++;
                }
            }
        }
        return revealedCount === rows * cols - mines && flaggedCount === mines;
    };

    // Reveal all mines when game is over
    const revealAllMines = () => {
        const newBoard = [...board];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (newBoard[row][col].isMine) {
                    newBoard[row][col].isRevealed = true;
                }
            }
        }

        setBoard(newBoard);
    };

    // Reset the game
    const resetGame = () => {
        initializeBoard();
        onReset();
    };

    return (
        <div className="minesweeper-board">
            <div className="game-info">
                <div className="mines-counter">Mines: {mines - flagsPlaced}</div>
                <button className="reset-button" onClick={resetGame}>
                    {gameStatus === 'playing' ? '😊' : gameStatus === 'won' ? '😎' : '😵'}
                </button>
            </div>
            <div className="board-grid" style={{gridTemplateColumns: `repeat(${cols}, 30px)`}}>
                {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <Cell
                            key={`${rowIndex}-${colIndex}`}
                            cell={cell}
                            onClick={() => handleCellClick(rowIndex, colIndex)}
                            onRightClick={(e) => handleCellRightClick(e, rowIndex, colIndex)}
                            onMiddleClick={() => handleCellMiddleClick(rowIndex, colIndex)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default Board;
