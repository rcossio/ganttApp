import { loadConfig, saveConfig } from './modules/config.js';
import { initResizer, scrollToToday, generateDays, synchronizeVerticalScroll, enableCtrlWheelZoom, enableDragToScroll } from './modules/utils.js';
import { render } from './modules/render.js';
import state from './modules/state.js';
import { ZoomInButton, ZoomOutButton, DownloadConfigButton, UploadConfigButton, ManageTeamButton } from './modules/controlButtons.js';

// Init
function init() {
  //State
  state.days = generateDays();
  const loadedConfig = loadConfig();
  state.groups = loadedConfig.groups;
  state.zoomLevel = loadedConfig.zoomLevel;
  state.team = loadedConfig.team || [];
  saveConfig();

  //Initial render
  render();
  scrollToToday();

  // Control Buttons
  const controls = document.getElementById('controls');
  controls.innerHTML = '';
  controls.appendChild(ZoomOutButton());
  controls.appendChild(ZoomInButton());
  controls.appendChild(DownloadConfigButton());
  controls.appendChild(UploadConfigButton());
  controls.appendChild(ManageTeamButton());

  // Initialize drag-and-drop resizing 
  initResizer();

  // Synchronize vertical scroll between task column and timeline
  synchronizeVerticalScroll();

  // Enable zoom in/out with Ctrl + scroll wheel
  enableCtrlWheelZoom();

  // Enable drag-to-scroll for timelineContainer (excluding grid)
  enableDragToScroll(document.getElementById('timelineContainer'));
}

window.onload = init;