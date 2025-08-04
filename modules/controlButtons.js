import { saveConfig, downloadConfig, handleUpload } from './config.js';
import { render } from './render.js';
import state from './state.js';
import { scrollToToday } from './utils.js';
import { openTeamMenu } from './popupMenus.js';

export function ZoomInButton() {
  const zoomInButton = document.createElement('button');
  zoomInButton.id = 'zoomIn';
  zoomInButton.className = 'btn btn-secondary';
  zoomInButton.textContent = '+';
  zoomInButton.onclick = () => {
    const timeline = document.getElementById('timelineContainer');
    const prevScrollLeft = timeline.scrollLeft;
    const prevDayWidth = state.baseDayWidth * state.zoomLevel;
    // Store precise offset in state
    state.scrollOffsetDays = prevScrollLeft / prevDayWidth;
    state.zoomLevel = Math.min(state.zoomLevel * 1.25, 5.0);
    saveConfig();
    render();
    // Restore scroll position after render
    const timelineAfter = document.getElementById('timelineContainer');
    if (timelineAfter) {
      const newDayWidth = state.baseDayWidth * state.zoomLevel;
      timelineAfter.scrollLeft = state.scrollOffsetDays * newDayWidth;
    }
  };
  return zoomInButton;
}

export function ZoomOutButton() {
  const zoomOutButton = document.createElement('button');
  zoomOutButton.id = 'zoomOut';
  zoomOutButton.className = 'btn btn-secondary';
  zoomOutButton.textContent = '-';
  zoomOutButton.onclick = () => {
    const timeline = document.getElementById('timelineContainer');
    const prevScrollLeft = timeline.scrollLeft;
    const prevDayWidth = state.baseDayWidth * state.zoomLevel;
    // Store precise offset in state
    state.scrollOffsetDays = prevScrollLeft / prevDayWidth;
    state.zoomLevel = Math.max(state.zoomLevel / 1.25, 0.1);
    saveConfig();
    render();
    // Restore scroll position after render
    const timelineAfter = document.getElementById('timelineContainer');
    if (timelineAfter) {
      const newDayWidth = state.baseDayWidth * state.zoomLevel;
      timelineAfter.scrollLeft = state.scrollOffsetDays * newDayWidth;
    }
  };
  return zoomOutButton;
}

export function DownloadConfigButton() {
  const downloadConfigButton = document.createElement('button');
  downloadConfigButton.id = 'downloadConfig';
  downloadConfigButton.className = 'btn btn-success';
  downloadConfigButton.textContent = 'Download Config';
  downloadConfigButton.onclick = () => {
    downloadConfig();
  };
  return downloadConfigButton;
}

export function UploadConfigButton() {
  const uploadConfigButton = document.createElement('button');
  uploadConfigButton.id = 'uploadConfigBtn';
  uploadConfigButton.className = 'btn btn-secondary';
  uploadConfigButton.textContent = 'Upload Config';
  const loadInput = document.createElement('input');
  loadInput.type = 'file';
  loadInput.id = 'loadConfigInput';
  loadInput.accept = 'application/json';
  loadInput.style.display = 'none';
  uploadConfigButton.onclick = () => {
    loadInput.click();
  };
  loadInput.onchange = e => {
    handleUpload(e.target.files[0]);
    e.target.value = '';
  };
  const fragment = document.createDocumentFragment();
  fragment.appendChild(uploadConfigButton);
  fragment.appendChild(loadInput);
  return fragment;
}

/**
 * Creates "Manage Team" button that opens a popup listing team members.
 */
export function ManageTeamButton() {
  const btn = document.createElement('button');
  btn.id = 'manageTeam';
  btn.className = 'btn btn-secondary';
  btn.textContent = 'Manage Team';
  btn.onclick = () => openTeamMenu(btn);
  return btn;
}

let showWeekends = true;

export function WeekendToggleButton() {
  const btn = document.createElement('button');
  btn.id = 'toggleWeekends';
  btn.className = 'btn btn-secondary';
  btn.textContent = showWeekends ? 'Hide Weekends' : 'Show Weekends';
  btn.onclick = () => {
    showWeekends = !showWeekends;
    state.showWeekends = showWeekends;
    btn.textContent = showWeekends ? 'Hide Weekends' : 'Show Weekends';
    render();
    scrollToToday();
  };
  return btn;
}