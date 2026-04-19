// ─── ESTADOS VISUAIS ─────────────────────────────────────────────
export const NODE_STATES = {
  UNVISITED: 'unvisited',
  IN_TREE: 'inTree',       // verde — já na árvore geradora
  PROCESSING: 'processing', // laranja — sendo avaliado
}

// ─── VALIDAÇÃO ────────────────────────────────────────────────────

export function canRun(nodes, edges, startNode) {
  if (nodes.length < 2) return false
  if (startNode === null) return false
  if (edges.length === 0) return false

  // prim exige grafo não direcionado
  if (edges.some(e => e.directed)) return false

  // verifica conectividade via BFS inline
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
`para cada aresta (u, v) onde u está na árvore e v não está
  candidatas.adicionar(aresta com menor peso)`,

  addToTree:
`aresta_mínima = menor aresta candidata
  adicionar nó de destino à árvore
  adicionar aresta à árvore geradora`,

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
    current: startNodeId,
    currentEdge: null,
    visitedEdges: [],
    confirmedEdges: [...confirmedEdges],
  })

  while (inTree.size < nodes.length) {

    // encontra todas as arestas candidatas — uma ponta na árvore, outra fora
    const candidateEdges = edges.filter(e => {
      const sourceInTree = inTree.has(e.source)
      const targetInTree = inTree.has(e.target)
      return (sourceInTree && !targetInTree) || (!sourceInTree && targetInTree)
    })

    if (candidateEdges.length === 0) break

    // step — avaliando arestas candidatas
    steps.push({
      nodeStates: { ...nodeStates },
      pseudocode: pseudocode.evaluateEdge,
      current: null,
      currentEdge: null,
      visitedEdges: candidateEdges.map(e => e.id),
      confirmedEdges: [...confirmedEdges],
    })

    // escolhe a aresta de menor peso — peso nulo assume 1
    const minEdge = candidateEdges.reduce((min, e) => {
      const w = e.weight ?? 1
      return w < (min.weight ?? 1) ? e : min
    })

    const newNode = inTree.has(minEdge.source) ? minEdge.target : minEdge.source
    inTree.add(newNode)
    nodeStates[newNode] = NODE_STATES.PROCESSING
    confirmedEdges.push(minEdge.id)

    // step — adiciona nó e aresta à árvore
    steps.push({
      nodeStates: { ...nodeStates },
      pseudocode: pseudocode.addToTree,
      current: newNode,
      currentEdge: minEdge.id,
      visitedEdges: [],
      confirmedEdges: [...confirmedEdges],
      checking: newNode,
    })

    nodeStates[newNode] = NODE_STATES.IN_TREE
  }

  // confirma todos os nós na árvore
  nodes.forEach(n => {
    if (inTree.has(n.id)) nodeStates[n.id] = NODE_STATES.IN_TREE
  })

  steps.push({
    nodeStates: { ...nodeStates },
    pseudocode: pseudocode.done,
    current: null,
    currentEdge: null,
    visitedEdges: [],
    confirmedEdges: [...confirmedEdges],
  })

  return steps
}