// Initialize a draggable divider between two panels.
// divider: DOM element to drag
// container: parent element for width calculations
// onResize: callback(newWidth)
export function initResizer(divider, container, onResize) {
  let isResizing = false;
  divider.addEventListener('mousedown', e => {
    e.preventDefault();
    isResizing = true;
  });
  document.addEventListener('mousemove', e => {
    if (!isResizing) return;
    const rect = container.getBoundingClientRect();
    const newWidth = Math.max(100, Math.min(500, e.clientX - rect.left));
    onResize(newWidth);
  });
  document.addEventListener('mouseup', () => {
    isResizing = false;
  });
}
