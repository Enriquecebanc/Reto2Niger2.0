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

// CSS HORRIPILANTE CON ANIMACIONES RIDÍCULAS
const horribileStyles = `
  @keyframes spinFlip {
    0% { transform: rotateX(0deg) rotateY(0deg) scale(1); }
    25% { transform: rotateX(360deg) rotateY(180deg) scale(1.2); }
    50% { transform: rotateX(0deg) rotateY(360deg) scale(0.8); }
    75% { transform: rotateX(180deg) rotateY(180deg) scale(1.3); }
    100% { transform: rotateX(360deg) rotateY(360deg) scale(1); }
  }
  
  @keyframes pulsateMonster {
    0% { transform: scale(1) skew(0deg); box-shadow: 0 0 5px #ff00ff, 0 0 10px #00ffff; }
    50% { transform: scale(1.15) skew(5deg); box-shadow: 0 0 20px #ffff00, 0 0 30px #ff00ff, inset 0 0 10px #00ff00; }
    100% { transform: scale(1) skew(0deg); box-shadow: 0 0 5px #ff00ff, 0 0 10px #00ffff; }
  }
  
  @keyframes glitchFlash {
    0% { background: #ff00ff; clip-path: polygon(0 0, 100% 0, 100% 30%, 0 30%); }
    20% { background: #00ffff; clip-path: polygon(0 70%, 100% 70%, 100% 100%, 0 100%); }
    40% { background: #ffff00; clip-path: polygon(0 0, 100% 0, 100% 50%, 0 50%); }
    60% { background: #ff0000; clip-path: polygon(0 50%, 100% 50%, 100% 100%, 0 100%); }
    80% { background: #00ff00; clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%); }
    100% { background: #0000ff; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
  }
  
  @keyframes rainbowShift {
    0% { background-color: #ff0000; text-shadow: 0 0 10px #00ff00; }
    16% { background-color: #ff7700; text-shadow: 0 0 10px #ff00ff; }
    33% { background-color: #ffff00; text-shadow: 0 0 10px #00ffff; }
    50% { background-color: #00ff00; text-shadow: 0 0 10px #ff0000; }
    66% { background-color: #0000ff; text-shadow: 0 0 10px #ffff00; }
    83% { background-color: #ff00ff; text-shadow: 0 0 10px #00ff00; }
    100% { background-color: #ff0000; text-shadow: 0 0 10px #00ff00; }
  }
  
  @keyframes wiggleShake {
    0% { transform: translateX(0) rotateZ(0deg); }
    10% { transform: translateX(-3px) rotateZ(-1deg); }
    20% { transform: translateX(3px) rotateZ(1deg); }
    30% { transform: translateX(-3px) rotateZ(-1deg); }
    40% { transform: translateX(3px) rotateZ(1deg); }
    50% { transform: translateX(-3px) rotateZ(-2deg); }
    60% { transform: translateX(3px) rotateZ(2deg); }
    70% { transform: translateX(-3px) rotateZ(-1deg); }
    80% { transform: translateX(3px) rotateZ(1deg); }
    90% { transform: translateX(-3px) rotateZ(-1deg); }
    100% { transform: translateX(0) rotateZ(0deg); }
  }
  
  @keyframes bounceInsane {
    0% { transform: translateY(0) scale(1); }
    25% { transform: translateY(-20px) scale(1.1) rotateX(20deg); }
    50% { transform: translateY(0) scale(0.95); }
    75% { transform: translateY(-10px) scale(1.05) rotateX(-15deg); }
    100% { transform: translateY(0) scale(1); }
  }
  
  @keyframes colorBomb {
    0% { filter: hue-rotate(0deg) saturate(100%) brightness(100%); }
    25% { filter: hue-rotate(90deg) saturate(200%) brightness(150%); }
    50% { filter: hue-rotate(180deg) saturate(50%) brightness(80%); }
    75% { filter: hue-rotate(270deg) saturate(300%) brightness(120%); }
    100% { filter: hue-rotate(360deg) saturate(100%) brightness(100%); }
  }
  
  @keyframes textWave {
    0% { transform: translateY(0px); }
    25% { transform: translateY(-5px); }
    50% { transform: translateY(5px); }
    75% { transform: translateY(-5px); }
    100% { transform: translateY(0px); }
  }
  
  .horripilante-container {
    animation: rainbowShift 3s infinite;
    border: 5px dashed #ff1493;
    border-radius: 20px;
    box-shadow: 
      0 0 20px #ff00ff,
      0 0 40px #00ffff,
      0 0 60px #ffff00,
      inset 0 0 20px rgba(255, 0, 255, 0.5);
    position: relative;
    overflow: hidden;
    background: linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #00ff00, #ff0000);
    background-size: 400% 400%;
  }
  
  .horripilante-button {
    animation: pulsateMonster 0.8s infinite, wiggleShake 2s infinite !important;
    background: linear-gradient(135deg, #ff00ff, #00ffff, #ffff00, #ff0000) !important;
    background-size: 200% 200%;
    border: 3px solid #00ff00 !important;
    text-shadow: 2px 2px 4px #000, -1px -1px 2px #fff;
    font-weight: 900 !important;
    letter-spacing: 2px;
    transform: perspective(1000px);
  }
  
  .horripilante-button:hover {
    animation: glitchFlash 0.5s infinite, bounceInsane 0.6s infinite !important;
    box-shadow: 
      0 0 10px #ff00ff,
      0 0 20px #00ffff,
      0 0 30px #ffff00,
      inset 0 0 15px rgba(0, 255, 0, 0.8) !important;
    transform: scale(1.15) rotateZ(5deg);
  }
  
  .horripilante-title {
    animation: textWave 1s infinite, colorBomb 4s infinite;
    font-size: 3.5rem !important;
    font-weight: 900 !important;
    letter-spacing: 3px;
    text-shadow: 
      3px 3px 0px #ff00ff,
      6px 6px 0px #00ffff,
      9px 9px 0px #ffff00,
      -1px -1px 0px #ff0000;
    background: linear-gradient(90deg, #ff00ff, #00ffff, #ffff00, #00ff00, #ff0000);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .horripilante-paper {
    animation: pulsateMonster 2s infinite;
    background: linear-gradient(135deg, #1a0033, #330033, #003333) !important;
    border: 4px double #ffff00 !important;
    border-radius: 20px !important;
    box-shadow: 
      0 0 15px #ff00ff,
      0 0 25px #00ffff,
      inset 0 0 20px rgba(255, 0, 255, 0.3);
  }
  
  .horripilante-grid {
    background: linear-gradient(45deg, rgba(255, 0, 255, 0.1), rgba(0, 255, 255, 0.1)) !important;
    border: 2px dashed #00ff00 !important;
    animation: glitchFlash 5s infinite;
  }
  
  .horripilante-input {
    animation: colorBomb 3s infinite !important;
    border: 2px solid #ff00ff !important;
    background: rgba(0, 0, 0, 0.8) !important;
    color: #00ffff !important;
    font-weight: bold !important;
    caret-color: #ffff00 !important;
  }
  
  .horripilante-input::placeholder {
    color: #ff00ff !important;
    opacity: 1 !important;
  }
  
  .horripilante-dialog {
    animation: bounceInsane 1s infinite !important;
  }
  
  .horripilante-dialog .MuiDialog-paper {
    background: linear-gradient(135deg, #ff00ff, #00ffff) !important;
    border: 5px solid #ffff00 !important;
    border-radius: 30px !important;
    box-shadow: 
      0 0 30px #ff00ff,
      0 0 50px #00ffff,
      0 0 70px #ffff00;
  }
`;

// Inyectar estilos horripilantes en el head
if (typeof document !== 'undefined' && !document.getElementById('horripilante-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'horripilante-styles';
  styleSheet.textContent = horribileStyles;
  document.head.appendChild(styleSheet);
}

const STORAGE_KEY = 'proveedores_simple_v2';
const TIPOS_PRODUCTO = ['Sensores', 'Baterías', 'Carcasas plásticas', 'Sensores de riego', 'Electrónica'];
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
      setProveedores(EJEMPLOS_PROVEEDORES.map((p) => ({ id: p._id, nombre: p.nombre, direccion: p.direccion, telefono: p.telefono, correo: p.correo, productos: '-' })));
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
    };

    const guardar = async () => {
      try {
        if (editingId) {
          const updated = await actualizarProveedor(editingId, payload);
          setProveedores((prev) => prev.map((p) => (p.id === editingId ? { ...updated, id: updated._id } : p)));
        } else {
          const created = await crearProveedor(payload);
          setProveedores((prev) => [...prev, { ...created, id: created._id }]);
        }
        handleCerrarDialog();
      } catch (err) {
        console.error('Error guardando proveedor:', err);
        alert('Error al guardar proveedor');
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
      setTamaño('Mediana');
      setTipoProducto(TIPOS_PRODUCTO[0]);
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
    { field: 'productos', headerName: 'Productos', flex: 1 },
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
      <Box className="horripilante-container" sx={{ 
        py: 3, 
        px: 5, 
        minHeight: '100vh', 
        backgroundColor: '#000',
        width: '100%',
        boxSizing: 'border-box',
        margin: 0
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <img src={logoNiger} alt="Niger Logo" style={{ width: 80, height: 'auto', filter: 'hue-rotate(180deg) saturate(200%)', transition: 'transform 0.3s' }} />
          <Box sx={{ flex: 1 }}>
            <BarraBusqueda />
          </Box>
        </Box>
        
        <Typography variant="h4" className="horripilante-title" sx={{ mb: 3 }}>
          🎪 GESTIÓN DE PROVEEDORES 🎪
        </Typography>

  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            className="horripilante-button"
            onClick={() => setOpenDialog(true)}
          >
            ➕ NUEVO PROVEEDOR ➕
          </Button>

          <Button 
            variant="outlined" 
            onClick={() => { loadData(); }}
            className="horripilante-button"
            sx={{ border: '3px dashed #ff00ff !important', color: '#00ffff !important' }}
          >
            {loading ? '⏳ SINCRONIZANDO ⏳' : '🔄 SINCRONIZAR BD 🔄'}
          </Button>

          <Box sx={{ flexGrow: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="🔍 BUSCAR PROVEEDOR DEL CAOS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="horripilante-input"
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: '#ffff00' }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  animation: 'colorBomb 3s infinite',
                  borderRadius: '15px',
                },
              }}
            />
          </Box>
        </Stack>
        {/* Si no hay proveedores cargados, mostrar mensaje útil en lugar de pantalla en blanco */}
        {proveedores.length === 0 ? (
          <Paper className="horripilante-paper" sx={{ width: '100%', p: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ffff00', animation: 'textWave 1s infinite' }}>
              {loading ? '⏳ CARGANDO PROVEEDORES DEL MULTIVERSO ⏳' : '👻 NO HAY PROVEEDORES CARGADOS EN ESTA DIMENSIÓN 👻'}
            </Typography>
            {lastError && <Typography sx={{ mb: 2, color: '#ff00ff', fontWeight: 'bold' }}>❌ ERROR: {lastError}</Typography>}
            <Typography sx={{ mb: 2, color: '#00ffff' }}>Si la carga tarda, los proveedores pueden estar atrapados en otra realidad...</Typography>
            <Button 
              variant="outlined" 
              onClick={() => setProveedores(EJEMPLOS_PROVEEDORES.map((p) => ({ ...p, id: p._id })))}
              className="horripilante-button"
            >
              🌈 CARGAR EJEMPLOS MÁGICOS 🌈
            </Button>
          </Paper>
        ) : (
          <Paper
            className="horripilante-paper"
            sx={{
              width: '100%',
              height: 440,
              p: 1,
            }}
          >
            <DataGrid
              rows={proveedoresFiltrados}
              columns={columns}
              pageSizeOptions={[5, 10]}
              disableRowSelectionOnClick
              className="horripilante-grid"
              sx={{
                width: '100%',
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#ff00ff',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  animation: 'rainbowShift 2s infinite',
                },
                '& .MuiDataGrid-cell': {
                  whiteSpace: 'normal',
                  lineHeight: '1.4em',
                  color: '#00ffff',
                  borderColor: '#ffff00 !important',
                },
                '& .MuiDataGrid-row': {
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 0, 255, 0.3)',
                    animation: 'colorBomb 2s infinite',
                  },
                },
              }}
            />
          </Paper>
        )}

        {/* Dialogo de nuevo/editar proveedor */}
        <Dialog 
          open={openDialog} 
          onClose={handleCerrarDialog} 
          maxWidth="sm" 
          fullWidth
          className="horripilante-dialog"
        >
          <DialogTitle sx={{ 
            backgroundColor: '#ff00ff', 
            color: '#000',
            animation: 'rainbowShift 2s infinite',
            fontSize: '1.8rem',
            fontWeight: 'bold',
            textAlign: 'center',
            textShadow: '2px 2px 4px #00ffff, -1px -1px 2px #ffff00',
          }}>
            {editingId ? '✏️ EDITAR PROVEEDOR INTERGALÁCTICO ✏️' : '➕ NUEVO PROVEEDOR DEL CAOS ➕'}
          </DialogTitle>
          <DialogContent sx={{ 
            pt: 2,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backgroundImage: 'linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(0, 255, 255, 0.1))',
          }}>
            <Stack spacing={2}>
              <TextField
                label="👤 Nombre del Proveedor *"
                fullWidth
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="horripilante-input"
                sx={{
                  '& .MuiInputBase-input': {
                    color: '#00ffff !important',
                    fontWeight: 'bold',
                  },
                  '& .MuiInputLabel-root': {
                    color: '#ffff00 !important',
                    fontWeight: 'bold',
                  },
                }}
              />
              <TextField
                label="📍 Dirección *"
                fullWidth
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                className="horripilante-input"
                sx={{
                  '& .MuiInputBase-input': {
                    color: '#00ffff !important',
                    fontWeight: 'bold',
                  },
                  '& .MuiInputLabel-root': {
                    color: '#ffff00 !important',
                    fontWeight: 'bold',
                  },
                }}
              />
              <TextField
                label="☎️ Teléfono *"
                fullWidth
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="horripilante-input"
                sx={{
                  '& .MuiInputBase-input': {
                    color: '#00ffff !important',
                    fontWeight: 'bold',
                  },
                  '& .MuiInputLabel-root': {
                    color: '#ffff00 !important',
                    fontWeight: 'bold',
                  },
                }}
              />
              <TextField
                label="📧 Correo (opcional)"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="horripilante-input"
                sx={{
                  '& .MuiInputBase-input': {
                    color: '#00ffff !important',
                    fontWeight: 'bold',
                  },
                  '& .MuiInputLabel-root': {
                    color: '#ffff00 !important',
                    fontWeight: 'bold',
                  },
                }}
              />

              <Box sx={{ backgroundColor: 'rgba(255, 0, 255, 0.1)', padding: 2, borderRadius: '10px', border: '2px dashed #00ff00' }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#ffff00', fontWeight: 'bold', animation: 'textWave 1s infinite' }}>
                  📦 TAMAÑO DE LA PIEZA (ELEGIR DIMENSIÓN):
                </Typography>
                <RadioGroup
                  row
                  value={tamaño}
                  onChange={(e) => setTamaño(e.target.value)}
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      color: '#00ffff',
                      fontWeight: 'bold',
                    },
                  }}
                >
                  {TAMAÑOS.map((t) => (
                    <FormControlLabel 
                      key={t} 
                      value={t} 
                      control={<Radio sx={{ color: '#ffff00 !important' }} />} 
                      label={t} 
                    />
                  ))}
                </RadioGroup>
              </Box>

              <Box sx={{ backgroundColor: 'rgba(0, 255, 255, 0.1)', padding: 2, borderRadius: '10px', border: '2px dashed #ff00ff' }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#ffff00', fontWeight: 'bold', animation: 'textWave 1.2s infinite' }}>
                  🎨 TIPO DE PRODUCTO (DEL UNIVERSO):
                </Typography>
                <RadioGroup
                  row
                  value={tipoProducto}
                  onChange={(e) => setTipoProducto(e.target.value)}
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      color: '#00ffff',
                      fontWeight: 'bold',
                    },
                  }}
                >
                  {TIPOS_PRODUCTO.map((tipo) => (
                    <FormControlLabel 
                      key={tipo} 
                      value={tipo} 
                      control={<Radio sx={{ color: '#ffff00 !important' }} />} 
                      label={tipo} 
                    />
                  ))}
                </RadioGroup>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ backgroundColor: '#000', borderTop: '3px solid #ffff00' }}>
            <Button 
              onClick={handleCerrarDialog}
              className="horripilante-button"
              sx={{ color: '#ff0000 !important' }}
            >
              ❌ CANCELAR ❌
            </Button>
            <Button
              variant="contained"
              className="horripilante-button"
              onClick={handleGuardar}
            >
              {editingId ? '💾 ACTUALIZAR 💾' : '✅ GUARDAR ✅'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default ProveedoresPage;
