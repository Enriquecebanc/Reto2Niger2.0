import React, { useEffect, useState } from 'react';
import BarraBusqueda from '../componentes/barraBusqueda.jsx';
import logoNiger from '../assets/Niger.png';
import {
  Container,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Paper,
  Stack,
  Typography,
  IconButton,
  Grid,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';

const STORAGE_KEY = 'proveedores_macetas_v1';
const TIPOS_PIEZA = ['Sensores', 'Baterías', 'Carcasas plásticas', 'Sistema de riego', 'Electrónica', 'Otros'];
const TAMAÑOS = ['Pequeña', 'Mediana', 'Grande'];

const ProveedoresPage = () => {
  const [proveedores, setProveedores] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectionModel, setSelectionModel] = useState([]);

  // Form modal
  const [nombre, setNombre] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [tipoPieza, setTipoPieza] = useState('Otros');
  const [tamañosSuministra, setTamañosSuministra] = useState(['Pequeña', 'Mediana', 'Grande']);
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [leadTime, setLeadTime] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // DataGrid
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setProveedores(JSON.parse(raw));
      } else {
        setProveedores([]);
      }
    } catch (e) {
      setProveedores([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(proveedores));
    } catch (e) {
      // ignore storage errors
    }
  }, [proveedores]);

  const handleOpenDialog = () => {
    setEditingId(null);
    setNombre('');
    setContacto('');
    setTelefono('');
    setEmail('');
    setWebsite('');
    setCiudad('');
    setTipoPieza('Otros');
    setTamañosSuministra(['Pequeña', 'Mediana', 'Grande']);
    setPrecioUnitario('');
    setLeadTime('');
    setError('');
    setOpenDialog(true);
  };

  const handleEditProveedor = (id) => {
    const proveedor = proveedores.find((p) => p.id === id);
    if (proveedor) {
      setEditingId(id);
      setNombre(proveedor.nombre);
      setContacto(proveedor.contacto);
      setTelefono(proveedor.telefono);
      setEmail(proveedor.email || '');
      setWebsite(proveedor.website || '');
      setCiudad(proveedor.ciudad || '');
      setTipoPieza(proveedor.tipoPieza || 'Otros');
      setTamañosSuministra(proveedor.tamañosSuministra || []);
      setPrecioUnitario(proveedor.precioUnitario?.toString() || '');
      setLeadTime(proveedor.leadTime?.toString() || '');
      setError('');
      setOpenDialog(true);
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !email || re.test(email);
  };

  const handleAñadir = async () => {
    setError('');
    
    // Validaciones
    if (!nombre.trim()) {
      setError('El nombre del proveedor es obligatorio.');
      return;
    }
    if (!contacto.trim()) {
      setError('El contacto es obligatorio.');
      return;
    }
    if (email && !validateEmail(email)) {
      setError('Email inválido.');
      return;
    }
    const telClean = telefono.replace(/[^0-9]/g, '');
    if (telefono && telClean.length < 6) {
      setError('Teléfono inválido (mínimo 6 dígitos).');
      return;
    }
    if (tamañosSuministra.length === 0) {
      setError('Selecciona al menos un tamaño que suministra.');
      return;
    }
    if (precioUnitario && isNaN(parseFloat(precioUnitario))) {
      setError('El precio unitario debe ser un número válido.');
      return;
    }
    if (leadTime && isNaN(parseInt(leadTime))) {
      setError('El lead time debe ser un número entero (días).');
      return;
    }

    // Guardar o actualizar
    if (editingId) {
      // Editar existente
      setProveedores((s) =>
        s.map((p) =>
          p.id === editingId
            ? {
                ...p,
                nombre: nombre.trim(),
                contacto: contacto.trim(),
                telefono: telefono.trim(),
                email: email.trim(),
                website: website.trim(),
                ciudad: ciudad.trim(),
                tipoPieza,
                tamañosSuministra,
                precioUnitario: precioUnitario ? parseFloat(precioUnitario) : null,
                leadTime: leadTime ? parseInt(leadTime) : null,
              }
            : p
        )
      );
    } else {
      // Crear nuevo
      const nuevoProveedor = {
        id: Date.now(),
        nombre: nombre.trim(),
        contacto: contacto.trim(),
        telefono: telefono.trim(),
        email: email.trim(),
        website: website.trim(),
        ciudad: ciudad.trim(),
        tipoPieza,
        tamañosSuministra: [...tamañosSuministra],
        precioUnitario: precioUnitario ? parseFloat(precioUnitario) : null,
        leadTime: leadTime ? parseInt(leadTime) : null,
        estado: 'activo'
      };
      setProveedores((s) => [...s, nuevoProveedor]);
    }

    // Esperar un tick y luego resetear todo
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Resetear formulario y cerrar dialog
    setNombre('');
    setContacto('');
    setTelefono('');
    setEmail('');
    setWebsite('');
    setCiudad('');
    setTipoPieza('Otros');
    setTamañosSuministra(['Pequeña', 'Mediana', 'Grande']);
    setPrecioUnitario('');
    setLeadTime('');
    setError('');
    setEditingId(null);
    setOpenDialog(false);
  };

  const handleEliminar = (id) => {
    setDeleteId(id);
    setOpenConfirmDialog(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setProveedores((s) => s.filter((p) => p.id !== deleteId));
    }
    setOpenConfirmDialog(false);
    setDeleteId(null);
  };

  const handleEliminarSeleccionados = () => {
    setProveedores((s) => s.filter((p) => !selectionModel.includes(p.id)));
    setSelectionModel([]);
  };

  const handleExportarCSV = () => {
    setLoading(true);
    setTimeout(() => {
      const csv = [
        ['Nombre', 'Contacto', 'Teléfono', 'Email', 'Website', 'Ciudad', 'Tipo Pieza', 'Tamaños', 'Precio Unit.', 'Lead Time (días)', 'Estado'],
        ...proveedoresFiltrados.map((p) => [
          p.nombre,
          p.contacto,
          p.telefono,
          p.email || '',
          p.website || '',
          p.ciudad || '',
          p.tipoPieza || '',
          p.tamañosSuministra?.join(', ') || '',
          p.precioUnitario ? `€${p.precioUnitario.toFixed(2)}` : '',
          p.leadTime || '',
          p.estado || 'activo'
        ])
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `proveedores_macetas_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setLoading(false);
    }, 300);
  };

  const handleLimpiarFiltros = () => {
    setFiltro('');
  };

  const proveedoresFiltrados = proveedores.filter((p) => {
    const q = filtro.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(q) ||
      p.contacto.toLowerCase().includes(q) ||
      (p.telefono && p.telefono.includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.ciudad && p.ciudad.toLowerCase().includes(q)) ||
      (p.tipoPieza && p.tipoPieza.toLowerCase().includes(q))
    );
  });

  const columns = [
    { field: 'nombre', headerName: 'Proveedor', flex: 1.2, minWidth: 200 },
    { field: 'tipoPieza', headerName: 'Tipo Pieza', flex: 1, minWidth: 140 },
    { field: 'tamaños', headerName: 'Tamaños', flex: 1, minWidth: 150 },
    { field: 'precioUnitario', headerName: 'Precio Unit.', flex: 0.8, minWidth: 120 },
    { field: 'leadTime', headerName: 'Lead Time', flex: 0.8, minWidth: 100 },
    { field: 'ciudad', headerName: 'Ciudad', flex: 0.8, minWidth: 100 },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Editar">
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleEditProveedor(params.row.id)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              color="error"
              size="small"
              onClick={() => handleEliminar(params.row.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const rows = proveedoresFiltrados.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    tipoPieza: p.tipoPieza || '-',
    tamaños: p.tamañosSuministra?.join(', ') || '-',
    precioUnitario: p.precioUnitario ? `€${p.precioUnitario.toFixed(2)}` : '-',
    leadTime: p.leadTime ? `${p.leadTime}d` : '-',
    ciudad: p.ciudad || '-',
  }));

  const stats = [
    { label: 'Total Proveedores', value: proveedores.length, color: '#2e7d32' },
    { label: 'Resultados Búsqueda', value: proveedoresFiltrados.length, color: '#1976d2' },
    { label: 'Precio Promedio', value: `€${(proveedores.reduce((sum, p) => sum + (p.precioUnitario || 0), 0) / Math.max(proveedores.length, 1)).toFixed(2)}`, color: '#f57c00' },
  ];

  const handleTamañoChange = (e) => {
    const tamaño = e.target.name;
    if (e.target.checked) {
      setTamañosSuministra([...tamañosSuministra, tamaño]);
    } else {
      setTamañosSuministra(tamañosSuministra.filter((t) => t !== tamaño));
    }
  };

  const handleCloseDialog = () => {
  setOpenDialog(false);
  setError('');
  setEditingId(null);
  setNombre('');
  setContacto('');
  setTelefono('');
  setEmail('');
  setWebsite('');
  setCiudad('');
  setTipoPieza('Otros');
  setTamañosSuministra(['Pequeña', 'Mediana', 'Grande']);
  setPrecioUnitario('');
  setLeadTime('');
};


  return (
    
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: 10 }}>
        <img src={logoNiger} alt="Niger Logo" style={{ width: 80, height: 'auto' }} />
        <div style={{ flex: 1 }}>
          <BarraBusqueda />
        </div>
      </div>
    
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
          <LocalFloristIcon sx={{ fontSize: 32, color: '#2e7d32' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1b5e20' }}>
            Gestión de Proveedores - Macetas Inteligentes
          </Typography>
        </Stack>
        <Typography variant="body2" color="textSecondary">
          Administra proveedores de piezas para macetas con sensores: sensores de humedad, baterías recargables, carcasas plásticas, sistemas de riego automático y componentes electrónica.
        </Typography>
      </Box>
      
      {/* Estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card sx={{ background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)` }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="caption">
                  {stat.label}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: stat.color }}>
                  {typeof stat.value === 'number' ? stat.value : stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filtros y Acciones */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: 'flex-end' }}>
            <TextField
              label="Buscar"
              placeholder="Nombre, contacto, email, ciudad, tipo de pieza..."
              variant="outlined"
              size="small"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} /> }}
              sx={{ flex: 1, minWidth: 250 }}
            />
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleLimpiarFiltros}
              size="small"
            >
              Limpiar
            </Button>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{ backgroundColor: '#2e7d32', '&:hover': { backgroundColor: '#1b5e20' } }}
            >
              Nuevo Proveedor
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportarCSV}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Exportar CSV'}
            </Button>
            {selectionModel.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleEliminarSeleccionados}
              >
                Eliminar {selectionModel.length} Seleccionado{selectionModel.length !== 1 ? 's' : ''}
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* DataGrid */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ height: 450, width: '100%' }}>
          {proveedoresFiltrados.length === 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="textSecondary">No hay proveedores que coincidan con tu búsqueda.</Typography>
            </Box>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 25, 50]}
              checkboxSelection
              onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
              rowSelectionModel={selectionModel}
              disableSelectionOnClick
              density="comfortable"
              sx={{
                '& .MuiDataGrid-cell': {
                  overflow: 'visible',
                },
              }}
            />
          )}
        </Box>
      </Paper>

      {/* Dialog para agregar/editar proveedor */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#2e7d32', color: 'white' }}>
          {editingId ? '✏️ Editar Proveedor' : '🌱 Nuevo Proveedor'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              autoFocus
              label="Nombre del Proveedor"
              fullWidth
              variant="outlined"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              helperText="Ej: TechSensors España"
            />
            <TextField
              label="Persona de Contacto"
              fullWidth
              variant="outlined"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              required
              helperText="Nombre del responsable"
            />
            <TextField
              label="Teléfono"
              fullWidth
              variant="outlined"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: 612345678"
              helperText="Opcional"
            />
            <TextField
              label="Email"
              fullWidth
              variant="outlined"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej: contacto@proveedor.es"
              helperText="Opcional"
            />
            <TextField
              label="Website"
              fullWidth
              variant="outlined"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Ej: www.proveedor.es"
              helperText="Opcional"
            />
            <TextField
              label="Ciudad"
              fullWidth
              variant="outlined"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder="Ej: Madrid"
              helperText="Opcional"
            />

            {/* Tipo de Pieza */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Tipo de Pieza que Suministra *
              </Typography>
              <Stack spacing={1}>
                {TIPOS_PIEZA.map((tipo) => (
                  <FormControlLabel
                    key={tipo}
                    control={
                      <Checkbox
                        checked={tipoPieza === tipo}
                        onChange={(e) => {
                          if (e.target.checked) setTipoPieza(tipo);
                        }}
                      />
                    }
                    label={tipo}
                  />
                ))}
              </Stack>
            </Box>

            {/* Tamaños */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Tamaños que Suministra *
              </Typography>
              <FormGroup row>
                {TAMAÑOS.map((tamaño) => (
                  <FormControlLabel
                    key={tamaño}
                    control={
                      <Checkbox
                        name={tamaño}
                        checked={tamañosSuministra.includes(tamaño)}
                        onChange={handleTamañoChange}
                      />
                    }
                    label={tamaño}
                  />
                ))}
              </FormGroup>
            </Box>

            <TextField
              label="Precio Unitario (€)"
              fullWidth
              variant="outlined"
              type="number"
              value={precioUnitario}
              onChange={(e) => setPrecioUnitario(e.target.value)}
              placeholder="Ej: 4.50"
              inputProps={{ step: '0.01', min: '0' }}
              helperText="Opcional"
            />
            <TextField
              label="Lead Time (días)"
              fullWidth
              variant="outlined"
              type="number"
              value={leadTime}
              onChange={(e) => setLeadTime(e.target.value)}
              placeholder="Ej: 10"
              inputProps={{ step: '1', min: '0' }}
              helperText="Opcional - Días de entrega"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => {
            setOpenDialog(false);
            // Limpiar state sin async
            setTimeout(() => {
              setNombre('');
              setContacto('');
              setTelefono('');
              setEmail('');
              setWebsite('');
              setCiudad('');
              setTipoPieza('Otros');
              setTamañosSuministra(['Pequeña', 'Mediana', 'Grande']);
              setPrecioUnitario('');
              setLeadTime('');
              setError('');
              setEditingId(null);
            }, 150);
          }}>Cancelar</Button>
          <Button onClick={handleAñadir} variant="contained" sx={{ backgroundColor: '#2e7d32' }}>
            {editingId ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle>⚠️ Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar este proveedor? Esta acción no se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Cancelar</Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProveedoresPage;
