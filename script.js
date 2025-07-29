import { loadConfig, saveConfig, downloadConfig, handleUpload } from './modules/config.js';
import { initResizer, scrollToToday, flattenRows, dayWidth, initDrag, generateDays  } from './modules/utils.js';
import { render, renderBlocks} from './modules/render.js';
import state from './modules/state.js';

// Init
function init() {
  //State
  state.days = generateDays();
  state.groups = loadConfig();
  //document.getElementById('taskColumn').style.width = state.firstColWidth + 'px';

  //Initial render
  render();
  scrollToToday();

  //Control Buttons listeners
  document.getElementById('zoomIn').onclick  = () => { state.zoomLevel *= 1.25; render(); };
  document.getElementById('zoomOut').onclick = () => { state.zoomLevel /= 1.25; render(); };
  document.getElementById('addGroup').onclick = () => {
    state.groups.push({ name: 'New Group', collapsed: false, tasks: [] });
    saveConfig(state.groups);
    render();
  };
  document.getElementById('downloadConfig').onclick   = () => downloadConfig(state.groups);
  const loadInput = document.getElementById('loadConfigInput');
  document.getElementById('uploadConfigBtn').onclick = () => loadInput.click();
  loadInput.onchange = e => {
    handleUpload(e.target.files[0], newGroups => {
      state.groups = newGroups;
      saveConfig(state.groups);
      render();
      // clear input to allow re-uploading same file
      e.target.value = '';
    });
  };

  // Initialize drag-and-drop resizing and task block dragging
  initDrag(
    flattenRows,  // 1) a fn that returns your “flattened” task‐rows
    state.days,   // 2) the array of date slots
    dayWidth,     // 3) a fn that tells you the pixel‐width of one day
    () => {       // 4) onUpdate
      saveConfig(state.groups);
      renderBlocks(flattenRows());
    }
  );
  initResizer(
    document.getElementById('divider'),
    document.getElementById('ganttContainer')
  );
}

window.onload = init;