import useGraphStore from '../store/GraphStore'
import { canRun as bfsCanRun, run as bfsRun } from '../features/algorithms/bfs'
import { canRun as dfsCanRun, run as dfsRun } from '../features/algorithms/dfs'
import { canRun as colorCanRun, run as colorRun } from '../features/algorithms/graphColoring'
import { canRun as hamilCanRun, run as hamilRun } from '../features/algorithms/hamiltonianCycle'
import { canRun as eulerCanRun, run as eulerRun } from '../features/algorithms/eulerianCycle'
import { canRun as primCanRun, run as primRun } from '../features/algorithms/prim'
import { canRun as kruskalCanRun, run as kruskalRun } from '../features/algorithms/kruskal'

function useAlgorithmValidation() {
  const nodes = useGraphStore((state) => state.nodes)
  const edges = useGraphStore((state) => state.edges)
  const startNode = useGraphStore((state) => state.startNode)

  return [
    { id: 'bfs', label: 'Busca em Largura (BFS)', canRun: bfsCanRun(nodes, edges, startNode), run: () => bfsRun(nodes, edges, startNode) },
    { id: 'dfs', label: 'Busca em Profundidade (DFS)', canRun: dfsCanRun(nodes, edges, startNode), run: () => dfsRun(nodes, edges, startNode) },
    { id: 'color', label: 'Coloração', canRun: colorCanRun(nodes, edges), run: () => colorRun(nodes, edges) },
    { id: 'hamiltonian', label: 'Caminho Hamiltoniano', canRun: hamilCanRun(nodes, edges, startNode), run: () => hamilRun(nodes, edges, startNode) },
    { id: 'eulerian', label: 'Caminho Euleriano', canRun: eulerCanRun(nodes, edges, startNode), run: () => eulerRun(nodes, edges, startNode) },
    { id: 'prim', label: 'Prim (árvore geradora)', canRun: primCanRun(nodes, edges, startNode), run: () => primRun(nodes, edges, startNode) },
    { id: 'kruskal', label: 'Kruskal (árvore geradora)', canRun: kruskalCanRun(nodes, edges, startNode), run: () => kruskalRun(nodes, edges, startNode) },  
  ]
}

export default useAlgorithmValidation