
import { saveConfig, downloadConfig, handleUpload } from './config.js';
import { render } from './render.js';
import state from './state.js';
import { scrollToToday } from './utils.js';

export function createZoomInButton() {
  //    <button id="zoomIn"  class="btn btn-secondary">+</button>
  const zoomInButton = document.createElement('button');
  zoomInButton.id = 'zoomIn';
  zoomInButton.className = 'btn btn-secondary';
  zoomInButton.textContent = '+';
  zoomInButton.onclick = () => {
    state.zoomLevel *= 1.25;
    saveConfig({ groups: state.groups, zoomLevel: state.zoomLevel });
    render();
    scrollToToday();
  };
  return zoomInButton;
}

export function createZoomOutButton() {
  //    <button id="zoomOut" class="btn btn-secondary">-</button
  const zoomOutButton = document.createElement('button');
  zoomOutButton.id = 'zoomOut';
  zoomOutButton.className = 'btn btn-secondary';
  zoomOutButton.textContent = '-';
  zoomOutButton.onclick = () => {
    state.zoomLevel /= 1.25;
    saveConfig({ groups: state.groups, zoomLevel: state.zoomLevel });
    render();
    scrollToToday();
  };
  return zoomOutButton;
}

export function createDownloadConfigButton() {
  const downloadConfigButton = document.createElement('button');
  downloadConfigButton.id = 'downloadConfig';
  downloadConfigButton.className = 'btn btn-success';
  downloadConfigButton.textContent = 'Download Config';
  downloadConfigButton.onclick = () => {
    downloadConfig({ groups: state.groups, zoomLevel: state.zoomLevel });
  };
  return downloadConfigButton;
}

export function createUploadConfigButton() {
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
      saveConfig(newConfig);
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