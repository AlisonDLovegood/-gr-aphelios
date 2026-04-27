import useGraphStore from '../../store/GraphStore'

const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1MB

function isValidNode(n) {
  return n !== null && typeof n === 'object' &&
    typeof n.id === 'number' &&
    typeof n.x === 'number' &&
    typeof n.y === 'number'
}

function isValidEdge(e) {
  return e !== null && typeof e === 'object' &&
    typeof e.id === 'number' &&
    typeof e.source === 'number' &&
    typeof e.target === 'number'
}

function validateGraph(data) {
  if (typeof data !== 'object' || data === null) return false
  if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) return false
  if (!data.nodes.every(isValidNode)) return false
  if (!data.edges.every(isValidEdge)) return false
  return true
}

// retorna null se ok, ou string com mensagem de erro
export async function handleImportGraph(file) {
  if (!file) return 'Nenhum arquivo selecionado.'

  if (!file.name.endsWith('.json'))
    return 'Apenas arquivos .json são aceitos.'

  if (file.size > MAX_FILE_SIZE)
    return 'Arquivo muito grande. Limite de 1MB.'

  try {
    const content = await file.text()
    const data = JSON.parse(content)

    if (!validateGraph(data))
      return 'Arquivo inválido. Certifique-se de que é um grafo exportado por esta aplicação.'

    const { nodes, edges } = data
    const maxNodeId = nodes.reduce((max, n) => Math.max(max, n.id), -1)
    const maxEdgeId = edges.reduce((max, e) => Math.max(max, e.id), -1)

    // limpa o canvas antes de importar para não deixar resíduos
    useGraphStore.getState().clearCanvas()

    useGraphStore.setState({
      nodes,
      edges,
      nodeCounter: maxNodeId + 1,
      edgeCounter: maxEdgeId + 1,
      startNode: nodes.length > 0 ? nodes[0].id : null,
      isRunning: false,
      steps: [],
      currentStep: 0,
    })

    return null

  } catch {
    return 'Erro ao ler o arquivo. Verifique se é um JSON válido.'
  }
}