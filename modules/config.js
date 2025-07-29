export function loadConfig() {
  const saved = localStorage.getItem('tasksConfig')
  if (!saved || saved === 'undefined') return []
  try {
    return JSON.parse(saved)
  } catch {
    return []
  }
}

export function saveConfig(tasks) {
  localStorage.setItem('tasksConfig', JSON.stringify(tasks))
}

export function downloadConfig(tasks) {
  const blob = new Blob([JSON.stringify(tasks, null,2)], {type:'application/json'})
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