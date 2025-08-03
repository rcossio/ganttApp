import state from './state.js';

// Synchronize vertical scroll between task column and timeline
export function synchronizeVerticalScroll() {
  const taskCol = document.getElementById('taskColumn');
  const timeline = document.getElementById('timelineContainer');
  let isSyncingTask = false;
  let isSyncingTimeline = false;

  taskCol.addEventListener('scroll', () => {
    if (!isSyncingTask) {
      isSyncingTimeline = true;
      timeline.scrollTop = taskCol.scrollTop;
    }
    isSyncingTask = false;
  });

  timeline.addEventListener('scroll', () => {
    if (!isSyncingTimeline) {
      isSyncingTask = true;
      taskCol.scrollTop = timeline.scrollTop;
    }
    isSyncingTimeline = false;
  });
}

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
  const moveHandler = e => {
    if (!isResizing) return;
    const rect = container.getBoundingClientRect();
    const newWidth = e.clientX - rect.left;
    state.firstColWidth = newWidth;
    document.getElementById('taskColumn').style.width = `${newWidth}px`;
  };
  const upHandler = () => { isResizing = false; };

  divider.addEventListener('mousedown', e => { e.preventDefault(); isResizing = true; });
  divider.addEventListener('dragstart', e => e.preventDefault());
  document.addEventListener('mousemove', moveHandler);
  document.addEventListener('mouseup', upHandler);
}

// Initialize drag behavior for task-block handles
export function initDrag(getRows, days, dayWidthFn, onUpdate) {
  let dragState = null;

  document.addEventListener('mousedown', e => {
    // start handle drag
    if (e.target.classList.contains('handle')) {
      e.stopPropagation();
      const handle = e.target;
      const blk = handle.parentElement;
      const rows = getRows();
      const row = rows[+blk.dataset.row];
      const task = row.task;
      const isStart = handle.classList.contains('start');
      dragState = { type: 'handle', task, isStart };
      // attach move/up listeners
      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', upHandler);
    }
    // start block drag (move entire task)
    else if (e.target.classList.contains('task-block')) {
      e.stopPropagation();
      const blk = e.target;
      const rows = getRows();
      const row = rows[+blk.dataset.row];
      const task = row.task;
      const dw = dayWidthFn();
      const rect = document.getElementById('grid').getBoundingClientRect();
      const x = e.clientX - rect.left;
      const initialMouseDay = Math.round(x / dw);
      dragState = {
        type: 'block',
        task,
        initialMouseDay,
        initialStart: task.start,
        initialEnd: task.end
      };
      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', upHandler);
    }
  });

  function moveHandler(e) {
    if (!dragState) return;
    const dw = dayWidthFn();
    const rect = document.getElementById('grid').getBoundingClientRect();
    let x = e.clientX - rect.left;
    let day = Math.round(x / dw);
    day = Math.max(0, Math.min(days.length - 1, day));
    if (dragState.type === 'handle') {
      if (dragState.isStart) {
        dragState.task.start = Math.min(dragState.task.end, day);
      } else {
        dragState.task.end = Math.max(dragState.task.start, day);
      }
    } else if (dragState.type === 'block') {
      const delta = day - dragState.initialMouseDay;
      const length = dragState.initialEnd - dragState.initialStart;
      let newStart = dragState.initialStart + delta;
      // clamp within bounds
      newStart = Math.max(0, Math.min(days.length - 1 - length, newStart));
      dragState.task.start = newStart;
      dragState.task.end = newStart + length;
    }
    onUpdate();
  }

  function upHandler() {
    // remove the added listeners
    document.removeEventListener('mousemove', moveHandler);
    document.removeEventListener('mouseup', upHandler);
    dragState = null;
  }
}

// Utility: Attach outside click handler and auto-remove
export function attachClickOutside(element, callback, extraCondition) {
  function handler(ev) {
    const condition = typeof extraCondition === 'function' ? extraCondition() : true;
    if (!element.contains(ev.target) && condition) {
      callback();
      document.removeEventListener('mousedown', handler);
    }
  }
  setTimeout(() => {
    document.addEventListener('mousedown', handler);
  }, 0);
}
