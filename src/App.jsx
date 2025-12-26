import Box from '@mui/material/Box';
import Navbar from './components/navbar';

function App() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: '#D9D9D9'
      }}
    >
      <Box
        sx={{
          position: 'fixed',
          top: '1%',
          width: '75%',
        }}>

        <Navbar />

      </Box>

    </Box>
  )
}

export default App
