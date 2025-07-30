import { openNamePopup, openColorPopup } from "./popups.js";
import { saveConfig } from './config.js';
import state from "./state.js";
import { render } from "./render.js";

export function createEditNameButton(rows, idx) {
  const btn = document.createElement('button');
  btn.className = 'btn btn-sm btn-light edit-name';
  btn.dataset.idx = idx;
  btn.textContent = '✏️';
  btn.onclick = () => {
    const idx = +btn.dataset.idx;
    const row = rows[idx];
    openNamePopup(row.task, btn, () => { saveConfig(state.groups); render(); });
  };
  return btn;
}

export function createEditColorButton(rows, idx) {
  const btn = document.createElement('button');
  btn.className = 'btn btn-sm btn-light edit-color';
  btn.dataset.idx = idx;
  btn.textContent = '🎨';
  btn.onclick = () => {
    const idx = +btn.dataset.idx;
    const row = rows[idx];
    openColorPopup(row.task, btn, () => { saveConfig(state.groups); render(); });
  };
  return btn;
}

export  function createDeleteTaskButton(rows, idx) {
  const btn = document.createElement('button');
  btn.className = 'btn btn-sm btn-danger delete-task';
  btn.dataset.idx = idx;
  btn.textContent = '🗑️';
  btn.onclick = () => {
    const idx = +btn.dataset.idx;
    if (confirm(`Are you sure you want to delete the task "${rows[idx].task.name}"?`)) {
      const row = rows[idx];
      if (row.type === 'task') {
        state.groups[row.gi].tasks.splice(row.ti, 1);
      } else {
        state.groups.splice(row.gi, 1);
      }
      saveConfig(state.groups);   
      render();
    }
  };
  return btn;
}