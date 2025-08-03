import { closePopups, positionPopup } from './popupMenus.js';
import { ClearButton } from './specialButtons.js';
import { attachOnClickOutside } from './utils.js';
import { saveConfig } from './config.js';
import { render } from './render.js';

function TaskBlock(task, rIdx, days, dw) {
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
  
  // Handles for resizing
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
    h.addEventListener('mousedown', createResizeMoveHandler({ task, pos, startIdx, endIdx, days, dw }));
  });

  // Drag logic for moving the block
  b.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('handle')) return;
    createBlockMoveHandler({ task, startIdx, endIdx, days, dw })(e);
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
    attachOnClickOutside(menu);
  });

  return b;
}

function createResizeMoveHandler({ task, pos, startIdx, endIdx, days, dw }) {
  return function(e) {
    const initialX = e.clientX;
    const origIdx = pos === 'start' ? startIdx : endIdx;
    function onMouseMove(ev) {
      const delta = Math.round((ev.clientX - initialX) / dw);
      let newIdx = Math.max(0, Math.min(days.length - 1, origIdx + delta));
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
  };
}

function createBlockMoveHandler({ task, startIdx, endIdx, days, dw }) {
  return function(e) {
    const initialX = e.clientX;
    const origStartIdx = startIdx;
    const origEndIdx = endIdx;
    function onMouseMove(ev) {
      const delta = Math.round((ev.clientX - initialX) / dw);
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
  };
}

export default TaskBlock;