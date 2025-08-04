import state from './state.js';
import { render } from './render.js';
import { scrollToToday } from './utils.js';

export function saveConfig() {
  localStorage.setItem('tasksConfig', JSON.stringify(state));
}

export function loadConfig() {
  const saved = localStorage.getItem('tasksConfig')
  try {
    const config = JSON.parse(saved)
    return {
      groups: config.groups || [],
      zoomLevel: config.zoomLevel ?? 1,
      team: config.team || []
    }
  } catch {
    return { groups: [], zoomLevel: 1, team: [] }
  }
}

export function downloadConfig() {
  const exportConfig = { ...state }; //just in case we strip properties later
  const blob = new Blob([JSON.stringify(exportConfig, null,2)], {type:'application/json'})
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob), download:'config.json'
  })
  a.click()
  URL.revokeObjectURL(a.href)
}

export function handleUpload(file) {
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const config = JSON.parse(reader.result)
      // Fix: convert days array to Date objects if present
      if (Array.isArray(config.days)) {
        config.days = config.days.map(d => new Date(d));
      }
      Object.assign(state, config);
      saveConfig();
      render();
      scrollToToday();
    } catch (err) {
      alert('Invalid JSON')
    }
  }
  reader.readAsText(file)
}