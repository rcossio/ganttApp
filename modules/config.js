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
    try { onLoad(JSON.parse(reader.result)) }
    catch { alert('Invalid JSON') }
  }
  reader.readAsText(file)
}