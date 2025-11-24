// Importaciones principales de React y Material-UI para la UI y funcionalidades.
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
import logoNiger from '../assets/Niger-Photoroom.png';
import BarraBusqueda from '../componentes/barraBusqueda.jsx';
import { colors } from '../styles/commonStyles.js';
import { getProveedores, crearProveedor, actualizarProveedor, eliminarProveedor } from '../services/proveedoresService';

// Constante para la clave de almacenamiento local (no usada actualmente)
const STORAGE_KEY = 'proveedores_simple_v2';

// Tipos de productos y tamaños disponibles para los proveedores.
const TIPOS_PRODUCTO = ['LED Rojo', 'LED Verde', 'LED Amarillo', 'Maceta de plástico Pequeño', 'Maceta de plástico Mediano', 'Maceta de plástico Grande', 'Sensor de humedad', 'Sensor de luz', 'Batería'];
const TAMAÑOS = ['Pequeña', 'Mediana', 'Grande'];

// Configuración del tema de Material-UI (modo oscuro, paleta de colores personalizada).
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

// Ejemplos hardcodeados de proveedores, usados como fallback si la API falla.
const EJEMPLOS_PROVEEDORES = [
  { _id: 'ex1', nombre: 'TecnoSensores SL', telefono: '612345678', correo: 'contacto@tecnosensores.com', direccion: 'Calle Falsa 123' },
  { _id: 'ex2', nombre: 'Energía Verde SA', telefono: '699887766', correo: 'ventas@energiaverde.es', direccion: 'Av. Verde 45' },
  { _id: 'ex3', nombre: 'Plásticos Norte', telefono: '688551122', correo: 'info@plasticosnorte.com', direccion: 'Pol. Ind. Norte, Parc. 9' }
];

// Componente principal de la página de proveedores
const ProveedoresPage = () => {
  // Estado para la lista de proveedores y fuente de datos.
  const [proveedores, setProveedores] = useState([]);
  const [dataSource, setDataSource] = useState('loading');
  // Ref para saber si el componente está montado, útil para evitar setState en componentes desmontados.
  const mountedRef = useRef(true);
  const [loading, setLoading] = useState(false); // Estado de carga.
  const [lastError, setLastError] = useState(null); // Último error al cargar datos.
  const [openDialog, setOpenDialog] = useState(false); // Estado para mostrar/ocultar el diálogo de agregar/editar.
  const [editingId, setEditingId] = useState(null); // ID del proveedor editado.
  const [searchTerm, setSearchTerm] = useState(''); // Término de búsqueda.

  // Estados para los campos del formulario (nombre, contacto/dirección, teléfono, email, tamaño, tipo).
  const [nombre, setNombre] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [tamaño, setTamaño] = useState('Mediana');
  const [tipoProducto, setTipoProducto] = useState(TIPOS_PRODUCTO[0]);

  // Función que consulta los proveedores desde la API y los normaliza al formato necesario para la DataGrid.
  const fetchProveedoresFromApi = async () => {
    const data = await getProveedores();
    return data.map((p) => {
      let tipos = [];
      // Extrae los tipos de producto si existen en la respuesta.
      if (Array.isArray(p.productos) && p.productos.length > 0) {
        tipos = p.productos.map((pr) => pr.pieza_id ? (pr.pieza_id.nombre || pr.pieza_id.tipo || '') : '').filter(Boolean);
      }
      return {
        id: p._id, // DataGrid espera 'id' en vez de '_id'.
        nombre: p.nombre || '',
        direccion: p.direccion || '',
        telefono: p.telefono || '',
        correo: p.correo || '',
        productos: tipos.join(', ') || '-',
        tamano: p.tamano || p.tamaño || '-',
        tipoProducto: p.tipoProducto || '-',
        raw: p, // Guarda la respuesta original para posibles usos.
      };
    });
  };

  // Carga los datos de proveedores desde la API, establece el estado de la fuente, carga ejemplos si falla.
  const loadData = async () => {
    setLoading(true);
    setLastError(null);
    try {
      const mapped = await fetchProveedoresFromApi();
      if (!mountedRef.current) return;
      setProveedores(mapped);
      setDataSource('api');
    } catch (err) {
      // Si hay error, muestra fallback local.
      console.error('No se pudieron cargar proveedores desde API, usando ejemplos', err);
      setLastError(err.message || String(err));
      setProveedores(EJEMPLOS_PROVEEDORES.map((p) => ({ id: p._id, nombre: p.nombre, direccion: p.direccion, telefono: p.telefono, correo: p.correo, productos: '-', tamano: '-', tipoProducto: '-' })));
      setDataSource('examples');
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar los proveedores al montar el componente.
  useEffect(() => {
    mountedRef.current = true;
    loadData();
    return () => { mountedRef.current = false; }; // Limpieza al desmontar.
  }, []);
  

  // Maneja guardar nuevo proveedor o actualizar uno existente.
  const handleGuardar = () => {
    // Validación mínima.
    if (!nombre.trim() || !telefono.trim()) {
      alert('Por favor completa los campos obligatorios: nombre y teléfono.');
      return;
    }

    // Construye el objeto proveedor desde los estados.
    const payload = {
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      correo: email.trim(),
      direccion: contacto.trim(),
      tamano: tamaño,
      tipoProducto: tipoProducto,
    };

    // Guarda en la API usando el servicio adecuado (crear o actualizar).
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
        await loadData(); // Recarga la lista después.
        handleCerrarDialog(); // Cierra el diálogo luego.
        return result;
      } catch (err) {
        console.error('Error guardando proveedor:', err);
        alert('Error al guardar proveedor');
        throw err;
      }
    };

    guardar();
  };

  // Rellena los campos del formulario para editar proveedores.
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

  // Elimina un proveedor después de confirmar con el usuario.
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

  // Cierra y reinicia el formulario de diálogo.
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

  // Filtra proveedores por el término de búsqueda (nombre, dirección, teléfono, correo, productos).
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

  // Define las columnas para el DataGrid (visualización de proveedores).
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
      // Botones para editar y eliminar proveedores en cada fila de la tabla.
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

  // Render principal de la página usando ThemeProvider para el tema.
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
        {/* Barra superior con logo y barra de búsqueda */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <img src={logoNiger} alt="Niger Logo" style={{ width: 80, height: 'auto' }} />
          <Box sx={{ flex: 1 }}>
            <BarraBusqueda />
          </Box>
        </Box>
        
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: colors.primary }}>
          Gestión de Proveedores
        </Typography>

        {/* Barra de acciones: Nuevo proveedor, Sincronizar BD, buscador */}
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
            {/* Buscador de proveedores */}
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

        {/* Si no hay proveedores cargados, muestra mensaje amigable y opción de cargar ejemplos locales */}
        {proveedores.length === 0 ? (
          <Paper sx={{ width: '100%', p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{loading ? 'Cargando proveedores...' : 'No hay proveedores cargados'}</Typography>
            {lastError && <Typography sx={{ mb: 2, color: 'error.main' }}>Error: {lastError}</Typography>}
            <Typography sx={{ mb: 2, color: 'text.secondary' }}>Si la carga tarda o falla, puedes cargar ejemplos locales.</Typography>
            <Button variant="outlined" onClick={() => setProveedores(EJEMPLOS_PROVEEDORES.map((p) => ({ ...p, id: p._id })))}>Cargar ejemplos</Button>
          </Paper>
        ) : (
          // Tabla de proveedores usando DataGrid
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
                  color: '#ffffff',
                  fontWeight: '700',
                },
                '& .MuiDataGrid-columnHeader': {
                  backgroundColor: colors.backgroundDark,
                  color: '#ffffff',
                  fontWeight: '700',
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: '700',
                  color: '#ffffff',
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

        {/* Diálogo para crear o editar proveedor */}
        <Dialog open={openDialog} onClose={handleCerrarDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ backgroundColor: colors.secondary, color: 'white' }}>
            {editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2}>
              {/* Campos del formulario */}
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

              {/* Desplegable para tamaño */}
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

              {/* Desplegable para tipo de producto */}
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