import { openNamePopup } from "./popups.js";
import { saveConfig } from './config.js';
import state from "./state.js";
import { render } from "./render.js";

// Group controls
export function createCollapseButton(rows,idx) {
  const btn = document.createElement('button');
  btn.className = 'collapse-toggle';
  btn.dataset.idx = idx;
  const row = rows[idx];
  btn.textContent = row.group.collapsed ? '▶' : '▼';
  btn.onclick = () => {
    const idx = +btn.dataset.idx;
    const row = rows[idx];
    const group = row.group;
    group.collapsed = !group.collapsed;
    saveConfig(state.groups);
    render();
  };
  return btn;
}

export function createGroupRenameButton(rows,idx) {
  const btn = document.createElement('button');
  btn.className = 'btn btn-sm btn-light group-rename';
  btn.dataset.idx = idx;
  btn.textContent = '✒️'; //✎ 🖋️🖊️✏️✒️
  btn.onclick = () => {
    const idx = +btn.dataset.idx;
    const row = rows[idx];
    openNamePopup(row.group, btn, () => { saveConfig(state.groups); render(); });
  };
  return btn;
}

export function createGroupAddTaskButton(rows, idx) {
  const btn = document.createElement('button');
  btn.className = 'btn btn-sm btn-light group-add-task';
  btn.dataset.idx = idx;
  btn.textContent = '＋';
  btn.onclick = () => {
    const idx = +btn.dataset.idx;
    const row = rows[idx];
    const task = { name: 'New Task', start: null, end: null, color: '#0082c8' };
    row.group.tasks.push(task);
    saveConfig(state.groups);
    render();
  };
  return btn;
}

export function createGroupDeleteButton(rows,idx) {
  const btn = document.createElement('button');
  btn.className = 'btn btn-sm btn-danger group-delete';
  btn.dataset.idx = idx;
  btn.textContent = '🗑️';
  btn.onclick = () => {
    const idx = +btn.dataset.idx;
    const row = rows[idx];
    if (confirm(`Are you sure you want to delete the Group "${row.group.name}"?`)) {
      state.groups.splice(row.gi, 1);
      saveConfig(state.groups);
      render();
    }
  };
  return btn;
}