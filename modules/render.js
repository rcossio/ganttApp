import state from './state.js';
import { flattenRows, dayWidth } from './utils.js';
import { saveConfig } from './config.js';
import { createCollapseButton, createGroupRenameButton, createGroupAddTaskButton, createGroupDeleteButton } from './groupButtons.js';
import { createEditNameButton, createEditColorButton, createDeleteTaskButton } from './taskButtons.js';

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
  header.textContent = 'Group/Task';
  col.appendChild(header);

  //Add dummy row so everything lines up under the two timeline headers
  const dummy = document.createElement('div');
  dummy.className = 'task-cell';
  // add Add Group button in dummy cell
  dummy.innerHTML = `<button id="addGroupDummy" class="btn btn-primary btn-sm">+ Add Group</button>`;
  col.appendChild(dummy);
  // attach click handler for dummy Add Group
  document.getElementById('addGroupDummy').onclick = () => {
    state.groups.push({ name: 'New Group', collapsed: false, tasks: [] });
    saveConfig({ groups: state.groups, zoomLevel: state.zoomLevel });
    render();
  };

  rows.forEach((row, idx) => {
    const cell = document.createElement('div');
    cell.className = row.type === 'group' ? 'group-cell' : 'task-cell';
    if (row.type === 'group') {
      // replace inline HTML for groups with factory functions
      cell.innerHTML = '';
      cell.appendChild(createCollapseButton(rows, idx));
      const nameSpan = document.createElement('span');
      nameSpan.textContent = row.group.name;
      cell.appendChild(nameSpan);
      cell.appendChild(createGroupRenameButton(rows, idx));
      cell.appendChild(createGroupAddTaskButton(rows, idx));
      if (row.group.tasks.length === 0) {
        cell.appendChild(createGroupDeleteButton(rows, idx));
      }
    } else {
      const t = row.task;
      cell.innerHTML = '';
      const nameSpan = document.createElement('span');
      nameSpan.textContent = t.name;
      cell.appendChild(nameSpan);
      const controlsDiv = document.createElement('div');
      controlsDiv.className = 'task-controls';
      controlsDiv.appendChild(createEditNameButton(rows, idx));
      controlsDiv.appendChild(createEditColorButton(rows, idx));
      controlsDiv.appendChild(createDeleteTaskButton(rows, idx));
      cell.appendChild(controlsDiv);
    }
    col.appendChild(cell);
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
    div.className = 'day-col' + (d.getDay() === 1 ? ' monday' : '');
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
      if (state.days[i].getDay() === 1) cell.classList.add('monday');
      cell.style.gridColumn = `${i + 1}/${i + 2}`;
      cell.style.gridRow    = `${rIdx + 3}/${rIdx + 4}`;
      if (row.type === 'task' && row.task.start == null) {
         cell.addEventListener('click', () => {
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
