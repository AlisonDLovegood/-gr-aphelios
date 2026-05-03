import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import WidgetsIcon from '@mui/icons-material/Widgets';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { exportGraph } from '../features/io/exportGraph';
import { exportPNG } from '../features/io/exportPNG';
import { handleImportGraph } from '../features/io/importGraph';
import useGraphStore from '../store/GraphStore';
import logo from '../assets/logo-2.png';

const academyItems = ['Monografia', 'GitHub'];

function Navbar() {
  const clearCanvas = useGraphStore((state) => state.clearCanvas)
  const [anchors, setAnchors] = React.useState({});
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState(null);

  const handleOpen = (event, value) => setAnchors((prev) => ({ ...prev, [value]: event.currentTarget }));
  const handleClose = (value) => setAnchors((prev) => ({ ...prev, [value]: null }));

  const handleMenuAction = (value, action) => {
    handleClose(value)
    if (action === 'openImportGraph') setImportDialogOpen(true)
    else if (typeof action === 'function') action()
  }

  const handleImportConfirm = async () => {
    const error = await handleImportGraph(selectedFile)
    if (error) {
      setImportDialogOpen(false)
      setSelectedFile(null)
      setErrorMessage(error)
    } else {
      setSelectedFile(null)
      setImportDialogOpen(false)
    }
  }

  const handleImportCancel = () => {
    setSelectedFile(null)
    setImportDialogOpen(false)
  }

  const actionItems = [
    {
      value: 'Importar',
      icon: <UploadIcon />,
      itemsMenu: [
        { label: 'Importar Grafo', icon: <UploadIcon />, action: 'openImportGraph' },
      ]
    },
    {
      value: 'Exportar',
      icon: <DownloadIcon />,
      itemsMenu: [
        { label: 'Exportar Grafo', icon: <DownloadIcon />, action: exportGraph },
        { label: 'Exportar Imagem (PNG)', icon: <ImageIcon />, action: exportPNG },
      ]
    },
    {
      value: 'grafo',
      icon: <WidgetsIcon />,
      itemsMenu: [
        { label: 'Limpar Canvas', icon: <DeleteOutlineIcon />, action: clearCanvas },
      ]
    },
  ]

  return (
    <AppBar position="static" sx={{ borderRadius: '8px', mb: 2 }}>
      <Container maxWidth="1980">
        <Toolbar sx={{ gap: 2 }}>

          <img src={logo} alt="logo" style={{ height: 50, width: 'auto' }} />

          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{ fontWeight: 900, color: 'white', letterSpacing: '.3rem', textDecoration: 'none' }}
          >
            (gr)Aphelios
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>

            {academyItems.map((item) => (
              <Button key={item} sx={{ color: 'white', letterSpacing: '.1rem' }}>
                {item}
              </Button>
            ))}

            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.3)', mx: 1 }} />

            {actionItems.map((item) => (
              <React.Fragment key={item.value}>
                <Button
                  startIcon={item.icon}
                  onClick={(e) => handleOpen(e, item.value)}
                  sx={{ color: 'white', letterSpacing: '.1rem' }}
                >
                  {item.value}
                </Button>
                <Menu
                  anchorEl={anchors[item.value]}
                  open={Boolean(anchors[item.value])}
                  onClose={() => handleClose(item.value)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  sx={{ mt: '8px' }}
                >
                  {item.itemsMenu.map((menuItem) => (
                    <MenuItem
                      key={menuItem.label}
                      onClick={() => handleMenuAction(item.value, menuItem.action)}
                    >
                      <ListItemIcon>{menuItem.icon}</ListItemIcon>
                      <Typography>{menuItem.label}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </React.Fragment>
            ))}

          </Box>

        </Toolbar>
      </Container>

      {/* Dialog — Importar Grafo */}
      <Dialog open={importDialogOpen} onClose={handleImportCancel}>
        <DialogTitle>Importar arquivo .JSON</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 2 }}>
          <Button variant="outlined" component="label">
            {selectedFile ? selectedFile.name : 'Selecionar arquivo'}
            <input
              type="file"
              accept=".json"
              hidden
              onChange={(e) => setSelectedFile(e.target.files[0] ?? null)}
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImportCancel}>Cancelar</Button>
          <Button onClick={handleImportConfirm} variant="contained" disabled={!selectedFile}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog — Erro de importação */}
      <Dialog open={Boolean(errorMessage)} onClose={() => setErrorMessage(null)}>
        <DialogContent sx={{ p: 0 }}>
          <Alert severity="error" onClose={() => setErrorMessage(null)}>
            <AlertTitle>Arquivo inválido</AlertTitle>
            {errorMessage}
          </Alert>
        </DialogContent>
      </Dialog>

    </AppBar>
  );
}

export default Navbar;