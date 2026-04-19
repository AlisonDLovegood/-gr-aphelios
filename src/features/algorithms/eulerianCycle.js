// ─── ESTADOS VISUAIS ─────────────────────────────────────────────
export const NODE_STATES = {
  UNVISITED: 'unvisited',
  PROCESSING: 'processing',
  VISITED: 'visited',
  CONFIRMED: 'confirmed',
}

// ─── VALIDAÇÃO ────────────────────────────────────────────────────

export function canRun(nodes, edges, startNode) {
  if (nodes.length < 2) return false
  if (edges.length === 0) return false
  if (startNode === null) return false

  const degree = {}
  nodes.forEach(n => { degree[n.id] = 0 })
  edges.forEach(e => {
    degree[e.source]++
    degree[e.target]++
  })
  if (!nodes.every(n => degree[n.id] % 2 === 0)) return false

  const visited = new Set([startNode])
  const queue = [startNode]
  while (queue.length > 0) {
    const current = queue.shift()
    edges
      .filter(e => e.source === current || e.target === current)
      .map(e => e.source === current ? e.target : e.source)
      .filter(id => !visited.has(id))
      .forEach(id => { visited.add(id); queue.push(id) })
  }
  if (visited.size !== nodes.length) return false

  return true
}

// ─── PSEUDOCÓDIGO POR STEP ────────────────────────────────────────
export const pseudocode = {

  init:
`Euleriano(Grafo, nó_inicial)
  circuito = []
  nó_atual = nó_inicial`,

  traverse:
`enquanto nó_atual tem arestas não visitadas
  escolher aresta não visitada de nó_atual
  marcar aresta como visitada
  nó_atual = outro extremo da aresta
  adicionar nó_atual ao circuito`,

  done:
`nó_atual == nó_inicial
circuito euleriano concluído`,

}

// ─── EXECUÇÃO DO EULERIANO ────────────────────────────────────────
export function run(nodes, edges, startNodeId) {
  const steps = []
  const nodeStates = {}
  nodes.forEach(n => { nodeStates[n.id] = NODE_STATES.UNVISITED })

  const usedEdges = new Set()
  const visitedEdges = []
  const circuit = [startNodeId]
  let current = startNodeId
  nodeStates[current] = NODE_STATES.PROCESSING

  steps.push({
    nodeStates: { ...nodeStates },
    pseudocode: pseudocode.init,
    current,
    circuit: [...circuit],
    currentEdge: null,
    visitedEdges: [],
    confirmedEdges: [],
  })

  while (true) {
    const unusedEdge = edges.find(e =>
      !usedEdges.has(e.id) && (
        (!e.directed && (e.source === current || e.target === current)) ||
        (e.directed && e.source === current)
      )
    )

    if (!unusedEdge) break

    usedEdges.add(unusedEdge.id)
    visitedEdges.push(unusedEdge.id)
    const next = unusedEdge.source === current ? unusedEdge.target : unusedEdge.source
    nodeStates[current] = NODE_STATES.VISITED
    nodeStates[next] = NODE_STATES.PROCESSING
    current = next
    circuit.push(current)

    steps.push({
      nodeStates: { ...nodeStates },
      pseudocode: pseudocode.traverse,
      current,
      circuit: [...circuit],
      checking: current,
      currentEdge: unusedEdge.id,
      visitedEdges: [...visitedEdges],
      confirmedEdges: [],
    })
  }

  // confirma todos os nós e arestas do circuito
  circuit.forEach(nodeId => {
    nodeStates[nodeId] = NODE_STATES.CONFIRMED
  })

  steps.push({
    nodeStates: { ...nodeStates },
    pseudocode: pseudocode.done,
    current: null,
    circuit: [...circuit],
    currentEdge: null,
    visitedEdges: [],
    confirmedEdges: [...visitedEdges],
  })

  return steps
}