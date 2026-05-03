import { useRef, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import useGraphStore from '../store/GraphStore'

function GraphCanvas() {
  const activeTool = useGraphStore((state) => state.activeTool)
  const nodes = useGraphStore((state) => state.nodes)
  const edges = useGraphStore((state) => state.edges)
  const addNode = useGraphStore((state) => state.addNode)
  const addEdge = useGraphStore((state) => state.addEdge)
  const removeNode = useGraphStore((state) => state.removeNode)
  const removeEdge = useGraphStore((state) => state.removeEdge)
  const updateNodeLabel = useGraphStore((state) => state.updateNodeLabel)
  const updateEdge = useGraphStore((state) => state.updateEdge)
  const moveNode = useGraphStore((state) => state.moveNode)
  const setStartNode = useGraphStore((state) => state.setStartNode)
  const startNode = useGraphStore((state) => state.startNode)
  const steps = useGraphStore((state) => state.steps)
  const currentStep = useGraphStore((state) => state.currentStep)
  const isRunning = useGraphStore((state) => state.isRunning)

  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [sourceNode, setSourceNode] = useState(null)
  const [draggingNode, setDraggingNode] = useState(null)

  const [nodeDialog, setNodeDialog] = useState(null)
  const [edgeDialog, setEdgeDialog] = useState(null)
  const [nodeLabel, setNodeLabel] = useState('')
  const [edgeWeight, setEdgeWeight] = useState(null)
  const [edgeDirected, setEdgeDirected] = useState(false)
  const [isSelfLoopEdge, setIsSelfLoopEdge] = useState(false)

  // ─── HANDLERS ─────────────────────────────────────────────────────

  const handleCanvaClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if (activeTool === 'addNode') addNode(x, y)
  }

  const handleNodeMouseDown = (e, nodeId) => {
    if (activeTool !== 'control') return
    e.stopPropagation()
    setDraggingNode(nodeId)
  }

  const handleSvgMouseMove = (e) => {
    if (draggingNode === null) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    moveNode(draggingNode, x, y)
  }

  const handleSvgMouseUp = () => {
    setDraggingNode(null)
  }

  const handleNodeClick = (e, nodeId) => {
    e.stopPropagation()
    if (activeTool === 'addEdge') {
      if (sourceNode === null) {
        setSourceNode(nodeId)
      } else {
        const isSelfLoopDuplicate = sourceNode === nodeId && edges.some(e => e.source === nodeId && e.target === nodeId)
        if (!isSelfLoopDuplicate) addEdge(sourceNode, nodeId)
        setSourceNode(null)
      }
    }
    if (activeTool === 'delete') removeNode(nodeId)
    if (activeTool === 'select') {
      const node = nodes.find(n => n.id === nodeId)
      setNodeLabel(node.label || '')
      setNodeDialog(node)
    }
  }

  const handleNodeContextMenu = (e, nodeId) => {
    e.preventDefault()
    setStartNode(nodeId)
  }

  const handleEdgeClick = (e, edgeId) => {
    e.stopPropagation()
    if (activeTool === 'delete') removeEdge(edgeId)
    if (activeTool === 'select') {
      const edge = edges.find(ed => ed.id === edgeId)
      setEdgeWeight(edge.weight)
      setEdgeDirected(edge.directed)
      setIsSelfLoopEdge(edge.source === edge.target)
      setEdgeDialog(edge)
    }
  }

  const handleNodeDialogConfirm = () => {
    updateNodeLabel(nodeDialog.id, nodeLabel)
    setNodeDialog(null)
  }

  const handleEdgeDialogConfirm = () => {
    updateEdge(edgeDialog.id, edgeWeight, edgeDirected)
    setEdgeDialog(null)
  }

  const getNodeColor = (nodeId) => {
    if (!isRunning || steps.length === 0) return 'black'
    const state = steps[currentStep]?.nodeStates?.[nodeId]
    if (!state || state === 'unvisited') return 'black'
    if (state === 'processing') return 'orange'
    if (state === 'visited') return '#1565c0'
    if (state === 'confirmed') return 'green'
    if (state === 'rejected') return 'red'
    if (state === 'inQueue') return 'gray'
    if (state === 'inPath') return 'orange'
    if (state === 'inTree') return 'green'
    if (state.startsWith('#')) return state
    return 'black'
  }

  const getEdgeColor = (edgeId) => {
    if (!isRunning || steps.length === 0) return 'black'
    const step = steps[currentStep]
    if (step?.currentEdge === edgeId) return 'orange'
    if (step?.currentEdges?.includes(edgeId)) return 'orange'
    if (step?.confirmedEdges?.includes(edgeId)) return 'green'
    if (step?.rejectedEdges?.includes(edgeId)) return 'red'
    if (step?.visitedEdges?.includes(edgeId)) return '#1565c0'
    return 'black'
  }

  // ─── UTILITÁRIOS DE GEOMETRIA ─────────────────────────────────────

  const getMarker = (edge) => {
    if (!edge.directed) return { markerStart: null, markerEnd: null }
    return { markerStart: null, markerEnd: 'url(#arrowhead)' }
  }

  const renderWeight = (x1, y1, x2, y2, weight, offset = -15, color = 'black') => {
    if (weight === null) return null
    const angle = Math.atan2(y2 - y1, x2 - x1)
    const tx = (x1 + x2) / 2 - Math.sin(angle) * offset
    const ty = (y1 + y2) / 2 + Math.cos(angle) * offset
    return (
      <text x={tx} y={ty} textAnchor="middle" fontSize={14} fill={color} pointerEvents="none">
        {weight}
      </text>
    )
  }

  // ─── RENDER DE ARESTAS ────────────────────────────────────────────
  // Recebe o pool completo (reais + virtuais) para calcular paralelas corretamente.

  const renderEdge = (edge, allEdges) => {
    const source = nodes.find(n => n.id === edge.source)
    const target = nodes.find(n => n.id === edge.target)
    if (!source || !target) return null

    const isVirtual = !!edge.virtual
    const edgeColor = isVirtual ? '#1565c0' : getEdgeColor(edge.id)
    const strokeDash = isVirtual ? '6 3' : undefined
    const { markerStart, markerEnd } = isVirtual ? { markerStart: null, markerEnd: null } : getMarker(edge)

    const isSelfLoop = edge.source === edge.target

    if (isSelfLoop) {
      if (isVirtual) return null
      const loopRadius = 25
      const lx = source.x - 10
      const ly = source.y - 18
      return (
        <g key={edge.id}>
          <ellipse cx={lx} cy={ly} rx={loopRadius} ry={loopRadius / 1.3} fill="none" stroke={edgeColor} strokeWidth={2} pointerEvents="none" />
          <ellipse cx={lx} cy={ly} rx={loopRadius} ry={loopRadius / 1.5} fill="none" stroke="transparent" strokeWidth={12} onClick={(e) => handleEdgeClick(e, edge.id)} style={{ cursor: 'pointer' }} />
          {edge.weight !== null && (
            <text x={lx} y={ly - loopRadius - 4} textAnchor="middle" fontSize={14} fill="black" pointerEvents="none">
              {edge.weight}
            </text>
          )}
        </g>
      )
    }

    // arestas paralelas — considera o pool completo (reais + virtuais)
    const nodeA = Math.min(edge.source, edge.target)
    const nodeB = Math.max(edge.source, edge.target)

    const parallelEdges = allEdges.filter(e => {
      const eA = Math.min(e.source, e.target)
      const eB = Math.max(e.source, e.target)
      return eA === nodeA && eB === nodeB && e.source !== e.target
    })

    const hasParallel = parallelEdges.length > 1

    if (!hasParallel) {
      return (
        <g key={edge.id}>
          <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke={edgeColor} strokeWidth={2} strokeDasharray={strokeDash} pointerEvents="none" markerStart={markerStart} markerEnd={markerEnd} />
          {renderWeight(source.x, source.y, target.x, target.y, edge.weight, -15, edgeColor)}
          {!isVirtual && (
            <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke="transparent" strokeWidth={12} onClick={(e) => handleEdgeClick(e, edge.id)} style={{ cursor: 'pointer' }} />
          )}
        </g>
      )
    }

    // bezier paralela
    const fromNode = nodeA === edge.source ? source : target
    const toNode = nodeA === edge.source ? target : source
    const dx = toNode.x - fromNode.x
    const dy = toNode.y - fromNode.y
    const angle = Math.atan2(dy, dx)

    const edgeIndex = parallelEdges.findIndex(e => e.id === edge.id)
    const totalParallel = parallelEdges.length
    const curveAmount = (edgeIndex - (totalParallel - 1) / 2) * 50

    const mx = (source.x + target.x) / 2
    const my = (source.y + target.y) / 2
    const cpx = mx - Math.sin(angle) * curveAmount
    const cpy = my + Math.cos(angle) * curveAmount
    const d = `M ${source.x} ${source.y} Q ${cpx} ${cpy} ${target.x} ${target.y}`

    const bmx = 0.25 * source.x + 0.5 * cpx + 0.25 * target.x
    const bmy = 0.25 * source.y + 0.5 * cpy + 0.25 * target.y
    const labelOffset = curveAmount >= 0 ? 15 : -15
    const perpX = bmx - Math.sin(angle) * labelOffset
    const perpY = bmy + Math.cos(angle) * labelOffset

    return (
      <g key={edge.id}>
        <path d={d} fill="none" stroke={edgeColor} strokeWidth={2} strokeDasharray={strokeDash} pointerEvents="none" markerStart={markerStart} markerEnd={markerEnd} />
        {edge.weight !== null && (
          <text x={perpX} y={perpY} textAnchor="middle" fontSize={14} fill={edgeColor} pointerEvents="none">
            {edge.weight}
          </text>
        )}
        {!isVirtual && (
          <path d={d} fill="none" stroke="transparent" strokeWidth={12} onClick={(e) => handleEdgeClick(e, edge.id)} style={{ cursor: 'pointer' }} />
        )}
      </g>
    )
  }

  // ─── EFEITOS ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!containerRef.current) return
    const { width, height } = containerRef.current.getBoundingClientRect()
    setDimensions({ width, height })
  }, [])

  // ─── RENDER ───────────────────────────────────────────────────────

  const virtualEdges = (isRunning && steps[currentStep]?.virtualEdges) || []

  const allEdges = [
    ...edges,
    ...virtualEdges.map((ve, idx) => ({
      id: `virtual-${idx}`,
      source: ve.source,
      target: ve.target,
      weight: ve.weight,
      directed: false,
      virtual: true,
    })),
  ]

  return (
    <Box ref={containerRef} sx={{ height: '100%', border: '1px solid black', borderRadius: '7px', mb: 2, overflow: 'hidden' }}>
      <svg
        id="graph-svg"
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleCanvaClick}
        onMouseMove={handleSvgMouseMove}
        onMouseUp={handleSvgMouseUp}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="16" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="black" />
          </marker>
        </defs>

        {allEdges.map((edge) => renderEdge(edge, allEdges))}

        {nodes.map((node) => (
          <g key={node.id}>
            <circle
              cx={node.x} cy={node.y} r={15}
              fill={
                sourceNode === node.id ? 'orange' :
                  draggingNode === node.id ? 'gray' :
                    getNodeColor(node.id)
              }
              stroke="none"
              strokeWidth={3}
              onClick={(e) => handleNodeClick(e, node.id)}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              onContextMenu={(e) => handleNodeContextMenu(e, node.id)}
              style={{ cursor: activeTool === 'control' ? 'grab' : 'pointer' }}
            />
            {startNode === node.id && !isRunning && (
              <text x={node.x} y={node.y + 5} textAnchor="middle" fontSize={14} fill="white" fontWeight="bold" pointerEvents="none">
                I
              </text>
            )}
            {isRunning && steps[currentStep]?.distance?.[node.id] !== Infinity && steps[currentStep]?.distance?.[node.id] !== undefined && (
              <text x={node.x} y={node.y + 5} textAnchor="middle" fontSize={12} fill="white" fontWeight="bold" pointerEvents="none">
                {steps[currentStep].distance[node.id]}
              </text>
            )}
            {isRunning && steps[currentStep]?.current === node.id && (
              <text x={node.x} y={node.y + 5} textAnchor="middle" fontSize={14} fill="white" fontWeight="bold" pointerEvents="none">
                K
              </text>
            )}
            <text x={node.x} y={node.y - 26} textAnchor="middle" fontSize={20} fill="black" pointerEvents="none">
              {node.label}
            </text>
          </g>
        ))}
      </svg>

      <Dialog open={Boolean(nodeDialog)} onClose={() => setNodeDialog(null)}>
        <DialogTitle>Editar nó</DialogTitle>
        <DialogContent>
          <TextField label="Nome" value={nodeLabel} onChange={(e) => setNodeLabel(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNodeDialog(null)}>Cancelar</Button>
          <Button onClick={handleNodeDialogConfirm} variant="contained">Confirmar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(edgeDialog)} onClose={() => setEdgeDialog(null)}>
        <DialogTitle>Editar Aresta</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Peso"
            type="number"
            value={edgeWeight ?? ''}
            onChange={(e) => setEdgeWeight(Number(e.target.value))}
            sx={{ mt: 1 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={edgeDirected}
                onChange={(e) => setEdgeDirected(e.target.checked)}
                disabled={isSelfLoopEdge}
              />
            }
            label="Direcionada"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEdgeDialog(null)}>Cancelar</Button>
          <Button onClick={handleEdgeDialogConfirm} variant="contained">Confirmar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default GraphCanvas