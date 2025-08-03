import state from './state.js';
import { saveConfig } from './config.js';

function TimelineCell(row, rIdx, i) {
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
  return cell;
} 

export default TimelineCell;