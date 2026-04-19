import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import LastPageIcon from '@mui/icons-material/LastPage'
import TextField from '@mui/material/TextField'
import ButtonGroup from '@mui/material/ButtonGroup'
import Button from '@mui/material/Button'
import StopIcon from '@mui/icons-material/Stop'
import useGraphStore from '../store/GraphStore'
import useAlgorithmValidation from '../hooks/useAlgorithmValidation'


function AlgorithmsBar() {
  const selectedAlgorithm = useGraphStore((state) => state.selectedAlgorithm)
  const isRunning = useGraphStore((state) => state.isRunning)
  const currentStep = useGraphStore((state) => state.currentStep)
  const steps = useGraphStore((state) => state.steps)

  const setAlgorithm = useGraphStore((state) => state.setAlgorithm)
  const startExecution = useGraphStore((state) => state.startExecution)
  const stopExecution = useGraphStore((state) => state.stopExecution)
  const nextStep = useGraphStore((state) => state.nextStep)
  const prevStep = useGraphStore((state) => state.prevStep)
  const firstStep = useGraphStore((state) => state.firstStep)
  const lastStep = useGraphStore((state) => state.lastStep)

  const validation = useAlgorithmValidation()

  const currentPseudocode = steps.length > 0 && isRunning
    ? steps[currentStep]?.pseudocode ?? ''
    : ''

  const handlePlay = () => {
    const alg = validation.find(a => a.id === selectedAlgorithm)
    if (!alg) return
    startExecution(alg.run())
  }

  return (
    <Paper elevation={3} sx={{ width: '25vw', minWidth: '25vw', height: '100%', display: 'flex', flexDirection: 'column', ml: 1 }}>

      {/* SEÇÃO ALGORITMOS */}
      <Box sx={{ overflow: 'auto', p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          Algoritmos
        </Typography>

        <List dense>
          {validation
            .filter(alg => alg.canRun)
            .map(alg => (
              <ListItemButton
                key={alg.id}
                selected={selectedAlgorithm === alg.id}
                onClick={() => setAlgorithm(alg.id)}
              >
                <ListItemText primary={alg.label} />
              </ListItemButton>
            ))}
        </List>
      </Box>

      <Divider sx={{ mt: 'auto' }} />

      {/* SEÇÃO EXECUÇÃO */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          Execução
        </Typography>

        <TextField
          multiline
          rows={10}
          value={currentPseudocode}
          placeholder="Selecione um algoritmo e clique em executar"
          slotProps={{ input: { readOnly: true } }}
          sx={{ '& .MuiInputBase-input': { fontSize: '12px' } }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ButtonGroup size="small" fullWidth>
            <Button onClick={firstStep} disabled={!isRunning}><FirstPageIcon /></Button>
            <Button onClick={prevStep} disabled={!isRunning}><ChevronLeftIcon /></Button>
            <Button onClick={handlePlay} disabled={!selectedAlgorithm || isRunning}><PlayArrowIcon /></Button>
            <Button onClick={nextStep} disabled={!isRunning}><ChevronRightIcon /></Button>
            <Button onClick={lastStep} disabled={!isRunning}><LastPageIcon /></Button>
            <Button color="error" onClick={stopExecution} disabled={!isRunning}><StopIcon /></Button>
          </ButtonGroup>
        </Box>

      </Box>

    </Paper>
  )
}

export default AlgorithmsBar