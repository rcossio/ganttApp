import { openNamePopup, openColorPopup } from "./popups.js";
import { saveConfig } from './config.js';
import state from "./state.js";
import { render } from "./render.js";


// Helper to create context menu for a task
export function TaskContextMenu(rows, idx) {
  const menu = document.createElement('div');
  menu.className = 'context-menu';

  // Create buttons
  const editNameBtn = EditNameButton(rows, idx, menu);
  const editColorBtn = EditColorButton(rows, idx, menu);
  const deleteBtn = DeleteTaskButton(rows, idx, menu);

  menu.appendChild(editNameBtn);
  menu.appendChild(editColorBtn);
  menu.appendChild(deleteBtn);

  return menu;
}

// Refactor button creators to optionally receive context menu and handle menu visibility
function EditNameButton(rows, idx, contextMenu) {
  const btn = document.createElement('button');
  btn.className = 'btn btn-sm btn-light edit-name';
  btn.dataset.idx = idx;
  btn.textContent = '✏️ Edit name';
  btn.onclick = (e) => {
    e.stopPropagation();
    const idx = +btn.dataset.idx;
    const row = rows[idx];
    openNamePopup(row.task, btn, () => {
      saveConfig();
      render();
      if (contextMenu) contextMenu.remove(); // Close context menu when popup closes
    });
  };
  return btn;
}

function EditColorButton(rows, idx, contextMenu) {
  const btn = document.createElement('button');
  btn.className = 'btn btn-sm btn-light edit-color';
  btn.dataset.idx = idx;
  btn.textContent = '🎨 Edit color';
  btn.onclick = (e) => {
    e.stopPropagation();
    const idx = +btn.dataset.idx;
    const row = rows[idx];
    openColorPopup(row.task, btn, () => {
      saveConfig();
      render();
      if (contextMenu) contextMenu.remove(); // Close context menu when popup closes
    });
  };
  return btn;
}

function DeleteTaskButton(rows, idx, contextMenu) {
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
      saveConfig();   
      render();
    }
    // Close context menu after delete
    if (contextMenu) contextMenu.remove();
  };
  return btn;
}