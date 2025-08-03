import state from './state.js';
import { flattenRows, dayWidth, closePopups, positionPopup, attachOnClickOutside } from './utils.js';

import { CollapseButton, GroupRenameButton, GroupAddTaskButton, GroupDeleteButton } from './groupButtons.js';
import { AddGroupButton } from './specialButtons.js';
import TaskBlock from './TaskBlock.js';
import TaskContextMenu from './TaskContextMenu.js';
import TimelineCell from './TimelineCell.js';

const ZOOM_DAY_TEXT_THRESHOLD = 0.45;

// Main render
export async function render() {
  const rows = flattenRows();

  // Add Weekend toggle button to controls
  const controls = document.getElementById('controls');
  if (!document.getElementById('toggleWeekends')) {
    const { WeekendToggleButton } = await import('./controlButtons.js');
    controls.appendChild(WeekendToggleButton());
  }

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
        closePopups();
        const menu = TaskContextMenu(rows, idx);
        document.body.appendChild(menu);
        positionPopup(menu, cell);

        // Close popup when clicking outside menu or submenu
        attachOnClickOutside(menu, () => !document.querySelector('.popup'));
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
  const days = state.showWeekends === false
    ? state.days.filter(d => d.getDay() !== 0 && d.getDay() !== 6)
    : state.days;
  grid.style.minWidth = `${dw * days.length}px`;
  grid.style.gridTemplateColumns = `repeat(${days.length}, ${dw}px)`;
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
  const todayDate = new Date().toDateString();
  days.forEach((d, i) => {
    const div = document.createElement('div');
    // highlight today
    const isToday = d.toDateString() === todayDate;
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    div.className = 'day-col' +
      (d.getDay() === 1 ? ' monday' : '') +
      (isToday ? ' today' : '') +
      (isWeekend ? ' weekend' : '');
    // Only show day number text for Mondays or if zoomLevel >= threshold
    if (state.zoomLevel < ZOOM_DAY_TEXT_THRESHOLD && d.getDay() !== 1) {
      div.textContent = '';
    } else {
      div.textContent = d.getDate();
    }
    div.style.gridColumn = `${i + 1}/${i + 2}`;
    div.style.gridRow    = '2/3';
    // Allow overflow for Monday text if zoomLevel < threshold
    if (state.zoomLevel < ZOOM_DAY_TEXT_THRESHOLD && d.getDay() === 1) {
      div.style.zIndex = 2;
    }
    // Remove day borders if zoomLevel < threshold (leave week borders)
    if (state.zoomLevel < ZOOM_DAY_TEXT_THRESHOLD) {
      div.style.borderRight = 'none';
      div.style.borderLeft = d.getDay() === 1 ? '2px solid #aaa' : 'none';
    }
    grid.appendChild(div);
  });

  // empty cells for tasks (starting row 3)
  rows.forEach((row, rIdx) => {
    days.forEach((_, i) => {
      grid.appendChild(TimelineCell(row, rIdx, i, days));
    });
  });

  // Render task blocks
  document.querySelectorAll('.task-block').forEach(b => b.remove());
  const tl = document.getElementById('timelineContainer');
  rows.forEach((row, rIdx) => {
    if (row.type === 'task') {
      const task = row.task;
      if (task.startDate != null && task.endDate != null) {
        tl.appendChild(TaskBlock(task,rIdx,days,dw));
      }
    }
  });
}