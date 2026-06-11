// Shikaku Game Logic
class ShikakuGame {
    constructor(gridSize = 5) {
        this.gridSize = gridSize;
        this.grid = [];
        this.solution = [];
        this.userSolution = [];
        this.userRectangleColors = {};
        this.moves = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.history = [];
        this.selectedCells = new Set();
        this.completedRectangles = new Set();
        this.colorPalette = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFD93D', '#6BCB77',
            '#BB8FCE', '#FF8C42', '#A8E6CF', '#FF6B9D', '#C7CEEA',
            '#FFDAB9', '#FF6348', '#20B2AA', '#FFD700', '#DDA0DD',
            '#87CEEB', '#FF4500', '#32CD32', '#FF69B4', '#00CED1'
        ];
        this.colorIndex = 0;
        
        this.generatePuzzle();
    }

    generatePuzzle() {
        let validPuzzle = false;
        let attempts = 0;
        const maxAttempts = 100;
        
        while (!validPuzzle && attempts < maxAttempts) {
            attempts++;
            this.grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(0));
            this.solution = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(-1));
            
            let rectId = 0;
            const placed = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(false));
            
            for (let i = 0; i < this.gridSize; i++) {
                for (let j = 0; j < this.gridSize; j++) {
                    if (!placed[i][j]) {
                        let rect = null;
                        
                        for (let sizeAttempt = 0; sizeAttempt < 3 && !rect; sizeAttempt++) {
                            rect = this.generateRandomRectangle(i, j, placed, sizeAttempt);
                        }
                        
                        if (rect) {
                            const { row, col, height, width } = rect;
                            const area = height * width;
                            
                            const numberRow = row + Math.floor(Math.random() * height);
                            const numberCol = col + Math.floor(Math.random() * width);
                            
                            this.grid[numberRow][numberCol] = area;
                            
                            for (let r = row; r < row + height; r++) {
                                for (let c = col; c < col + width; c++) {
                                    this.solution[r][c] = rectId;
                                    placed[r][c] = true;
                                }
                            }
                            rectId++;
                        }
                    }
                }
            }
            
            validPuzzle = placed.every(row => row.every(cell => cell === true));
        }
        
        this.userSolution = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(-1));
    }

    generateRandomRectangle(startRow, startCol, placed, sizeAttempt = 0) {
        const maxWidth = Math.min(4, this.gridSize - startCol);
        const maxHeight = Math.min(4, this.gridSize - startRow);
        
        let width, height;
        
        if (sizeAttempt === 0) {
            width = Math.floor(Math.random() * (maxWidth - 1)) + 2;
            height = Math.floor(Math.random() * (maxHeight - 1)) + 2;
        } else if (sizeAttempt === 1) {
            width = Math.floor(Math.random() * maxWidth) + 1;
            height = Math.floor(Math.random() * maxHeight) + 1;
            
            if (width === 1 && height === 1) return null;
        } else {
            width = Math.floor(Math.random() * maxWidth) + 1;
            height = Math.floor(Math.random() * maxHeight) + 1;
        }
        
        width = Math.max(1, Math.min(width, maxWidth));
        height = Math.max(1, Math.min(height, maxHeight));
        
        for (let r = startRow; r < Math.min(startRow + height, this.gridSize); r++) {
            for (let c = startCol; c < Math.min(startCol + width, this.gridSize); c++) {
                if (placed[r][c]) return null;
            }
        }
        
        return { row: startRow, col: startCol, height, width };
    }

    getCell(row, col) {
        return this.grid[row]?.[col] || null;
    }

    selectCell(row, col) {
        const key = `${row},${col}`;
        if (this.selectedCells.has(key)) {
            this.selectedCells.delete(key);
        } else {
            this.selectedCells.add(key);
        }
    }

    addCellsInRange(startRow, startCol, endRow, endCol) {
        const minRow = Math.min(startRow, endRow);
        const maxRow = Math.max(startRow, endRow);
        const minCol = Math.min(startCol, endCol);
        const maxCol = Math.max(startCol, endCol);
        
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                this.selectedCells.add(`${r},${c}`);
            }
        }
    }

    clearSelection() {
        this.selectedCells.clear();
    }

    deleteRectangle(row, col) {
        const rectId = this.userSolution[row][col];
        if (rectId === -1) return;
        
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.userSolution[r][c] === rectId) {
                    this.userSolution[r][c] = -1;
                }
            }
        }
        
        this.history = this.history.filter(h => h.rectId !== rectId);
        
        this.completedRectangles.delete(rectId);
        if (this.userRectangleColors[rectId]) {
            delete this.userRectangleColors[rectId];
        }
    }

    completeRectangle(isValid) {
        if (this.selectedCells.size === 0) return false;
        
        const cells = Array.from(this.selectedCells).map(k => {
            const [r, c] = k.split(',').map(Number);
            return { r, c };
        });
        
        let minRow = Math.min(...cells.map(c => c.r));
        let maxRow = Math.max(...cells.map(c => c.r));
        let minCol = Math.min(...cells.map(c => c.c));
        let maxCol = Math.max(...cells.map(c => c.c));
        
        const height = maxRow - minRow + 1;
        const width = maxCol - minCol + 1;
        const area = height * width;
        
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                if (!this.selectedCells.has(`${r},${c}`)) {
                    break;
                }
            }
        }
        
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                if (this.userSolution[r][c] !== -1) {
                    this.showError("Rectangles cannot overlap!");
                    return false;
                }
            }
        }
        
        const color = this.colorPalette[this.colorIndex % this.colorPalette.length];
        this.colorIndex++;
        
        let hasMatchingNumber = false;
        let numberCount = 0;
        let numberValue = null;
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                if (this.grid[r][c] > 0) {
                    numberCount++;
                    numberValue = this.grid[r][c];
                    if (this.grid[r][c] === area) {
                        hasMatchingNumber = true;
                    }
                }
            }
        }
        
        if (numberCount === 0) {
            this.showError("This rectangle has no number!");
            return false;
        }
        if (numberCount > 1) {
            this.showError("A rectangle can contain only one number!");
            return false;
        }
        if (!hasMatchingNumber && numberCount === 1) {
            this.showError(`Area is ${area}, but number is ${numberValue}!`);
            return false;
        }
        
        const isCompleted = isValid && hasMatchingNumber && numberCount === 1;
        
        const rectId = Math.max(...Array.from(this.userSolution).flat(), -1) + 1;
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                this.userSolution[r][c] = rectId;
            }
        }
        
        this.userRectangleColors[rectId] = {
            color: color,
            isCompleted: isCompleted
        };
        
        if (isCompleted) {
            this.completedRectangles.add(rectId);
            this.moves++;
        }
        
        this.history.push({
            cells: Array.from(this.selectedCells),
            rectId: rectId
        });
        
        this.selectedCells.clear();
        
        return true;
    }

    reset() {
        this.userSolution = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(-1));
        this.completedRectangles.clear();
        this.history = [];
        this.selectedCells.clear();
        this.userRectangleColors = {};
        this.colorIndex = 0;
        this.moves = 0;
    }

    isComplete() {
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.userSolution[r][c] === -1) return false;
            }
        }

        const groups = {};
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                const id = this.userSolution[r][c];
                if (!groups[id]) groups[id] = [];
                groups[id].push([r, c]);
            }
        }

        for (const idStr in groups) {
            const id = parseInt(idStr, 10);
            const cells = groups[idStr];

            let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
            for (const [r, c] of cells) {
                minR = Math.min(minR, r);
                maxR = Math.max(maxR, r);
                minC = Math.min(minC, c);
                maxC = Math.max(maxC, c);
            }

            const height = maxR - minR + 1;
            const width = maxC - minC + 1;
            const area = height * width;

            let boundingOk = true;
            for (let r = minR; r <= maxR; r++) {
                for (let c = minC; c <= maxC; c++) {
                    if (this.userSolution[r][c] !== id) {
                        boundingOk = false;
                        break;
                    }
                }
                if (!boundingOk) break;
            }

            if (!boundingOk) {
                return false;
            }

            let numberCount = 0;
            let numberValue = null;
            for (let r = minR; r <= maxR; r++) {
                for (let c = minC; c <= maxC; c++) {
                    if (this.grid[r][c] > 0) {
                        numberCount++;
                        numberValue = this.grid[r][c];
                        if (numberCount > 1) break;
                    }
                }
                if (numberCount > 1) break;
            }

            if (!(numberCount === 1 && numberValue === area)) {
                return false;
            }
        }

        return true;
    }

    showError(message = "Invalid rectangle!") {
        const board = document.getElementById('gameBoard');
        board.classList.add('error');
        
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            board.classList.remove('error');
            toast.remove();
        }, 1500);
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
    }

    updateTimer() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('timer').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    getElapsedTime() {
        return Math.floor((Date.now() - this.startTime) / 1000);
    }
}

// UI Controller
class GameUI {
    constructor() {
        this.game = null;
        this.currentDifficulty = 5;
        this.isMouseDown = false;
        this.isTouchActive = false;
        this.dragStartRow = null;
        this.dragStartCol = null;
        this.dragColor = null;
        this.lastStats = null;
        this.setupEventListeners();
        this.checkFirstVisit();
        this.initializeGame();
    }

    checkFirstVisit() {
        const hasVisited = localStorage.getItem('shikakuVisited');
        if (!hasVisited) {
            setTimeout(() => {
                document.getElementById('tutorialModal').classList.remove('hidden');
            }, 500);
            localStorage.setItem('shikakuVisited', 'true');
        }
    }

    setupEventListeners() {
        document.getElementById('newGameBtn').addEventListener('click', () => this.startNewGame());
        document.getElementById('statsBtn').addEventListener('click', () => this.showStats());
        document.getElementById('helpBtn').addEventListener('click', () => this.showTutorial());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('modalBtn').addEventListener('click', () => this.dismissVictory());

        document.getElementById('tutorialModal').addEventListener('click', (e) => {
            if (e.target.id === 'tutorialModal') {
                document.getElementById('tutorialModal').classList.add('hidden');
            }
        });

        document.getElementById('statsModal').addEventListener('click', (e) => {
            if (e.target.id === 'statsModal') {
                document.getElementById('statsModal').classList.add('hidden');
            }
        });

        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentDifficulty = parseInt(e.target.dataset.size);
                this.startNewGame();
            });
        });

        document.addEventListener('touchmove', (e) => this.handleDocumentTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleDocumentTouchEnd(e));
    }

    initializeGame() {
        this.game = new ShikakuGame(this.currentDifficulty);
        this.renderBoard();
        this.game.startTimer();
    }

    startNewGame() {
        if (this.game) this.game.stopTimer();
        this.game = new ShikakuGame(this.currentDifficulty);
        this.renderBoard();
        document.getElementById('moves').textContent = '0';
        document.getElementById('timer').textContent = '0:00';
        document.getElementById('modal').classList.add('hidden');
        document.getElementById('statsModal').classList.add('hidden');
        this.updateStatsButtonState();
        this.game.startTimer();
    }

    renderBoard() {
        const board = document.getElementById('gameBoard');
        board.innerHTML = '';
        board.style.gridTemplateColumns = `repeat(${this.currentDifficulty}, 1fr)`;
        board.style.gridTemplateRows = `repeat(${this.currentDifficulty}, 1fr)`;

        for (let r = 0; r < this.currentDifficulty; r++) {
            for (let c = 0; c < this.currentDifficulty; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = r;
                cell.dataset.col = c;

                const number = this.game.getCell(r, c);
                if (number) {
                    cell.textContent = number;
                }

                cell.addEventListener('mousedown', (e) => this.handleCellMouseDown(r, c, e));
                cell.addEventListener('mouseover', (e) => this.handleCellMouseOver(r, c, e));
                cell.addEventListener('mouseup', (e) => this.handleCellMouseUp(r, c, e));
                cell.addEventListener('touchstart', (e) => this.handleCellTouchStart(r, c, e));

                board.appendChild(cell);
            }
        }
        this.updateBoardDisplay();
    }

    handleCellMouseDown(row, col, e) {
        e.preventDefault();
        
        if (this.game.userSolution[row][col] !== -1) {
            this.game.deleteRectangle(row, col);
            this.updateBoardDisplay();
            return;
        }
        
        this.isMouseDown = true;
        this.dragStartRow = row;
        this.dragStartCol = col;
        this.dragColor = this.game.colorPalette[this.game.colorIndex % this.game.colorPalette.length];
        this.game.clearSelection();
        this.game.selectCell(row, col);
        this.updateBoardDisplay();
    }

    handleCellMouseOver(row, col, e) {
        if (!this.isMouseDown) return;
        
        this.game.clearSelection();
        this.game.addCellsInRange(this.dragStartRow, this.dragStartCol, row, col);
        this.updateBoardDisplay();
    }

    handleCellMouseUp(row, col, e) {
        if (!this.isMouseDown) return;
        
        this.isMouseDown = false;
        this.completeRectangleFromSelection();
    }

    handleCellTouchStart(row, col, e) {
        e.preventDefault();
        
        if (this.game.userSolution[row][col] !== -1) {
            this.game.deleteRectangle(row, col);
            this.updateBoardDisplay();
            return;
        }
        
        this.isTouchActive = true;
        this.dragStartRow = row;
        this.dragStartCol = col;
        this.dragColor = this.game.colorPalette[this.game.colorIndex % this.game.colorPalette.length];
        this.game.clearSelection();
        this.game.selectCell(row, col);
        this.updateBoardDisplay();
    }

    handleDocumentTouchMove(e) {
        if (!this.isTouchActive) return;
        e.preventDefault();

        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (element && element.classList.contains('cell')) {
            const row = parseInt(element.dataset.row);
            const col = parseInt(element.dataset.col);
            
            this.game.clearSelection();
            this.game.addCellsInRange(this.dragStartRow, this.dragStartCol, row, col);
            this.updateBoardDisplay();
        }
    }

    handleDocumentTouchEnd(e) {
        if (!this.isTouchActive) return;
        
        this.isTouchActive = false;
        this.completeRectangleFromSelection();
    }

    completeRectangleFromSelection() {
        const cells = Array.from(this.game.selectedCells).map(k => {
            const [r, c] = k.split(',').map(Number);
            return { r, c };
        });
        
        if (cells.length > 0) {
            let minRow = Math.min(...cells.map(c => c.r));
            let maxRow = Math.max(...cells.map(c => c.r));
            let minCol = Math.min(...cells.map(c => c.c));
            let maxCol = Math.max(...cells.map(c => c.c));
            
            const height = maxRow - minRow + 1;
            const width = maxCol - minCol + 1;
            const area = height * width;
            
            let numberCount = 0;
            let hasMatchingNumber = false;
            for (let r = minRow; r <= maxRow; r++) {
                for (let c = minCol; c <= maxCol; c++) {
                    if (this.game.grid[r][c] > 0) {
                        numberCount++;
                        if (this.game.grid[r][c] === area) {
                            hasMatchingNumber = true;
                        }
                    }
                }
            }
            
            const isValid = hasMatchingNumber && numberCount === 1;
            
            if (this.game.completeRectangle(isValid)) {
                document.getElementById('moves').textContent = this.game.moves;
                this.updateBoardDisplay();

                if (this.game.isComplete()) {
                    this.showWinModal();
                }
            }
        }
    }

    updateBoardDisplay() {
        document.querySelectorAll('.cell').forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const key = `${row},${col}`;

            cell.classList.remove('selected', 'highlighted', 'completed', 'incomplete');
            cell.style.backgroundColor = '';
            cell.style.opacity = '1';

            if (this.game.userSolution[row][col] !== -1) {
                const rectId = this.game.userSolution[row][col];
                const colorInfo = this.game.userRectangleColors[rectId];
                
                if (colorInfo) {
                    if (colorInfo.isCompleted) {
                        cell.classList.add('completed');
                        cell.style.backgroundColor = colorInfo.color;
                        cell.style.opacity = '1';
                    } else {
                        cell.classList.add('incomplete');
                        cell.style.backgroundColor = colorInfo.color;
                        cell.style.opacity = '0.5';
                    }
                }
            } else if (this.game.selectedCells.has(key)) {
                cell.classList.add('selected');
                cell.style.backgroundColor = this.dragColor || '#667eea';
                cell.style.opacity = '1';
            }
        });
    }

    resetGame() {
        this.game.reset();
        document.getElementById('moves').textContent = '0';
        this.updateBoardDisplay();
    }

    dismissVictory() {
        document.getElementById('modal').classList.add('hidden');
    }

    updateStatsButtonState() {
        const statsBtn = document.getElementById('statsBtn');
        if (this.lastStats) {
            statsBtn.disabled = false;
        } else {
            statsBtn.disabled = true;
        }
    }

    showStats() {
        if (!this.lastStats) return;
        
        document.getElementById('statsTime').textContent = this.lastStats.time;
        document.getElementById('statsMoves').textContent = this.lastStats.moves;
        document.getElementById('statsModal').classList.remove('hidden');
    }

    showTutorial() {
        document.getElementById('tutorialModal').classList.remove('hidden');
    }

    showWinModal() {
        this.game.stopTimer();
        const time = this.game.getElapsedTime();
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Store stats
        this.lastStats = {
            time: timeStr,
            moves: this.game.moves
        };

        // Show in victory modal
        document.getElementById('victoryTime').textContent = timeStr;
        document.getElementById('victoryMoves').textContent = this.game.moves;
        
        // Update stats button
        this.updateStatsButtonState();

        // Show victory modal
        document.getElementById('modal').classList.remove('hidden');
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new GameUI();
});
