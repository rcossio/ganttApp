import state from './state.js';
import { saveConfig } from './config.js';
import { render } from './render.js';
import { closePopups } from './popups.js';

export function AddGroupButton() {
  const button = document.createElement('button');
  button.className = 'btn btn-primary btn-sm';
  button.textContent = '+ Add Group';
  button.onclick = () => {
    state.groups.push({ name: 'New Group', collapsed: false, tasks: [] });
    saveConfig();
    render();
  };
  return button;
}

export function ClearButton(task) {
  const btn = document.createElement('button');
  btn.className = 'btn btn-sm';
  btn.textContent = '🧹 Clear dates';
  btn.onclick = () => {
    task.start = null;
    task.end = null;
    saveConfig();
    render();
    closePopups();
    // Find and remove parent menu
    let menu = btn.closest('.context-menu');
    if (menu) menu.remove();
    // Remove outside click handler
    document.removeEventListener('mousedown', onClickOutside);
  };
  return btn;
}

export function RemoveMemberButton(member, renderList) {
  const btn = document.createElement('button');
  btn.className = 'btn btn-sm btn-danger';
  btn.textContent = 'Remove member';
  btn.onmousedown = () => {
    const emailToRemove = member.email;
    const removedIdx = state.team.findIndex(m => m.email === emailToRemove);
    if (removedIdx !== -1) {
      state.team.splice(removedIdx, 1);
      saveConfig();
      // Remove parent menu
      const menu = btn.closest('.context-menu');
      if (menu) menu.remove();
      // Directly call renderList to update UI
      renderList();
    }
  };
  return btn;
}