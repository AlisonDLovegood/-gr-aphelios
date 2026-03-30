import Navbar from '../components/Navbar'
import GraphToolbar from '../components/GraphToolBar'
import StatusBar from '../components/StatusBar'
import GraphCanvas from '../components/GraphCanvas'
import AlgorithmsBar from '../components/AlgorithmsBar'
import { Box } from '@mui/material'

function Home() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '97vh' }}>
      
      <Navbar />

      <Box sx={{ display: 'flex', height: '100%' }}>
        
        <GraphToolbar />

        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <GraphCanvas />
          <StatusBar />
        </Box>

        <AlgorithmsBar />

      </Box>

    </Box>
  )
}

export default Home