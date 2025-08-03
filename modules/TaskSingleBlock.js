import { dayWidth, flattenRows } from './utils.js';
import { closePopups, positionPopup } from './popups.js';
import { ClearButton } from './specialButtons.js';
import { attachClickOutside } from './utils.js';
import state from './state.js';
import { saveConfig } from './config.js';
import { render } from './render.js';

function TaskSingleBlock(task, rIdx, days, dw) {
  const b = document.createElement('div');
  b.className = 'task-block';
  // Map dates to indices
  const startIdx = days.findIndex(d => d.toISOString().slice(0, 10) === task.startDate);
  const endIdx = days.findIndex(d => d.toISOString().slice(0, 10) === task.endDate);
  b.style.top        = `${40 * (rIdx + 2) + 5}px`;
  b.style.left       = `${dw * startIdx}px`;
  b.style.width      = `${dw * (endIdx - startIdx + 1)}px`;
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

    // Drag logic for resizing
    h.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      let startX = e.clientX;
      let origIdx = pos === 'start' ? startIdx : endIdx;
      function onMouseMove(ev) {
        let delta = Math.round((ev.clientX - startX) / dw);
        let newIdx = origIdx + delta;
        newIdx = Math.max(0, Math.min(days.length - 1, newIdx));
        if (pos === 'start' && newIdx <= endIdx) {
          task.startDate = days[newIdx].toISOString().slice(0, 10);
        } else if (pos === 'end' && newIdx >= startIdx) {
          task.endDate = days[newIdx].toISOString().slice(0, 10);
        }
        render();
      }
      function onMouseUp() {
        saveConfig();
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      }
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  });

  // Drag logic for moving the block
  b.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('handle')) return;
    let startX = e.clientX;
    let origStartIdx = startIdx;
    let origEndIdx = endIdx;
    function onMouseMove(ev) {
      let delta = Math.round((ev.clientX - startX) / dw);
      let newStartIdx = Math.max(0, Math.min(days.length - 1, origStartIdx + delta));
      let newEndIdx = Math.max(0, Math.min(days.length - 1, origEndIdx + delta));
      if (newEndIdx >= newStartIdx) {
        task.startDate = days[newStartIdx].toISOString().slice(0, 10);
        task.endDate = days[newEndIdx].toISOString().slice(0, 10);
        render();
      }
    }
    function onMouseUp() {
      saveConfig();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
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