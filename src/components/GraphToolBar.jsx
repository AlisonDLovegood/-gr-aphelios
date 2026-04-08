import { Paper, ToggleButtonGroup, ToggleButton } from '@mui/material'
import NearMeIcon from '@mui/icons-material/NearMe'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import LinearScaleIcon from '@mui/icons-material/LinearScale'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import PanToolIcon from '@mui/icons-material/PanTool'
import Typography from '@mui/material/Typography';
import useGraphStore from '../store/GraphStore'


const tools = [
  { value: 'select', label: 'Selecionar', icon: <NearMeIcon /> },
  { value: 'addNode', label: 'Add Nó', icon: <AddCircleOutlineIcon /> },
  { value: 'addEdge', label: 'Add Aresta', icon: <LinearScaleIcon /> },
  { value: 'delete', label: 'Remover', icon: <DeleteOutlineIcon /> },
  { value: 'control', label: 'Controlar', icon: <PanToolIcon /> },
]

function GraphToolbar() {
  const activeTool = useGraphStore((state) => state.activeTool)
  const setActiveTool = useGraphStore((state) => state.setActiveTool)

  const handleToolChange = (e, newTool) => {
    if (newTool !== null) setActiveTool(newTool)
  }

  return (
    <Paper elevation={3} sx={{ width: '7vh', height: '100%', mr: 2, }}>
      <ToggleButtonGroup
        orientation="vertical"
        value={activeTool}
        exclusive
        onChange={handleToolChange}
        sx={{
          width: '100%',
          '& .MuiToggleButton-root': {
            border: 'none'
          }
        }}
      >
        {tools.map(({ value, label, icon }) => (
          <ToggleButton key={value} value={value} sx={{ height: '7vh', flexDirection: 'column', gap: 0.5, textTransform: 'none' }}>
            {icon}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Paper>
  )
}

export default GraphToolbar