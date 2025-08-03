import { saveConfig, downloadConfig, handleUpload } from './config.js';
import { render } from './render.js';
import state from './state.js';
import { scrollToToday } from './utils.js';
import { openTeamPopup } from './popups.js';

export function ZoomInButton() {
  //    <button id="zoomIn"  class="btn btn-secondary">+</button>
  const zoomInButton = document.createElement('button');
  zoomInButton.id = 'zoomIn';
  zoomInButton.className = 'btn btn-secondary';
  zoomInButton.textContent = '+';
  zoomInButton.onclick = () => {
    state.zoomLevel *= 1.25;
    saveConfig();
    render();
    scrollToToday();
  };
  return zoomInButton;
}

export function ZoomOutButton() {
  //    <button id="zoomOut" class="btn btn-secondary">-</button
  const zoomOutButton = document.createElement('button');
  zoomOutButton.id = 'zoomOut';
  zoomOutButton.className = 'btn btn-secondary';
  zoomOutButton.textContent = '-';
  zoomOutButton.onclick = () => {
    state.zoomLevel /= 1.25;
    saveConfig();
    render();
    scrollToToday();
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
    handleUpload(e.target.files[0], newConfig => {
      state.groups = newConfig.groups;
      state.zoomLevel = newConfig.zoomLevel;
      state.team = newConfig.team;
      saveConfig();
      render();
      scrollToToday();
      e.target.value = '';
    });
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
  btn.onclick = () => openTeamPopup(btn);
  return btn;
}