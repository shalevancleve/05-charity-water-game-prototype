// Log a message to the console to ensure the script is linked correctly
console.log('JavaScript file is linked correctly.');

const board = document.getElementById('game-board');
    let draggedTile = null;

    function getTileIndex(tile) {
      return Array.from(board.children).indexOf(tile);
    }

    function areAdjacent(index1, index2) {
      const row1 = Math.floor(index1 / 3);
      const col1 = index1 % 3;
      const row2 = Math.floor(index2 / 3);
      const col2 = index2 % 3;

      const rowDiff = Math.abs(row1 - row2);
      const colDiff = Math.abs(col1 - col2);

      return (rowDiff + colDiff === 1);
    }

    function highlightAdjacents(index) {
      const tiles = Array.from(board.children);
      tiles.forEach((tile, i) => {
        if (
          areAdjacent(index, i) &&
          tile.innerHTML === '' &&
          !tile.classList.contains('start') &&
          !tile.classList.contains('destination')
        ) {
          tile.classList.add('highlight');
        }
      });
    }

    function clearHighlights() {
      document.querySelectorAll('.tile.highlight').forEach(tile => tile.classList.remove('highlight'));
    }

    board.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('movable')) {
        draggedTile = e.target;
        const index = getTileIndex(draggedTile);
        highlightAdjacents(index);
      }
    });

    board.addEventListener('dragend', () => {
      clearHighlights();
    });

    board.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    board.addEventListener('drop', (e) => {
      const dropTarget = e.target;
      if (
        !draggedTile ||
        !dropTarget.classList.contains('tile') ||
        dropTarget === draggedTile ||
        dropTarget.classList.contains('start') ||
        dropTarget.classList.contains('destination')
      )
        return;

      const draggedIndex = getTileIndex(draggedTile);
      const dropIndex = getTileIndex(dropTarget);

      if (!areAdjacent(draggedIndex, dropIndex)) return;

      if (!dropTarget.classList.contains('movable') && dropTarget.innerHTML === '') {
        const rowDragged = Math.floor(draggedIndex / 3);
        const colDragged = draggedIndex % 3;
        const rowDrop = Math.floor(dropIndex / 3);
        const colDrop = dropIndex % 3;

        // Calculate difference in pixels
        const xDiff = (colDrop - colDragged) * (draggedTile.offsetWidth + 5); // +5 for grid gap
        const yDiff = (rowDrop - rowDragged) * (draggedTile.offsetHeight + 5);

        // Apply transform to draggedTile to move it visually to dropTarget's place
        draggedTile.style.transition = 'transform 0.4s ease';
        draggedTile.style.transform = `translate(${xDiff}px, ${yDiff}px)`;

        // Disable pointer events to avoid drag confusion during animation
        draggedTile.style.pointerEvents = 'none';

        // After animation ends, update tiles and reset styles
        setTimeout(() => {
          // Reset transform and pointer events
          draggedTile.style.transition = '';
          draggedTile.style.transform = '';
          draggedTile.style.pointerEvents = '';

          // Move content to dropTarget
          dropTarget.innerHTML = draggedTile.innerHTML;
          dropTarget.classList.add('movable');
          dropTarget.setAttribute('draggable', 'true');
          dropTarget.dataset.type = draggedTile.dataset.type;

          // Clear original tile
          draggedTile.innerHTML = '';
          draggedTile.classList.remove('movable');
          draggedTile.removeAttribute('draggable');
          draggedTile.removeAttribute('data-type');

          clearHighlights();
        }, 400);
      }
    });