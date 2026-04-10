import { useRef, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
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

  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [sourceNode, setSourceNode] = useState(null)

  const [nodeDialog, setNodeDialog] = useState(null)
  const [edgeDialog, setEdgeDialog] = useState(null)
  const [nodeLabel, setNodeLabel] = useState('')
  const [edgeWeight, setEdgeWeight] = useState(null)
  const [edgeOrientation, setEdgeOrientation] = useState(null)

  const handleCanvaClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if (activeTool === 'addNode') addNode(x, y)
  }

  const handleNodeClick = (e, nodeId) => {
    e.stopPropagation()

    if (activeTool === 'addEdge') {
      if (sourceNode === null) {
        setSourceNode(nodeId)
      } else {
        const exists = edges.some(e => e.source === sourceNode && e.target === nodeId)
        if (!exists) addEdge(sourceNode, nodeId)
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

  const handleEdgeClick = (e, edgeId) => {
    e.stopPropagation()
    if (activeTool === 'delete') removeEdge(edgeId)
    if (activeTool === 'select') {
      const edge = edges.find(ed => ed.id === edgeId)
      setEdgeWeight(edge.weight)
      setEdgeOrientation(edge.orientation)
      setEdgeDialog(edge)
    }
  }

  const handleNodeDialogConfirm = () => {
    updateNodeLabel(nodeDialog.id, nodeLabel)
    setNodeDialog(null)
  }

  const handleEdgeDialogConfirm = () => {
    updateEdge(edgeDialog.id, edgeWeight, edgeOrientation !== null, edgeOrientation)
    setEdgeDialog(null)
  }

  // determina markers de seta baseado na orientação e posição dos nós
  const getMarkers = (edge, source, target) => {
    if (!edge.orientation) return { markerStart: null, markerEnd: null }

    const sourceIsLeft = source.x <= target.x

    if (edge.orientation === 'both') {
      return { markerStart: 'url(#arrowhead-start)', markerEnd: 'url(#arrowhead)' }
    }

    if (edge.orientation === 'left') {
      return sourceIsLeft
        ? { markerStart: 'url(#arrowhead-start)', markerEnd: null }
        : { markerStart: null, markerEnd: 'url(#arrowhead)' }
    }

    if (edge.orientation === 'right') {
      return sourceIsLeft
        ? { markerStart: null, markerEnd: 'url(#arrowhead)' }
        : { markerStart: 'url(#arrowhead-start)', markerEnd: null }
    }

    return { markerStart: null, markerEnd: null }
  }

  const renderEdge = (edge) => {
    const source = nodes.find(n => n.id === edge.source)
    const target = nodes.find(n => n.id === edge.target)

    if (!source || !target) return null

    const isSelfLoop = edge.source === edge.target
    const hasReverse = edges.some(e => e.source === edge.target && e.target === edge.source && e.id !== edge.id)
    const { markerStart, markerEnd } = getMarkers(edge, source, target)

    const renderWeight = (x1, y1, x2, y2, curveOffset = 0) => {
      if (edge.weight === null) return null
      const dx = x2 - x1
      const dy = y2 - y1
      const angle = Math.atan2(dy, dx)
      const offset = -15
      const tx = (x1 + x2) / 2 - Math.sin(angle) * (offset + curveOffset)
      const ty = (y1 + y2) / 2 + Math.cos(angle) * (offset + curveOffset)
      return (
        <text x={tx} y={ty} textAnchor="middle" fontSize={14} fill="black" pointerEvents="none">
          {edge.weight}
        </text>
      )
    }

    // caso 1 — self-loop
    if (isSelfLoop) {
      const loopRadius = 25
      const lx = source.x - 10
      const ly = source.y - 18
      return (
        <g key={edge.id}>
          <ellipse cx={lx} cy={ly} rx={loopRadius} ry={loopRadius / 1.3} fill="none" stroke="black" strokeWidth={2} pointerEvents="none" />
          <ellipse cx={lx} cy={ly} rx={loopRadius} ry={loopRadius / 1.5} fill="none" stroke="transparent" strokeWidth={12} onClick={(e) => handleEdgeClick(e, edge.id)} style={{ cursor: 'pointer' }} />
          {edge.weight !== null && (
            <text x={lx} y={ly - loopRadius - 4} textAnchor="middle" fontSize={14} fill="black" pointerEvents="none">
              {edge.weight}
            </text>
          )}
        </g>
      )
    }

    // caso 2 — arestas duplas com curvatura
    if (hasReverse) {
      const dx = target.x - source.x
      const dy = target.y - source.y
      const mx = (source.x + target.x) / 2
      const my = (source.y + target.y) / 2
      const angle = Math.atan2(dy, dx)
      const curveAmount = 40

      const cpx = mx - Math.sin(angle) * curveAmount
      const cpy = my + Math.cos(angle) * curveAmount
      const d = `M ${source.x} ${source.y} Q ${cpx} ${cpy} ${target.x} ${target.y}`

      const parallelEdges = edges.filter(e =>
        (e.source === edge.source && e.target === edge.target) ||
        (e.source === edge.target && e.target === edge.source)
      )
      const labelSide = parallelEdges[0].id === edge.id ? curveAmount / 2 : -(curveAmount / 2)

      return (
        <g key={edge.id}>
          <path d={d} fill="none" stroke="black" strokeWidth={2} pointerEvents="none" markerStart={markerStart} markerEnd={markerEnd} />
          {renderWeight(source.x, source.y, target.x, target.y, labelSide)}
          <path d={d} fill="none" stroke="transparent" strokeWidth={12} onClick={(e) => handleEdgeClick(e, edge.id)} style={{ cursor: 'pointer' }} />
        </g>
      )
    }

    // caso 3 — linha reta simples
    return (
      <g key={edge.id}>
        <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke="black" strokeWidth={2} pointerEvents="none" markerStart={markerStart} markerEnd={markerEnd} />
        {renderWeight(source.x, source.y, target.x, target.y)}
        <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke="transparent" strokeWidth={12} onClick={(e) => handleEdgeClick(e, edge.id)} style={{ cursor: 'pointer' }} />
      </g>
    )
  }

  useEffect(() => {
    if (!containerRef.current) return
    const { width, height } = containerRef.current.getBoundingClientRect()
    setDimensions({ width, height })
  }, [])

  // verifica se já há duas arestas entre os mesmos nós — desabilita 'ambos' nesse caso
  const hasTwoEdgesBetween = edgeDialog
    ? edges.filter(e =>
        (e.source === edgeDialog.source && e.target === edgeDialog.target) ||
        (e.source === edgeDialog.target && e.target === edgeDialog.source)
      ).length >= 2
    : false

  return (
    <Box ref={containerRef} sx={{ height: '100%', border: '1px solid black', borderRadius: '7px', mb: 2 }}>
      <svg width={dimensions.width} height={dimensions.height} onClick={handleCanvaClick}>

        <defs>
          {/* seta para o fim da linha */}
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="16" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="black" />
          </marker>
          {/* seta para o início da linha */}
          <marker id="arrowhead-start" markerWidth="10" markerHeight="7" refX="16" refY="3.5" orient="auto-start-reverse">
            <polygon points="0 0, 10 3.5, 0 7" fill="black" />
          </marker>
        </defs>

        {/* EDGES */}
        {edges.map((edge) => renderEdge(edge))}

        {/* NODES */}
        {nodes.map((node) => (
          <g key={node.id}>
            <circle
              cx={node.x} cy={node.y} r={15}
              fill={sourceNode === node.id ? 'orange' : 'black'}
              onClick={(e) => handleNodeClick(e, node.id)}
              style={{ cursor: 'pointer' }}
            />
            <text x={node.x} y={node.y - 26} textAnchor="middle" fontSize={20} fill="black" pointerEvents="none">
              {node.label}
            </text>
          </g>
        ))}

      </svg>

      {/* POPUP DO NÓ */}
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

      {/* POPUP DA ARESTA */}
      <Dialog open={Boolean(edgeDialog)} onClose={() => setEdgeDialog(null)}>
        <DialogTitle>Editar Aresta</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Peso" type="number" value={edgeWeight ?? ''} onChange={(e) => setEdgeWeight(Number(e.target.value))} sx={{ mt: 1 }} />
          <Typography variant="caption">Orientação</Typography>
          <ToggleButtonGroup value={edgeOrientation} exclusive onChange={(e, val) => setEdgeOrientation(val)}>
            <ToggleButton value="left">← Esquerda</ToggleButton>
            {/* ambos fica desabilitado quando já há duas arestas entre os mesmos nós */}
            <ToggleButton value="both" disabled={hasTwoEdgesBetween}>↔ Ambos</ToggleButton>
            <ToggleButton value="right">Direita →</ToggleButton>
          </ToggleButtonGroup>
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