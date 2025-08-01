import { openNamePopup, openColorPopup } from "./popups.js";
import { saveConfig } from './config.js';
import state from "./state.js";
import { render } from "./render.js";

// Helper to create context menu for a task
export function createTaskContextMenu(rows, idx) {
  const menu = document.createElement('div');
  menu.className = 'task-context-menu';

  // Create buttons
  const editNameBtn = createEditNameButton(rows, idx, menu);
  const editColorBtn = createEditColorButton(rows, idx, menu);
  const deleteBtn = createDeleteTaskButton(rows, idx, menu);

  menu.appendChild(editNameBtn);
  menu.appendChild(editColorBtn);
  menu.appendChild(deleteBtn);

  return menu;
}

// Refactor button creators to optionally receive context menu and handle menu visibility
export function createEditNameButton(rows, idx, contextMenu) {
  const btn = document.createElement('button');
  btn.className = 'btn btn-sm btn-light edit-name';
  btn.dataset.idx = idx;
  btn.textContent = '✏️ Edit name';
  btn.onclick = (e) => {
    e.stopPropagation();
    const idx = +btn.dataset.idx;
    const row = rows[idx];
    openNamePopup(row.task, btn, () => {
      saveConfig(state.groups);
      render();
      if (contextMenu) contextMenu.remove(); // Close context menu when popup closes
    });
  };
  return btn;
}

export function createEditColorButton(rows, idx, contextMenu) {
  const btn = document.createElement('button');
  btn.className = 'btn btn-sm btn-light edit-color';
  btn.dataset.idx = idx;
  btn.textContent = '🎨 Edit color';
  btn.onclick = (e) => {
    e.stopPropagation();
    const idx = +btn.dataset.idx;
    const row = rows[idx];
    openColorPopup(row.task, btn, () => {
      saveConfig(state.groups);
      render();
      if (contextMenu) contextMenu.remove(); // Close context menu when popup closes
    });
  };
  return btn;
}

export function createDeleteTaskButton(rows, idx, contextMenu) {
  const btn = document.createElement('button');
  btn.className = 'btn btn-sm btn-danger delete-task';
  btn.dataset.idx = idx;
  btn.textContent = '🗑️ Delete task';
  btn.onclick = (e) => {
    e.stopPropagation();
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
    // Close context menu after delete
    if (contextMenu) contextMenu.remove();
  };
  return btn;
}