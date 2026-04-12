import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import useGraphAnalysis from '../hooks/useGraphAnalysis'

function StatusBar() {
  const {
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
  } = useGraphAnalysis()

  const statusItems = [
    { label: 'Nós', value: nodeCount },
    { label: 'Arestas', value: edgeCount },
    { label: 'Dirigido', value: isDirected ? 'Sim' : 'Não' },
    { label: 'Ponderado', value: isWeighted ? 'Sim' : 'Não' },
    { label: 'Completo', value: isComplete ? 'Sim' : 'Não' },
    { label: 'Regular', value: isRegular ? 'Sim' : 'Não' },
    { label: 'Conexo', value: isConnected ? 'Sim' : 'Não' },
    { label: 'Acíclico', value: isAcyclic ? 'Sim' : 'Não' },
    { label: 'Árvore', value: isTree ? 'Sim' : 'Não' },
    { label: 'Bipartido', value: isBipartite ? 'Sim' : 'Não' },
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