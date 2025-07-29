import state from './state.js';

// Date related functions
export function scrollToToday() {
  const today = new Date();
  // find index of today in days array
  const idx = state.days.findIndex(d => d.toDateString() === today.toDateString());
  if (idx >= 0) {
    const offIdx = Math.max(0, idx - 10);
    document.getElementById('timelineContainer').scrollLeft = offIdx * dayWidth();
  }
}

export function generateDays() {
  const days = []
  const year = new Date().getFullYear()
  for (let d=new Date(year,0,1); d.getFullYear()===year; d.setDate(d.getDate()+1)) {
    if (d.getDay()>=1 && d.getDay()<=5) days.push(new Date(d))
  }
  return days
}


// State functions
// Measurements
export function dayWidth() { return state.baseDayWidth * state.zoomLevel; }

// Flatten groups into header/task rows for rendering
export function flattenRows() {
  const r = [];
  state.groups.forEach((g, gi) => {
    r.push({ type: 'group', group: g, gi });
    if (!g.collapsed) {
      g.tasks.forEach((t, ti) => r.push({ type: 'task', task: t, gi, ti }));
    }
  });
  return r;
}


// Drag functions
// Initialize a draggable divider between two panels.
// divider: DOM element to drag
// container: parent element for width calculations
export function initResizer(divider, container) {
  let isResizing = false;
  divider.onmousedown = e => { e.preventDefault(); isResizing = true; };
  divider.ondragstart = e => e.preventDefault();
  document.onmousemove = e => {
    if (!isResizing) return;
    const rect = container.getBoundingClientRect();
    const newWidth = e.clientX - rect.left;
    state.firstColWidth = newWidth;
    document.getElementById('taskColumn').style.width = `${newWidth}px`;
  };
  document.onmouseup = () => { isResizing = false; };
}

// Initialize drag behavior for task-block handles
export function initDrag(getRows, days, dayWidthFn, onUpdate) {
  let dragState = null;

  document.addEventListener('mousedown', e => {
    if (!e.target.classList.contains('handle')) return;
    e.stopPropagation();
    const handle = e.target;
    const blk = handle.parentElement;
    const rows = getRows();
    const row = rows[+blk.dataset.row];
    const task = row.task;
    const isStart = handle.classList.contains('start');
    dragState = { task, isStart };
    document.onmousemove = moveHandler;
    document.onmouseup = upHandler;
  });

  function moveHandler(e) {
    if (!dragState) return;
    const dw = dayWidthFn();
    const rect = document.getElementById('grid').getBoundingClientRect();
    let x = e.clientX - rect.left;
    let day = Math.round(x / dw);
    day = Math.max(0, Math.min(days.length - 1, day));
    if (dragState.isStart) {
      dragState.task.start = Math.min(dragState.task.end, day);
    } else {
      dragState.task.end = Math.max(dragState.task.start, day);
    }
    onUpdate();
  }

  function upHandler() {
    document.onmousemove = null;
    document.onmouseup = null;
    dragState = null;
  }
}


