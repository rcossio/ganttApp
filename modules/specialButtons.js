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

export function RemoveMemberButton(member, renderTeamListCallback) {
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
      renderTeamListCallback();
    }
  };
  return btn;
}

export function AddTeamMemberButton(container, renderTeamListCallback) {
  const addBtn = document.createElement('button');
  addBtn.textContent = '+';
  addBtn.className = 'btn btn-sm btn-primary';
  addBtn.onclick = () => {
    container.innerHTML = '';
    const form = document.createElement('div');
    form.className = 'team-form';
    const initInput = Object.assign(document.createElement('input'), { placeholder: 'Initials' });
    const emailInput = Object.assign(document.createElement('input'), { placeholder: 'Email', type: 'email' });
    const saveBtn = document.createElement('button'); saveBtn.textContent = 'Save'; saveBtn.className = 'btn btn-sm btn-success';
    form.append(initInput, emailInput, saveBtn);
    container.append(form);
    saveBtn.onclick = () => {
      const initials = initInput.value.trim();
      const email = emailInput.value.trim();
      if (initials && email) {
        state.team.push({ initials, email });
        saveConfig();
        renderTeamListCallback();
      }
    };
  };
  return addBtn;
}