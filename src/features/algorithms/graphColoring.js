// ─── CORES DE COLORAÇÃO ───────────────────────────────────────────
export const COLORS = [
  '#a71100',
  '#005c99',
  '#009b40',
  '#5e0083',
  '#c57a00',
  '#008066',
  '#ff6196',
  '#88d7ff',
]

// ─── VALIDAÇÃO ────────────────────────────────────────────────────

export function canRun(nodes, edges) {
  if (nodes.length === 0) return false
  if (edges.length === 0) return false
  return true
}

// ─── PSEUDOCÓDIGO POR STEP ────────────────────────────────────────
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

// ─── EXECUÇÃO DA COLORAÇÃO ────────────────────────────────────────
export function run(nodes, edges) {
  const steps = []

  const nodeStates = {}

  nodes.forEach(n => {
    nodeStates[n.id] = 'unvisited'
  })

  // step 1 — inicialização
  steps.push({
    nodeStates: { ...nodeStates },
    pseudocode: pseudocode.init,
    current: null,
  })

  for (const node of nodes) {

    // pega as cores já usadas pelos vizinhos
    const neighbors = edges
      .filter(e => {
        if (!e.directed) return e.source === node.id || e.target === node.id
        return e.source === node.id
      })
      .map(e => e.source === node.id ? e.target : e.source)

    const usedColors = new Set(
      neighbors
        .map(neighborId => nodeStates[neighborId])
        .filter(color => color !== 'unvisited' && color !== null)
    )

    // step — avaliando vizinhos do nó atual
    steps.push({
      nodeStates: { ...nodeStates },
      pseudocode: pseudocode.evaluateNode,
      current: node.id,
    })

    // atribui a menor cor disponível não usada pelos vizinhos
    let colorIndex = 0
    while (usedColors.has(COLORS[colorIndex])) colorIndex++
    nodeStates[node.id] = COLORS[colorIndex]

    // step — nó colorido
    steps.push({
      nodeStates: { ...nodeStates },
      pseudocode: pseudocode.colorNode,
      current: node.id,
    })
  }

  // step final
  steps.push({
    nodeStates: { ...nodeStates },
    pseudocode: pseudocode.done,
    current: null,
  })

  return steps
}