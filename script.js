    const board = document.getElementById('game-board');
    let selectedTile = null;

    function getTileIndex(tile) {
      return Array.from(board.children).indexOf(tile);
    }

    function areAdjacent(i1, i2) {
      const r1 = Math.floor(i1 / 3), c1 = i1 % 3;
      const r2 = Math.floor(i2 / 3), c2 = i2 % 3;
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
        const tempSrc = fromImg.src;
        const tempAlt = fromImg.alt;
        fromImg.src = toImg.src;
        fromImg.alt = toImg.alt;
        toImg.src = tempSrc;
        toImg.alt = tempAlt;

        const tempType = fromTile.dataset.type;
        fromTile.dataset.type = toTile.dataset.type;
        toTile.dataset.type = tempType;

        fromTile.classList.toggle('movable', fromTile.dataset.type !== 'empty');
        toTile.classList.toggle('movable', toTile.dataset.type !== 'empty');

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

      }, 300);
    }

    function clearSelection() {
      if (selectedTile) {
        selectedTile.classList.remove('popping');
        selectedTile = null;
      }
      clearHighlights();
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