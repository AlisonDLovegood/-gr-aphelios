// ─── ESTADOS VISUAIS ─────────────────────────────────────────────
export const NODE_STATES = {
  UNVISITED: 'unvisited',
  IN_PATH: 'inPath',
  CONFIRMED: 'confirmed',
  BACKTRACK: 'backtrack',
}

// ─── VALIDAÇÃO ────────────────────────────────────────────────────

export function canRun(nodes, edges, startNode) {
  if (nodes.length < 3) return false
  if (startNode === null) return false

  const visited = new Set([startNode])
  const path = [startNode]

  function backtrack() {
    if (path.length === nodes.length) {
      const last = path[path.length - 1]
      return edges.some(e =>
        (!e.directed && ((e.source === last && e.target === startNode) || (e.source === startNode && e.target === last))) ||
        (e.directed && e.source === last && e.target === startNode)
      )
    }

    const neighbors = edges
      .filter(e => {
        if (!e.directed) return e.source === path[path.length - 1] || e.target === path[path.length - 1]
        return e.source === path[path.length - 1]
      })
      .map(e => e.source === path[path.length - 1] ? e.target : e.source)
      .filter(id => !visited.has(id))

    for (const neighborId of neighbors) {
      visited.add(neighborId)
      path.push(neighborId)
      if (backtrack()) return true
      path.pop()
      visited.delete(neighborId)
    }

    return false
  }

  return backtrack()
}

// ─── PSEUDOCÓDIGO POR STEP ────────────────────────────────────────
export const pseudocode = {

  init:
    `Hamiltoniano(Grafo, nó_inicial)
  caminho = [nó_inicial]
  nó_inicial.estado = no_caminho`,

  tryNeighbor:
    `para cada vizinho não visitado do nó atual
  adicionar vizinho ao caminho
  vizinho.estado = no_caminho`,

  checkCycle:
    `se todos os nós estão no caminho
  verificar se existe aresta de volta ao nó_inicial
  se sim — ciclo hamiltoniano encontrado`,

  backtrack:
    `sem vizinhos válidos
  remover nó atual do caminho
  nó.estado = não_visitado`,

  found:
    `ciclo hamiltoniano encontrado
  todos os nós confirmados no ciclo`,

  notFound:
    `nenhum ciclo hamiltoniano existe
  Hamiltoniano concluído`,

}

// ─── EXECUÇÃO DO HAMILTONIANO ─────────────────────────────────────
export function run(nodes, edges, startNodeId) {
  const steps = []
  const nodeStates = {}
  const visitedEdges = []
  const confirmedEdges = []

  nodes.forEach(n => {
    nodeStates[n.id] = NODE_STATES.UNVISITED
  })

  nodeStates[startNodeId] = NODE_STATES.IN_PATH
  const path = [startNodeId]
  const visited = new Set([startNodeId])

  steps.push({
    nodeStates: { ...nodeStates },
    pseudocode: pseudocode.init,
    current: startNodeId,
    path: [...path],
    currentEdge: null,
    visitedEdges: [...visitedEdges],
    confirmedEdges: [...confirmedEdges],
  })

  let found = false

  function backtrack() {
    if (path.length === nodes.length) {
      const last = path[path.length - 1]
      const cycleEdge = edges.find(e =>
        (!e.directed && ((e.source === last && e.target === startNodeId) || (e.source === startNodeId && e.target === last))) ||
        (e.directed && e.source === last && e.target === startNodeId)
      )

      steps.push({
        nodeStates: { ...nodeStates },
        pseudocode: pseudocode.checkCycle,
        current: last,
        path: [...path],
        currentEdge: cycleEdge?.id ?? null,
        visitedEdges: [...visitedEdges],
        confirmedEdges: [...confirmedEdges],
      })

      if (cycleEdge) {
        nodes.forEach(n => { nodeStates[n.id] = NODE_STATES.CONFIRMED })

        // reconstrói as arestas do caminho final usando o path
        const pathEdges = []
        for (let i = 0; i < path.length - 1; i++) {
          const from = path[i]
          const to = path[i + 1]
          const e = edges.find(ed =>
            (!ed.directed && ((ed.source === from && ed.target === to) || (ed.source === to && ed.target === from))) ||
            (ed.directed && ed.source === from && ed.target === to)
          )
          if (e) pathEdges.push(e.id)
        }
        pathEdges.push(cycleEdge.id)

        steps.push({
          nodeStates: { ...nodeStates },
          pseudocode: pseudocode.found,
          current: null,
          path: [...path],
          currentEdge: null,
          visitedEdges: [],
          confirmedEdges: pathEdges,
        })
        found = true
        return true
      }

      return false
    }

    const current = path[path.length - 1]
    const neighborEdges = edges.filter(e => {
      if (!e.directed) return e.source === current || e.target === current
      return e.source === current
    })

    for (const edge of neighborEdges) {
      const neighborId = edge.source === current ? edge.target : edge.source
      if (visited.has(neighborId)) continue

      visited.add(neighborId)
      path.push(neighborId)
      nodeStates[neighborId] = NODE_STATES.IN_PATH
      visitedEdges.push(edge.id)

      steps.push({
        nodeStates: { ...nodeStates },
        pseudocode: pseudocode.tryNeighbor,
        current: neighborId,
        path: [...path],
        checking: neighborId,
        currentEdge: edge.id,
        visitedEdges: [...visitedEdges],
        confirmedEdges: [...confirmedEdges],
      })

      if (backtrack()) return true

      path.pop()
      visited.delete(neighborId)
      nodeStates[neighborId] = NODE_STATES.UNVISITED
      visitedEdges.pop()

      steps.push({
        nodeStates: { ...nodeStates },
        pseudocode: pseudocode.backtrack,
        current: path[path.length - 1],
        path: [...path],
        currentEdge: null,
        visitedEdges: [...visitedEdges],
        confirmedEdges: [...confirmedEdges],
      })
    }

    return false
  }

  backtrack()

  if (!found) {
    steps.push({
      nodeStates: { ...nodeStates },
      pseudocode: pseudocode.notFound,
      current: null,
      path: [...path],
      currentEdge: null,
      visitedEdges: [...visitedEdges],
      confirmedEdges: [...confirmedEdges],
    })
  }

  return steps
}