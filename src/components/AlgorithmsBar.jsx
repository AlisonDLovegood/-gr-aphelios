import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import StopIcon from '@mui/icons-material/Stop';

function AlgorithmsBar() {
  return (
    <Paper elevation={3} sx={{ width: '35vh', height: '100%', display: 'flex', flexDirection: 'column', ml: 2 }}>

      {/* SEÇÃO ALGORITMOS */}
      <Box sx={{ overflow: 'auto', p: 2 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 900 }}>
          Algoritmos
        </Typography>

        <List dense>
          {/* lista dinâmica virá do Zustand futuramente */}
        </List>
      </Box>

      <Divider sx={{ mt: 'auto' }} />

      {/* SEÇÃO EXECUÇÃO */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 900 }}>
          Execução
        </Typography>

        {/* PSEUDOCÓDIGO */}
        <TextField
          multiline
          rows={10}
          placeholder="PSEUDO"
          slotProps={{ input: { readOnly: true } }}
          sx={{ '& .MuiInputBase-input': { fontSize: '12px' } }}
        />

        {/* CONTROLES */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ButtonGroup size="small" fullWidth>
            <Button><FirstPageIcon /></Button>
            <Button><ChevronLeftIcon /></Button>
            <Button><PlayArrowIcon /></Button>
            <Button><ChevronRightIcon /></Button>
            <Button><LastPageIcon /></Button>
            <Button color="error"><StopIcon /></Button>
          </ButtonGroup>
        </Box>

      </Box>

    </Paper>
  )
}

export default AlgorithmsBar;