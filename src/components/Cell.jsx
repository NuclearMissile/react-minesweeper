import React from 'react';

const Cell = ({cell, onClick, onRightClick, onMiddleClick}) => {
    const getCellContent = () => {
        if (cell.isFlagged) {
            return '🚩';
        }

        if (!cell.isRevealed) {
            return '';
        }

        if (cell.isMine) {
            return '💣';
        }

        if (cell.neighborMines === 0) {
            return '';
        }

        return cell.neighborMines;
    };

    const getCellClass = () => {
        let className = 'cell';

        if (cell.isRevealed) {
            className += ' revealed';

            if (cell.isMine) {
                className += ' mine';
            } else {
                className += ` neighbor-${cell.neighborMines}`;
            }
        }

        if (cell.isFlagged) {
            className += ' flagged';
        }

        return className;
    };

    return (
        <div
            className={getCellClass()}
            onClick={onClick}
            onContextMenu={onRightClick}
            onMouseDown={e => {
                if (e.button === 1 && onMiddleClick) {
                    e.preventDefault();
                    onMiddleClick();
                }
            }}
        >
            {getCellContent()}
        </div>
    );
};

export default Cell;
