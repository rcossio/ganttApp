export const COLORS = [
  '#e6194b','#3cb44b','#ffe119','#0082c8',
  '#f58231','#911eb4','#46f0f0','#f032e6',
  '#d2f53c','#fabebe','#008080','#e6beff'
]

export function closePopups() {
  document.querySelectorAll('.popup').forEach(p=>p.remove())
}
export function positionPopup(popup, anchor) {
  const r = anchor.getBoundingClientRect()
  Object.assign(popup.style, {
    left:`${r.right+5}px`, top:`${r.top}px`
  })
}
export function openNamePopup(task, anchor, onSave) {
  closePopups()
  const popup = document.createElement('div'); popup.className='popup'
  const input = Object.assign(document.createElement('input'), {value:task.name})
  input.addEventListener('keydown', e=> {
    if(e.key==='Enter'){
      task.name = input.value; onSave(); closePopups()
    }
  })
  popup.append(input); document.body.append(popup)
  positionPopup(popup,anchor); input.focus()
}
export function openColorPopup(task, anchor, onSave) {
  closePopups()
  const popup = document.createElement('div'); popup.className='popup'
  const palette = document.createElement('div'); palette.className='color-palette'
  COLORS.forEach(c=> {
    const sw = document.createElement('div')
    sw.className='color-swatch'; sw.style.background=c
    sw.onclick = () => { task.color=c; onSave(); closePopups() }
    palette.append(sw)
  })
  popup.append(palette); document.body.append(popup)
  positionPopup(popup,anchor)
}