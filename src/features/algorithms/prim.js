// ─── ESTADOS VISUAIS ─────────────────────────────────────────────
export const NODE_STATES = {
  UNVISITED: 'unvisited',    // preto
  PROCESSING: 'processing',  // laranja — sendo avaliado agora
  VISITED: 'visited',        // azul — avaliado mas não escolhido
  IN_TREE: 'inTree',         // verde — confirmado na árvore
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
`Prim(Grafo, nó_inicial)
  árvore = {nó_inicial}
  nó_inicial.estado = na_árvore`,

  evaluateEdge:
`avaliando aresta candidata (u, v)
  comparando com menor encontrada até agora`,

  addToTree:
`aresta_mínima escolhida
  adicionar nó e aresta à árvore`,

  done:
`todos os nós estão na árvore
árvore geradora mínima concluída`,

}

// ─── EXECUÇÃO DO PRIM ─────────────────────────────────────────────
export function run(nodes, edges, startNodeId) {
  const steps = []
  const nodeStates = {}
  const confirmedEdges = []

  nodes.forEach(n => {
    nodeStates[n.id] = NODE_STATES.UNVISITED
  })

  nodeStates[startNodeId] = NODE_STATES.IN_TREE
  const inTree = new Set([startNodeId])

  steps.push({
    nodeStates: { ...nodeStates },
    pseudocode: pseudocode.init,
    current: null,
    currentEdge: null,
    visitedEdges: [],
    confirmedEdges: [],
    rejectedEdges: [],
  })

  while (inTree.size < nodes.length) {

    const candidateEdges = edges.filter(e => {
      const sourceInTree = inTree.has(e.source)
      const targetInTree = inTree.has(e.target)
      return (sourceInTree && !targetInTree) || (!sourceInTree && targetInTree)
    })

    if (candidateEdges.length === 0) break

    const minEdge = candidateEdges.reduce((min, e) =>
      (e.weight ?? 1) < (min.weight ?? 1) ? e : min
    )

    const visitedEdgesThisRound = []

    for (const edge of candidateEdges) {
      const candidateNode = inTree.has(edge.source) ? edge.target : edge.source

      nodeStates[candidateNode] = NODE_STATES.PROCESSING

      steps.push({
        nodeStates: { ...nodeStates },
        pseudocode: pseudocode.evaluateEdge,
        current: null,
        currentEdge: edge.id,
        visitedEdges: [...visitedEdgesThisRound],
        confirmedEdges: [...confirmedEdges],
        rejectedEdges: [],
      })

      if (edge.id !== minEdge.id) {
        nodeStates[candidateNode] = NODE_STATES.VISITED
        visitedEdgesThisRound.push(edge.id)
      }
    }

    const newNode = inTree.has(minEdge.source) ? minEdge.target : minEdge.source
    inTree.add(newNode)
    confirmedEdges.push(minEdge.id)

    candidateEdges.forEach(e => {
      const candidateNode = inTree.has(e.source) ? e.target : e.source
      if (candidateNode !== newNode && nodeStates[candidateNode] === NODE_STATES.VISITED) {
        nodeStates[candidateNode] = NODE_STATES.UNVISITED
      }
    })

    nodeStates[newNode] = NODE_STATES.IN_TREE

    steps.push({
      nodeStates: { ...nodeStates },
      pseudocode: pseudocode.addToTree,
      current: null,
      currentEdge: null,
      visitedEdges: [],
      confirmedEdges: [...confirmedEdges],
      rejectedEdges: [],
    })
  }

  // arestas que não fazem parte da árvore ficam vermelhas
  const rejectedEdges = edges
    .filter(e => !confirmedEdges.includes(e.id))
    .map(e => e.id)

  steps.push({
    nodeStates: { ...nodeStates },
    pseudocode: pseudocode.done,
    current: null,
    currentEdge: null,
    visitedEdges: [],
    confirmedEdges: [...confirmedEdges],
    rejectedEdges: [...rejectedEdges],
  })

  return steps
}