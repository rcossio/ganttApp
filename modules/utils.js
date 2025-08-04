import state from './state.js';
import { saveConfig } from './config.js';
import { render } from './render.js';

// Date related functions
export function generateDays() {
  const days = []
  const year = new Date().getFullYear()
  for (let d=new Date(year,0,1); d.getFullYear()===year; d.setDate(d.getDate()+1)) {
    days.push(new Date(d))
  }
  return days
}

export function scrollToToday() {
  const today = new Date();
  const days = state.showWeekends === false
    ? state.days.filter(d => d.getDay() !== 0 && d.getDay() !== 6)
    : state.days;
  // find index of today in days array
  let idx = days.findIndex(d => d.toDateString() === today.toDateString());
  // If today is not found (weekend hidden), scroll to next weekday
  if (idx === -1) {
    idx = days.findIndex(d => d > today);
    if (idx === -1) idx = 0; // fallback to first day
  }
  if (idx >= 0) {
    const offIdx = Math.max(0, idx - 10);
    document.getElementById('timelineContainer').scrollLeft = offIdx * dayWidth();
  }
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

//Popup utils
export function closePopups() {
  document.querySelectorAll('.popup, .context-menu').forEach(p=>p.remove())
}

export function positionPopup(popup, anchor) {
  const r = anchor.getBoundingClientRect()
  Object.assign(popup.style, {
    left:`${r.right+5}px`, top:`${r.top}px`
  })
}

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

// Utility: Initialize resizer for task column
export function initResizer() {
  const divider = document.getElementById('divider');
  const container = document.getElementById('ganttContainer');
  let isResizing = false;
  const minWidth = 100; // Minimum width for the task column

  divider.addEventListener('mousedown', e => {
    e.preventDefault();
    isResizing = true;
    document.body.style.cursor = 'col-resize';
  });
  divider.addEventListener('dragstart', e => e.preventDefault());

  function moveHandler(e) {
    if (!isResizing) return;
    const rect = container.getBoundingClientRect();
    let newWidth = e.clientX - rect.left;
    newWidth = Math.max(minWidth, newWidth);
    state.firstColWidth = newWidth;
    document.getElementById('taskColumn').style.width = `${newWidth}px`;
  }

  function upHandler() {
    isResizing = false;
    document.body.style.cursor = '';
  }

  document.addEventListener('mousemove', moveHandler);
  document.addEventListener('mouseup', upHandler);
}

// Utility: Attach outside click handler and auto-remove
export function attachOnClickOutside(element, extraCondition) {
  function handler(ev) {
    const condition = typeof extraCondition === 'function' ? extraCondition() : true;
    if (!element.contains(ev.target) && condition) {
      closePopups();
      document.removeEventListener('mousedown', handler);
    }
  }
  setTimeout(() => {
    document.addEventListener('mousedown', handler);
  }, 0);
}

// Utility: Enable zoom in/out with Ctrl + scroll wheel
export function enableCtrlWheelZoom() {
  window.addEventListener('wheel', function(e) {
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        // Zoom in
        state.zoomLevel = Math.min(state.zoomLevel * 1.05737126344, 5.0); //sqrt(sqrt(1.25))
      } else if (e.deltaY > 0) {
        // Zoom out
        state.zoomLevel = Math.max(state.zoomLevel / 1.05737126344, 0.1); //sqrt(sqrt(1.25))
      }
      import('./render.js').then(({ render }) => {
        saveConfig();
        render();
      });
    }
  }, { passive: false });
}

// Utility: Enable drag-to-scroll for an element
export function enableDragToScroll(element) {
  let isDragging = false;
  let startX, startY, scrollLeft, scrollTop;

  element.addEventListener('mousedown', function(e) {
    // Only drag if not clicking on a child element (like grid)
    if (e.target !== element) {
      return;
    }
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    scrollLeft = element.scrollLeft;
    scrollTop = element.scrollTop;
    element.style.cursor = 'grab';
    e.preventDefault();
  });

  window.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    const dx = startX - e.clientX;
    const dy = startY - e.clientY;
    element.scrollLeft = scrollLeft + dx;
    element.scrollTop = scrollTop + dy;
  });

  window.addEventListener('mouseup', function() {
    if (isDragging) {
      isDragging = false;
      element.style.cursor = '';
    }
  });
}
