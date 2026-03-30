import { Paper, ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material'
import NearMeIcon from '@mui/icons-material/NearMe'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import LinearScaleIcon from '@mui/icons-material/LinearScale'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import PanToolIcon from '@mui/icons-material/PanTool'

const tools = [
  { value: 'select', label: 'Select', icon: <NearMeIcon /> },
  { value: 'addNode', label: 'Add Node', icon: <AddCircleOutlineIcon /> },
  { value: 'addEdge', label: 'Add Edge', icon: <LinearScaleIcon /> },
  { value: 'delete', label: 'Delete', icon: <DeleteOutlineIcon /> },
  { value: 'pan', label: 'Pan/Zoom', icon: <PanToolIcon /> },
]

function GraphToolbar() {
  const activeTool = 'select' // virá do Zustand futuramente
  const handleToolChange = (e, newTool) => { } // conectará ao Zustand futuramente

  return (
    <Paper elevation={3} sx={{ width: '6vh', height: '100%', mr: 2,  }}>
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
          <Tooltip key={value} title={label} placement="right">
            <ToggleButton value={value} sx={{ height: '6vh' }}>
              {icon}
            </ToggleButton>
          </Tooltip>
        ))}
      </ToggleButtonGroup>
    </Paper>
  )
}

export default GraphToolbar