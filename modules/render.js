import state from './state.js';
import { flattenRows, dayWidth } from './utils.js';
import { saveConfig } from './config.js';

import { CollapseButton, GroupRenameButton, GroupAddTaskButton, GroupDeleteButton } from './groupButtons.js';
import { AddGroupButton } from './specialButtons.js';
import TaskSingleBlock from './TaskSingleBlock.js';
import TaskContextMenu from './TaskContextMenu.js';

import { attachClickOutside } from './utils.js';

// Main render
export function render() {
  const rows = flattenRows();

  renderTaskColumn(rows);
  renderTimeline(rows);
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
  dummy.appendChild(AddGroupButton());
  col.appendChild(dummy);

  // Render each task/group
  rows.forEach((row, idx) => {
    const cell = document.createElement('div');
    cell.className = row.type === 'group' ? 'group-cell' : 'task-cell';
    if (row.type === 'group') { // Group row
      cell.innerHTML = '';
      cell.appendChild(CollapseButton(rows, idx));
      const nameSpan = document.createElement('span');
      nameSpan.textContent = row.group.name;
      cell.appendChild(nameSpan);
      cell.appendChild(GroupRenameButton(rows, idx));
      cell.appendChild(GroupAddTaskButton(rows, idx));
      if (row.group.tasks.length === 0) {
        cell.appendChild(GroupDeleteButton(rows, idx));
      }
    } else { // Task row
      cell.innerHTML = '';
      const nameSpan = document.createElement('span');
      nameSpan.textContent = row.task.name;
      cell.appendChild(nameSpan);
      // Context menu logic
      cell.oncontextmenu = (e) => {
        e.preventDefault();
        document.querySelectorAll('.context-menu').forEach(m => m.remove());
        const menu = TaskContextMenu(rows, idx);
        document.body.appendChild(menu);
        // Position menu next to the task cell
        const rect = cell.getBoundingClientRect();
        menu.style.left = rect.right + 8 + 'px';
        menu.style.top = rect.top + window.scrollY + 'px';
        attachClickOutside(menu, () => menu.remove(), () => !document.querySelector('.popup'));
      };
    }
    col.appendChild(cell);
  });
}

// Timeline
function renderTimeline(rows) {
  const dw = dayWidth();
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
  const todayDate = new Date().toDateString();
  state.days.forEach((d, i) => {
    const div = document.createElement('div');
    // highlight today
    const isToday = d.toDateString() === todayDate;
    div.className = 'day-col' +
      (d.getDay() === 1 ? ' monday' : '') +
      (isToday ? ' today' : '');
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
           saveConfig();
           render();
         });
      }
      grid.appendChild(cell);
    });
  });

  renderTaskBlocks(rows);
}

// Blocks and drag
export function renderTaskBlocks(rows) {
  document.querySelectorAll('.task-block').forEach(b => b.remove());
  const tl = document.getElementById('timelineContainer');
  rows.forEach((row, rIdx) => {
    if (row.type === 'task') {
      const task = row.task;
      if (task.start != null && task.end != null) {
        tl.appendChild(TaskSingleBlock(task, rIdx));
      }
    }
  });
}

