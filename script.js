// Configuration and state
const firstColWidth = 200;
const baseDayWidth = 40;
let zoomLevel = 1;
let tasks = [];
const days = [];

// Generate working days for current year
function generateDays() {
  const year = new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  let d = new Date(start);
  while (d <= end) {
    const wd = d.getDay();
    if (wd >= 1 && wd <= 5) days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
}

// Load tasks from localStorage
function loadConfig() {
  const saved = localStorage.getItem('tasksConfig');
  if (saved) tasks = JSON.parse(saved);
}

// Save tasks to localStorage
function saveConfigToStorage() {
  localStorage.setItem('tasksConfig', JSON.stringify(tasks));
}

// Trigger download of config.json
function downloadConfig() {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'config.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Compute current widths
function dayWidth() {
  return baseDayWidth * zoomLevel;
}

// Render the full grid including headers and tasks
function renderGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  const dw = dayWidth();

  // Ensure grid expands to full width to enable scrollbar
  grid.style.minWidth = `${firstColWidth + dw * days.length}px`;

  // Define grid template
  grid.style.gridTemplateColumns = `${firstColWidth}px repeat(${days.length}, ${dw}px)`;
  grid.style.gridTemplateRows = `40px 40px repeat(${tasks.length}, 40px)`;

  // Month headers (row 1)
  const monthSpans = [];
  days.forEach((d, i) => {
    const m = d.toLocaleString('default', { month: 'long' });
    const last = monthSpans.length - 1;
    if (last < 0 || monthSpans[last].month !== m) {
      monthSpans.push({ month: m, start: i, span: 1 });
    } else {
      monthSpans[last].span++;
    }
  });
  monthSpans.forEach(ms => {
    const div = document.createElement('div');
    div.className = 'header-col';
    div.textContent = ms.month;
    div.style.gridColumn = `${ms.start + 2} / ${ms.start + 2 + ms.span}`;
    div.style.gridRow = '1 / 2';
    grid.appendChild(div);
  });

  // Day-of-month headers (row 2)
  days.forEach((d, i) => {
    const div = document.createElement('div');
    div.className = 'header-col';
    div.textContent = d.getDate();
    div.style.gridColumn = `${i + 2} / ${i + 3}`;
    div.style.gridRow = '2 / 3';
    grid.appendChild(div);
  });

  // Task rows
  tasks.forEach((task, idx) => {
    const nameCell = document.createElement('div');
    nameCell.className = 'task-col';
    nameCell.style.gridColumn = '1 / 2';
    nameCell.style.gridRow = `${idx + 3} / ${idx + 4}`;
    nameCell.innerHTML = `
      <span>${task.name}</span>
      <div>
        <button class="btn btn-sm btn-light edit-name">✏️</button>
        <button class="btn btn-sm btn-light edit-color">🎨</button>
      </div>`;
    grid.appendChild(nameCell);

    days.forEach((_, i) => {
      const cell = document.createElement('div');
      cell.className = 'day-col';
      cell.style.gridColumn = `${i + 2} / ${i + 3}`;
      cell.style.gridRow = `${idx + 3} / ${idx + 4}`;
      cell.addEventListener('contextmenu', e => {
        e.preventDefault();
        task.start = i;
        task.end = i;
        saveConfigToStorage();
        renderGrid();
      });
      cell.addEventListener('click', e => {
        task.start = i;
        task.end = i;
        saveConfigToStorage();
        renderGrid();
      });
      grid.appendChild(cell);
    });
  });

  renderBlocks();
  attachRowControls();
}

// Draw draggable blocks
function renderBlocks() {
  document.querySelectorAll('.task-block').forEach(b => b.remove());
  const container = document.getElementById('ganttContainer');
  const dw = dayWidth();
  tasks.forEach((task, idx) => {
    if (task.start != null && task.end != null) {
      const block = document.createElement('div'); block.className = 'task-block';
      block.style.top = `${40 * (idx + 2)}px`;
      block.style.left = `${firstColWidth + dw * task.start}px`;
      block.style.width = `${dw * (task.end - task.start + 1)}px`;
      block.style.background = task.color;
      block.dataset.idx = idx;
      block.textContent = task.name;

      const startHandle = document.createElement('div'); startHandle.className = 'handle start';
      const endHandle   = document.createElement('div'); endHandle.className   = 'handle end';
      block.appendChild(startHandle);
      block.appendChild(endHandle);

      addDrag(startHandle);
      addDrag(endHandle);

      container.appendChild(block);
    }
  });
}

// Attach edit-name and edit-color handlers
function attachRowControls() {
  document.querySelectorAll('.edit-name').forEach(btn => {
    btn.onclick = () => {
      const idx = [...document.querySelectorAll('.edit-name')].indexOf(btn);
      openNamePopup(tasks[idx], btn);
    };
  });
  document.querySelectorAll('.edit-color').forEach(btn => {
    btn.onclick = () => {
      const idx = [...document.querySelectorAll('.edit-color')].indexOf(btn);
      openColorPopup(tasks[idx], btn);
    };
  });
}

// Popups
function openNamePopup(task, anchor) {
  closePopups();
  const popup = document.createElement('div'); popup.className = 'popup';
  const input = document.createElement('input'); input.value = task.name;
  input.addEventListener('keydown', ke => {
    if (ke.key === 'Enter') {
      task.name = input.value;
      saveConfigToStorage();
      closePopups();
      renderGrid();
    }
  });
  popup.appendChild(input);
  document.body.appendChild(popup);
  positionPopup(popup, anchor);
}

function openColorPopup(task, anchor) {
  closePopups();
  const popup = document.createElement('div'); popup.className = 'popup';
  const palette = document.createElement('div'); palette.className = 'color-palette';
  const colors = ['#e6194b','#3cb44b','#ffe119','#0082c8','#f58231','#911eb4','#46f0f0','#f032e6','#d2f53c','#fabebe','#008080','#e6beff'];
  colors.forEach(c => {
    const sw = document.createElement('div'); sw.className = 'color-swatch'; sw.style.background = c;
    sw.onclick = () => { task.color = c; saveConfigToStorage(); closePopups(); renderGrid(); };
    palette.appendChild(sw);
  });
  popup.appendChild(palette);
  document.body.appendChild(popup);
  positionPopup(popup, anchor);
}

function closePopups() {
  document.querySelectorAll('.popup').forEach(p => p.remove());
}

function positionPopup(popup, anchor) {
  const rect = anchor.getBoundingClientRect();
  popup.style.left = rect.right + 'px';
  popup.style.top = rect.top + 'px';
}

// Drag handlers
let dragState = null;
function addDrag(handle) {
  handle.onmousedown = e => {
    e.stopPropagation();
    const block = handle.parentElement;
    const idx = +block.dataset.idx;
    dragState = { task: tasks[idx], isStart: handle.classList.contains('start') };
    document.onmousemove = onDrag;
    document.onmouseup   = endDrag;
  };
}
function onDrag(e) {
  if (!dragState) return;
  const dw = dayWidth();
  const rect = document.getElementById('grid').getBoundingClientRect();
  let x = e.clientX - rect.left - firstColWidth;
  let day = Math.round(x / dw);
  day = Math.max(0, Math.min(days.length - 1, day));
  if (dragState.isStart) dragState.task.start = Math.min(dragState.task.end, day);
  else dragState.task.end = Math.max(dragState.task.start, day);
  saveConfigToStorage();
  renderBlocks();
}
function endDrag() {
  document.onmousemove = null;
  document.onmouseup   = null;
  dragState = null;
}

// Zoom controls
function zoomIn()  { zoomLevel *= 1.25; renderGrid(); }
function zoomOut() { zoomLevel /= 1.25; renderGrid(); }

// Initialization
function init() {
  generateDays();
  loadConfig();
  document.getElementById('zoomIn').onclick  = zoomIn;
  document.getElementById('zoomOut').onclick = zoomOut;
  document.getElementById('addTask').onclick = () => {
    tasks.push({ name: 'New Task', start: null, end: null, color: '#0082c8' });
    saveConfigToStorage(); renderGrid();
  };
  document.getElementById('saveConfig').onclick = downloadConfig;
  renderGrid();
}
window.onload = init;