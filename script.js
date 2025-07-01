// Log a message to the console to ensure the script is linked correctly
console.log('JavaScript file is linked correctly.');

const board = document.getElementById('game-board');
    let draggedTile = null;

    board.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('movable')) {
        draggedTile = e.target;
      }
    });

    board.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    board.addEventListener('drop', (e) => {
      if (!draggedTile || !e.target.classList.contains('tile') || e.target === draggedTile || e.target.classList.contains('start') || e.target.classList.contains('destination')) return;

      if (!e.target.classList.contains('movable') && e.target.innerHTML === '') {
        e.target.innerHTML = draggedTile.innerHTML;
        e.target.classList.add('movable');
        e.target.setAttribute('draggable', 'true');
        e.target.dataset.type = draggedTile.dataset.type;

        draggedTile.innerHTML = '';
        draggedTile.classList.remove('movable');
        draggedTile.removeAttribute('draggable');
        draggedTile.removeAttribute('data-type');
      }
    });
