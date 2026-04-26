// ─── ESTADOS VISUAIS ─────────────────────────────────────────────
export const NODE_STATES = {
  UNVISITED: 'unvisited',    // preto
  IN_QUEUE: 'inQueue',       // cinza — vizinho revelado
  PROCESSING: 'processing',  // laranja — sendo percorrido
  VISITED: 'visited',        // azul — já percorrido
  CONFIRMED: 'confirmed',    // verde — confirmado no circuito
  REJECTED: 'rejected',      // vermelho — descartado no backtrack
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
  circuito = [nó_inicial]
  nó_atual = nó_inicial`,

  traverse:
`escolher aresta não visitada de nó_atual
  verificar se aresta é válida no sentido atual
  marcar aresta como visitada
  nó_atual = outro extremo da aresta
  adicionar nó_atual ao circuito`,

  backtrack:
`sem arestas válidas no nó_atual
  retornar ao nó anterior
  tentar outro caminho`,

  done:
`nó_atual == nó_inicial
todas as arestas visitadas
circuito euleriano concluído`,

}

// ─── EXECUÇÃO DO EULERIANO ────────────────────────────────────────
export function run(nodes, edges, startNodeId) {
  const steps = []
  const nodeStates = {}
  nodes.forEach(n => { nodeStates[n.id] = NODE_STATES.UNVISITED })

  const usedEdges = new Set()
  const visitedEdgesList = []
  const rejectedEdgesList = []
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
    rejectedEdges: [],
  })

  let found = false

  function dfs() {
    if (usedEdges.size === edges.length) {
      if (current === startNodeId) {
        found = true
        return true
      }
      return false
    }

    const availableEdges = edges.filter(e =>
      !usedEdges.has(e.id) && (
        (!e.directed && (e.source === current || e.target === current)) ||
        (e.directed && e.source === current)
      )
    )

    // marca vizinhos não visitados como cinza ao revelar o current
    availableEdges.forEach(edge => {
      const next = edge.source === current ? edge.target : edge.source
      if (nodeStates[next] === NODE_STATES.UNVISITED) {
        nodeStates[next] = NODE_STATES.IN_QUEUE
      }
    })

    for (const edge of availableEdges) {
      const next = edge.source === current ? edge.target : edge.source

      usedEdges.add(edge.id)
      visitedEdgesList.push(edge.id)
      nodeStates[current] = NODE_STATES.VISITED
      const prev = current
      current = next

      const rejEdgeIdx = rejectedEdgesList.indexOf(edge.id)
      if (rejEdgeIdx !== -1) rejectedEdgesList.splice(rejEdgeIdx, 1)

      // vizinho laranja ao ser avaliado
      nodeStates[next] = NODE_STATES.PROCESSING
      circuit.push(current)

      steps.push({
        nodeStates: { ...nodeStates },
        pseudocode: pseudocode.traverse,
        current,
        circuit: [...circuit],
        checking: current,
        currentEdge: edge.id,
        visitedEdges: [...visitedEdgesList],
        confirmedEdges: [],
        rejectedEdges: [...rejectedEdgesList],
      })

      if (dfs()) return true

      // backtrack
      current = prev
      circuit.pop()
      usedEdges.delete(edge.id)
      visitedEdgesList.pop()
      rejectedEdgesList.push(edge.id)
      nodeStates[next] = NODE_STATES.REJECTED
      nodeStates[current] = NODE_STATES.PROCESSING

      steps.push({
        nodeStates: { ...nodeStates },
        pseudocode: pseudocode.backtrack,
        current,
        circuit: [...circuit],
        currentEdge: null,
        visitedEdges: [...visitedEdgesList],
        confirmedEdges: [],
        rejectedEdges: [...rejectedEdgesList],
      })
    }

    return false
  }

  dfs()

  nodes.forEach(n => {
    nodeStates[n.id] = NODE_STATES.CONFIRMED
  })

  steps.push({
    nodeStates: { ...nodeStates },
    pseudocode: pseudocode.done,
    current: null,
    circuit: [...circuit],
    currentEdge: null,
    visitedEdges: [],
    confirmedEdges: [...visitedEdgesList],
    rejectedEdges: [],
  })

  return steps
}