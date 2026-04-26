// ─── ESTADOS VISUAIS ─────────────────────────────────────────────
export const NODE_STATES = {
  UNVISITED: 'unvisited',    // preto
  PROCESSING: 'processing',  // laranja — sendo avaliado
  IN_TREE: 'inTree',         // verde — confirmado na árvore
}

// ─── UNION-FIND ───────────────────────────────────────────────────
function makeUnionFind(nodes) {
  const parent = {}
  const rank = {}
  nodes.forEach(n => { parent[n.id] = n.id; rank[n.id] = 0 })

  function find(id) {
    if (parent[id] !== id) parent[id] = find(parent[id])
    return parent[id]
  }

  function union(a, b) {
    const rootA = find(a)
    const rootB = find(b)
    if (rootA === rootB) return false
    if (rank[rootA] < rank[rootB]) parent[rootA] = rootB
    else if (rank[rootA] > rank[rootB]) parent[rootB] = rootA
    else { parent[rootB] = rootA; rank[rootA]++ }
    return true
  }

  return { find, union }
}

// ─── VALIDAÇÃO ────────────────────────────────────────────────────

export function canRun(nodes, edges, startNode) {
  if (nodes.length < 2) return false
  if (startNode === null) return false
  if (edges.length === 0) return false

  if (edges.some(e => e.directed)) return false

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

  return visited.size === nodes.length
}

// ─── PSEUDOCÓDIGO POR STEP ────────────────────────────────────────
export const pseudocode = {

  init:
`Kruskal(Grafo)
  ordenar todas as arestas por peso crescente
  para cada nó — criar componente individual`,

  evaluateEdge:
`para cada aresta em ordem de peso
  se os dois nós estão em componentes diferentes
    adicionar aresta à árvore
    unir os dois componentes`,

  rejectEdge:
`aresta rejeitada — formaria ciclo
  os dois nós já estão no mesmo componente`,

  done:
`todos os nós conectados
árvore geradora mínima concluída`,

}

// ─── EXECUÇÃO DO KRUSKAL ──────────────────────────────────────────
export function run(nodes, edges, startNodeId) {
  const steps = []
  const nodeStates = {}
  const confirmedEdges = []
  const rejectedEdges = []

  nodes.forEach(n => {
    nodeStates[n.id] = NODE_STATES.UNVISITED
  })

  const sortedEdges = [...edges].sort((a, b) => (a.weight ?? 1) - (b.weight ?? 1))
  const uf = makeUnionFind(nodes)

  steps.push({
    nodeStates: { ...nodeStates },
    pseudocode: pseudocode.init,
    current: null,
    currentEdge: null,
    visitedEdges: [],
    confirmedEdges: [...confirmedEdges],
    rejectedEdges: [...rejectedEdges],
  })

  for (const edge of sortedEdges) {

    nodeStates[edge.source] = NODE_STATES.PROCESSING
    nodeStates[edge.target] = NODE_STATES.PROCESSING

    steps.push({
      nodeStates: { ...nodeStates },
      pseudocode: pseudocode.evaluateEdge,
      current: null,
      currentEdge: edge.id,
      visitedEdges: [edge.id],
      confirmedEdges: [...confirmedEdges],
      rejectedEdges: [...rejectedEdges],
      checking: edge.target,
    })

    const united = uf.union(edge.source, edge.target)

    if (united) {
      confirmedEdges.push(edge.id)
      nodeStates[edge.source] = NODE_STATES.IN_TREE
      nodeStates[edge.target] = NODE_STATES.IN_TREE

      steps.push({
        nodeStates: { ...nodeStates },
        pseudocode: pseudocode.evaluateEdge,
        current: null,
        currentEdge: null,
        visitedEdges: [],
        confirmedEdges: [...confirmedEdges],
        rejectedEdges: [...rejectedEdges],
      })

    } else {
      rejectedEdges.push(edge.id)
      nodeStates[edge.source] = NODE_STATES.IN_TREE
      nodeStates[edge.target] = NODE_STATES.IN_TREE

      steps.push({
        nodeStates: { ...nodeStates },
        pseudocode: pseudocode.rejectEdge,
        current: null,
        currentEdge: null,
        visitedEdges: [],
        confirmedEdges: [...confirmedEdges],
        rejectedEdges: [...rejectedEdges],
      })
    }

    if (confirmedEdges.length === nodes.length - 1) break
  }

  // arestas restantes que não foram avaliadas também ficam vermelhas
  const allRejected = edges
    .filter(e => !confirmedEdges.includes(e.id))
    .map(e => e.id)

  steps.push({
    nodeStates: { ...nodeStates },
    pseudocode: pseudocode.done,
    current: null,
    currentEdge: null,
    visitedEdges: [],
    confirmedEdges: [...confirmedEdges],
    rejectedEdges: [...allRejected],
  })

  return steps
}