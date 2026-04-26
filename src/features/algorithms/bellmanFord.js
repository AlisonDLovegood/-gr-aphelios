export const NODE_STATES = {
  UNVISITED: 'unvisited',   // preto
  IN_QUEUE: 'inQueue',      // cinza — vizinho revelado
  PROCESSING: 'processing', // laranja — sendo avaliado agora
  CONFIRMED: 'confirmed',   // verde — melhor distância confirmada
}

// ─── VALIDAÇÃO ────────────────────────────────────────────────────

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

  for (let i = 0; i < nodes.length - 1; i++)
    expanded.forEach(e => {
      const w = e.weight ?? 1
      if (dist[e.source] !== Infinity && dist[e.source] + w < dist[e.target])
        dist[e.target] = dist[e.source] + w
    })

  for (const e of expanded) {
    const w = e.weight ?? 1
    if (dist[e.source] !== Infinity && dist[e.source] + w < dist[e.target])
      return false
  }

  return true
}

// ─── PSEUDOCÓDIGO ─────────────────────────────────────────────────

export const pseudocode = {
  init:
`BellmanFord(Grafo, nó_inicial)
  para cada nó
    dist[nó] = infinito
  dist[nó_inicial] = 0`,

  source:
`para cada nó u com dist[u] conhecido
  avaliar vizinhos de u`,

  evaluate:
`avaliando aresta (u, v)
  dist[u] + w`,

  relax:
`dist[u] + w < dist[v]
  dist[v] = dist[u] + w`,

  noRelax:
`dist[u] + w >= dist[v]
  não atualiza`,

  done:
`BellmanFord concluído
distâncias mínimas encontradas`,
}

// ─── HELPERS ──────────────────────────────────────────────────────

function mkStep(nodeStates, dist, pseudo, currentEdge, confirmedEdges, rejectedEdges) {
  return {
    nodeStates: { ...nodeStates },
    distance: { ...dist },
    pseudocode: pseudo,
    current: null,
    currentEdge: currentEdge ?? null,
    visitedEdges: [],
    confirmedEdges: [...confirmedEdges],
    rejectedEdges: [...rejectedEdges],
  }
}

function outEdges(edges, sourceId) {
  return edges.filter(e =>
    (!e.directed && (e.source === sourceId || e.target === sourceId)) ||
    (e.directed && e.source === sourceId)
  )
}

function neighborId(edge, sourceId) {
  return edge.source === sourceId ? edge.target : edge.source
}

// ─── EXECUÇÃO ─────────────────────────────────────────────────────

export function run(nodes, edges, startNodeId) {
  const steps = []
  const nodeStates = {}
  const dist = {}
  const predecessor = {}
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

  steps.push(mkStep(nodeStates, dist, pseudocode.init, null, confirmedEdges, []))

  for (let i = 0; i < nodes.length - 1; i++) {
    let anyRelaxed = false

    const sources = nodes.filter(n => dist[n.id] !== Infinity)

    for (const source of sources) {
      // reset cinzas da rodada anterior
      nodes.forEach(n => {
        if (nodeStates[n.id] === NODE_STATES.IN_QUEUE)
          nodeStates[n.id] = NODE_STATES.UNVISITED
      })

      nodeStates[source.id] = NODE_STATES.PROCESSING

      const neighbors = outEdges(edges, source.id)

      // step 1 — source laranja, vizinhos cinzas
      neighbors.forEach(e => {
        const nb = neighborId(e, source.id)
        if (nodeStates[nb] === NODE_STATES.UNVISITED)
          nodeStates[nb] = NODE_STATES.IN_QUEUE
      })

      steps.push(mkStep(nodeStates, dist, pseudocode.source, null, confirmedEdges, []))

      for (const edge of neighbors) {
        const nb = neighborId(edge, source.id)
        const prevNbState = nodeStates[nb]
        const candidate = dist[source.id] + (edge.weight ?? 1)

        // step 2 — source + aresta + vizinho laranjos
        nodeStates[source.id] = NODE_STATES.PROCESSING
        nodeStates[nb] = NODE_STATES.PROCESSING
        steps.push(mkStep(nodeStates, dist, pseudocode.evaluate, edge.id, confirmedEdges, []))

        if (candidate < dist[nb]) {
          dist[nb] = candidate
          predecessor[nb] = source.id
          anyRelaxed = true

          const prevIdx = confirmedEdges.findIndex(eid => {
            const e = edges.find(ed => ed.id === eid)
            return e && (e.target === nb || (!e.directed && e.source === nb))
          })
          if (prevIdx !== -1) confirmedEdges.splice(prevIdx, 1)
          if (!confirmedEdges.includes(edge.id)) confirmedEdges.push(edge.id)

          confirmedNodes.add(nb)
          nodeStates[nb] = NODE_STATES.CONFIRMED
          nodeStates[source.id] = NODE_STATES.CONFIRMED

          // step 3 — relaxou: source + aresta + vizinho verdes
          steps.push(mkStep(nodeStates, dist, pseudocode.relax, null, confirmedEdges, []))

        } else {
          // step 3 — não relaxou: vizinho volta estado anterior, source verde
          nodeStates[nb] = prevNbState
          nodeStates[source.id] = NODE_STATES.CONFIRMED
          steps.push(mkStep(nodeStates, dist, pseudocode.noRelax, null, confirmedEdges, []))
        }
      }

      nodeStates[source.id] = NODE_STATES.CONFIRMED
    }

    if (!anyRelaxed) break
  }

  const rejectedEdges = edges.filter(e => !confirmedEdges.includes(e.id)).map(e => e.id)

  nodes.forEach(n => {
    nodeStates[n.id] = dist[n.id] !== Infinity ? NODE_STATES.CONFIRMED : NODE_STATES.UNVISITED
  })

  steps.push(mkStep(nodeStates, dist, pseudocode.done, null, confirmedEdges, rejectedEdges))

  return steps
}