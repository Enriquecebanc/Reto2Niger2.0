import React, { useEffect, useState, useRef } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import { getProveedores, crearProveedor, actualizarProveedor, eliminarProveedor } from '../services/proveedoresService';



const STORAGE_KEY = 'proveedores_simple_v2';
const TIPOS_PRODUCTO = ['LED Rojo', 'LED Verde', 'LED Amarillo', 'Maceta de plástico Pequeño', 'Maceta de plástico Mediano', 'Maceta de plástico Grande', 'Sensor de humedad', 'Sensor de luz', 'Batería'];
const TAMAÑOS = ['Pequeña', 'Mediana', 'Grande'];

// Usar tema claro para no forzar modo oscuro en este módulo
const theme = createTheme({
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

// Ejemplos de proveedores compatibles con el modelo del backend (fallback)
const EJEMPLOS_PROVEEDORES = [
  { _id: 'ex1', nombre: 'TecnoSensores SL', telefono: '612345678', correo: 'contacto@tecnosensores.com', direccion: 'Calle Falsa 123' },
  { _id: 'ex2', nombre: 'Energía Verde SA', telefono: '699887766', correo: 'ventas@energiaverde.es', direccion: 'Av. Verde 45' },
  { _id: 'ex3', nombre: 'Plásticos Norte', telefono: '688551122', correo: 'info@plasticosnorte.com', direccion: 'Pol. Ind. Norte, Parc. 9' }
];

const ProveedoresPage = () => {
  const [proveedores, setProveedores] = useState([]);
  const [dataSource, setDataSource] = useState('loading');
  const mountedRef = useRef(true);
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState(null);
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

  // Función que consulta la API y normaliza resultados
  const fetchProveedoresFromApi = async () => {
    const data = await getProveedores();
    return data.map((p) => {
      let tipos = [];
      if (Array.isArray(p.productos) && p.productos.length > 0) {
        tipos = p.productos.map((pr) => pr.pieza_id ? (pr.pieza_id.nombre || pr.pieza_id.tipo || '') : '').filter(Boolean);
      }
      return {
        id: p._id,
        nombre: p.nombre || '',
        direccion: p.direccion || p.direccion || '',
        telefono: p.telefono || '',
        correo: p.correo || '',
        productos: tipos.join(', ') || '-',
        tamano: p.tamano || p.tamaño || '-',
        tipoProducto: p.tipoProducto || '-',
        raw: p,
      };
    });
  };

  const loadData = async () => {
    setLoading(true);
    setLastError(null);
    try {
      const mapped = await fetchProveedoresFromApi();
      if (!mountedRef.current) return;
      setProveedores(mapped);
      setDataSource('api');
    } catch (err) {
      console.error('No se pudieron cargar proveedores desde API, usando ejemplos', err);
      setLastError(err.message || String(err));
      setProveedores(EJEMPLOS_PROVEEDORES.map((p) => ({ id: p._id, nombre: p.nombre, direccion: p.direccion, telefono: p.telefono, correo: p.correo, productos: '-', tamano: '-', tipoProducto: '-' })));
      setDataSource('examples');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    loadData();
    return () => { mountedRef.current = false; };
  }, []);
  

  const handleGuardar = () => {
    if (!nombre.trim() || !telefono.trim()) {
      alert('Por favor completa los campos obligatorios: nombre y teléfono.');
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      correo: email.trim(),
      direccion: contacto.trim(),
      tamano: tamaño,
      tipoProducto: tipoProducto,
    };

    const guardar = async () => {
      try {
        console.log('Proveedores - payload a enviar:', payload);
        let result = null;
        if (editingId) {
          result = await actualizarProveedor(editingId, payload);
          console.log('Proveedores - respuesta PUT:', result);
        } else {
          result = await crearProveedor(payload);
          console.log('Proveedores - respuesta POST:', result);
        }
        await loadData();
        handleCerrarDialog();
        return result;
      } catch (err) {
        console.error('Error guardando proveedor:', err);
        alert('Error al guardar proveedor');
        throw err;
      }
    };

    guardar();
  };

  const handleEditar = (id) => {
    const p = proveedores.find((prov) => prov.id === id);
    if (p) {
      setEditingId(p.id);
      setNombre(p.nombre || '');
      setContacto(p.direccion || '');
      setTelefono(p.telefono || '');
      setEmail(p.correo || '');
      setTamaño((p.tamano && p.tamano !== '-') ? p.tamano : (p.raw && (p.raw.tamano || p.raw.tamaño)) || 'Mediana');
      setTipoProducto((p.tipoProducto && p.tipoProducto !== '-') ? p.tipoProducto : (p.raw && p.raw.tipoProducto) || TIPOS_PRODUCTO[0]);
      setOpenDialog(true);
    }
  };

  const handleEliminar = (id) => {
    if (window.confirm('¿Eliminar este proveedor?')) {
      const borrar = async () => {
        try {
          await eliminarProveedor(id);
          setProveedores((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
          console.error('Error eliminando proveedor:', err);
          alert('Error al eliminar proveedor');
        }
      };
      borrar();
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
      (p.direccion || '').toLowerCase().includes(texto) ||
      (p.telefono || '').toLowerCase().includes(texto) ||
      (p.correo || '').toLowerCase().includes(texto) ||
      (p.productos || '').toLowerCase().includes(texto)
    );
  });

  const columns = [
    { field: 'nombre', headerName: 'Proveedor', flex: 1.2 },
    { field: 'direccion', headerName: 'Dirección', flex: 1 },
    { field: 'telefono', headerName: 'Teléfono', flex: 1 },
    { field: 'correo', headerName: 'Correo', flex: 1 },
    { field: 'tipoProducto', headerName: 'Tipo', flex: 0.8 },
    { field: 'tamano', headerName: 'Tamaño', width: 120 },
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        py: 3, 
        px: 5, 
        minHeight: '100vh', 
        backgroundColor: colors.background,
        width: '100%',
        boxSizing: 'border-box',
        margin: 0
      }}>
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

          <Button variant="outlined" onClick={() => { loadData(); }}>
            {loading ? 'Sincronizando...' : 'Sincronizar BD'}
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
        {/* Si no hay proveedores cargados, mostrar mensaje útil en lugar de pantalla en blanco */}
        {proveedores.length === 0 ? (
          <Paper sx={{ width: '100%', p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{loading ? 'Cargando proveedores...' : 'No hay proveedores cargados'}</Typography>
            {lastError && <Typography sx={{ mb: 2, color: 'error.main' }}>Error: {lastError}</Typography>}
            <Typography sx={{ mb: 2, color: 'text.secondary' }}>Si la carga tarda o falla, puedes cargar ejemplos locales.</Typography>
            <Button variant="outlined" onClick={() => setProveedores(EJEMPLOS_PROVEEDORES.map((p) => ({ ...p, id: p._id })))}>Cargar ejemplos</Button>
          </Paper>
        ) : (
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
                  fontWeight: '700',
                },
                '& .MuiDataGrid-columnHeader': {
                  backgroundColor: colors.backgroundDark,
                  color: colors.textLight,
                },
                '& .MuiDataGrid-cell': {
                  whiteSpace: 'normal',
                  lineHeight: '1.4em',
                  color: colors.text,
                  borderBottom: `1px solid ${colors.borderLight}`,
                },
                '& .MuiDataGrid-row': {
                  '&:hover': {
                    backgroundColor: colors.backgroundLight,
                  },
                },
              }}
            />
          </Paper>
        )}

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
                label="Dirección *"
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
                label="Correo (opcional)"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Box>
                <FormControl fullWidth>
                  <InputLabel id="select-tamano-label">Tamaño</InputLabel>
                  <Select
                    labelId="select-tamano-label"
                    value={tamaño}
                    label="Tamaño"
                    onChange={(e) => setTamaño(e.target.value)}
                  >
                    {TAMAÑOS.map((t) => (
                      <MenuItem key={t} value={t}>{t}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <FormControl fullWidth>
                  <InputLabel id="select-tipo-label">Tipo de producto</InputLabel>
                  <Select
                    labelId="select-tipo-label"
                    value={tipoProducto}
                    label="Tipo de producto"
                    onChange={(e) => setTipoProducto(e.target.value)}
                  >
                    {TIPOS_PRODUCTO.map((tipo) => (
                      <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
      </Box>
    </ThemeProvider>
  );
};

export default ProveedoresPage;