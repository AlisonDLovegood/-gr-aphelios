import useGraphStore from '../../store/GraphStore'

export function exportGraph() {
  const { nodes, edges } = useGraphStore.getState()

  const data = JSON.stringify({ nodes, edges }, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'grafo.json'
  a.click()

  URL.revokeObjectURL(url)
}