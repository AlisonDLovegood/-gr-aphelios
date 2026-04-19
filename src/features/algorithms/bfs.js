// ─── ESTADOS VISUAIS ─────────────────────────────────────────────
export const NODE_STATES = {
  UNVISITED: 'unvisited',
  IN_QUEUE: 'inQueue',
  PROCESSING: 'processing',
  VISITED: 'visited',
}

// ─── VALIDAÇÃO ────────────────────────────────────────────────────

export function canRun(nodes, edges, startNode) {
  if (nodes.length === 0) return false
  if (startNode === null) return false
  if (edges.length === 0) return false

  const hasEdgeFromStart = edges.some(e => e.source === startNode || e.target === startNode)
  if (!hasEdgeFromStart) return false

  return true
}

// ─── PSEUDOCÓDIGO POR STEP ────────────────────────────────────────
export const pseudocode = {

  init:
`BFS(Grafo, nó_inicial)
  para cada nó de Grafo exceto nó_inicial
    nó.estado = não_visitado
    nó.distancia = infinito
    nó.predecessor = nulo
  nó_inicial.estado = em_fila
  nó_inicial.distancia = 0
  nó_inicial.predecessor = nulo
  enfileirar(fila, nó_inicial)`,

  dequeue:
`atual = desenfileirar(fila)`,

  neighbor:
`para cada vizinho de atual
  se vizinho.estado == não_visitado
    vizinho.estado = em_fila
    vizinho.distancia = atual.distancia + 1`,

  finishNode:
`atual.estado = visitado`,

  done:
`fila está vazia
BFS concluído`,

}

// ─── EXECUÇÃO DO BFS ──────────────────────────────────────────────
export function run(nodes, edges, startNodeId) {
  const steps = []

  const nodeStates = {}
  const distance = {}
  const predecessor = {}
  const visitedEdges = []

  nodes.forEach(n => {
    nodeStates[n.id] = NODE_STATES.UNVISITED
    distance[n.id] = Infinity
    predecessor[n.id] = null
  })

  nodeStates[startNodeId] = NODE_STATES.IN_QUEUE
  distance[startNodeId] = 0
  const queue = [startNodeId]

  steps.push({
    nodeStates: { ...nodeStates },
    distance: { ...distance },
    pseudocode: pseudocode.init,
    queue: [...queue],
    current: null,
    currentEdge: null,
    visitedEdges: [...visitedEdges],
  })

  while (queue.length > 0) {

    const current = queue.shift()
    nodeStates[current] = NODE_STATES.PROCESSING

    steps.push({
      nodeStates: { ...nodeStates },
      distance: { ...distance },
      pseudocode: pseudocode.dequeue,
      queue: [...queue],
      current,
      currentEdge: null,
      visitedEdges: [...visitedEdges],
    })

    const neighborEdges = edges.filter(e => {
      if (!e.directed) return e.source === current || e.target === current
      return e.source === current
    })

    for (const edge of neighborEdges) {
      const neighborId = edge.source === current ? edge.target : edge.source

      if (nodeStates[neighborId] === NODE_STATES.UNVISITED) {

        nodeStates[neighborId] = NODE_STATES.IN_QUEUE
        distance[neighborId] = distance[current] + 1
        predecessor[neighborId] = current
        queue.push(neighborId)
        visitedEdges.push(edge.id)

        steps.push({
          nodeStates: { ...nodeStates },
          distance: { ...distance },
          pseudocode: pseudocode.neighbor,
          queue: [...queue],
          current,
          checking: neighborId,
          currentEdge: edge.id,
          visitedEdges: [...visitedEdges],
        })
      }
    }

    nodeStates[current] = NODE_STATES.VISITED
    steps.push({
      nodeStates: { ...nodeStates },
      distance: { ...distance },
      pseudocode: pseudocode.finishNode,
      queue: [...queue],
      current,
      currentEdge: null,
      visitedEdges: [...visitedEdges],
    })
  }

  steps.push({
    nodeStates: { ...nodeStates },
    distance: { ...distance },
    pseudocode: pseudocode.done,
    queue: [],
    current: null,
    currentEdge: null,
    visitedEdges: [...visitedEdges],
  })

  return steps
}