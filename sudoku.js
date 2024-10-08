let solvedBoard = []; // Store the solved board here
let generatedBoard = []; // Track the generated board to keep cells uneditable

// Create the Sudoku grid in HTML
const grid = document.getElementById("sudoku-grid");

for (let i = 0; i < 9; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < 9; j++) {
        const cell = document.createElement("td");
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = "1";  // Limit input to one character
        input.id = `cell-${i}-${j}`; // Set ID for each cell
        input.classList.add("editable"); // Add a class for editable cells
        input.inputMode = "numeric"; // Suggest numeric keyboard on mobile
        input.pattern = "[0-9]"; // Pattern to allow only single digits
        input.addEventListener("input", function() {
            this.value = this.value.replace(/[^0-9]/g, ''); // Ensure only numbers are entered
        });
        cell.appendChild(input);
        row.appendChild(cell);
    }
    grid.appendChild(row);
}

// Get the board state from HTML inputs
function getBoard() {
    const board = [];
    const rows = document.querySelectorAll("#sudoku-grid tr");
    rows.forEach((row) => {
        const cols = row.querySelectorAll("input");
        const boardRow = [];
        cols.forEach((col) => {
            boardRow.push(col.value === "" ? 0 : parseInt(col.value));
        });
        board.push(boardRow);
    });
    return board;
}

// Set the board to HTML inputs and control editability
function setBoard(board) {
    const rows = document.querySelectorAll("#sudoku-grid tr");
    rows.forEach((row, i) => {
        const cols = row.querySelectorAll("input");
        cols.forEach((col, j) => {
            col.value = board[i][j] !== 0 ? board[i][j] : "";
            // If the cell is part of the generated board, keep it non-editable
            col.disabled = generatedBoard[i][j] !== 0; 
            col.classList.toggle('editable', generatedBoard[i][j] === 0); 
            col.style.backgroundColor = ""; // Reset background color
        });
    });
}

// Backtracking algorithm to solve Sudoku
function solve(board) {
    const empty = findEmpty(board);
    if (!empty) return true;
    const [row, col] = empty;

    for (let num = 1; num <= 9; num++) {
        if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            if (solve(board)) return true;
            board[row][col] = 0;
        }
    }
    return false;
}

function findEmpty(board) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === 0) return [i, j];
        }
    }
    return null;
}

function isSafe(board, row, col, num) {
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num || board[x][col] === num) return false;
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i + startRow][j + startCol] === num) return false;
        }
    }
    return true;
}

// Solve the Sudoku on the grid
function solveSudoku() {
    const board = getBoard();
    if (solve(board)) {
        setBoard(board); // Keep user-filled cells editable, generated cells non-editable
        solvedBoard = board; // Store the solved board for later checking
    } else {
        showResultMessage("No solution exists!", false);
    }
}

// Clear the grid
function clearGrid() {
    const inputs = document.querySelectorAll("input");
    inputs.forEach((input) => {
        input.value = "";
        input.disabled = false;
        input.classList.add('editable');
        input.style.backgroundColor = ""; // Reset background color
    });
    generatedBoard = [];
}

// Generate a random Sudoku puzzle
function generateSudoku() {
    clearGrid();  // Clear the grid before generating a new puzzle
    const board = generateFullSudoku();
    solvedBoard = JSON.parse(JSON.stringify(board)); // Store the full solution
    removeNumbersFromBoard(board, 50);  // Adjust this number to change difficulty
    generatedBoard = JSON.parse(JSON.stringify(board)); // Store generated board
    setBoard(board); // Set the board with correct editability
}

// Generate a fully solved Sudoku board with randomization
function generateFullSudoku() {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));

    // Randomly fill the diagonal boxes to introduce randomness
    for (let i = 0; i < 9; i += 3) {
        fillDiagonalBox(board, i, i);
    }

    solve(board);  // Use the existing solve function to fill the rest of the board
    return board;
}

// Fill diagonal 3x3 boxes with random numbers
function fillDiagonalBox(board, row, col) {
    const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            board[row + i][col + j] = nums[i * 3 + j];
        }
    }
}

// Shuffle an array to randomize the numbers
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Remove random numbers from the board to create a puzzle
function removeNumbersFromBoard(board, numHoles) {
    while (numHoles > 0) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (board[row][col] !== 0) {
            board[row][col] = 0;
            numHoles--;
        }
    }
}

// Check if the user's solution is correct
function checkSolution() {
    const userBoard = getBoard(); // Get user's current board state
    let isCorrect = true; // Flag to track if the solution is correct

    // Iterate over each cell to check the user's input
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const input = document.getElementById(`cell-${i}-${j}`);
            if (userBoard[i][j] === solvedBoard[i][j]) {
                // If correct, turn the cell green
                input.style.backgroundColor = '#00e043';
            } else {
                // If incorrect, turn it red
                input.style.backgroundColor = '#e00700';
                isCorrect = false; // Mark the solution as incorrect
            }
        }
    }

    if (isCorrect) {
        showResultMessage("The solution is correct!", true);
    } else {
        showResultMessage("The solution is incorrect!", false);

        // Revert incorrect cells back to default color after 2 seconds
        setTimeout(() => {
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    const input = document.getElementById(`cell-${i}-${j}`);
                    if (input.style.backgroundColor === 'rgb(224, 7, 0)') { // Checking if it's red
                        input.style.backgroundColor = ''; // Reset background color
                    } else if (input.style.backgroundColor === 'rgb(0, 224, 67)') { // Checking if it's green
                        input.style.backgroundColor = ''; // Reset background color
                    }
                }
            }
        }, 1500); // 2 seconds delay
    }
}

function showResultMessage(message, isCorrect) {
    const resultMessageDiv = document.querySelector('.result-message');
    const resultText = document.querySelector('.result-text');
    resultText.textContent = message;

    if (isCorrect) {
        resultMessageDiv.style.backgroundColor = '#90EE90'; // Light green for correct
    } else {
        resultMessageDiv.style.backgroundColor = '#FFB6C1'; // Light pink for incorrect
    }

    resultMessageDiv.style.display = 'block';
}

// Function to close the popup
function closePopup() {
    const resultMessageDiv = document.querySelector('.result-message');
    resultMessageDiv.style.display = 'none';
}
