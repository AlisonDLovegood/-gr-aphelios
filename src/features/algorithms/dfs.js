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

    const hasEdgeFromStart = edges.some(e => e.source === startNode || e.target === startNode)
    if (!hasEdgeFromStart) return false

    return true
}

// ─── PSEUDOCÓDIGO POR STEP ────────────────────────────────────────
export const pseudocode = {

    init:
        `DFS(Grafo, nó_inicial)
  para cada nó de Grafo exceto nó_inicial
    nó.estado = não_visitado
    nó.distancia = infinito
    nó.predecessor = nulo
  nó_inicial.estado = na_pilha
  nó_inicial.distancia = 0
  nó_inicial.predecessor = nulo
  empilhar(pilha, nó_inicial)`,

    pop:
        `atual = desempilhar(pilha)`,

    neighbor:
        `para cada vizinho de atual
  se vizinho.estado == não_visitado
    vizinho.estado = na_pilha
    vizinho.distancia = atual.distancia + 1
    empilhar(pilha, vizinho)`,

    finishNode:
        `atual.estado = visitado`,

    done:
        `pilha está vazia
DFS concluído`,

}

// ─── EXECUÇÃO DO DFS ──────────────────────────────────────────────
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

    // step 1 — inicialização: todos não visitados, nó inicial na pilha
    nodeStates[startNodeId] = NODE_STATES.IN_QUEUE
    distance[startNodeId] = 0
    const stack = [startNodeId]

    steps.push({
        nodeStates: { ...nodeStates },
        distance: { ...distance },
        pseudocode: pseudocode.init,
        queue: [...stack],
        current: null,
    })

    while (stack.length > 0) {

        // step — nó atual sendo processado — desempilha do topo
        const current = stack.pop()

        // ignora se já foi visitado — pode ter sido empilhado mais de uma vez
        if (nodeStates[current] === NODE_STATES.VISITED) continue

        nodeStates[current] = NODE_STATES.PROCESSING

        steps.push({
            nodeStates: { ...nodeStates },
            distance: { ...distance },
            pseudocode: pseudocode.pop,
            queue: [...stack],
            current,
        })

        const neighbors = edges
            .filter(e => {
                if (!e.directed) return e.source === current || e.target === current
                return e.source === current
            })
            .map(e => e.source === current ? e.target : e.source)

        for (const neighborId of neighbors) {

            if (nodeStates[neighborId] === NODE_STATES.UNVISITED) {

                // step — vizinho não visitado: empilha e atualiza distância
                nodeStates[neighborId] = NODE_STATES.IN_QUEUE
                distance[neighborId] = distance[current] + 1
                predecessor[neighborId] = current
                stack.push(neighborId)

                steps.push({
                    nodeStates: { ...nodeStates },
                    distance: { ...distance },
                    pseudocode: pseudocode.neighbor,
                    queue: [...stack],
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
            queue: [...stack],
            current,
        })
    }

    // step final — DFS concluído
    steps.push({
        nodeStates: { ...nodeStates },
        distance: { ...distance },
        pseudocode: pseudocode.done,
        queue: [],
        current: null,
    })

    return steps
}