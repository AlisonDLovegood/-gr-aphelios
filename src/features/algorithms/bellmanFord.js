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

  const dist = {}
  nodes.forEach(n => { dist[n.id] = Infinity })
  dist[startNode] = 0

  const expanded = []
  edges.forEach(e => {
    expanded.push(e)
    if (!e.directed && e.source !== startNode)
      expanded.push({ ...e, source: e.target, target: e.source })
  })

  for (let i = 0; i < nodes.length - 1; i++) {
    expanded.forEach(e => {
      const w = e.weight ?? 1
      if (dist[e.source] !== Infinity && dist[e.source] + w < dist[e.target])
        dist[e.target] = dist[e.source] + w
    })
  }

  for (const e of expanded) {
    const w = e.weight ?? 1
    if (dist[e.source] !== Infinity && dist[e.source] + w < dist[e.target])
      return false
  }

  return true
}

export const pseudocode = {
  init:
`BellmanFord(Grafo, nó_inicial)
  para cada nó
    dist[nó] = infinito
  dist[nó_inicial] = 0`,

  relax:
`se dist[u] + w < dist[v]
  dist[v] = dist[u] + w
  predecessor[v] = u`,

  noRelax:
`dist[u] + w >= dist[v]
  não atualiza`,

  done:
`BellmanFord concluído
distâncias mínimas encontradas`,
}

export function run(nodes, edges, startNodeId) {
  const steps = []
  const nodeStates = {}
  const dist = {}
  const predecessor = {}

  nodes.forEach(n => {
    nodeStates[n.id] = NODE_STATES.UNVISITED
    dist[n.id] = Infinity
    predecessor[n.id] = null
  })

  dist[startNodeId] = 0

  const expandedEdges = []
  edges.forEach(e => {
    expandedEdges.push(e)
    if (!e.directed && e.source !== startNodeId)
      expandedEdges.push({ ...e, source: e.target, target: e.source })
  })

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

  for (let i = 0; i < nodes.length - 1; i++) {
    let anyRelaxed = false

    for (const edge of expandedEdges) {
      const w = edge.weight ?? 1

      if (dist[edge.source] === Infinity) continue

      const candidate = dist[edge.source] + w

      if (candidate < dist[edge.target]) {
        dist[edge.target] = candidate
        predecessor[edge.target] = edge.source
        anyRelaxed = true

        nodeStates[edge.source] = NODE_STATES.PROCESSING
        nodeStates[edge.target] = NODE_STATES.PROCESSING

        steps.push({
          nodeStates: { ...nodeStates },
          distance: { ...dist },
          pseudocode: pseudocode.relax,
          current: edge.target,
          currentEdge: edge.id,
          visitedEdges: [],
          confirmedEdges: [],
          rejectedEdges: [],
          checking: edge.target,
        })

        nodeStates[edge.source] = NODE_STATES.VISITED
        nodeStates[edge.target] = NODE_STATES.VISITED

      } else {
        steps.push({
          nodeStates: { ...nodeStates },
          distance: { ...dist },
          pseudocode: pseudocode.noRelax,
          current: null,
          currentEdge: edge.id,
          visitedEdges: [],
          confirmedEdges: [],
          rejectedEdges: [],
        })
      }
    }

    if (!anyRelaxed) break
  }

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