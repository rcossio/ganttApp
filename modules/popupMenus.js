import state from './state.js';
import { AddTeamMemberButton } from './specialButtons.js';
import TeamMemberRow from './TeamMemberRow.js';
import { attachOnClickOutside } from './utils.js';
import { closePopups, positionPopup } from './utils.js';

export function openNamePopup(task, anchor, onSave) {
  const popup = document.createElement('div'); popup.className='popup'
  const input = Object.assign(document.createElement('input'), {value:task.name})
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      task.name = input.value;
      onSave();
      document.removeEventListener('mousedown', onClickOutside);
      closePopups();
    }
  });
  popup.append(input); document.body.append(popup)
  positionPopup(popup,anchor); input.focus()
  // Close popup when clicking outside
  function onClickOutside(e) {
   if (!popup.contains(e.target)) {
     document.removeEventListener('mousedown', onClickOutside);
     closePopups();
   }
  }
  document.addEventListener('mousedown', onClickOutside);
}

export function openColorPopup(task, anchor, onSave) {
  const COLORS = [
  '#8b94a7', '#3344b4', '#883ab0', '#e62788',
  '#ea3a77', '#fe5d4d', '#ff822e', '#ffc800',
  '#77d257', '#48c488', '#2a9d8f', '#264653',
  ]

  const popup = document.createElement('div'); popup.className='popup'
  const palette = document.createElement('div'); palette.className='color-palette'
  COLORS.forEach(c=> {
    const sw = document.createElement('div')
    sw.className='color-swatch'; sw.style.background=c
    sw.onclick = () => {
      document.removeEventListener('mousedown', onClickOutside);
      task.color = c;
      onSave();
      closePopups();
    }
    palette.append(sw)
  })
  popup.append(palette); document.body.append(popup)
  positionPopup(popup,anchor)
  // Close popup when clicking outside
  function onClickOutside(e) {
   if (!popup.contains(e.target)) {
     document.removeEventListener('mousedown', onClickOutside);
     closePopups();
   }
  }
  document.addEventListener('mousedown', onClickOutside);
}

export function openTeamMenu(anchor) {
  function renderTeamList(container) {
    container.innerHTML = '';
    state.team.forEach((member, idx) => {
      container.append(TeamMemberRow(member, () => renderTeamList(container)));
    });
  }

  closePopups();
  const popup = document.createElement('div'); 
  popup.className = 'context-menu';

  // Container for list and optional form
  const content = document.createElement('div'); //created here to be passed to AddTeamMemberButton
  content.className = 'team-content';

  // Header with title and add button
  const headerRow = document.createElement('div');
  headerRow.className = 'team-header-row';
  const header = document.createElement('strong'); 
  header.textContent = 'Team Members';
  const addBtn = AddTeamMemberButton(content, () => renderTeamList(content));
  headerRow.append(header, addBtn);

  // Main content area for team list
  popup.append(headerRow);
  popup.append(content); 
  renderTeamList(content);

  // Add-member form
  document.body.append(popup);
  positionPopup(popup, anchor);

  // Close popup when clicking outside
  attachOnClickOutside(popup);
}
