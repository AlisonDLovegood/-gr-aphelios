import useGraphStore from '../store/GraphStore'
import { canRun as bfsCanRun } from '../features/algorithms/bfs'

function useAlgorithmValidation() {
  const nodes = useGraphStore((state) => state.nodes)
  const edges = useGraphStore((state) => state.edges)
  const startNode = useGraphStore((state) => state.startNode)

  return {
    bfs: bfsCanRun(nodes, edges, startNode),
  }
}

export default useAlgorithmValidation