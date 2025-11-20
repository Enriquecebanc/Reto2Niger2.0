// Importaciones principales de React
import React, { useEffect, useState, useRef } from 'react';

// Importaciones de Material UI
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

// Iconos
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';

// Assets y componentes propios
import logoNiger from '../assets/Niger.png';
import BarraBusqueda from '../componentes/barraBusqueda.jsx';
import { colors } from '../styles/commonStyles.js';

// Servicios del backend
import { getProveedores, crearProveedor, actualizarProveedor, eliminarProveedor } from '../services/proveedoresService';

// Keys y constantes
const STORAGE_KEY = 'proveedores_simple_v2';

// Tipos de producto para el selector
const TIPOS_PRODUCTO = ['LED Rojo', 'LED Verde', 'LED Amarillo', 'Maceta de plástico Pequeño', 'Maceta de plástico Mediano', 'Maceta de plástico Grande', 'Sensor de humedad', 'Sensor de luz', 'Batería'];

// Tamaños disponibles
const TAMAÑOS = ['Pequeña', 'Mediana', 'Grande'];

// Tema personalizado (oscuro)
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

// Datos de ejemplo en caso de fallar la API
const EJEMPLOS_PROVEEDORES = [
  { _id: 'ex1', nombre: 'TecnoSensores SL', telefono: '612345678', correo: 'contacto@tecnosensores.com', direccion: 'Calle Falsa 123' },
  { _id: 'ex2', nombre: 'Energía Verde SA', telefono: '699887766', correo: 'ventas@energiaverde.es', direccion: 'Av. Verde 45' },
  { _id: 'ex3', nombre: 'Plásticos Norte', telefono: '688551122', correo: 'info@plasticosnorte.com', direccion: 'Pol. Ind. Norte, Parc. 9' }
];

const ProveedoresPage = () => {

  // Estado principal
  const [proveedores, setProveedores] = useState([]);
  const [dataSource, setDataSource] = useState('loading'); // De dónde provienen los datos: API o ejemplos
  const mountedRef = useRef(true); // Para evitar actualizar estado tras un desmontado
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState(null);

  // Estados para el diálogo y edición
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Estado del buscador
  const [searchTerm, setSearchTerm] = useState('');

  // Campos del formulario del proveedor
  const [nombre, setNombre] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [tamaño, setTamaño] = useState('Mediana');
  const [tipoProducto, setTipoProducto] = useState(TIPOS_PRODUCTO[0]);

  // Función para consultar proveedores de la API y normalizar estructura
  const fetchProveedoresFromApi = async () => {
    const data = await getProveedores();

    return data.map((p) => {
      let tipos = [];

      // Extrae tipos desde la lista de productos asociada
      if (Array.isArray(p.productos) && p.productos.length > 0) {
        tipos = p.productos
          .map((pr) =>
            pr.pieza_id ? (pr.pieza_id.nombre || pr.pieza_id.tipo || '') : ''
          )
          .filter(Boolean);
      }

      // Normaliza el objeto que se muestra en la tabla
      return {
        id: p._id,
        nombre: p.nombre || '',
        direccion: p.direccion || '',
        telefono: p.telefono || '',
        correo: p.correo || '',
        productos: tipos.join(', ') || '-',
        tamano: p.tamano || p.tamaño || '-',
        tipoProducto: p.tipoProducto || '-',
        raw: p, // Guarda el objeto completo para reutilizarlo
      };
    });
  };

  // Cargar proveedores desde API con fallback a ejemplos
  const loadData = async () => {
    setLoading(true);
    setLastError(null);

    try {
      const mapped = await fetchProveedoresFromApi();

      if (!mountedRef.current) return; // Evita actualizar si el componente ya no está montado

      setProveedores(mapped);
      setDataSource('api');

    } catch (err) {
      // Si la API falla, se usan datos locales
      console.error('No se pudieron cargar proveedores desde API, usando ejemplos', err);
      setLastError(err.message || String(err));

      setProveedores(
        EJEMPLOS_PROVEEDORES.map((p) => ({
          id: p._id,
          nombre: p.nombre,
          direccion: p.direccion,
          telefono: p.telefono,
          correo: p.correo,
          productos: '-',
          tamano: '-',
          tipoProducto: '-',
        }))
      );

      setDataSource('examples');
    } finally {
      setLoading(false);
    }
  };

  // Se ejecuta al montar el componente
  useEffect(() => {
    mountedRef.current = true;
    loadData();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Guardar o actualizar proveedor
  const handleGuardar = () => {

    // Validación básica
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
        let result = null;

        if (editingId) {
          // Modo edición
          result = await actualizarProveedor(editingId, payload);
        } else {
          // Crear nuevo proveedor
          result = await crearProveedor(payload);
        }

        await loadData(); // Recargar datos
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

  // Cargar datos en el modal al editar
  const handleEditar = (id) => {
    const p = proveedores.find((prov) => prov.id === id);

    if (p) {
      setEditingId(p.id);
      setNombre(p.nombre || '');
      setContacto(p.direccion || '');
      setTelefono(p.telefono || '');
      setEmail(p.correo || '');
      setTamaño(p.tamano !== '-' ? p.tamano : 'Mediana');
      setTipoProducto(p.tipoProducto !== '-' ? p.tipoProducto : TIPOS_PRODUCTO[0]);
      setOpenDialog(true);
    }
  };

  // Eliminar proveedor
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

  // Cerrar diálogo y limpiar campos
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

  // Filtrado de la tabla con el buscador
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

  // Columnas de la tabla DataGrid
  const columns = [
    { field: 'nombre', headerName: 'Proveedor', flex: 1.2 },
    { field: 'direccion', headerName: 'Dirección', flex: 1 },
    { field: 'telefono', headerName: 'Teléfono', flex: 1 },
    { field: 'correo', headerName: 'Correo', flex: 1 },
    { field: 'tipoProducto', headerName: 'Tipo', flex: 0.8 },
    { field: 'tamano', headerName: 'Tamaño', width: 120 },

    // Columna de acciones (editar / eliminar)
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
      <CssBaseline /> {/* Resetea estilos por defecto */}

      <Box
        sx={{
          py: 3,
          px: 5,
          minHeight: '100vh',
          backgroundColor: colors.background,
        }}
      >

        {/* Encabezado con el logo y barra de búsqueda */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <img src={logoNiger} alt="Niger Logo" style={{ width: 80 }} />
          <Box sx={{ flex: 1 }}>
            <BarraBusqueda />
          </Box>
        </Box>

        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
          Gestión de Proveedores
        </Typography>

        {/* Botones superiores */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Nuevo Proveedor
          </Button>

          <Button variant="outlined" onClick={loadData}>
            {loading ? 'Sincronizando...' : 'Sincronizar BD'}
          </Button>

          {/* Buscador */}
          <Box sx={{ flexGrow: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Buscar proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1 }} />,
              }}
            />
          </Box>
        </Stack>

        {/* Si no hay proveedores */}
        {proveedores.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6">
              {loading ? 'Cargando proveedores...' : 'No hay proveedores cargados'}
            </Typography>

            {lastError && (
              <Typography sx={{ color: 'error.main' }}>Error: {lastError}</Typography>
            )}

            <Button onClick={() =>
              setProveedores(EJEMPLOS_PROVEEDORES.map((p) => ({ ...p, id: p._id })))
            }>
              Cargar ejemplos
            </Button>
          </Paper>
        ) : (

          // Tabla DataGrid
          <Paper sx={{ height: 440, p: 1 }}>
            <DataGrid
              rows={proveedoresFiltrados}
              columns={columns}
              pageSizeOptions={[5, 10]}
              disableRowSelectionOnClick
            />
          </Paper>
        )}

        {/* Diálogo para agregar / editar proveedor */}
        <Dialog open={openDialog} onClose={handleCerrarDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </DialogTitle>

          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
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

              {/* Selector Tamaño */}
              <FormControl fullWidth>
                <InputLabel id="select-tamano-label">Tamaño</InputLabel>
                <Select
                  labelId="select-tamano-label"
                  value={tamaño}
                  onChange={(e) => setTamaño(e.target.value)}
                >
                  {TAMAÑOS.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Selector Tipo Producto */}
              <FormControl fullWidth>
                <InputLabel id="select-tipo-label">Tipo de producto</InputLabel>
                <Select
                  labelId="select-tipo-label"
                  value={tipoProducto}
                  onChange={(e) => setTipoProducto(e.target.value)}
                >
                  {TIPOS_PRODUCTO.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCerrarDialog}>Cancelar</Button>
            <Button variant="contained" onClick={handleGuardar}>
              {editingId ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};
d
export default ProveedoresPage;
