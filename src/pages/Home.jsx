import Navbar from '../components/Navbar'
import GraphToolbar from '../components/GraphToolBar'
import StatusBar from '../components/StatusBar'
import GraphCanvas from '../components/GraphCanvas'
import AlgorithmsBar from '../components/AlgorithmsBar'
import { Box } from '@mui/material'

function Home() {
  return (
<Box sx={{ display: 'flex', flexDirection: 'column', height: '98vh' }}>

  <Navbar />

  <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>

    <GraphToolbar />

    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0, mx: 1 }}>
      <GraphCanvas />
      <StatusBar />
    </Box>

    <AlgorithmsBar />

  </Box>

</Box>
  )
}

export default Home