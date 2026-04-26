export const NODE_STATES = {
  UNVISITED: 'unvisited',   // preto
  IN_QUEUE: 'inQueue',      // cinza — candidato
  PROCESSING: 'processing', // laranja — sendo avaliado agora
  VISITED: 'visited',       // azul — já processado
  CONFIRMED: 'confirmed',   // verde — melhor caminho confirmado
  REJECTED: 'rejected',     // vermelho — não faz parte do caminho
}

// ─── VALIDAÇÃO ────────────────────────────────────────────────────

export function canRun(nodes, edges, startNode) {
  if (nodes.length < 2) return false
  if (startNode === null) return false
  if (edges.length === 0) return false

  if (edges.some(e => (e.weight ?? 1) < 0)) return false

  const hasEdgeFromStart = edges.some(e =>
    e.source === startNode || (!e.directed && e.target === startNode)
  )
  if (!hasEdgeFromStart) return false

  return true
}

// ─── PSEUDOCÓDIGO ─────────────────────────────────────────────────

export const pseudocode = {
  init:
`Dijkstra(Grafo, nó_inicial)
  para cada nó
    dist[nó] = infinito
  dist[nó_inicial] = 0
  fila = todos os nós`,

  pick:
`atual = nó não visitado com menor dist
  marcar atual como visitado`,

  evaluate:
`avaliando aresta (atual, v)
  dist[atual] + w`,

  relax:
`dist[atual] + w < dist[v]
  dist[v] = dist[atual] + w
  predecessor[v] = atual`,

  noRelax:
`dist[atual] + w >= dist[v]
  não atualiza`,

  done:
`todos os nós processados
Dijkstra concluído`,
}

// ─── EXECUÇÃO ─────────────────────────────────────────────────────

export function run(nodes, edges, startNodeId) {
  const steps = []
  const nodeStates = {}
  const dist = {}
  const predecessor = {}
  const visitedNodes = new Set()
  const confirmedEdges = []
  const confirmedNodes = new Set()

  nodes.forEach(n => {
    nodeStates[n.id] = NODE_STATES.UNVISITED
    dist[n.id] = Infinity
    predecessor[n.id] = null
  })

  dist[startNodeId] = 0
  nodeStates[startNodeId] = NODE_STATES.CONFIRMED
  confirmedNodes.add(startNodeId)

  steps.push({
    nodeStates: { ...nodeStates },
    distance: { ...dist },
    pseudocode: pseudocode.init,
    current: null,
    currentEdge: null,
    visitedEdges: [],
    confirmedEdges: [...confirmedEdges],
    rejectedEdges: [],
  })

  while (visitedNodes.size < nodes.length) {

    const unvisited = nodes.filter(n => !visitedNodes.has(n.id) && dist[n.id] !== Infinity)
    if (unvisited.length === 0) break
    const current = unvisited.reduce((min, n) => dist[n.id] < dist[min.id] ? n : min)

    visitedNodes.add(current.id)
    nodeStates[current.id] = NODE_STATES.PROCESSING

    const neighborEdges = edges.filter(e => {
      if (!e.directed) return e.source === current.id || e.target === current.id
      return e.source === current.id
    })

    // step 1 — current laranja, vizinhos cinzas
    neighborEdges.forEach(edge => {
      const nb = edge.source === current.id ? edge.target : edge.source
      if (!visitedNodes.has(nb) && nodeStates[nb] === NODE_STATES.UNVISITED)
        nodeStates[nb] = NODE_STATES.IN_QUEUE
    })

    steps.push({
      nodeStates: { ...nodeStates },
      distance: { ...dist },
      pseudocode: pseudocode.pick,
      current: null,
      currentEdge: null,
      visitedEdges: [],
      confirmedEdges: [...confirmedEdges],
      rejectedEdges: [],
    })

    for (const edge of neighborEdges) {
      const nb = edge.source === current.id ? edge.target : edge.source
      if (visitedNodes.has(nb)) continue

      const prevNbState = nodeStates[nb]
      const candidate = dist[current.id] + (edge.weight ?? 1)

      // step 2 — current + aresta + vizinho laranjos
      nodeStates[current.id] = NODE_STATES.PROCESSING
      nodeStates[nb] = NODE_STATES.PROCESSING

      steps.push({
        nodeStates: { ...nodeStates },
        distance: { ...dist },
        pseudocode: pseudocode.evaluate,
        current: null,
        currentEdge: edge.id,
        visitedEdges: [],
        confirmedEdges: [...confirmedEdges],
        rejectedEdges: [],
      })

      if (candidate < dist[nb]) {
        dist[nb] = candidate
        predecessor[nb] = current.id

        const prevIdx = confirmedEdges.findIndex(eid => {
          const e = edges.find(ed => ed.id === eid)
          return e && (e.target === nb || (!e.directed && e.source === nb))
        })
        if (prevIdx !== -1) confirmedEdges.splice(prevIdx, 1)
        if (!confirmedEdges.includes(edge.id)) confirmedEdges.push(edge.id)

        confirmedNodes.add(nb)
        nodeStates[nb] = NODE_STATES.CONFIRMED
        nodeStates[current.id] = NODE_STATES.PROCESSING

        // step 3 relax — vizinho + aresta verdes, current continua laranja
        steps.push({
          nodeStates: { ...nodeStates },
          distance: { ...dist },
          pseudocode: pseudocode.relax,
          current: null,
          currentEdge: null,
          visitedEdges: [],
          confirmedEdges: [...confirmedEdges],
          rejectedEdges: [],
        })

      } else {
        // step 3 noRelax — vizinho volta estado anterior, current continua laranja
        nodeStates[nb] = prevNbState
        nodeStates[current.id] = NODE_STATES.PROCESSING

        steps.push({
          nodeStates: { ...nodeStates },
          distance: { ...dist },
          pseudocode: pseudocode.noRelax,
          current: null,
          currentEdge: null,
          visitedEdges: [],
          confirmedEdges: [...confirmedEdges],
          rejectedEdges: [],
        })
      }
    }

    // current azul ao finalizar todos os vizinhos
    nodeStates[current.id] = NODE_STATES.VISITED

    steps.push({
      nodeStates: { ...nodeStates },
      distance: { ...dist },
      pseudocode: pseudocode.pick,
      current: null,
      currentEdge: null,
      visitedEdges: [],
      confirmedEdges: [...confirmedEdges],
      rejectedEdges: [],
    })
  }

  const rejectedEdges = edges
    .filter(e => !confirmedEdges.includes(e.id))
    .map(e => e.id)

  nodes.forEach(n => {
    nodeStates[n.id] = dist[n.id] !== Infinity
      ? NODE_STATES.CONFIRMED
      : NODE_STATES.UNVISITED
  })

  steps.push({
    nodeStates: { ...nodeStates },
    distance: { ...dist },
    pseudocode: pseudocode.done,
    current: null,
    currentEdge: null,
    visitedEdges: [],
    confirmedEdges: [...confirmedEdges],
    rejectedEdges: [...rejectedEdges],
  })

  return steps
}