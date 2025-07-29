// State
const firstColWidth = 200;
const baseDayWidth = 40;
let zoomLevel = 1;
let tasks = [];
const days = [];

// Generate weekdays
function generateDays() {
  const year = new Date().getFullYear();
  let d = new Date(year, 0, 1);
  while (d.getFullYear() === year) {
    if (d.getDay() >= 1 && d.getDay() <= 5) days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
}

// Config load/save
function loadConfig() {
  const saved = localStorage.getItem('tasksConfig');
  if (saved) tasks = JSON.parse(saved);
}
function saveConfig() {
  localStorage.setItem('tasksConfig', JSON.stringify(tasks));
}
function downloadConfig() {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'config.json';
  a.click();
  URL.revokeObjectURL(url);
}
function handleUpload(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      tasks = JSON.parse(reader.result);
      saveConfig();
      render();
    } catch { alert('Invalid JSON'); }
  };
  reader.readAsText(file);
}

// Measurements
function dayWidth() { return baseDayWidth * zoomLevel; }

// Main render
function render() {
  renderTaskColumn();
  renderTimeline();
}

// Left column
function renderTaskColumn() {
  const col = document.getElementById('taskColumn');
  col.innerHTML = '';
  const header = document.createElement('div');
  header.className = 'task-cell'; header.textContent = 'Task';
  col.appendChild(header);
  tasks.forEach((task, idx) => {
    const cell = document.createElement('div');
    cell.className = 'task-cell';
    cell.innerHTML = `
      <span>${task.name}</span>
      <div>
        <button class="btn btn-sm btn-light edit-name" data-idx="${idx}">✏️</button>
        <button class="btn btn-sm btn-light edit-color" data-idx="${idx}">🎨</button>
      </div>`;
    col.appendChild(cell);
  });
  attachRowControls();
}

function attachRowControls() {
  document.querySelectorAll('.edit-name').forEach(btn => {
    btn.onclick = () => {
      const idx = +btn.dataset.idx;
      openNamePopup(tasks[idx], btn);
    };
  });
  document.querySelectorAll('.edit-color').forEach(btn => {
    btn.onclick = () => {
      const idx = +btn.dataset.idx;
      openColorPopup(tasks[idx], btn);
    };
  });
}

// Popups
function openNamePopup(task, anchor) {
  closePopups();
  const popup = document.createElement('div'); popup.className = 'popup';
  const input = document.createElement('input'); input.value = task.name;
  input.onkeydown = e => {
    if (e.key === 'Enter') {
      task.name = input.value; saveConfig(); closePopups(); render();
    }
  };
  popup.appendChild(input);
  document.body.appendChild(popup);
  positionPopup(popup, anchor);
}

function openColorPopup(task, anchor) {
  closePopups();
  const popup = document.createElement('div'); popup.className = 'popup';
  const palette = document.createElement('div'); palette.className = 'color-palette';
  ['#e6194b','#3cb44b','#ffe119','#0082c8','#f58231','#911eb4','#46f0f0','#f032e6','#d2f53c','#fabebe','#008080','#e6beff']
    .forEach(c => {
      const sw = document.createElement('div'); sw.className = 'color-swatch'; sw.style.background = c;
      sw.onclick = () => { task.color = c; saveConfig(); closePopups(); render(); };
      palette.appendChild(sw);
    });
  popup.appendChild(palette);
  document.body.appendChild(popup);
  positionPopup(popup, anchor);
}

function closePopups() { document.querySelectorAll('.popup').forEach(p => p.remove()); }
function positionPopup(popup, anchor) {
  const r = anchor.getBoundingClientRect();
  popup.style.left = `${r.right + 5}px`;
  popup.style.top  = `${r.top}px`;
}

// Timeline
function renderTimeline() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  const dw = dayWidth();
  grid.style.minWidth = `${dw * days.length}px`;
  grid.style.gridTemplateColumns = `repeat(${days.length}, ${dw}px)`;
  grid.style.gridTemplateRows = `40px 40px repeat(${tasks.length}, 40px)`;

  // Months
  const spans = [];
  days.forEach((d,i) => {
    const m = d.toLocaleString('default',{month:'short'});
    const last = spans.length-1;
    if (last<0||spans[last].month!==m) spans.push({month:m,start:i,span:1});
    else spans[last].span++;
  });
  spans.forEach(ms => {
    const div = document.createElement('div'); div.className='header-col'; div.textContent=ms.month;
    div.style.gridColumn=`${ms.start+1}/${ms.start+1+ms.span}`;
    div.style.gridRow='1/2'; grid.appendChild(div);
  });

  // Days
  days.forEach((d,i) => {
    const div = document.createElement('div'); div.className='day-col'; div.textContent=d.getDate();
    div.style.gridColumn=`${i+1}/${i+2}`; div.style.gridRow='2/3'; grid.appendChild(div);
  });

  // Cells
  tasks.forEach((task,row) => {
    days.forEach((_,i) => {
      const cell = document.createElement('div');
      cell.style.gridColumn=`${i+1}/${i+2}`;
      cell.style.gridRow=`${row+3}/${row+4}`;
      cell.addEventListener('click',()=>{ task.start=i; task.end=i; saveConfig(); render(); });
      cell.addEventListener('contextmenu',e=>{ e.preventDefault(); task.start=i; task.end=i; saveConfig(); render(); });
      grid.appendChild(cell);
    });
  });

  renderBlocks();
}

// Blocks and drag
function renderBlocks() {
  document.querySelectorAll('.task-block').forEach(b=>b.remove());
  const tl = document.getElementById('timelineContainer');
  const dw = dayWidth();
  tasks.forEach((task,row)=>{
    if(task.start!=null&&task.end!=null) {
      const b = document.createElement('div'); b.className='task-block';
      b.style.top=`${40*(row+2)}px`;
      b.style.left=`${dw*task.start}px`;
      b.style.width=`${dw*(task.end-task.start+1)}px`;
      b.style.background=task.color;
      b.textContent=task.name;
      b.dataset.row=row;
      ['start','end'].forEach(pos=>{ const h=document.createElement('div'); h.className=`handle ${pos}`; b.appendChild(h); addDrag(h); });
      tl.appendChild(b);
    }
  });
}

let dragState=null;
function addDrag(handle) {
  handle.onmousedown=e=>{
    e.stopPropagation();
    const blk=handle.parentElement;
    const task=tasks[+blk.dataset.row];
    dragState={task,isStart:handle.classList.contains('start')};
    document.onmousemove=onDrag;
    document.onmouseup=()=>{ document.onmousemove=null; document.onmouseup=null; dragState=null; };
  };
}
function onDrag(e){
  if(!dragState) return;
  const dw=dayWidth();
  const rect=document.getElementById('grid').getBoundingClientRect();
  let x=e.clientX-rect.left;
  let day=Math.round(x/dw);
  day=Math.max(0,Math.min(days.length-1,day));
  if(dragState.isStart) dragState.task.start=Math.min(dragState.task.end,day);
  else dragState.task.end=Math.max(dragState.task.start,day);
  saveConfig(); renderBlocks();
}

// Init
function init(){
  generateDays(); loadConfig(); render();
  document.getElementById('zoomIn').onclick=()=>{ zoomLevel*=1.25; render(); };
  document.getElementById('zoomOut').onclick=()=>{ zoomLevel/=1.25; render(); };
  document.getElementById('addTask').onclick=()=>{ tasks.push({name:'New Task',start:null,end:null,color:'#0082c8'}); saveConfig(); render(); };
  document.getElementById('saveConfig').onclick=downloadConfig;
  const loadInput=document.getElementById('loadConfigInput');
  document.getElementById('loadConfigBtn').onclick=()=>loadInput.click();
  loadInput.onchange=e=>handleUpload(e.target.files[0]);
}
window.onload=init;