export function loadConfig() {
  const saved = localStorage.getItem('tasksConfig')
  if (!saved || saved === 'undefined') return { groups: [], zoomLevel: 1 }
  try {
    const config = JSON.parse(saved)
    if (Array.isArray(config)) {
      // legacy format: only groups array
      return { groups: config, zoomLevel: 1 }
    }
    return {
      groups: config.groups || [],
      zoomLevel: config.zoomLevel ?? 1
    }
  } catch {
    return { groups: [], zoomLevel: 1 }
  }
}

export function saveConfig(config) {
  localStorage.setItem('tasksConfig', JSON.stringify(config))
}

export function downloadConfig(config) {
  const blob = new Blob([JSON.stringify(config, null,2)], {type:'application/json'})
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