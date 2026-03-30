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
import AdbIcon from '@mui/icons-material/Adb';
import WidgetsIcon from '@mui/icons-material/Widgets';
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import WindowIcon from '@mui/icons-material/Window';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const academyItems = ['Monografia', 'GitHub'];

const actionItems = [
  {
    value: 'Importar',
    icon: <UploadIcon />,
    itemsMenu: [
      { label: 'Importar Grafo', icon: <UploadIcon /> },
      { label: 'Importar Matriz de Adjacência', icon: <DashboardCustomizeIcon /> },
    ]
  },
  {
    value: 'Exportar',
    icon: <DownloadIcon />,
    itemsMenu: [
      { label: 'Exportar Grafo', icon: <DownloadIcon /> },
      { label: 'Exportar Matriz de Adjacência', icon: <WindowIcon /> },
    ]
  },
  {
    value: 'grafo',
    icon: <WidgetsIcon />,
    itemsMenu: [
      { label: 'Novo Grafo', icon: <AddIcon /> },
      { label: 'Limpar Canvas', icon: <DeleteOutlineIcon /> },
    ]
  },
]

function Navbar() {
  const [anchors, setAnchors] = React.useState({});

  const handleOpen = (event, value) => setAnchors((prev) => ({ ...prev, [value]: event.currentTarget }));
  const handleClose = (value) => setAnchors((prev) => ({ ...prev, [value]: null }));

  return (
    <AppBar position="static" sx={{ borderRadius: '8px', mb: 2 }}>
      <Container maxWidth="1980">
        <Toolbar sx={{ gap: 2 }}>

          <AdbIcon />

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
                    <MenuItem key={menuItem.label} onClick={() => handleClose(item.value)}>
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
    </AppBar>
  );
}

export default Navbar;