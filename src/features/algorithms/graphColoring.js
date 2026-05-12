export const COLORS = [
  '#fbff00',
  '#00ccff',
  '#00ff6a',
  '#b700ff',
  '#ff9d00',
  '#ff0000',
  '#ff00f2',
  '#0011ff',
]

export function canRun(nodes, edges) {
  if (nodes.length === 0) return false
  if (edges.length === 0) return false
  return true
}

export const pseudocode = {

  init:
    `Coloração(Grafo)
  para cada nó de Grafo
    nó.cor = indefinida`,

  evaluateNode:
    `nó_atual = próximo nó não colorido
  cores_usadas = {}
  para cada vizinho de nó_atual
    se vizinho.cor != indefinida
      cores_usadas.adicionar(vizinho.cor)`,

  colorNode:
    `cor = primeira cor não presente em cores_usadas
  nó_atual.cor = cor`,

  done:
    `todos os nós coloridos
Coloração concluída`,

}

export function run(nodes, edges) {
  const steps = []
  const nodeStates = {}

  nodes.forEach(n => {
    nodeStates[n.id] = 'unvisited'
  })

  steps.push({
    nodeStates: { ...nodeStates },
    pseudocode: pseudocode.init,
    current: null,
    currentEdge: null,
    currentEdges: [],
    currentNodes: [],
    visitedEdges: [],
    confirmedEdges: [],
    rejectedEdges: [],
  })

  for (const node of nodes) {

    const neighborEdges = edges.filter(e =>
      e.source === node.id || e.target === node.id
    )

    const neighborIds = neighborEdges.map(e =>
      e.source === node.id ? e.target : e.source
    )

    const usedColors = new Set(
      neighborIds
        .map(id => nodeStates[id])
        .filter(color => color !== 'unvisited' && color !== null)
    )

    // step 1 — k com label K, vizinhos com borda laranja, arestas laranjas
    steps.push({
      nodeStates: { ...nodeStates },
      pseudocode: pseudocode.evaluateNode,
      current: node.id,               // mostra label K no nó atual
      currentEdge: null,
      currentEdges: neighborEdges.map(e => e.id), // arestas laranjas
      currentNodes: [...neighborIds], // borda laranja nos vizinhos
      visitedEdges: [],
      confirmedEdges: [],
      rejectedEdges: [],
    })

    // escolhe a cor
    let colorIndex = 0
    while (usedColors.has(COLORS[colorIndex])) colorIndex++
    nodeStates[node.id] = COLORS[colorIndex]

    // step 2 — k recebe a cor, vizinhos mantêm borda
    steps.push({
      nodeStates: { ...nodeStates },
      pseudocode: pseudocode.colorNode,
      current: node.id,
      currentEdge: null,
      currentEdges: neighborEdges.map(e => e.id),
      currentNodes: [...neighborIds],
      visitedEdges: [],
      confirmedEdges: [],
      rejectedEdges: [],
    })
  }

  steps.push({
    nodeStates: { ...nodeStates },
    pseudocode: pseudocode.done,
    current: null,
    currentEdge: null,
    currentEdges: [],
    currentNodes: [],
    visitedEdges: [],
    confirmedEdges: [],
    rejectedEdges: [],
  })

  return steps
}