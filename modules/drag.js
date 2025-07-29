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