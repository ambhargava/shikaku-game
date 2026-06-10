// Shikaku Game Logic
class ShikakuGame {
    constructor(gridSize = 5) {
        this.gridSize = gridSize;
        this.grid = [];
        this.solution = [];
        this.userSolution = [];
        this.userRectangleColors = {}; // Track colors for each rectangle
        this.moves = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.history = [];
        this.selectedCells = new Set();
        this.completedRectangles = new Set();
        this.colorPalette = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
            '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A9DFBF',
            '#F1948A', '#85C1E2', '#F7DC6F', '#D7BDE2', '#82E0AA',
            '#FAD7A0', '#A9DFBF', '#F8B88B', '#D5F4E6', '#FADBD8'
        ];
        this.colorIndex = 0;
        
        this.generatePuzzle();
    }

    generatePuzzle() {
        // Keep trying until we get a valid puzzle that covers all cells
        let validPuzzle = false;
        while (!validPuzzle) {
            this.grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(0));
            this.solution = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(-1));
            
            let rectId = 0;
            const placed = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(false));
            
            // Generate rectangles
            for (let i = 0; i < this.gridSize; i++) {
                for (let j = 0; j < this.gridSize; j++) {
                    if (!placed[i][j]) {
                        const rect = this.generateRandomRectangle(i, j, placed);
                        if (rect) {
                            const { row, col, height, width } = rect;
                            const area = height * width;
                            
                            // Place the area number randomly within the rectangle
                            const numberRow = row + Math.floor(Math.random() * height);
                            const numberCol = col + Math.floor(Math.random() * width);
                            
                            this.grid[numberRow][numberCol] = area;
                            
                            // Mark solution
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
            
            // Check if all cells are covered
            validPuzzle = placed.every(row => row.every(cell => cell === true));
        }
        
        this.userSolution = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(-1));
    }

    generateRandomRectangle(startRow, startCol, placed) {
        const maxWidth = Math.min(4, this.gridSize - startCol);
        const maxHeight = Math.min(4, this.gridSize - startRow);
        
        const width = Math.floor(Math.random() * (maxWidth - 1)) + 1;
        const height = Math.floor(Math.random() * (maxHeight - 1)) + 1;
        
        // Check if rectangle can be placed
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
        if (rectId === -1) return; // No rectangle to delete
        
        // Find and remove the rectangle
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.userSolution[r][c] === rectId) {
                    this.userSolution[r][c] = -1;
                }
            }
        }
        
        // Remove from history
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
        
        // Find bounding rectangle
        let minRow = Math.min(...cells.map(c => c.r));
        let maxRow = Math.max(...cells.map(c => c.r));
        let minCol = Math.min(...cells.map(c => c.c));
        let maxCol = Math.max(...cells.map(c => c.c));
        
        const height = maxRow - minRow + 1;
        const width = maxCol - minCol + 1;
        const area = height * width;
        
        // Check if all cells in rectangle are selected
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                if (!this.selectedCells.has(`${r},${c}`)) {
                    // Incomplete rectangle - still allow it
                    break;
                }
            }
        }
        
        // Check if rectangle overlaps with existing
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                if (this.userSolution[r][c] !== -1) {
                    this.showError();
                    return false;
                }
            }
        }
        
        // Get color for this selection
        const color = this.colorPalette[this.colorIndex % this.colorPalette.length];
        this.colorIndex++;
        
        // Check if area matches any number in the rectangle (for validation)
        let hasMatchingNumber = false;
        let numberCount = 0;
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                if (this.grid[r][c] > 0) {
                    numberCount++;
                    if (this.grid[r][c] === area) {
                        hasMatchingNumber = true;
                    }
                }
            }
        }
        
        // Only mark as completed if valid, otherwise mark as incomplete
        const isCompleted = isValid && hasMatchingNumber && numberCount === 1;
        
        // Valid rectangle - mark it
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

    undo() {
        if (this.history.length === 0) return false;
        
        const last = this.history.pop();
        const rectId = last.rectId;
        
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.userSolution[r][c] === rectId) {
                    this.userSolution[r][c] = -1;
                }
            }
        }
        
        this.completedRectangles.delete(rectId);
        if (this.userRectangleColors[rectId]) {
            delete this.userRectangleColors[rectId];
        }
        this.moves++;
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
        // Also check that all rectangles are completed (not just filled)
        return this.completedRectangles.size === Math.max(...Array.from(this.userSolution).flat(), -1) + 1;
    }

    showError() {
        const board = document.getElementById('gameBoard');
        board.classList.add('error');
        setTimeout(() => board.classList.remove('error'), 300);
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
        this.dragStartRow = null;
        this.dragStartCol = null;
        this.dragColor = null;
        this.setupEventListeners();
        this.initializeGame();
    }

    setupEventListeners() {
        document.getElementById('newGameBtn').addEventListener('click', () => this.startNewGame());
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('modalBtn').addEventListener('click', () => this.startNewGame());

        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentDifficulty = parseInt(e.target.dataset.size);
                this.startNewGame();
            });
        });
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

                // Mouse events for desktop drag selection
                cell.addEventListener('mousedown', (e) => this.handleCellMouseDown(r, c, e));
                cell.addEventListener('mouseover', (e) => this.handleCellMouseOver(r, c, e));
                cell.addEventListener('mouseup', (e) => this.handleCellMouseUp(r, c, e));
                cell.addEventListener('mouseleave', () => this.handleCellMouseLeave());

                // Touch events for mobile
                cell.addEventListener('touchstart', (e) => this.handleCellTouchStart(r, c, e));
                cell.addEventListener('touchmove', (e) => this.handleCellTouchMove(r, c, e));
                cell.addEventListener('touchend', (e) => this.handleCellTouchEnd(r, c, e));

                board.appendChild(cell);
            }
        }
        this.updateBoardDisplay();
    }

    handleCellMouseDown(row, col, e) {
        e.preventDefault();
        
        // If clicking on an existing rectangle, delete it
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
        
        // Check if the selection is valid
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
            
            // Count numbers in selection
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

    handleCellMouseLeave() {
        // Optional: clear visual feedback on mouse leave
    }

    handleCellTouchStart(row, col, e) {
        e.preventDefault();
        
        // If tapping on an existing rectangle, delete it
        if (this.game.userSolution[row][col] !== -1) {
            this.game.deleteRectangle(row, col);
            this.updateBoardDisplay();
            return;
        }
        
        this.dragStartRow = row;
        this.dragStartCol = col;
        this.dragColor = this.game.colorPalette[this.game.colorIndex % this.game.colorPalette.length];
        this.game.clearSelection();
        this.game.selectCell(row, col);
        this.updateBoardDisplay();
    }

    handleCellTouchMove(row, col, e) {
        e.preventDefault();
        
        this.game.clearSelection();
        this.game.addCellsInRange(this.dragStartRow, this.dragStartCol, row, col);
        this.updateBoardDisplay();
    }

    handleCellTouchEnd(row, col, e) {
        e.preventDefault();
        
        // Check if the selection is valid
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
            
            // Count numbers in selection
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
            }
        });
    }

    undo() {
        if (this.game.undo()) {
            document.getElementById('moves').textContent = this.game.moves;
            this.updateBoardDisplay();
        }
    }

    resetGame() {
        this.game.reset();
        document.getElementById('moves').textContent = '0';
        this.updateBoardDisplay();
    }

    showHint() {
        // Find next incomplete number
        for (let r = 0; r < this.currentDifficulty; r++) {
            for (let c = 0; c < this.currentDifficulty; c++) {
                const num = this.game.grid[r][c];
                if (num && this.game.userSolution[r][c] === -1) {
                    // Found a cell with number that needs to be filled
                    document.querySelectorAll('.cell').forEach(cell => {
                        if (parseInt(cell.dataset.row) === r && parseInt(cell.dataset.col) === c) {
                            cell.style.animation = 'pulse 1s infinite';
                        }
                    });
                    return;
                }
            }
        }
    }

    showWinModal() {
        this.game.stopTimer();
        const time = this.game.getElapsedTime();
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;

        const modal = document.getElementById('modal');
        document.getElementById('modalStats').innerHTML = `
            <div>Time: ${minutes}:${seconds.toString().padStart(2, '0')}</div>
            <div>Moves: ${this.game.moves}</div>
        `;
        modal.classList.remove('hidden');
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new GameUI();
});
