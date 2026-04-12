import useGraphStore from '../store/GraphStore'

function useGraphAnalysis() {
    const nodes = useGraphStore((state) => state.nodes)
    const edges = useGraphStore((state) => state.edges)

    // ─── CONTAGENS ────────────────────────────────────────────────────

    const nodeCount = nodes.length
    const edgeCount = edges.length

    // ─── CLASSIFICAÇÃO BÁSICA ─────────────────────────────────────────

    // dirigido se ao menos uma aresta for direcionada
    const isDirected = edges.some(e => e.directed === true)

    // ponderado se ao menos uma aresta tiver peso definido
    const isWeighted = edges.some(e => e.weight !== null)

    // ─── ANÁLISE ESTRUTURAL ───────────────────────────────────────────

    // completo — todo par de nós tem aresta entre si
    // fórmula: n*(n-1)/2 para não dirigido
    const nonLoopEdges = edges.filter(e => e.source !== e.target)
    const isComplete = nodeCount > 1 && nonLoopEdges.length === (nodeCount * (nodeCount - 1)) / 2

    // regular — todos os nós têm o mesmo grau (mesmo número de arestas conectadas)
    const isRegular = (() => {
        if (nodeCount === 0) return false
        const degree = (nodeId) => edges.filter(e =>
            (e.source === nodeId || e.target === nodeId) && e.source !== e.target
        ).length
        const firstDegree = degree(nodes[0].id)
        return nodes.every(n => degree(n.id) === firstDegree)
    })()

    // ─── REQUEREM ALGORITMO — implementar quando DFS/BFS estiver pronto ───

    const isConnected = false
    const isAcyclic = false
    const isTree = false
    const isBipartite = false

    return {
        nodeCount,
        edgeCount,
        isDirected,
        isWeighted,
        isComplete,
        isRegular,
        isConnected,
        isAcyclic,
        isTree,
        isBipartite,
    }
}

export default useGraphAnalysis