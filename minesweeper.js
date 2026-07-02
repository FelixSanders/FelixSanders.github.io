/* =========================================
   FSK Minesweeper — game logic
   ========================================= */

const MS_DIFFICULTIES = {
    easy:   { rows: 9,  cols: 9,  mines: 10 },
    medium: { rows: 13, cols: 13, mines: 30 },
    hard:   { rows: 16, cols: 16, mines: 50 }
};

let msRows = MS_DIFFICULTIES.easy.rows;
let msCols = MS_DIFFICULTIES.easy.cols;
let msMineCount = MS_DIFFICULTIES.easy.mines;
let msDifficulty = 'easy';

let msBoard = [];          // -1 = mine, 0-8 = adjacent mine count
let msRevealed = [];       // boolean grid
let msFlagged = [];        // boolean grid
let msFirstClick = true;
let msGameOver = false;
let msFlagMode = false;
let msFlagsPlaced = 0;
let msTimerInterval = null;
let msSecondsElapsed = 0;

$(document).ready(function () {
    setDifficulty('easy');
});

function setDifficulty(level) {
    if (!MS_DIFFICULTIES[level]) return;
    msDifficulty = level;
    msRows = MS_DIFFICULTIES[level].rows;
    msCols = MS_DIFFICULTIES[level].cols;
    msMineCount = MS_DIFFICULTIES[level].mines;

    $('.difficulty-button').removeClass('active');
    $('#diff-' + level).addClass('active');

    generateMinesweeper();
}

function generateMinesweeper() {
    msGameOver = false;
    msFirstClick = true;
    msFlagsPlaced = 0;
    msSecondsElapsed = 0;
    stopMsTimer();
    $('#ms-timer').text('000');
    $('#mine-count').text(msMineCount);
    $('#ms-face').text('🙂');

    msBoard = Array.from({ length: msRows }, () => Array(msCols).fill(0));
    msRevealed = Array.from({ length: msRows }, () => Array(msCols).fill(false));
    msFlagged = Array.from({ length: msRows }, () => Array(msCols).fill(false));

    renderMsBoard();
}

function renderMsBoard() {
    const $grid = $('#minesweeper-grid');
    $grid.empty();

    for (let r = 0; r < msRows; r++) {
        const $row = $('<tr></tr>');
        for (let c = 0; c < msCols; c++) {
            const $cell = $('<td></td>')
                .addClass('ms-hidden')
                .attr('data-row', r)
                .attr('data-col', c)
                .on('click', onMsCellClick)
                .on('contextmenu', onMsCellRightClick);
            $row.append($cell);
        }
        $grid.append($row);
    }
}

function onMsCellClick(e) {
    if (msGameOver) return;
    const $cell = $(this);
    const r = parseInt($cell.attr('data-row'));
    const c = parseInt($cell.attr('data-col'));

    if (msFlagMode) {
        toggleFlag(r, c);
        return;
    }

    if (msFlagged[r][c] || msRevealed[r][c]) return;

    if (msFirstClick) {
        placeMines(r, c);
        msFirstClick = false;
        startMsTimer();
    }

    if (msBoard[r][c] === -1) {
        revealMine(r, c);
        return;
    }

    floodReveal(r, c);
    checkMsWin();
}

function onMsCellRightClick(e) {
    e.preventDefault();
    if (msGameOver) return;
    const $cell = $(this);
    const r = parseInt($cell.attr('data-row'));
    const c = parseInt($cell.attr('data-col'));
    toggleFlag(r, c);
}

function toggleFlagMode() {
    msFlagMode = !msFlagMode;
    $('#flag-mode-button').toggleClass('active', msFlagMode);
}

function toggleFlag(r, c) {
    if (msRevealed[r][c]) return;
    msFlagged[r][c] = !msFlagged[r][c];
    msFlagsPlaced += msFlagged[r][c] ? 1 : -1;
    $('#mine-count').text(msMineCount - msFlagsPlaced);

    const $cell = getMsCell(r, c);
    if (msFlagged[r][c]) {
        $cell.addClass('ms-flagged').html('<i class="fa-solid fa-flag"></i>');
    } else {
        $cell.removeClass('ms-flagged').html('');
    }
}

function placeMines(safeRow, safeCol) {
    let placed = 0;
    const safeZone = new Set();
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            const nr = safeRow + dr, nc = safeCol + dc;
            if (nr >= 0 && nr < msRows && nc >= 0 && nc < msCols) {
                safeZone.add(nr + ',' + nc);
            }
        }
    }

    while (placed < msMineCount) {
        const r = Math.floor(Math.random() * msRows);
        const c = Math.floor(Math.random() * msCols);
        if (msBoard[r][c] === -1 || safeZone.has(r + ',' + c)) continue;
        msBoard[r][c] = -1;
        placed++;
    }

    for (let r = 0; r < msRows; r++) {
        for (let c = 0; c < msCols; c++) {
            if (msBoard[r][c] === -1) continue;
            msBoard[r][c] = countAdjacentMines(r, c);
        }
    }
}

function countAdjacentMines(r, c) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < msRows && nc >= 0 && nc < msCols && msBoard[nr][nc] === -1) {
                count++;
            }
        }
    }
    return count;
}

function floodReveal(startR, startC) {
    const stack = [[startR, startC]];
    while (stack.length) {
        const [r, c] = stack.pop();
        if (r < 0 || r >= msRows || c < 0 || c >= msCols) continue;
        if (msRevealed[r][c] || msFlagged[r][c]) continue;

        msRevealed[r][c] = true;
        const value = msBoard[r][c];
        const $cell = getMsCell(r, c);
        $cell.removeClass('ms-hidden').addClass('ms-revealed');

        if (value > 0) {
            $cell.addClass('ms-n' + value).text(value);
        } else {
            $cell.text('');
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    stack.push([r + dr, c + dc]);
                }
            }
        }
    }
}

function revealMine(r, c) {
    msGameOver = true;
    stopMsTimer();
    $('#ms-face').text('😵');

    for (let i = 0; i < msRows; i++) {
        for (let j = 0; j < msCols; j++) {
            if (msBoard[i][j] === -1) {
                const $cell = getMsCell(i, j);
                $cell.removeClass('ms-hidden ms-flagged').addClass(
                    i === r && j === c ? 'ms-mine-triggered' : 'ms-mine'
                ).html('<i class="fa-solid fa-bomb"></i>');
            }
        }
    }

    showResult('Boom! You hit a mine. Try again.');
}

function checkMsWin() {
    let revealedSafeCells = 0;
    const totalSafeCells = msRows * msCols - msMineCount;

    for (let r = 0; r < msRows; r++) {
        for (let c = 0; c < msCols; c++) {
            if (msRevealed[r][c] && msBoard[r][c] !== -1) revealedSafeCells++;
        }
    }

    if (revealedSafeCells === totalSafeCells) {
        msGameOver = true;
        stopMsTimer();
        $('#ms-face').text('😎');

        for (let r = 0; r < msRows; r++) {
            for (let c = 0; c < msCols; c++) {
                if (msBoard[r][c] === -1 && !msFlagged[r][c]) {
                    toggleFlag(r, c);
                }
            }
        }

        showResult('You cleared the field in ' + msSecondsElapsed + ' seconds!');
    }
}

function getMsCell(r, c) {
    return $('#minesweeper-grid td[data-row="' + r + '"][data-col="' + c + '"]');
}

function startMsTimer() {
    stopMsTimer();
    msTimerInterval = setInterval(function () {
        msSecondsElapsed++;
        $('#ms-timer').text(String(Math.min(msSecondsElapsed, 999)).padStart(3, '0'));
    }, 1000);
}

function stopMsTimer() {
    if (msTimerInterval) {
        clearInterval(msTimerInterval);
        msTimerInterval = null;
    }
}

function showResult(message) {
    $('.result-text').text(message);
    $('.result-message').addClass('active').css('display', 'flex');
}

function closePopup() {
    $('.result-message').removeClass('active').css('display', 'none');
}