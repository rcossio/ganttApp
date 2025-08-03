import state from './state.js';

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

export function handleUpload(file, onLoad) {
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const config = JSON.parse(reader.result)
      Object.assign(state, config);
      saveConfig();
      onLoad(config)
    } catch {
      alert('Invalid JSON')
    }
  }
  reader.readAsText(file)
}