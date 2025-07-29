import {loadConfig, saveConfig, downloadConfig, handleUpload} from './modules/config.js';
import { openNamePopup, openColorPopup } from './modules/popups.js'
import { generateDays } from './modules/date.js'
import { initDrag } from './modules/drag.js';
import { initResizer } from './modules/resizer.js';

// State
let firstColWidth = 200;
const baseDayWidth = 40;
let zoomLevel = 1;
let groups = [];
let days = [];
// rows is a flattened view of group and task rows
let rows = [];

// Flatten groups into header/task rows for rendering
function flattenRows() {
  const r = [];
  groups.forEach((g, gi) => {
    r.push({ type: 'group', group: g, gi });
    if (!g.collapsed) {
      g.tasks.forEach((t, ti) => r.push({ type: 'task', task: t, gi, ti }));
    }
  });
  return r;
}

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

  rows = flattenRows();
  rows.forEach((row, idx) => {
    const cell = document.createElement('div');
    cell.className = row.type === 'group' ? 'group-cell' : 'task-cell';
    if (row.type === 'group') {
      cell.innerHTML = `
        <button class="collapse-toggle" data-idx="${idx}">${row.group.collapsed ? '▶' : '▼'}</button>
        <span>${row.group.name}</span>
        <button class="btn btn-sm btn-light group-rename" data-idx="${idx}">✏️</button>
        <button class="btn btn-sm btn-light group-add-task" data-idx="${idx}">＋</button>
        ${row.group.tasks.length === 0 ? `<button class="btn btn-sm btn-danger group-delete" data-idx="${idx}">🗑️</button>` : ''}
      `;
    } else {
      const t = row.task;
      cell.innerHTML = `
        <span>${t.name}</span>
        <div class="task-controls">
          <button class="btn btn-sm btn-light edit-name" data-idx="${idx}">✏️</button>
          <button class="btn btn-sm btn-light edit-color" data-idx="${idx}">🎨</button>
          <button class="btn btn-sm btn-danger delete-task" data-idx="${idx}">🗑️</button>
        </div>
      `;
    }
    col.appendChild(cell);
  });
  attachGroupControls();
  attachRowControls();
}

function attachGroupControls() {
  document.querySelectorAll('.collapse-toggle').forEach(btn => {
    btn.onclick = () => {
      const idx = +btn.dataset.idx;
      const row = rows[idx];
      const group = row.group;
      group.collapsed = !group.collapsed;
      saveConfig(groups);
      renderTaskColumn();
    };
  });
  document.querySelectorAll('.group-rename').forEach(btn => {
    btn.onclick = () => {
      const idx = +btn.dataset.idx;
      const row = rows[idx];
      openNamePopup(row.group, btn, () => { saveConfig(groups); render(); });
    };
  });
  document.querySelectorAll('.group-add-task').forEach(btn => {
    btn.onclick = () => {
      const idx = +btn.dataset.idx;
      const row = rows[idx];
      const task = { name: 'New Task', start: null, end: null, color: '#0082c8' };
      row.group.tasks.push(task);
      saveConfig(groups);
      render();
    };
  });
  document.querySelectorAll('.group-delete').forEach(btn => {
    btn.onclick = () => {
      const idx = +btn.dataset.idx;
      const row = rows[idx];
      if (confirm('Are you sure you want to delete this group?')) {
        groups.splice(row.gi, 1);
        saveConfig(groups);
        render();
      }
    };
  });
}

function attachRowControls() {
  document.querySelectorAll('.edit-name').forEach(btn => {
    btn.onclick = () => {
      const idx = +btn.dataset.idx;
      const row = rows[idx];
      openNamePopup(row.task, btn, () => { saveConfig(groups); render(); });
    };
  });
  document.querySelectorAll('.edit-color').forEach(btn => {
    btn.onclick = () => {
      const idx = +btn.dataset.idx;
      const row = rows[idx];
      openColorPopup(row.task, btn, () => { saveConfig(groups); render(); });
    };
  });
  document.querySelectorAll('.delete-task').forEach(btn => {
    btn.onclick = () => {
      const idx = +btn.dataset.idx;
      if (confirm('Are you sure you want to delete this task?')) {
        const row = rows[idx];
        if (row.type === 'task') {
          groups[row.gi].tasks.splice(row.ti, 1);
        } else {
          groups.splice(row.gi, 1);
        }
        saveConfig(groups);
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
  rows = flattenRows();
  grid.style.gridTemplateRows = `40px 40px repeat(${rows.length}, 40px)`;

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
  rows.forEach((row, rIdx) => {
    days.forEach((_, i) => {
      const cell = document.createElement('div');
      cell.style.gridColumn = `${i + 1}/${i + 2}`;
      cell.style.gridRow    = `${rIdx + 3}/${rIdx + 4}`;
      if (row.type === 'task') {
        cell.addEventListener('click', () => {
          row.task.start = i;
          row.task.end   = i;
          saveConfig(groups);
          render();
        });
        cell.addEventListener('contextmenu', e => {
          e.preventDefault();
          row.task.start = i;
          row.task.end   = i;
          saveConfig(groups);
          render();
        });
      }
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
  rows.forEach((row, rIdx) => {
    if (row.type === 'task') {
      const task = row.task;
      if (task.start != null && task.end != null) {
        const b = document.createElement('div');
        b.className = 'task-block';
        b.style.top        = `${40 * (rIdx + 2)}px`;
        b.style.left       = `${dw * task.start}px`;
        b.style.width      = `${dw * (task.end - task.start + 1)}px`;
        b.style.background = task.color;
        b.textContent      = task.name;
        b.dataset.row      = rIdx;
        ['start', 'end'].forEach(pos => {
          const h = document.createElement('div');
          h.className = `handle ${pos}`;
          // make handle draggable: position and size
          h.style.position = 'absolute';
          h.style.top = '0';
          h.style[pos === 'start' ? 'left' : 'right'] = '0';
          h.style.width = '4px';
          h.style.height = '100%';
          h.style.cursor = 'ew-resize';
          b.appendChild(h);
        });
        tl.appendChild(b);
      }
    }
  });
}

// Scroll timeline so that today is centered (start 5 days before today)
function scrollToToday() {
  const today = new Date();
  // find index of today in days array
  const idx = days.findIndex(d => d.toDateString() === today.toDateString());
  if (idx >= 0) {
    const offIdx = Math.max(0, idx - 10);
    document.getElementById('timelineContainer').scrollLeft = offIdx * dayWidth();
  }
}

// Init
function init() {
  days = generateDays();
  groups = loadConfig();
  document.getElementById('taskColumn').style.width = firstColWidth + 'px';
  render();
  scrollToToday();

  document.getElementById('zoomIn').onclick  = () => { zoomLevel *= 1.25; render(); };
  document.getElementById('zoomOut').onclick = () => { zoomLevel /= 1.25; render(); };
  document.getElementById('addGroup').onclick = () => {
    groups.push({ name: 'New Group', collapsed: false, tasks: [] });
    saveConfig(groups);
    render();
  };
  document.getElementById('saveConfig').onclick   = () => downloadConfig(groups);
  const loadInput = document.getElementById('loadConfigInput');
  document.getElementById('loadConfigBtn').onclick = () => loadInput.click();
  loadInput.onchange = e => handleUpload(e.target.files[0], newGroups => {
    groups = newGroups;
    saveConfig(groups);
    render();
  });

  // Initialize drag-and-drop resizing and task block dragging
  initDrag(() => flattenRows(), days, dayWidth, () => { saveConfig(groups); renderBlocks(); });
  initResizer(
    document.getElementById('divider'),
    document.getElementById('ganttContainer'),
    newWidth => {
      firstColWidth = newWidth;
      document.getElementById('taskColumn').style.width = `${newWidth}px`;
    }
  );
}

window.onload = init;