// Set grid size dynamically for each level
let gridRows = 3;
let gridCols = 3;

// If you want to use a 5x5 grid for the final level, set gridRows = 5; gridCols = 5;
// Example: gridRows = 5; gridCols = 5; // For 5x5 grid

const board = document.getElementById('game-board');
let selectedTile = null;

// Tile map: each key represents a tile type
const TILE_MAP = {
  S: { type: 'start', img: 'assets/water-can-transparent.png', alt: 'Start', classes: 'start unmovable' },
  D: { type: 'destination', img: 'assets/destination-house.png', alt: 'Destination', classes: 'destination unmovable' },
  B: { type: 'stone-block', img: 'assets/stone-block.png', alt: 'Stone Block Obstacle', classes: 'unmovable' },
  E: { type: 'empty', img: 'assets/empty.png', alt: 'Empty Space', classes: '' },
  H: { type: 'h-pipe', img: 'assets/h-pipe.png', alt: 'Horizontal Pipe', classes: 'movable', draggable: true },
  V: { type: 'v-pipe', img: 'assets/v-pipe.png', alt: 'Vertical Pipe', classes: 'movable', draggable: true },
  L: { type: 'l-pipe', img: 'assets/l-pipe.png', alt: 'L Elbow Pipe', classes: 'movable', draggable: true },
  N: { type: 'n-pipe', img: 'assets/n-pipe.png', alt: 'N Elbow Pipe', classes: 'movable', draggable: true },
  R: { type: 'r-pipe', img: 'assets/r-pipe.png', alt: 'R Elbow Pipe', classes: 'movable', draggable: true },
  J: { type: 'j-pipe', img: 'assets/j-pipe.png', alt: 'J Elbow Pipe', classes: 'movable', draggable: true },
  TD: { type: 'td-pipe', img: 'assets/td-pipe.png', alt: 'Downward T Pipe', classes: 'movable', draggable: true },
  TU: { type: 'tu-pipe', img: 'assets/tu-pipe.png', alt: 'Upward T Pipe', classes: 'movable', draggable: true },
  TL: { type: 'tl-pipe', img: 'assets/tl-pipe.png', alt: 'Left T Pipe', classes: 'movable', draggable: true },
  TR: { type: 'tr-pipe', img: 'assets/tr-pipe.png', alt: 'Right T Pipe', classes: 'movable', draggable: true }
};

// Levels: each level is an array of tile keys
const LEVELS = [
  // Level 1 (3x3)
  [
    "S", "H", "N",
    "E", "E", "V",
    "E", "E", "D"
  ],
  // Level 2 (3x3) - example, you can add more
  [
    "S", "N", "E",
    "E", "L", "N",
    "E", "D", "J"
  ],
  // Level 3 (3x3)
  [
    "S", "N", "E",
    "B", "V", "E",
    "E", "L", "D"
  ],
  // Level 4 (3x3)
  [
    "E", "R", "S",
    "E", "TR", "N",
    "D", "TU", "D"
  ],
  // ...add more 3x3 levels here...
  // Challenge Level (5x5)
  [
    "R", "H", "H", "D", "E",
    "V", "B", "R", "H", "N",
    "TR", "H", "S", "B", "D",
    "L", "N", "B", "E", "V",
    "D", "TU", "H", "H", "J"
  ]
];

let currentLevel = 0; // Track the current level

// Store the solved state for the current level
let solvedState = [];

// Check if the current board matches the solved state
function isBoardSolved() {
  // Get the current board's tile keys
  const tiles = Array.from(board.children);
  const currentKeys = tiles.map(tile => {
    // Find the key in TILE_MAP that matches this tile's type
    for (const key in TILE_MAP) {
      if (TILE_MAP[key].type === tile.dataset.type) {
        return key;
      }
    }
    return null;
  });

  // Compare currentKeys to solvedState
  for (let i = 0; i < solvedState.length; i++) {
    if (currentKeys[i] !== solvedState[i]) {
      return false;
    }
  }
  return true;
}

// This function checks if the board is solved and enables the next level button
function checkForWin() {
  if (isBoardSolved()) {
    const nextLevelBtn = document.getElementById('next-level-btn');
    if (nextLevelBtn) {
      nextLevelBtn.disabled = false;
    }
    // You can add more win effects here (like a message or animation)
  }
}

// Helper function to shuffle an array (Fisher-Yates shuffle)
// This function makes a copy of the array, so the original is NOT changed.
function shuffleArray(array) {
  // Make a shallow copy so the original levelKeys is not modified
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    // Pick a random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));
    // Swap arr[i] and arr[j]
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

function scrambleLevelByMoves(levelKeys, rows, cols, moves = 300) {
  const board = levelKeys.slice(); // clone to avoid mutating input
  let previousSwaps = new Set();

  // Helper to find empty tile indexes
  function getEmptyIndexes(board) {
    const emptyIndexes = [];
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "E") emptyIndexes.push(i);
    }
    return emptyIndexes;
  }

  // Helper to find adjacent indexes in the grid
  function getAdjacentIndexes(index, rows, cols) {
    const adj = [];
    const row = Math.floor(index / cols);
    const col = index % cols;
    if (row > 0) adj.push(index - cols);     // up
    if (row < rows - 1) adj.push(index + cols); // down
    if (col > 0) adj.push(index - 1);         // left
    if (col < cols - 1) adj.push(index + 1);  // right
    return adj;
  }

  // Used to prevent flip-flop moves
  let lastMove = null;

  for (let m = 0; m < moves; m++) {
    const emptyIndexes = getEmptyIndexes(board);
    const possibleSwaps = [];

    for (const emptyIdx of emptyIndexes) {
      const adjacent = getAdjacentIndexes(emptyIdx, rows, cols);
      for (const adjIdx of adjacent) {
        const tile = board[adjIdx];
        if (["S", "B", "D"].includes(tile)) continue; // skip fixed tiles

        const moveKey = `${adjIdx}-${emptyIdx}`;
        const reverseKey = `${emptyIdx}-${adjIdx}`;
        if (moveKey === lastMove) continue; // avoid direct undo

        possibleSwaps.push({ from: adjIdx, to: emptyIdx, key: moveKey });
      }
    }

    if (possibleSwaps.length === 0) break;

    const swap = possibleSwaps[Math.floor(Math.random() * possibleSwaps.length)];

    // Execute the move
    [board[swap.from], board[swap.to]] = [board[swap.to], board[swap.from]];
    lastMove = `${swap.to}-${swap.from}`; // set reverse of this move
  }

  return board;
}

// Set grid size and create grid for a level
function loadLevel(levelIndex) {
  currentLevel = levelIndex;
  const levelKeys = LEVELS[levelIndex];
  // Save the solved state for this level
  solvedState = levelKeys.slice();
  // Set grid size based on level length
  if (levelKeys.length === 25) {
    gridRows = 5;
    gridCols = 5;
  } else {
    gridRows = 3;
    gridCols = 3;
  }
  // Use the improved scrambler for all levels
  const scrambleMoves = (gridRows === 5 && gridCols === 5) ? 100 : 30;
  const scrambledKeys = scrambleLevelByMoves(levelKeys, gridRows, gridCols, scrambleMoves);
  // Map keys to tile data
  const tileData = scrambledKeys.map(key => TILE_MAP[key]);
  createGrid(gridRows, gridCols, tileData);

  // Disable next level button at the start of a level
  const nextLevelBtn = document.getElementById('next-level-btn');
  if (nextLevelBtn) {
    nextLevelBtn.disabled = true;
  }
}

// Get the index of a tile in the grid
function getTileIndex(tile) {
  return Array.from(board.children).indexOf(tile);
}

// Check if two tiles are adjacent in the grid
function areAdjacent(i1, i2) {
  // Calculate row and column for each index using gridCols
  const r1 = Math.floor(i1 / gridCols), c1 = i1 % gridCols;
  const r2 = Math.floor(i2 / gridCols), c2 = i2 % gridCols;
  // Tiles are adjacent if they are next to each other horizontally or vertically
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
}

function highlightAdjacents(index) {
  clearHighlights();
  const tiles = Array.from(board.children);
  tiles.forEach((tile, i) => {
    if (
      areAdjacent(index, i) &&
      tile.dataset.type === 'empty' &&
      !tile.classList.contains('start') &&
      !tile.classList.contains('destination')
    ) {
      tile.classList.add('highlight');
    }
  });
}

function clearHighlights() {
  board.querySelectorAll('.highlight').forEach(t => t.classList.remove('highlight'));
}

function swapTiles(fromTile, toTile) {
  fromTile.classList.remove('popping');

  const fromImg = fromTile.querySelector('img');
  const toImg = toTile.querySelector('img');

  const fromRect = fromTile.getBoundingClientRect();
  const toRect = toTile.getBoundingClientRect();
  const deltaX = toRect.left - fromRect.left;
  const deltaY = toRect.top - fromRect.top;

  fromTile.classList.add('animating');
  toTile.classList.add('animating');

  fromTile.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  toTile.style.transform = `translate(${-deltaX}px, ${-deltaY}px)`;

  setTimeout(() => {
    // Swap images and alt text
    const tempSrc = fromImg.src;
    const tempAlt = fromImg.alt;
    fromImg.src = toImg.src;
    fromImg.alt = toImg.alt;
    toImg.src = tempSrc;
    toImg.alt = tempAlt;

    // Swap data-type
    const tempType = fromTile.dataset.type;
    fromTile.dataset.type = toTile.dataset.type;
    toTile.dataset.type = tempType;

    // Update movable class
    fromTile.classList.toggle('movable', fromTile.dataset.type !== 'empty');
    toTile.classList.toggle('movable', toTile.dataset.type !== 'empty');

    // Always remove popping class after swap so popout can be triggered again
    fromTile.classList.remove('popping');
    toTile.classList.remove('popping');

    fromTile.style.transition = 'none';
    toTile.style.transition = 'none';
    fromTile.style.transform = 'none';
    toTile.style.transform = 'none';

    void fromTile.offsetWidth;
    void toTile.offsetWidth;

    fromTile.classList.remove('animating');
    toTile.classList.remove('animating');
    fromTile.style.transition = '';
    toTile.style.transition = '';

    // Remove the inline transform style so .popping can work again
    fromTile.style.removeProperty('transform');
    toTile.style.removeProperty('transform');

    // After swap, check for win
    checkForWin();
  }, 300);
}

function clearSelection() {
  if (selectedTile) {
    selectedTile.classList.remove('popping');
    selectedTile = null;
  }
  clearHighlights();
}

// If you want to generate the grid dynamically, you can use a function like this:
// Update createGrid to set the correct board size class
function createGrid(rows, cols, tileData) {
  board.innerHTML = '';

  // Set tile and gap sizes to fit inside #game-container
  let tileSize = 102;
  let gap = 5;
  if (rows === 5 && cols === 5) {
    tileSize = 56;
    gap = 5;
  }

  board.style.gridTemplateColumns = `repeat(${cols}, ${tileSize}px)`;
  board.style.gridTemplateRows = `repeat(${rows}, ${tileSize}px)`;
  board.style.width = `${cols * tileSize + (cols - 1) * gap}px`;
  board.style.height = `${rows * tileSize + (rows - 1) * gap}px`;
  board.style.gap = `${gap}px`;
  board.classList.toggle('five-by-five', rows === 5 && cols === 5);

  for (let i = 0; i < rows * cols; i++) {
    const data = tileData[i] || { type: 'empty', img: 'assets/empty.png', alt: 'Empty Space', classes: '' };
    const tile = document.createElement('div');
    tile.className = `tile${data.classes ? ' ' + data.classes : ''}`;
    tile.dataset.type = data.type;
    if (data.draggable) tile.setAttribute('draggable', 'true');
    const img = document.createElement('img');
    img.src = data.img;
    img.alt = data.alt;
    tile.appendChild(img);
    board.appendChild(tile);
  }
}

board.addEventListener('click', (e) => {
  const clickedTile = e.target.closest('.tile');
  if (!clickedTile) return;

  if (clickedTile.classList.contains('highlight') && selectedTile) {
    swapTiles(selectedTile, clickedTile);
    clearSelection();
    return;
  }

  if (clickedTile.classList.contains('movable')) {
    if (selectedTile === clickedTile) {
      clearSelection();
    } else {
      clearSelection();
      selectedTile = clickedTile;
      
      selectedTile.classList.remove('popping');
      void selectedTile.offsetWidth;
      selectedTile.classList.add('popping');

      const index = getTileIndex(selectedTile);
      highlightAdjacents(index);
    }
    return;
  }

  clearSelection();
});

board.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  if (!target) return;
  const tile = target.closest('.tile');
  if (!tile) return;
  tile.click();
  e.preventDefault();
}, { passive: false });

// Hamburger menu and sidebar logic for beginners
const hamburger = document.getElementById('hamburger-menu');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebar-overlay');
const closeBtn = document.getElementById('sidebar-close'); // Add close button

hamburger.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
});

overlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  overlay.style.display = 'none';
});

// Add close button logic for sidebar (for index.html)
if (closeBtn && sidebar && overlay) {
  closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.style.display = 'none';
  });
}

// Hide sidebar if window is resized above 1000px
window.addEventListener('resize', () => {
  if (window.innerWidth > 1000) {
    sidebar.classList.remove('open');
    overlay.style.display = 'none';
  }
});

// On page load, fill the board with empty tiles only
window.addEventListener('DOMContentLoaded', () => {
  // Fill the board with empty tiles (dirt background)
  const emptyTiles = Array(gridRows * gridCols).fill(TILE_MAP.E);
  createGrid(gridRows, gridCols, emptyTiles);

  // Set up menu buttons
  const newGameBtn = document.getElementById('new-game-btn');
  const nextLevelBtn = document.getElementById('next-level-btn');

  if (newGameBtn) {
    newGameBtn.addEventListener('click', () => {
      loadLevel(0); // Always load the first level
      // nextLevelBtn.disabled = true; // Uncomment when level completion is implemented
    });
  }

  if (nextLevelBtn) {
    nextLevelBtn.addEventListener('click', () => {
      // Only go to next level if not at last level
      if (currentLevel < LEVELS.length - 1) {
        loadLevel(currentLevel + 1);
        // nextLevelBtn.disabled = true; // Uncomment when level completion is implemented
      }
    });
    nextLevelBtn.disabled = true; // Always disabled for now
  }
});