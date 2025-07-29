export function generateDays() {
  const days = []
  const year = new Date().getFullYear()
  for (let d=new Date(year,0,1); d.getFullYear()===year; d.setDate(d.getDate()+1)) {
    if (d.getDay()>=1 && d.getDay()<=5) days.push(new Date(d))
  }
  return days
}