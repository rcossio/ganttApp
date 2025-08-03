import { loadConfig, saveConfig } from './modules/config.js';
import { initResizer, scrollToToday, flattenRows, dayWidth, initDrag, generateDays, synchronizeVerticalScroll} from './modules/utils.js';
import { render, renderBlocks} from './modules/render.js';
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

  // Initialize drag-and-drop resizing and task block dragging
  initDrag(
    flattenRows,  // 1) a fn that returns your “flattened” task‐rows
    state.days,   // 2) the array of date slots
    dayWidth,     // 3) a fn that tells you the pixel‐width of one day
    () => {       // 4) onUpdate
      saveConfig();
      renderBlocks(flattenRows());
    }
  );
  initResizer(
    document.getElementById('divider'),
    document.getElementById('ganttContainer')
  );

  // Synchronize vertical scroll between task column and timeline
  synchronizeVerticalScroll();

}

window.onload = init;