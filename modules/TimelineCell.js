import state from './state.js';
import { saveConfig } from './config.js';
import { render } from './render.js';

function TimelineCell(row, rIdx, i, daysArr) {
  const cell = document.createElement('div');
  cell.className = 'timeline-cell';
  const days = daysArr || state.days;
  if (days[i].getDay() === 1) cell.classList.add('monday');
  if (days[i].getDay() === 0 || days[i].getDay() === 6) cell.classList.add('weekend');
  cell.style.gridColumn = `${i + 1}/${i + 2}`;
  cell.style.gridRow    = `${rIdx + 3}/${rIdx + 4}`;
  if (row.type === 'task' && row.task.startDate == null) {
    cell.addEventListener('click', () => {
      const date = days[i];
      const isoDate = date.toISOString().slice(0, 10);
      row.task.startDate = isoDate;
      row.task.endDate   = isoDate;
      saveConfig();
      render();
    });
  }
  return cell;
} 

export default TimelineCell;