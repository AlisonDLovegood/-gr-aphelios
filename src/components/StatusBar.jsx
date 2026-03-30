import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

const statusItems = [
  { label: 'Nós', value: 0 },
  { label: 'Arestas', value: 0 },
  { label: 'Tipo', value: 'Não Dirigido' },
  { label: 'Peso', value: 'Não Ponderado' },
]

function StatusBar() {
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

export default StatusBar;