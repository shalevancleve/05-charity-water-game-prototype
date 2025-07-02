document.addEventListener('DOMContentLoaded', () => {
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
          const img = tile.querySelector('img');
          if (
            areAdjacent(index, i) &&
            img &&
            img.src.includes('empty.png') &&
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

      // Helper to swap images and data attributes between two tiles
      function swapTiles(fromTile, toTile) {
        const fromImg = fromTile.querySelector('img');
        const toImg = toTile.querySelector('img');

        // Swap src and alt of images
        const tempSrc = fromImg.src;
        const tempAlt = fromImg.alt;
        fromImg.src = toImg.src;
        fromImg.alt = toImg.alt;
        toImg.src = tempSrc;
        toImg.alt = tempAlt;

        // Swap data-type attributes
        const tempType = fromTile.dataset.type;
        fromTile.dataset.type = toTile.dataset.type;
        toTile.dataset.type = tempType;

        // Update draggable class and attribute
        if (fromTile.dataset.type === 'empty' || fromTile.classList.contains('start') || fromTile.classList.contains('destination')) {
          fromTile.classList.remove('movable');
          fromTile.setAttribute('draggable', 'false');
        } else {
          fromTile.classList.add('movable');
          fromTile.setAttribute('draggable', 'true');
        }

        if (toTile.dataset.type === 'empty' || toTile.classList.contains('start') || toTile.classList.contains('destination')) {
          toTile.classList.remove('movable');
          toTile.setAttribute('draggable', 'false');
        } else {
          toTile.classList.add('movable');
          toTile.setAttribute('draggable', 'true');
        }
      }

      // Animation and swap function
      function animateAndSwapTiles(fromTile, toTile, fromIndex, toIndex) {
        const rowFrom = Math.floor(fromIndex / 3);
        const colFrom = fromIndex % 3;
        const rowTo = Math.floor(toIndex / 3);
        const colTo = toIndex % 3;
        const xDiff = (colTo - colFrom) * (fromTile.offsetWidth + 5);
        const yDiff = (rowTo - rowFrom) * (fromTile.offsetHeight + 5);

        const fromImg = fromTile.querySelector('img');
        fromImg.style.transition = 'transform 0.4s ease';
        fromImg.style.transform = `translate(${xDiff}px, ${yDiff}px)`;
        fromImg.style.pointerEvents = 'none';

        setTimeout(() => {
          fromImg.style.transition = '';
          fromImg.style.transform = '';
          fromImg.style.pointerEvents = '';
          swapTiles(fromTile, toTile);
        }, 400);
      }

      // MOUSE events
      board.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('movable')) {
        draggedTile = e.target;
        document.body.classList.add('dragging');
        const index = getTileIndex(draggedTile);
        highlightAdjacents(index);

        // Use a fully transparent SVG as drag image to eliminate system ghost + icon
        const transparentImg = new Image();
        transparentImg.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';
        e.dataTransfer.setDragImage(transparentImg, 0, 0);
      }
    });


      board.addEventListener('dragend', () => {
        document.body.classList.remove('dragging');
        clearHighlights();
      });

      board.addEventListener('dragover', (e) => {
        e.preventDefault();
      });

      board.addEventListener('drop', (e) => {
        const dropTarget = e.target.closest('.tile');
        if (!draggedTile || !dropTarget || dropTarget === draggedTile || dropTarget.classList.contains('start') || dropTarget.classList.contains('destination')) return;
        const draggedIndex = getTileIndex(draggedTile);
        const dropIndex = getTileIndex(dropTarget);
        if (!areAdjacent(draggedIndex, dropIndex)) return;
        if (!dropTarget.classList.contains('movable') && dropTarget.dataset.type === 'empty') {
          animateAndSwapTiles(draggedTile, dropTarget, draggedIndex, dropIndex);
        }
      });

      // TOUCH support for mobile devices
      let touchStartTile = null;
      board.addEventListener('touchstart', (e) => {
        const target = e.target.closest('.tile');
        if (target && target.classList.contains('movable')) {
          touchStartTile = target;
          const index = getTileIndex(touchStartTile);
          highlightAdjacents(index);
        }
      }, { passive: true });

      board.addEventListener('touchend', (e) => {
        const touch = e.changedTouches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        const dropTarget = element && element.closest('.tile');
        if (!touchStartTile || !dropTarget || dropTarget === touchStartTile || dropTarget.classList.contains('start') || dropTarget.classList.contains('destination')) {
          clearHighlights();
          touchStartTile = null;
          return;
        }
        const draggedIndex = getTileIndex(touchStartTile);
        const dropIndex = getTileIndex(dropTarget);
        if (!areAdjacent(draggedIndex, dropIndex)) {
          clearHighlights();
          touchStartTile = null;
          return;
        }
        if (!dropTarget.classList.contains('movable') && dropTarget.dataset.type === 'empty') {
          animateAndSwapTiles(touchStartTile, dropTarget, draggedIndex, dropIndex);
        }
        clearHighlights();
        touchStartTile = null;
      });
    });