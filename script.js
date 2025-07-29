import {loadConfig, saveConfig, downloadConfig, handleUpload} from './modules/config.js';
import { openNamePopup, openColorPopup } from './modules/popups.js'
import { generateDays } from './modules/date.js'

// State
let firstColWidth = 200;
const baseDayWidth = 40;
let zoomLevel = 1;
let tasks = [];
let days = [];

// Measurements
function dayWidth() { return baseDayWidth * zoomLevel; }

// Main render
function render() {
  renderTaskColumn();
  renderTimeline();
}

// Left column
function renderTaskColumn() {
  const col = document.getElementById('taskColumn');
  col.innerHTML = '';
  col.style.width = firstColWidth + 'px';

  // single header row
  const header = document.createElement('div');
  header.className = 'task-cell';
  header.textContent = 'Task';
  col.appendChild(header);

  // add dummy row so everything lines up under the two timeline headers
  const dummy = document.createElement('div');
  dummy.className = 'task-cell';
  dummy.innerHTML = '';
  col.appendChild(dummy);

  tasks.forEach((task, idx) => {
    const cell = document.createElement('div');
    cell.className = 'task-cell';
    cell.innerHTML = `
      <span>${task.name}</span>
      <div class="task-controls">
        <button class="btn btn-sm btn-light edit-name"   data-idx="${idx}">✏️</button>
        <button class="btn btn-sm btn-light edit-color"  data-idx="${idx}">🎨</button>
        <button class="btn btn-sm btn-danger delete-task" data-idx="${idx}">🗑️</button>
      </div>`;
    col.appendChild(cell);
  });
  attachRowControls();
}

function attachRowControls() {
  document.querySelectorAll('.edit-name').forEach(btn => {
    btn.onclick = () => {
      const idx = +btn.dataset.idx;
      openNamePopup(tasks[idx], btn, () => { saveConfig(tasks); render(); });
    };
  });
  document.querySelectorAll('.edit-color').forEach(btn => {
    btn.onclick = () => {
      const idx = +btn.dataset.idx;
      openColorPopup(tasks[idx], btn, () => { saveConfig(tasks); render(); });
    };
  });
  document.querySelectorAll('.delete-task').forEach(btn => {
    btn.onclick = () => {
      const idx = +btn.dataset.idx;
      if (confirm('Are you sure you want to delete this task?')) {
        tasks.splice(idx, 1);
        saveConfig();
        render();
      }
    };
  });
}

// Timeline
function renderTimeline() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  const dw = dayWidth();
  grid.style.minWidth = `${dw * days.length}px`;
  grid.style.gridTemplateColumns = `repeat(${days.length}, ${dw}px)`;
  grid.style.gridTemplateRows    = `40px 40px repeat(${tasks.length}, 40px)`;

  // Months (row 1)
  const spans = [];
  days.forEach((d, i) => {
    const m = d.toLocaleString('default', { month: 'short' });
    const last = spans.length - 1;
    if (last < 0 || spans[last].month !== m) spans.push({ month: m, start: i, span: 1 });
    else spans[last].span++;
  });
  spans.forEach(ms => {
    const div = document.createElement('div');
    div.className = 'header-col';
    div.textContent = ms.month;
    div.style.gridColumn = `${ms.start + 1}/${ms.start + 1 + ms.span}`;
    div.style.gridRow    = '1/2';
    grid.appendChild(div);
  });

  // Days (row 2)
  days.forEach((d, i) => {
    const div = document.createElement('div');
    div.className = 'day-col';
    div.textContent = d.getDate();
    div.style.gridColumn = `${i + 1}/${i + 2}`;
    div.style.gridRow    = '2/3';
    grid.appendChild(div);
  });

  // empty cells for tasks (starting row 3)
  tasks.forEach((task, row) => {
    days.forEach((_, i) => {
      const cell = document.createElement('div');
      cell.style.gridColumn = `${i + 1}/${i + 2}`;
      cell.style.gridRow    = `${row + 3}/${row + 4}`;
      cell.addEventListener('click', () => {
        task.start = i;
        task.end   = i;
        saveConfig();
        render();
      });
      cell.addEventListener('contextmenu', e => {
        e.preventDefault();
        task.start = i;
        task.end   = i;
        saveConfig();
        render();
      });
      grid.appendChild(cell);
    });
  });

  renderBlocks();
}

// Blocks and drag
function renderBlocks() {
  document.querySelectorAll('.task-block').forEach(b => b.remove());
  const tl = document.getElementById('timelineContainer');
  const dw = dayWidth();
  tasks.forEach((task, row) => {
    if (task.start != null && task.end != null) {
      const b = document.createElement('div');
      b.className = 'task-block';
      b.style.top        = `${40 * (row + 2)}px`;
      b.style.left       = `${dw * task.start}px`;
      b.style.width      = `${dw * (task.end - task.start + 1)}px`;
      b.style.background = task.color;
      b.textContent      = task.name;
      b.dataset.row      = row;
      ['start', 'end'].forEach(pos => {
        const h = document.createElement('div');
        h.className = `handle ${pos}`;
        b.appendChild(h);
        addDrag(h);
      });
      tl.appendChild(b);
    }
  });
}

// Drag logic
let dragState = null;
function addDrag(handle) {
  handle.onmousedown = e => {
    e.stopPropagation();
    const blk  = handle.parentElement;
    const task = tasks[+blk.dataset.row];
    dragState = {
      task,
      isStart: handle.classList.contains('start')
    };
    document.onmousemove = onDrag;
    document.onmouseup   = () => {
      document.onmousemove = null;
      document.onmouseup   = null;
      dragState = null;
    };
  };
}
function onDrag(e) {
  if (!dragState) return;
  const dw   = dayWidth();
  const rect = document.getElementById('grid').getBoundingClientRect();
  let x   = e.clientX - rect.left;
  let day = Math.round(x / dw);
  day     = Math.max(0, Math.min(days.length - 1, day));
  if (dragState.isStart) {
    dragState.task.start = Math.min(dragState.task.end, day);
  } else {
    dragState.task.end   = Math.max(dragState.task.start, day);
  }
  saveConfig();
  renderBlocks();
}

// Init
function init() {
  days = generateDays();
  tasks = loadConfig();
  document.getElementById('taskColumn').style.width = firstColWidth + 'px';
  render();

  document.getElementById('zoomIn').onclick  = () => { zoomLevel *= 1.25; render(); };
  document.getElementById('zoomOut').onclick = () => { zoomLevel /= 1.25; render(); };
  document.getElementById('addTask').onclick = () => {
    tasks.push({ name: 'New Task', start: null, end: null, color: '#0082c8' });
    saveConfig(tasks);
    render();
  };
  document.getElementById('saveConfig').onclick   = () => downloadConfig(tasks);
  const loadInput = document.getElementById('loadConfigInput');
  document.getElementById('loadConfigBtn').onclick = () => loadInput.click();
  loadInput.onchange = e => handleUpload(e.target.files[0], newTasks => {
    tasks = newTasks;
    saveConfig(tasks);
    render();
  });

  // Divider drag logic
  const divider = document.getElementById('divider');
  let isResizing = false;
  divider.addEventListener('mousedown', e => {
    e.preventDefault();
    isResizing = true;
  });
  document.addEventListener('mousemove', e => {
    if (!isResizing) return;
    const container = document.getElementById('ganttContainer');
    const rect = container.getBoundingClientRect();
    const newWidth = e.clientX - rect.left;
    firstColWidth = Math.max(100, Math.min(500, newWidth));
    document.getElementById('taskColumn').style.width = firstColWidth + 'px';
  });
  document.addEventListener('mouseup', () => {
    isResizing = false;
  });
}

window.onload = init;