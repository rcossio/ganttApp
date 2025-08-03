import { dayWidth } from './utils.js';
import { closePopups, positionPopup } from './popups.js';
import { ClearButton } from './specialButtons.js';
import { attachClickOutside } from './utils.js';

function TaskSingleBlock(task, rIdx) {
  const b = document.createElement('div');
  b.className = 'task-block';
  const dw = dayWidth();
  b.style.top        = `${40 * (rIdx + 2) + 5}px`;
  b.style.left       = `${dw * task.start}px`;
  b.style.width      = `${dw * (task.end - task.start + 1)}px`;
  b.style.background = task.color;
  b.textContent      = task.name;
  b.dataset.row      = rIdx;
  
  ['start', 'end'].forEach(pos => {
    const h = document.createElement('div');
    h.className = `handle ${pos}`;
    h.style.position = 'absolute';
    h.style.top = '0';
    h.style[pos === 'start' ? 'left' : 'right'] = '0';
    h.style.width = '4px';
    h.style.height = '100%';
    h.style.cursor = 'ew-resize';
    b.appendChild(h);
  });

  b.addEventListener('contextmenu', e => {
    e.preventDefault();
    closePopups();
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    const btn = ClearButton(task);
    menu.appendChild(btn);
    document.body.appendChild(menu);
    positionPopup(menu, b);
    attachClickOutside(menu, () => { closePopups(); menu.remove(); });
  });

  return b;
}

export default TaskSingleBlock;