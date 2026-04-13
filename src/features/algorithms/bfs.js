// ─── ESTADOS VISUAIS ─────────────────────────────────────────────
export const NODE_STATES = {
  UNVISITED: 'unvisited',
  IN_QUEUE: 'inQueue',
  PROCESSING: 'processing',
  VISITED: 'visited',
}

// ─── VALIDAÇÃO ────────────────────────────────────────────────────

export function canRun(nodes, edges, startNode) {
  if (nodes.length === 0) return false
  if (startNode === null) return false
  if (edges.length === 0) return false
  return true
}

// ─── PSEUDOCÓDIGO POR STEP ────────────────────────────────────────
export const pseudocode = {

  init:
`BFS(Grafo, nó_inicial)
  para cada nó de Grafo exceto nó_inicial
    nó.estado = não_visitado
    nó.distancia = infinito
    nó.predecessor = nulo
  nó_inicial.estado = em_fila
  nó_inicial.distancia = 0
  nó_inicial.predecessor = nulo
  enfileirar(fila, nó_inicial)`,

  dequeue:
`atual = desenfileirar(fila)`,

  neighbor:
`para cada vizinho de atual
  se vizinho.estado == não_visitado
    vizinho.estado = em_fila
    vizinho.distancia = atual.distancia + 1`,

  finishNode:
`atual.estado = visitado`,

  done:
`fila está vazia
BFS concluído`,

}

// ─── EXECUÇÃO DO BFS ──────────────────────────────────────────────
export function run(nodes, edges, startNodeId) {
  const steps = []

  const nodeStates = {}
  const distance = {}
  const predecessor = {}

  nodes.forEach(n => {
    nodeStates[n.id] = NODE_STATES.UNVISITED
    distance[n.id] = Infinity
    predecessor[n.id] = null
  })

  // step 1 — inicialização: todos não visitados, nó inicial em fila
  nodeStates[startNodeId] = NODE_STATES.IN_QUEUE
  distance[startNodeId] = 0
  const queue = [startNodeId]

  steps.push({
    nodeStates: { ...nodeStates },
    distance: { ...distance },
    pseudocode: pseudocode.init,
    queue: [...queue],
    current: null,
  })

  while (queue.length > 0) {

    // step — nó atual sendo processado
    const current = queue.shift()
    nodeStates[current] = NODE_STATES.PROCESSING

    steps.push({
      nodeStates: { ...nodeStates },
      distance: { ...distance },
      pseudocode: pseudocode.dequeue,
      queue: [...queue],
      current,
    })

    const neighbors = edges
      .filter(e => e.source === current || e.target === current)
      .map(e => e.source === current ? e.target : e.source)

    for (const neighborId of neighbors) {

      if (nodeStates[neighborId] === NODE_STATES.UNVISITED) {

        // step — vizinho não visitado: enfileira e atualiza distância
        nodeStates[neighborId] = NODE_STATES.IN_QUEUE
        distance[neighborId] = distance[current] + 1
        predecessor[neighborId] = current
        queue.push(neighborId)

        steps.push({
          nodeStates: { ...nodeStates },
          distance: { ...distance },
          pseudocode: pseudocode.neighbor,
          queue: [...queue],
          current,
          checking: neighborId,
        })

      } else {

        // step — vizinho já visitado ou em fila: apenas verifica
        steps.push({
          nodeStates: { ...nodeStates },
          distance: { ...distance },
          pseudocode: pseudocode.neighbor,
          queue: [...queue],
          current,
          checking: neighborId,
        })

      }
    }

    // step — nó atual finalizado
    nodeStates[current] = NODE_STATES.VISITED
    steps.push({
      nodeStates: { ...nodeStates },
      distance: { ...distance },
      pseudocode: pseudocode.finishNode,
      queue: [...queue],
      current,
    })
  }

  // step final — BFS concluído
  steps.push({
    nodeStates: { ...nodeStates },
    distance: { ...distance },
    pseudocode: pseudocode.done,
    queue: [],
    current: null,
  })

  return steps
}