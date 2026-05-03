export function exportPNG() {
  const svg = document.getElementById('graph-svg')
  if (!svg) return

  const serializer = new XMLSerializer()
  const svgStr = serializer.serializeToString(svg)
  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = svg.clientWidth
    canvas.height = svg.clientHeight

    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)

    URL.revokeObjectURL(url)

    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'grafo.png'
    a.click()
  }

  img.src = url
}