export const NODE_STATES = {
  UNVISITED: 'unvisited',
  PROCESSING: 'processing',
  VISITED: 'visited',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
}

export function canRun(nodes, edges, startNode) {
  if (nodes.length < 2) return false
  if (startNode === null) return false
  if (edges.length === 0) return false

  // dijkstra não suporta pesos negativos
  if (edges.some(e => (e.weight ?? 1) < 0)) return false

  // precisa ter ao menos uma aresta saindo do nó inicial
  const hasEdgeFromStart = edges.some(e =>
    e.source === startNode || (!e.directed && e.target === startNode)
  )
  if (!hasEdgeFromStart) return false

  return true
}

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

  relax:
`para cada vizinho v de atual
  se dist[atual] + w < dist[v]
    dist[v] = dist[atual] + w
    predecessor[v] = atual`,

  noRelax:
`dist[atual] + w >= dist[v]
  não atualiza`,

  done:
`todos os nós processados
Dijkstra concluído`,
}

export function run(nodes, edges, startNodeId) {
  const steps = []
  const nodeStates = {}
  const dist = {}
  const predecessor = {}
  const visitedNodes = new Set()

  nodes.forEach(n => {
    nodeStates[n.id] = NODE_STATES.UNVISITED
    dist[n.id] = Infinity
    predecessor[n.id] = null
  })

  dist[startNodeId] = 0

  steps.push({
    nodeStates: { ...nodeStates },
    distance: { ...dist },
    pseudocode: pseudocode.init,
    current: null,
    currentEdge: null,
    visitedEdges: [],
    confirmedEdges: [],
    rejectedEdges: [],
  })

  while (visitedNodes.size < nodes.length) {

    // pega o nó não visitado com menor distância
    const unvisited = nodes.filter(n => !visitedNodes.has(n.id) && dist[n.id] !== Infinity)
    if (unvisited.length === 0) break
    const current = unvisited.reduce((min, n) => dist[n.id] < dist[min.id] ? n : min)

    visitedNodes.add(current.id)
    nodeStates[current.id] = NODE_STATES.PROCESSING

    steps.push({
      nodeStates: { ...nodeStates },
      distance: { ...dist },
      pseudocode: pseudocode.pick,
      current: current.id,
      currentEdge: null,
      visitedEdges: [],
      confirmedEdges: [],
      rejectedEdges: [],
    })

    const neighborEdges = edges.filter(e => {
      if (!e.directed) return e.source === current.id || e.target === current.id
      return e.source === current.id
    })

    for (const edge of neighborEdges) {
      const neighborId = edge.source === current.id ? edge.target : edge.source
      if (visitedNodes.has(neighborId)) continue

      const w = edge.weight ?? 1
      const candidate = dist[current.id] + w

      if (candidate < dist[neighborId]) {
        dist[neighborId] = candidate
        predecessor[neighborId] = current.id

        nodeStates[neighborId] = NODE_STATES.PROCESSING

        steps.push({
          nodeStates: { ...nodeStates },
          distance: { ...dist },
          pseudocode: pseudocode.relax,
          current: current.id,
          currentEdge: edge.id,
          visitedEdges: [],
          confirmedEdges: [],
          rejectedEdges: [],
          checking: neighborId,
        })

        nodeStates[neighborId] = NODE_STATES.VISITED

      } else {
        steps.push({
          nodeStates: { ...nodeStates },
          distance: { ...dist },
          pseudocode: pseudocode.noRelax,
          current: current.id,
          currentEdge: edge.id,
          visitedEdges: [],
          confirmedEdges: [],
          rejectedEdges: [],
        })
      }
    }

    nodeStates[current.id] = NODE_STATES.VISITED
  }

  // constrói árvore mínima via predecessor
  const confirmedEdges = []
  nodes.forEach(n => {
    if (predecessor[n.id] !== null) {
      const e = edges.find(ed =>
        (!ed.directed && (
          (ed.source === predecessor[n.id] && ed.target === n.id) ||
          (ed.source === n.id && ed.target === predecessor[n.id])
        )) ||
        (ed.directed && ed.source === predecessor[n.id] && ed.target === n.id)
      )
      if (e && !confirmedEdges.includes(e.id)) confirmedEdges.push(e.id)
    }
  })

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