// State
let firstColWidth = 200;      // now mutable
const baseDayWidth = 40;
let zoomLevel = 1;
let tasks = [];
const days = [];

// Generate weekdays
function generateDays() {
  const year = new Date().getFullYear();
  let d = new Date(year, 0, 1);
  while (d.getFullYear() === year) {
    if (d.getDay() >= 1 && d.getDay() <= 5) days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
}

// Config load/save (unchanged)
function loadConfig() { /* ... */ }
function saveConfig() { /* ... */ }
function downloadConfig() { /* ... */ }
function handleUpload(file) { /* ... */ }

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
      openNamePopup(tasks[idx], btn);
    };
  });
  document.querySelectorAll('.edit-color').forEach(btn => {
    btn.onclick = () => {
      const idx = +btn.dataset.idx;
      openColorPopup(tasks[idx], btn);
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

// Popups
function openNamePopup(task, anchor) {
  closePopups();
  const popup = document.createElement('div'); popup.className = 'popup';
  const input = document.createElement('input'); input.value = task.name;
  input.onkeydown = e => {
    if (e.key === 'Enter') {
      task.name = input.value; saveConfig(); closePopups(); render();
    }
  };
  popup.appendChild(input);
  document.body.appendChild(popup);
  positionPopup(popup, anchor);
}

function openColorPopup(task, anchor) {
  closePopups();
  const popup = document.createElement('div'); popup.className = 'popup';
  const palette = document.createElement('div'); palette.className = 'color-palette';
  ['#e6194b','#3cb44b','#ffe119','#0082c8','#f58231','#911eb4','#46f0f0','#f032e6','#d2f53c','#fabebe','#008080','#e6beff']
    .forEach(c => {
      const sw = document.createElement('div'); sw.className = 'color-swatch'; sw.style.background = c;
      sw.onclick = () => { task.color = c; saveConfig(); closePopups(); render(); };
      palette.appendChild(sw);
    });
  popup.appendChild(palette);
  document.body.appendChild(popup);
  positionPopup(popup, anchor);
}

function closePopups() { document.querySelectorAll('.popup').forEach(p => p.remove()); }
function positionPopup(popup, anchor) {
  const r = anchor.getBoundingClientRect();
  popup.style.left = `${r.right + 5}px`;
  popup.style.top  = `${r.top}px`;
}

// Timeline
function renderTimeline() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  const dw = dayWidth();
  grid.style.minWidth = `${dw * days.length}px`;

  // back to two header rows only
  grid.style.gridTemplateColumns = `repeat(${days.length}, ${dw}px)`;
  grid.style.gridTemplateRows    = `40px 40px repeat(${tasks.length}, 40px)`;

  // Months (row 1)
  const spans = [];
  days.forEach((d,i) => {
    const m = d.toLocaleString('default',{month:'short'});
    const last = spans.length - 1;
    if (last < 0 || spans[last].month !== m) spans.push({ month: m, start: i, span: 1 });
    else spans[last].span++;
  });
  spans.forEach(ms => {
    const div = document.createElement('div');
    div.className = 'header-col';
    div.textContent = ms.month;
    div.style.gridColumn = `${ms.start+1}/${ms.start+1+ms.span}`;
    div.style.gridRow    = '1/2';
    grid.appendChild(div);
  });

  // Days (row 2)
  days.forEach((d,i) => {
    const div = document.createElement('div');
    div.className = 'day-col';
    div.textContent = d.getDate();
    div.style.gridColumn = `${i+1}/${i+2}`;
    div.style.gridRow    = '2/3';
    grid.appendChild(div);
  });

  // empty cells for tasks (starting row 3)
  tasks.forEach((task,row) => {
    days.forEach((_,i) => {
      const cell = document.createElement('div');
      cell.style.gridColumn = `${i+1}/${i+2}`;
      cell.style.gridRow    = `${row+3}/${row+4}`;
      cell.addEventListener('click',()=> {
        task.start = i; task.end = i; saveConfig(); render();
      });
      cell.addEventListener('contextmenu', e => {
        e.preventDefault();
        task.start = i; task.end = i; saveConfig(); render();
      });
      grid.appendChild(cell);
    });
  });

  renderBlocks();
}

// Blocks and drag
function renderBlocks() {
  document.querySelectorAll('.task-block').forEach(b=>b.remove());
  const tl = document.getElementById('timelineContainer');
  const dw = dayWidth();
  tasks.forEach((task,row) => {
    if (task.start != null && task.end != null) {
      const b = document.createElement('div');
      b.className = 'task-block';
      // back to skipping exactly 2 header rows:
      b.style.top   = `${40*(row+2)}px`;
      b.style.left  = `${dw*task.start}px`;
      b.style.width = `${dw*(task.end-task.start+1)}px`;
      b.style.background = task.color;
      b.textContent = task.name;
      b.dataset.row = row;
      ['start','end'].forEach(pos => {
        const h = document.createElement('div');
        h.className = `handle ${pos}`;
        b.appendChild(h);
        addDrag(h);
      });
      tl.appendChild(b);
    }
  });
}

// existing drag logic (unchanged)…
let dragState = null;
function addDrag(handle) { /* … */ }
function onDrag(e) { /* … */ }

// Init
function init(){
  generateDays();
  loadConfig();

  // ensure initial left-column width
  document.getElementById('taskColumn').style.width = firstColWidth + 'px';

  render();

  document.getElementById('zoomIn').onclick  = () => { zoomLevel *= 1.25; render(); };
  document.getElementById('zoomOut').onclick = () => { zoomLevel /= 1.25; render(); };
  document.getElementById('addTask').onclick = () => {
    tasks.push({ name: 'New Task', start: null, end: null, color: '#0082c8' });
    saveConfig(); render();
  };
  document.getElementById('saveConfig').onclick     = downloadConfig;
  const loadInput = document.getElementById('loadConfigInput');
  document.getElementById('loadConfigBtn').onclick   = () => loadInput.click();
  loadInput.onchange = e => handleUpload(e.target.files[0]);

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
