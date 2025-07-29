export function loadConfig() {
  const saved = localStorage.getItem('tasksConfig')
  if (!saved || saved === 'undefined') return []
  try {
    const data = JSON.parse(saved)
    // if stored as flat Task[], wrap in default group
    if (Array.isArray(data) && data.every(item => item.tasks === undefined)) {
      return [{ name: 'Default', collapsed: false, tasks: data }]
    }
    // else assume Group[]
    return data
  } catch {
    return []
  }
}

export function saveConfig(groups) {
  localStorage.setItem('tasksConfig', JSON.stringify(groups))
}

export function downloadConfig(groups) {
  const blob = new Blob([JSON.stringify(groups, null,2)], {type:'application/json'})
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
      const data = JSON.parse(reader.result)
      // normalize flat Task[] into Group[]
      const groups = Array.isArray(data) && data.every(item => item.tasks === undefined)
        ? [{ name: 'Default', collapsed: false, tasks: data }]
        : data
      // persist to storage
      saveConfig(groups)
      onLoad(groups)
    } catch {
      alert('Invalid JSON')
    }
  }
  reader.readAsText(file)
}