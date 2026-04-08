import { useRef, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import useGraphStore from '../store/GraphStore'

function GraphCanvas() {
  const activeTool = useGraphStore((state) => state.activeTool)
  const nodes = useGraphStore((state) => state.nodes)
  const edges = useGraphStore((state) => state.edges)
  const addNode = useGraphStore((state) => state.addNode)
  const addEdge = useGraphStore((state) => state.addEdge)
  const removeNode = useGraphStore((state) => state.removeNode)
  const removeEdge = useGraphStore((state) => state.removeEdge)

  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [sourceNode, setSourceNode] = useState(null)

  const handleCanvaClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (activeTool === 'addNode') addNode(x, y)
    if (activeTool === 'select') { /* futuramente */ }
  }

  const handleNodeClick = (e, nodeId) => {
    e.stopPropagation()

    if (activeTool === 'addEdge') {
      if (sourceNode === null) {
        setSourceNode(nodeId)
      } else {
        // verifica se já existe aresta de sourceNode para nodeId
        const exists = edges.some(e => e.source === sourceNode && e.target === nodeId)

        if (!exists) addEdge(sourceNode, nodeId)

        setSourceNode(null)
      }
    }

    if (activeTool === 'delete') {
      removeNode(nodeId)
    }
  }

  const handleEdgeClick = (e, edgeId) => {
    e.stopPropagation()

    if (activeTool === 'delete') removeEdge(edgeId)
  }

  useEffect(() => {
    if (!containerRef.current) return

    const { width, height } = containerRef.current.getBoundingClientRect()
    setDimensions({ width, height })
  }, [])

  return (
    <Box
      ref={containerRef}
      sx={{
        height: '100%',
        border: '1px solid black',
        borderRadius: '7px',
        mb: 2
      }}
    >
      <svg
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleCanvaClick}
      >

        {/* EDGES */}
        {edges.map((edge, index) => {
          const source = nodes.find(n => n.id === edge.source)
          const target = nodes.find(n => n.id === edge.target)

          if (!source || !target) return null

          return (
            <g key={edge.id}>
              {/* linha visual */}
              <line
                x1={source.x} y1={source.y}
                x2={target.x} y2={target.y}
                stroke="black"
                strokeWidth={2}
                pointerEvents="none"
              />
              {/* linha invisível para capturar clique */}
              <line
                x1={source.x} y1={source.y}
                x2={target.x} y2={target.y}
                stroke="transparent"
                strokeWidth={12}
                onClick={(e) => handleEdgeClick(e, edge.id)}
                style={{ cursor: 'pointer' }}
              />
            </g>
          )
        })}

        {/* NODES */}
        {nodes.map((node) => (
          <circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={10}
            fill={sourceNode === node.id ? 'orange' : 'black'} // destaca o nó source ao criar aresta
            onClick={(e) => handleNodeClick(e, node.id)}
            style={{ cursor: 'pointer' }}
          />
        ))}

      </svg>
    </Box>
  )
}

export default GraphCanvas