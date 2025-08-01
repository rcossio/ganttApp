import state from './state.js';
import { saveConfig } from './config.js';

export const COLORS = [
'#8b94a7', '#3344b4', '#883ab0', '#e62788',
'#ea3a77', '#fe5d4d', '#ff822e', '#ffc800',
'#77d257', '#48c488', '#2a9d8f', '#264653',
]

//'#d4dade',
export function closePopups() {
  document.querySelectorAll('.popup, .task-context-menu').forEach(p=>p.remove())
}

export function positionPopup(popup, anchor) {
  const r = anchor.getBoundingClientRect()
  Object.assign(popup.style, {
    left:`${r.right+5}px`, top:`${r.top}px`
  })
}

export function openNamePopup(task, anchor, onSave) {
  closePopups()
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
  closePopups()
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

/**
 * Opens a popup showing the current team members (initials - email).
 */
export function openTeamPopup(anchor) {
  closePopups();
  const popup = document.createElement('div'); popup.className = 'task-context-menu';
  // Header with title and add button
  const headerRow = document.createElement('div'); headerRow.style.display = 'flex'; headerRow.style.justifyContent = 'space-between'; headerRow.style.alignItems = 'center';
  const header = document.createElement('strong'); header.textContent = 'Team Members';
  const addBtn = document.createElement('button'); addBtn.textContent = '+'; addBtn.className = 'btn btn-sm btn-primary';
  headerRow.append(header, addBtn);
  popup.append(headerRow);
  // Container for list and optional form
  const content = document.createElement('div');
  content.style.display = 'flex';
  content.style.flexDirection = 'column';
  popup.append(content);
  // Function to render list and optional form
  function renderList() {
    content.innerHTML = '';
    state.team.forEach(member => {
      const row = document.createElement('button');
      row.className = 'btn btn-sm popup-btn';
      row.textContent = `👤 ${member.initials} - ${member.email}`;
      row.style.cursor = 'default';
      row.disabled = true;
      content.append(row);
    });
  }
  renderList();
  // Add-member form
  addBtn.onclick = () => {
    content.innerHTML = '';
    const form = document.createElement('div');
    form.style.display = 'flex'; form.style.flexDirection = 'column';
    const initInput = Object.assign(document.createElement('input'), { placeholder: 'Initials' });
    const emailInput = Object.assign(document.createElement('input'), { placeholder: 'Email', type: 'email' });
    const saveBtn = document.createElement('button'); saveBtn.textContent = 'Save'; saveBtn.className = 'btn btn-sm btn-success';
    form.append(initInput, emailInput, saveBtn);
    content.append(form);
    saveBtn.onclick = () => {
      const initials = initInput.value.trim();
      const email = emailInput.value.trim();
      if (initials && email) {
        state.team.push({ initials, email });
        saveConfig({ groups: state.groups, zoomLevel: state.zoomLevel, team: state.team });
        renderList();
      }
    };
  };
  document.body.append(popup);
  positionPopup(popup, anchor);
  // Close popup when clicking outside
  function onClickOutside(e) {
    if (!popup.contains(e.target)) {
      document.removeEventListener('mousedown', onClickOutside);
      closePopups();
    }
  }
  document.addEventListener('mousedown', onClickOutside);
}