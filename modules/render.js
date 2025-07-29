import state from './state.js';
import { flattenRows, dayWidth } from './utils.js';
import { saveConfig } from './config.js';
import { openNamePopup, openColorPopup } from './popups.js'

// Main render
export function render() {
  const rows = flattenRows();
  const dw = dayWidth();

  renderTaskColumn(rows);
  renderTimeline(rows, dw);
}

// Left column
function renderTaskColumn(rows) {
  const col = document.getElementById('taskColumn');
  col.innerHTML = '';
  col.style.width = state.firstColWidth + 'px';

  // Single header row
  const header = document.createElement('div');
  header.className = 'task-cell';
  header.textContent = 'Task';
  col.appendChild(header);

  //Add dummy row so everything lines up under the two timeline headers
  const dummy = document.createElement('div');
  dummy.className = 'task-cell';
  dummy.innerHTML = '';
  col.appendChild(dummy);

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
  attachGroupControls(rows);
  attachRowControls(rows);
}

function attachGroupControls(rows) {
  document.querySelectorAll('.collapse-toggle').forEach(btn => {
    btn.onclick = () => {
      const idx = +btn.dataset.idx;
      const row = rows[idx];
      const group = row.group;
      group.collapsed = !group.collapsed;
      saveConfig(state.groups);
      render();
    };
  });
  document.querySelectorAll('.group-rename').forEach(btn => {
    btn.onclick = () => {
      const idx = +btn.dataset.idx;
      const row = rows[idx];
      openNamePopup(row.group, btn, () => { saveConfig(state.groups); render(); });
    };
  });
  document.querySelectorAll('.group-add-task').forEach(btn => {
    btn.onclick = () => {
      const idx = +btn.dataset.idx;
      const row = rows[idx];
      const task = { name: 'New Task', start: null, end: null, color: '#0082c8' };
      row.group.tasks.push(task);
      saveConfig(state.groups);
      render();
    };
  });
  document.querySelectorAll('.group-delete').forEach(btn => {
    btn.onclick = () => {
      const idx = +btn.dataset.idx;
      const row = rows[idx];
      if (confirm('Are you sure you want to delete this group?')) {
        state.groups.splice(row.gi, 1);
        saveConfig(state.groups);
        render();
      }
    };
  });
}

function attachRowControls(rows) {
  document.querySelectorAll('.edit-name').forEach(btn => {
    btn.onclick = () => {
      const idx = +btn.dataset.idx;
      const row = rows[idx];
      openNamePopup(row.task, btn, () => { saveConfig(state.groups); render(); });
    };
  });
  document.querySelectorAll('.edit-color').forEach(btn => {
    btn.onclick = () => {
      const idx = +btn.dataset.idx;
      const row = rows[idx];
      openColorPopup(row.task, btn, () => { saveConfig(state.groups); render(); });
    };
  });
  document.querySelectorAll('.delete-task').forEach(btn => {
    btn.onclick = () => {
      const idx = +btn.dataset.idx;
      if (confirm('Are you sure you want to delete this task?')) {
        const row = rows[idx];
        if (row.type === 'task') {
          state.groups[row.gi].tasks.splice(row.ti, 1);
        } else {
          state.groups.splice(row.gi, 1);
        }
        saveConfig(state.groups);
        render();
      }
    };
  });
}

// Timeline
function renderTimeline(rows, dw) {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  grid.style.minWidth = `${dw * state.days.length}px`;
  grid.style.gridTemplateColumns = `repeat(${state.days.length}, ${dw}px)`;
  grid.style.gridTemplateRows = `40px 40px repeat(${rows.length}, 40px)`;

  // Months (row 1)
  const spans = [];
  state.days.forEach((d, i) => {
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
  state.days.forEach((d, i) => {
    const div = document.createElement('div');
    div.className = 'day-col';
    div.textContent = d.getDate();
    div.style.gridColumn = `${i + 1}/${i + 2}`;
    div.style.gridRow    = '2/3';
    grid.appendChild(div);
  });

  // empty cells for tasks (starting row 3)
  rows.forEach((row, rIdx) => {
    state.days.forEach((_, i) => {
      const cell = document.createElement('div');
      cell.className = 'timeline-cell';
      cell.style.gridColumn = `${i + 1}/${i + 2}`;
      cell.style.gridRow    = `${rIdx + 3}/${rIdx + 4}`;
      if (row.type === 'task') {
        cell.addEventListener('click', () => {
          row.task.start = i;
          row.task.end   = i;
          saveConfig(state.groups);
          render();
        });
        cell.addEventListener('contextmenu', e => {
          e.preventDefault();
          row.task.start = i;
          row.task.end   = i;
          saveConfig(state.groups);
          render();
        });
      }
      grid.appendChild(cell);
    });
  });

  renderBlocks(rows);
}

// Blocks and drag
export function renderBlocks(rows) {
  document.querySelectorAll('.task-block').forEach(b => b.remove());
  const tl = document.getElementById('timelineContainer');
  const dw = dayWidth();
  rows.forEach((row, rIdx) => {
    if (row.type === 'task') {
      const task = row.task;
      if (task.start != null && task.end != null) {
        const b = document.createElement('div');
        b.className = 'task-block';
        b.style.top        = `${40 * (rIdx + 2) + 5}px`;
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
