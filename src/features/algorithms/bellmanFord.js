// ─── ESTADOS VISUAIS ─────────────────────────────────────────────
export const NODE_STATES = {
  UNVISITED: 'unvisited',   // preto
  PROCESSING: 'processing', // laranja — sendo processado agora
  VISITED: 'visited',       // azul — já visitado/processado
  CONFIRMED: 'confirmed',   // verde — confirmado no resultado final
  REJECTED: 'rejected',     // vermelho — descartado/rejeitado
}

// ─── VALIDAÇÃO ────────────────────────────────────────────────────

export function canRun(nodes, edges, startNode) {
  if (nodes.length < 2) return false
  if (startNode === null) return false
  if (edges.length === 0) return false

  const dist = {}
  nodes.forEach(n => { dist[n.id] = Infinity })
  dist[startNode] = 0

  for (let i = 0; i < nodes.length - 1; i++) {
    edges.forEach(e => {
      const w = e.weight ?? 1
      if (dist[e.source] !== Infinity && dist[e.source] + w < dist[e.target])
        dist[e.target] = dist[e.source] + w
      if (!e.directed && dist[e.target] !== Infinity && dist[e.target] + w < dist[e.source])
        dist[e.source] = dist[e.target] + w
    })
  }

  for (const e of edges) {
    const w = e.weight ?? 1
    if (dist[e.source] !== Infinity && dist[e.source] + w < dist[e.target]) return false
    if (!e.directed && dist[e.target] !== Infinity && dist[e.target] + w < dist[e.source]) return false
  }

  return true
}

// ─── PSEUDOCÓDIGO POR STEP ────────────────────────────────────────
export const pseudocode = {

  init:
`BellmanFord(Grafo, nó_inicial)
  para cada nó de Grafo
    nó.distancia = infinito
    nó.predecessor = nulo
  nó_inicial.distancia = 0`,

  relax:
`para cada aresta (u, v) com peso w
  se u.distancia + w < v.distancia
    v.distancia = u.distancia + w
    v.predecessor = u`,

  noRelax:
`aresta não relaxada
  u.distancia + w >= v.distancia`,

  done:
`todas as iterações concluídas
BellmanFord concluído`,

}

// ─── EXECUÇÃO DO BELLMAN-FORD ─────────────────────────────────────
export function run(nodes, edges, startNodeId) {
  const steps = []
  const nodeStates = {}
  const distance = {}
  const predecessor = {}
  const confirmedEdges = []
  const visitedEdges = []
  const rejectedEdges = []

  nodes.forEach(n => {
    nodeStates[n.id] = NODE_STATES.UNVISITED
    distance[n.id] = Infinity
    predecessor[n.id] = null
  })

  distance[startNodeId] = 0
  nodeStates[startNodeId] = NODE_STATES.PROCESSING

  steps.push({
    nodeStates: { ...nodeStates },
    distance: { ...distance },
    pseudocode: pseudocode.init,
    current: startNodeId,
    currentEdge: null,
    visitedEdges: [...visitedEdges],
    confirmedEdges: [...confirmedEdges],
    rejectedEdges: [...rejectedEdges],
  })

  for (let i = 0; i < nodes.length - 1; i++) {
    let anyRelaxed = false

    for (const edge of edges) {
      const w = edge.weight ?? 1

      if (distance[edge.source] === Infinity) continue

      nodeStates[edge.source] = NODE_STATES.PROCESSING
      nodeStates[edge.target] = NODE_STATES.PROCESSING

      // tenta relaxar source → target
      if (distance[edge.source] + w < distance[edge.target]) {
        distance[edge.target] = distance[edge.source] + w
        predecessor[edge.target] = edge.source
        anyRelaxed = true

        if (!visitedEdges.includes(edge.id)) visitedEdges.push(edge.id)
        if (!confirmedEdges.includes(edge.id)) confirmedEdges.push(edge.id)

        nodeStates[edge.source] = NODE_STATES.VISITED
        nodeStates[edge.target] = NODE_STATES.VISITED

        steps.push({
          nodeStates: { ...nodeStates },
          distance: { ...distance },
          pseudocode: pseudocode.relax,
          current: edge.target,
          currentEdge: edge.id,
          visitedEdges: [...visitedEdges],
          confirmedEdges: [...confirmedEdges],
          rejectedEdges: [...rejectedEdges],
          checking: edge.target,
        })

      } else {
        // aresta não relaxada — nó target descartado
        nodeStates[edge.source] = NODE_STATES.VISITED
        if (!rejectedEdges.includes(edge.id)) rejectedEdges.push(edge.id)

        steps.push({
          nodeStates: { ...nodeStates },
          distance: { ...distance },
          pseudocode: pseudocode.noRelax,
          current: null,
          currentEdge: edge.id,
          visitedEdges: [...visitedEdges],
          confirmedEdges: [...confirmedEdges],
          rejectedEdges: [...rejectedEdges],
        })
      }

      // tenta relaxar target → source se não direcionada
      if (!edge.directed && distance[edge.target] !== Infinity && distance[edge.target] + w < distance[edge.source]) {
        distance[edge.source] = distance[edge.target] + w
        predecessor[edge.source] = edge.target
        anyRelaxed = true

        nodeStates[edge.source] = NODE_STATES.VISITED
        nodeStates[edge.target] = NODE_STATES.VISITED

        steps.push({
          nodeStates: { ...nodeStates },
          distance: { ...distance },
          pseudocode: pseudocode.relax,
          current: edge.source,
          currentEdge: edge.id,
          visitedEdges: [...visitedEdges],
          confirmedEdges: [...confirmedEdges],
          rejectedEdges: [...rejectedEdges],
          checking: edge.source,
        })
      }
    }

    if (!anyRelaxed) break
  }

  nodes.forEach(n => {
    if (distance[n.id] !== Infinity) nodeStates[n.id] = NODE_STATES.CONFIRMED
  })

  steps.push({
    nodeStates: { ...nodeStates },
    distance: { ...distance },
    pseudocode: pseudocode.done,
    current: null,
    currentEdge: null,
    visitedEdges: [...visitedEdges],
    confirmedEdges: [...confirmedEdges],
    rejectedEdges: [...rejectedEdges],
  })

  return steps
}