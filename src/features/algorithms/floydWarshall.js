export const NODE_STATES = {
  UNVISITED: 'unvisited',
  IN_QUEUE: 'inQueue',
  PROCESSING: 'processing',
  VISITED: 'visited',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
}

export function canRun(nodes, edges) {
  if (nodes.length < 2) return false
  if (edges.length === 0) return false

  const dist = {}
  nodes.forEach(i => {
    dist[i.id] = {}
    nodes.forEach(j => { dist[i.id][j.id] = i.id === j.id ? 0 : Infinity })
  })
  edges.forEach(e => {
    const w = e.weight ?? 1
    dist[e.source][e.target] = Math.min(dist[e.source][e.target], w)
    if (!e.directed) dist[e.target][e.source] = Math.min(dist[e.target][e.source], w)
  })
  nodes.forEach(k => {
    nodes.forEach(i => {
      nodes.forEach(j => {
        if (dist[i.id][k.id] !== Infinity && dist[k.id][j.id] !== Infinity)
          if (dist[i.id][k.id] + dist[k.id][j.id] < dist[i.id][j.id])
            dist[i.id][j.id] = dist[i.id][k.id] + dist[k.id][j.id]
      })
    })
  })
  for (const n of nodes)
    if (dist[n.id][n.id] < 0) return false

  return true
}

export const pseudocode = {
  init:
`FloydWarshall(Grafo)
  para cada par (i, j)
    dist[i][j] = peso da aresta direta
    dist[i][i] = 0
    dist[i][j] = infinito se não há aresta`,

  newK:
`k = nó intermediário atual
  vizinhos de k identificados
  para cada par de vizinhos (i, j)
    comparar i → j com i → k → j`,

  evaluate:
`avaliando par (i, j) via k
  i → k → j versus i → j direto`,

  better:
`i → k → j é mais curto
  dist[i][j] = dist[i][k] + dist[k][j]`,

  worse:
`i → j direto é melhor ou igual
  dist[i][j] mantido`,

  noTriangle:
`i e j não possuem aresta direta
  i → k → j é o único caminho`,

  done:
`todos os nós usados como intermediário
distâncias mínimas entre todos os pares
Floyd-Warshall concluído`,
}

function findAllEdges(edges, a, b) {
  return edges.filter(e =>
    (!e.directed && ((e.source === a && e.target === b) || (e.source === b && e.target === a))) ||
    (e.directed && e.source === a && e.target === b)
  )
}

function findEdge(edges, a, b) {
  return edges.find(e =>
    (!e.directed && ((e.source === a && e.target === b) || (e.source === b && e.target === a))) ||
    (e.directed && e.source === a && e.target === b)
  )
}

function edgesBetween(edges, a, b) {
  return findAllEdges(edges, a, b).map(e => e.id)
}

export function run(nodes, edges) {
  const steps = []
  const nodeStates = {}
  const dist = {}

  nodes.forEach(i => {
    nodeStates[i.id] = NODE_STATES.UNVISITED
    dist[i.id] = {}
    nodes.forEach(j => { dist[i.id][j.id] = i.id === j.id ? 0 : Infinity })
  })

  edges.forEach(e => {
    const w = e.weight ?? 1
    dist[e.source][e.target] = Math.min(dist[e.source][e.target], w)
    if (!e.directed) dist[e.target][e.source] = Math.min(dist[e.target][e.source], w)
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
    virtualEdges: [],
  })

  for (const k of nodes) {

    nodes.forEach(n => { nodeStates[n.id] = NODE_STATES.UNVISITED })
    nodeStates[k.id] = NODE_STATES.PROCESSING

    const neighbors = nodes.filter(n => n.id !== k.id && findEdge(edges, k.id, n.id))
    neighbors.forEach(n => { nodeStates[n.id] = NODE_STATES.IN_QUEUE })

    steps.push({
      nodeStates: { ...nodeStates },
      pseudocode: pseudocode.newK,
      current: k.id,
      currentEdge: null,
      currentEdges: [],
      currentNodes: [k.id],
      visitedEdges: [],
      confirmedEdges: [],
      rejectedEdges: [],
      virtualEdges: [],
    })

    for (let a = 0; a < neighbors.length; a++) {
      const i = neighbors[a]

      for (let b = a + 1; b < neighbors.length; b++) {
        const j = neighbors[b]

        const candidate = dist[i.id][k.id] + dist[k.id][j.id]

        const edgesKI = edgesBetween(edges, k.id, i.id)
        const edgesKJ = edgesBetween(edges, k.id, j.id)
        const edgesIJ = edgesBetween(edges, i.id, j.id)
        const allTriangleEdges = [...edgesKI, ...edgesKJ, ...edgesIJ]
        const hasDirectIJ = edgesIJ.length > 0

        nodes.forEach(n => { nodeStates[n.id] = NODE_STATES.UNVISITED })
        nodeStates[k.id] = NODE_STATES.PROCESSING
        nodeStates[i.id] = NODE_STATES.PROCESSING
        nodeStates[j.id] = NODE_STATES.PROCESSING

        steps.push({
          nodeStates: { ...nodeStates },
          pseudocode: hasDirectIJ ? pseudocode.evaluate : pseudocode.noTriangle,
          current: k.id,
          currentEdge: null,
          currentEdges: allTriangleEdges,
          currentNodes: [k.id, i.id, j.id],
          visitedEdges: [],
          confirmedEdges: [],
          rejectedEdges: [],
          virtualEdges: [],
          checking: j.id,
        })

        if (candidate < dist[i.id][j.id]) {
          dist[i.id][j.id] = candidate
          dist[j.id][i.id] = candidate

          nodes.forEach(n => { nodeStates[n.id] = NODE_STATES.UNVISITED })
          nodeStates[k.id] = NODE_STATES.CONFIRMED
          nodeStates[i.id] = NODE_STATES.CONFIRMED
          nodeStates[j.id] = NODE_STATES.CONFIRMED

          steps.push({
            nodeStates: { ...nodeStates },
            pseudocode: pseudocode.better,
            current: k.id,
            currentEdge: null,
            currentEdges: [],
            currentNodes: [k.id, i.id, j.id],
            visitedEdges: [],
            confirmedEdges: [...edgesKI, ...edgesKJ],
            rejectedEdges: hasDirectIJ ? [...edgesIJ] : [],
            virtualEdges: [],
            checking: j.id,
          })

        } else {
          nodes.forEach(n => { nodeStates[n.id] = NODE_STATES.UNVISITED })
          nodeStates[k.id] = NODE_STATES.REJECTED
          nodeStates[i.id] = NODE_STATES.CONFIRMED
          nodeStates[j.id] = NODE_STATES.CONFIRMED

          steps.push({
            nodeStates: { ...nodeStates },
            pseudocode: hasDirectIJ ? pseudocode.worse : pseudocode.noTriangle,
            current: k.id,
            currentEdge: null,
            currentEdges: [],
            currentNodes: [k.id, i.id, j.id],
            visitedEdges: [],
            confirmedEdges: hasDirectIJ ? [...edgesIJ] : [...edgesKI, ...edgesKJ],
            rejectedEdges: hasDirectIJ ? [...edgesKI, ...edgesKJ] : [],
            virtualEdges: [],
            checking: j.id,
          })
        }
      }
    }

    // atualiza dist via k para todos os pares
    nodes.forEach(i => {
      nodes.forEach(j => {
        if (dist[i.id][k.id] !== Infinity && dist[k.id][j.id] !== Infinity) {
          const candidate = dist[i.id][k.id] + dist[k.id][j.id]
          if (candidate < dist[i.id][j.id]) {
            dist[i.id][j.id] = candidate
            dist[j.id][i.id] = candidate
          }
        }
      })
    })
  }

  // step final — todos os nós confirmados e arestas virtuais para pares sem ligação direta
  nodes.forEach(n => {
    const reachable = nodes.some(m => m.id !== n.id && dist[n.id][m.id] !== Infinity)
    nodeStates[n.id] = reachable ? NODE_STATES.CONFIRMED : NODE_STATES.UNVISITED
  })

  // gera arestas virtuais para pares sem aresta direta
  const virtualEdges = []
  const seen = new Set()
  nodes.forEach(i => {
    nodes.forEach(j => {
      if (i.id >= j.id) return
      if (dist[i.id][j.id] === Infinity) return
      const key = `${Math.min(i.id, j.id)}-${Math.max(i.id, j.id)}`
      if (seen.has(key)) return
      seen.add(key)
      const hasDirectEdge = findEdge(edges, i.id, j.id)
      if (!hasDirectEdge) {
        virtualEdges.push({
          source: i.id,
          target: j.id,
          weight: dist[i.id][j.id],
        })
      }
    })
  })

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
    virtualEdges,
  })

  return steps
}