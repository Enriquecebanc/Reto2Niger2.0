import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Stack,
  Typography,
  FormControlLabel,
  RadioGroup,
  Radio,
  CssBaseline,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import logoNiger from '../assets/Niger.png';
import BarraBusqueda from '../componentes/barraBusqueda.jsx';
import { colors } from '../styles/commonStyles.js';

const STORAGE_KEY = 'proveedores_simple_v2';
const TIPOS_PRODUCTO = ['Sensores', 'Baterías', 'Carcasas plásticas', 'Sensores de riego', 'Electrónica'];
const TAMAÑOS = ['Pequeña', 'Mediana', 'Grande'];

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: colors.background,
      paper: colors.backgroundLight,
    },
    primary: {
      main: colors.secondary,
    },
    error: {
      main: colors.danger,
    },
    success: {
      main: colors.success,
    },
    text: {
      primary: colors.text,
      secondary: colors.textMuted,
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

const ProveedoresPage = () => {
  const [proveedores, setProveedores] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Campos del formulario
  const [nombre, setNombre] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [tamaño, setTamaño] = useState('Mediana');
  const [tipoProducto, setTipoProducto] = useState(TIPOS_PRODUCTO[0]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setProveedores(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(proveedores));
  }, [proveedores]);

  const handleGuardar = () => {
    if (!nombre.trim() || !contacto.trim() || !telefono.trim()) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    const nuevoProveedor = {
      id: editingId || Date.now(),
      nombre: nombre.trim(),
      contacto: contacto.trim(),
      telefono: telefono.trim(),
      email: email.trim(),
      tamaño,
      tipoProducto,
    };

    if (editingId) {
      setProveedores((prev) =>
        prev.map((p) => (p.id === editingId ? nuevoProveedor : p))
      );
    } else {
      setProveedores((prev) => [...prev, nuevoProveedor]);
    }

    handleCerrarDialog();
  };

  const handleEditar = (id) => {
    const p = proveedores.find((prov) => prov.id === id);
    if (p) {
      setEditingId(p.id);
      setNombre(p.nombre);
      setContacto(p.contacto);
      setTelefono(p.telefono);
      setEmail(p.email || '');
      setTamaño(p.tamaño || 'Mediana');
      setTipoProducto(p.tipoProducto || TIPOS_PRODUCTO[0]);
      setOpenDialog(true);
    }
  };

  const handleEliminar = (id) => {
    if (window.confirm('¿Eliminar este proveedor?')) {
      setProveedores((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleCerrarDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setNombre('');
    setContacto('');
    setTelefono('');
    setEmail('');
    setTamaño('Mediana');
    setTipoProducto(TIPOS_PRODUCTO[0]);
  };

  // 🔍 Filtro de búsqueda
  const proveedoresFiltrados = proveedores.filter((p) => {
    const texto = searchTerm.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(texto) ||
      p.contacto.toLowerCase().includes(texto) ||
      p.telefono.toLowerCase().includes(texto) ||
      (p.email || '').toLowerCase().includes(texto) ||
      (p.tamaño || '').toLowerCase().includes(texto) ||
      (p.tipoProducto || '').toLowerCase().includes(texto)
    );
  });

  const columns = [
    { field: 'nombre', headerName: 'Proveedor', flex: 1.2 },
    { field: 'contacto', headerName: 'Contacto', flex: 1 },
    { field: 'telefono', headerName: 'Teléfono', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'tamaño', headerName: 'Tamaño', flex: 0.8 },
    { field: 'tipoProducto', headerName: 'Tipo', flex: 1 },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => handleEditar(params.row.id)}
          >
            <EditIcon fontSize="small" />
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => handleEliminar(params.row.id)}
          >
            <DeleteIcon fontSize="small" />
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <img src={logoNiger} alt="Niger Logo" style={{ width: 80, height: 'auto' }} />
          <Box sx={{ flex: 1 }}>
            <BarraBusqueda />
          </Box>
        </Box>
        
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: colors.primary }}>
          Gestión de Proveedores
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: colors.secondary,
              '&:hover': { backgroundColor: colors.secondaryHover },
              height: '40px',
            }}
            onClick={() => setOpenDialog(true)}
          >
            Nuevo Proveedor
          </Button>

          <Box sx={{ flexGrow: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Buscar proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: '#aaa' }} />,
              }}
            />
          </Box>
        </Stack>

        <Paper
          sx={{
            width: '100%',
            height: 440,
            p: 1,
            bgcolor: 'background.paper',
          }}
        >
          <DataGrid
            rows={proveedoresFiltrados}
            columns={columns}
            pageSizeOptions={[5, 10]}
            disableRowSelectionOnClick
            sx={{
              width: '100%',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: colors.backgroundDark,
                color: colors.textLight,
                fontWeight: 'bold',
              },
              '& .MuiDataGrid-cell': {
                whiteSpace: 'normal',
                lineHeight: '1.4em',
              },
            }}
          />
        </Paper>

        {/* Dialogo de nuevo/editar proveedor */}
        <Dialog open={openDialog} onClose={handleCerrarDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ backgroundColor: colors.secondary, color: 'white' }}>
            {editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2}>
              <TextField
                label="Nombre del Proveedor *"
                fullWidth
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              <TextField
                label="Persona de Contacto *"
                fullWidth
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
              />
              <TextField
                label="Teléfono *"
                fullWidth
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
              <TextField
                label="Email (opcional)"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Tamaño de la pieza:
                </Typography>
                <RadioGroup
                  row
                  value={tamaño}
                  onChange={(e) => setTamaño(e.target.value)}
                >
                  {TAMAÑOS.map((t) => (
                    <FormControlLabel key={t} value={t} control={<Radio />} label={t} />
                  ))}
                </RadioGroup>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Tipo de producto:
                </Typography>
                <RadioGroup
                  row
                  value={tipoProducto}
                  onChange={(e) => setTipoProducto(e.target.value)}
                >
                  {TIPOS_PRODUCTO.map((tipo) => (
                    <FormControlLabel key={tipo} value={tipo} control={<Radio />} label={tipo} />
                  ))}
                </RadioGroup>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCerrarDialog}>Cancelar</Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: colors.secondary, '&:hover': { backgroundColor: colors.secondaryHover } }}
              onClick={handleGuardar}
            >
              {editingId ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
};

export default ProveedoresPage;
