import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import useGraphStore from '../store/GraphStore'

function StatusBar() {
  const nodes = useGraphStore((state) => state.nodes)
  const edges = useGraphStore((state) => state.edges)

  const isDirected = edges.some(e => e.directed === true)
  const isWeighted = edges.some(e => e.weight !== null)

  const statusItems = [
    { label: 'Nós', value: nodes.length },
    { label: 'Arestas', value: edges.length },
    { label: 'Tipo', value: isDirected ? 'Dirigido' : 'Não Dirigido' },
    { label: 'Peso', value: isWeighted ? 'Ponderado' : 'Não Ponderado' },
  ]

  return (
    <Paper
      elevation={3}
      sx={{
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        px: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {statusItems.map((item, index) => (
          <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography variant="caption" sx={{ opacity: 0.6 }}>{item.label}:</Typography>
              <Typography variant="caption">{item.value}</Typography>
            </Box>
            {index < statusItems.length - 1 && (
              <Divider orientation="vertical" flexItem />
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  )
}

export default StatusBar