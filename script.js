import { loadConfig, saveConfig, downloadConfig, handleUpload } from './modules/config.js';
import { initResizer, scrollToToday, flattenRows, dayWidth, initDrag, generateDays  } from './modules/utils.js';
import { render, renderBlocks} from './modules/render.js';
import state from './modules/state.js';
import { createZoomInButton, createZoomOutButton, createDownloadConfigButton, createUploadConfigButton } from './modules/controlButtons.js';

// Init
function init() {
  //State
  state.days = generateDays();
  const loadedConfig = loadConfig();
  state.groups = loadedConfig.groups;
  state.zoomLevel = loadedConfig.zoomLevel;

  //Initial render
  render();
  scrollToToday();

  // Control Buttons
  const controls = document.getElementById('controls');
  controls.innerHTML = '';
  controls.appendChild(createZoomOutButton());
  controls.appendChild(createZoomInButton());
  controls.appendChild(createDownloadConfigButton());
  controls.appendChild(createUploadConfigButton());

  // Initialize drag-and-drop resizing and task block dragging
  initDrag(
    flattenRows,  // 1) a fn that returns your “flattened” task‐rows
    state.days,   // 2) the array of date slots
    dayWidth,     // 3) a fn that tells you the pixel‐width of one day
    () => {       // 4) onUpdate
      saveConfig({ groups: state.groups, zoomLevel: state.zoomLevel });
      renderBlocks(flattenRows());
    }
  );
  initResizer(
    document.getElementById('divider'),
    document.getElementById('ganttContainer')
  );
}

window.onload = init;