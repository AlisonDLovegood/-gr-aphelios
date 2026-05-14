import Navbar from '../components/navbar.jsx'
import GraphToolbar from '../components/GraphToolBar.jsx'
import StatusBar from '../components/StatusBar.jsx'
import GraphCanvas from '../components/GraphCanvas.jsx'
import AlgorithmsBar from '../components/AlgorithmsBar.jsx'
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