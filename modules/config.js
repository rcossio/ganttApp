import state from './state.js';

/**
 * Persists configuration (including team) to localStorage
 */
export function saveConfig(config) {
  localStorage.setItem('tasksConfig', JSON.stringify(config));
}

export function loadConfig() {
  const saved = localStorage.getItem('tasksConfig')
  if (!saved || saved === 'undefined') return { groups: [], zoomLevel: 1 }
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

export function downloadConfig(config) {
  // include team before export
  const exportConfig = { ...config, team: state.team };
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
      saveConfig(config)
      onLoad(config)
    } catch {
      alert('Invalid JSON')
    }
  }
  reader.readAsText(file)
}