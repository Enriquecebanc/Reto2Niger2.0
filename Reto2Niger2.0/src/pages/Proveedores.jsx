import React, { useEffect, useState } from 'react';
import BarraBusqueda from '../componentes/barraBusqueda.jsx';
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
	// Componentes de Tabla estándar de MUI
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Switch,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
// El DataGrid ya no es necesario: import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

const STORAGE_KEY = 'proveedores_simple_v3';
const TIPOS_PRODUCTO = ['Sensores', 'Baterías', 'Carcasas plásticas', 'Sensores de riego', 'Electrónica'];
const TAMAÑOS = ['Pequeña', 'Mediana', 'Grande'];

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
		background: {
			default: '#121212',
			paper: '#1e1e1e',
		},
		primary: { main: '#2e7d32' },
		error: { main: '#d32f2f' },
		secondary: { main: '#9c27b0' },
	},
	typography: { fontFamily: 'Roboto, sans-serif' },
});

const lightTheme = createTheme({
	palette: {
		mode: 'light',
		background: {
			default: '#f5f7fb',
			paper: '#ffffff',
		},
		primary: { main: '#2e7d32' },
		error: { main: '#d32f2f' },
		secondary: { main: '#7b1fa2' },
	},
	typography: { fontFamily: 'Roboto, sans-serif' },
});

// 🌟 Ejemplos iniciales de proveedores
const EJEMPLOS_PROVEEDORES = [
  {
    id: 1,
    nombre: 'TecnoSensores SL',
    contacto: 'Laura Martínez',
    telefono: '612345678',
    email: 'contacto@tecnosensores.com',
    tamaño: 'Pequeña',
    tipoProducto: 'Sensores',
  },
  {
    id: 2,
    nombre: 'Energía Verde SA',
    contacto: 'Carlos López',
    telefono: '699887766',
    email: 'ventas@energiaverde.es',
    tamaño: 'Grande',
    tipoProducto: 'Baterías',
  },
];

const ProveedoresPage = () => {
	const [proveedores, setProveedores] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
	const [themeMode, setThemeMode] = useState(() => {
		try {
			return localStorage.getItem('app_theme_mode') || 'dark';
		} catch (e) {
			return 'dark';
		}
	});

  const [nombre, setNombre] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [tamaño, setTamaño] = useState('Mediana');
  const [tipoProducto, setTipoProducto] = useState(TIPOS_PRODUCTO[0]);

  // ✅ Cargar datos iniciales o ejemplos
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (Array.isArray(data) && data.length > 0) {
        setProveedores(data);
      } else {
        setProveedores(EJEMPLOS_PROVEEDORES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(EJEMPLOS_PROVEEDORES));
      }
    } else {
      setProveedores(EJEMPLOS_PROVEEDORES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(EJEMPLOS_PROVEEDORES));
    }
		// Si hay preferencia de tema, aplica
		try {
			const saved = localStorage.getItem('app_theme_mode');
			if (saved) setThemeMode(saved);
		} catch (e) {
			// ignore
		}
  }, []);

  // Guardar en Local Storage cada vez que los proveedores cambian
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(proveedores));
  }, [proveedores]);

	// Guardar preferencia de tema
	useEffect(() => {
		try {
			localStorage.setItem('app_theme_mode', themeMode);
		} catch (e) {
			// ignore
		}
	}, [themeMode]);

  const handleGuardar = () => {
    if (!nombre.trim() || !contacto.trim() || !telefono.trim()) {
      alert('Por favor completa los campos obligatorios: Nombre, Contacto y Teléfono.');
      return;
    }

    const nuevoProveedor = {
      // Usa Date.now() si no estamos editando, o el ID existente
      id: editingId || Date.now(), 
      nombre: nombre.trim(),
      contacto: contacto.trim(),
      telefono: telefono.trim(),
      email: email.trim(),
      tamaño,
      tipoProducto,
    };

    if (editingId) {
      // Modo Edición: Mapea y reemplaza el proveedor
      setProveedores((prev) =>
        prev.map((p) => (p.id === editingId ? nuevoProveedor : p))
      );
    } else {
      // Modo Creación: Añade el nuevo proveedor
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
    if (window.confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
      setProveedores((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleCerrarDialog = () => {
    setOpenDialog(false);
    setEditingId(null); // Resetea el ID para volver al modo "Crear"
    // Limpia los campos
    setNombre('');
    setContacto('');
    setTelefono('');
    setEmail('');
    setTamaño('Mediana');
    setTipoProducto(TIPOS_PRODUCTO[0]);
  };

  // 🔁 Restaurar ejemplos
  const handleRestaurarEjemplos = () => {
    if (window.confirm('¿Seguro que quieres restaurar los ejemplos? Se perderán los proveedores actuales.')) {
      setProveedores(EJEMPLOS_PROVEEDORES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(EJEMPLOS_PROVEEDORES));
    }
  };

	const toggleTheme = () => setThemeMode((t) => (t === 'dark' ? 'light' : 'dark'));

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

  // La paginación simple de la imagen es "1-X de X", la simulamos con el array filtrado.
  const totalProveedores = proveedoresFiltrados.length;


	return (
		<ThemeProvider theme={themeMode === 'dark' ? darkTheme : lightTheme}>
			<CssBaseline />
			<Container maxWidth="md" sx={{ py: 5 }}>
        {/* Título principal, imitando el estilo de la imagen */}
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#4caf50' }}>
          Gestión de Proveedores
        </Typography>

        {/* Barra de Acciones: Botones y Búsqueda */}
				<Stack 
					direction={{ xs: 'column', sm: 'row' }} 
					spacing={2} 
					sx={{ mb: 3, alignItems: 'center' }}
				>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ 
              backgroundColor: '#2e7d32', // Verde
              '&:hover': { backgroundColor: '#1b5e20' },
              minWidth: 'fit-content' 
            }}
            onClick={() => setOpenDialog(true)} // Abre el diálogo de "Nuevo Proveedor"
          >
            NUEVO PROVEEDOR
          </Button>

          <Button
            variant="text" // Usamos 'text' con color para simular el aspecto simple de la imagen
            color="secondary"
            startIcon={<RefreshIcon />}
            onClick={handleRestaurarEjemplos}
            sx={{ color: '#9c27b0', minWidth: 'fit-content' }}
          >
            RESTAURAR EJEMPLOS
          </Button>

					{/* Toggle de Modo Claro/Oscuro para que sea coherente con otros módulos */}
					<FormControlLabel
						control={<Switch checked={themeMode === 'light'} onChange={toggleTheme} />}
						label={themeMode === 'light' ? 'Modo Claro' : 'Modo Oscuro'}
						sx={{ ml: 1 }}
					/>

          <Box sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: '200px' } }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Buscar proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: '#aaa' }} />,
                sx: { borderRadius: 1 }
              }}
            />
          </Box>
        </Stack>

        {/* REEMPLAZO DEL DATAGRID POR TABLA ESTÁNDAR MUI */}
				<TableContainer component={Paper} sx={{ bgcolor: 'background.paper', mb: 3 }}>
          <Table aria-label="tabla de proveedores">
            {/* Cabecera de la tabla */}
						<TableHead>
							<TableRow sx={{ backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#333' : '#f0f0f0' }}>
                {['Proveedor', 'Contacto', 'Teléfono', 'Email', 'Tamaño', 'Tipo', 'Acciones'].map((header) => (
                  <TableCell 
                    key={header} 
										sx={{ 
											color: (theme) => theme.palette.text.primary, 
											fontWeight: 'bold', 
											borderBottom: 'none'
										}}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            {/* Cuerpo de la tabla */}
            <TableBody>
							{proveedoresFiltrados.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
									<TableCell component="th" scope="row" sx={{ color: (theme) => theme.palette.text.primary }}>{row.nombre}</TableCell>
									<TableCell sx={{ color: (theme) => theme.palette.text.primary }}>{row.contacto}</TableCell>
									<TableCell sx={{ color: (theme) => theme.palette.text.primary }}>{row.telefono}</TableCell>
									<TableCell sx={{ color: (theme) => theme.palette.text.primary }}>{(row.email || '').length > 20 ? `${row.email.substring(0, 17)}...` : row.email}</TableCell>
									<TableCell sx={{ color: (theme) => theme.palette.text.primary }}>{row.tamaño}</TableCell>
									<TableCell sx={{ color: (theme) => theme.palette.text.primary }}>{row.tipoProducto}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {/* Botón de Editar (Lápiz Verde) */}
                      <EditIcon 
                        fontSize="small" 
                        sx={{ color: darkTheme.palette.primary.main, cursor: 'pointer' }}
                        onClick={() => handleEditar(row.id)}
                      />
                      {/* Botón de Eliminar (Papelera Roja) */}
                      <DeleteIcon 
                        fontSize="small" 
                        sx={{ color: darkTheme.palette.error.main, cursor: 'pointer' }}
                        onClick={() => handleEliminar(row.id)}
                      />
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Paginación simple simulada de la imagen */}
							<Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 1, color: 'text.secondary', borderTop: (theme) => `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'}` }}>
            <Typography variant="caption">
              {`1–${totalProveedores} de ${totalProveedores}`}
            </Typography>
            <NavigateBeforeIcon sx={{ cursor: 'not-allowed', ml: 2, opacity: 0.5 }} />
            <NavigateNextIcon sx={{ cursor: 'not-allowed', opacity: 0.5 }} />
          </Box>
        </TableContainer>


        {/* DIÁLOGO/MODAL PARA CREAR Y EDITAR PROVEEDORES (funcional) */}
        <Dialog open={openDialog} onClose={handleCerrarDialog} PaperProps={{ sx: { bgcolor: 'background.paper', minWidth: { sm: 400 } } }}>
          <DialogTitle sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            {editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                autoFocus
                margin="dense"
                label="Nombre del Proveedor *"
                type="text"
                fullWidth
                variant="outlined"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              <TextField
                margin="dense"
                label="Contacto *"
                type="text"
                fullWidth
                variant="outlined"
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
              />
              <TextField
                margin="dense"
                label="Teléfono *"
                type="tel"
                fullWidth
                variant="outlined"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
              <TextField
                margin="dense"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Box>
                <Typography variant="subtitle2" sx={{ color: '#aaa', mb: 1 }}>
                  Tamaño de la empresa:
                </Typography>
                <RadioGroup row value={tamaño} onChange={(e) => setTamaño(e.target.value)}>
                  {TAMAÑOS.map((t) => (
                    <FormControlLabel key={t} value={t} control={<Radio color="primary" />} label={t} />
                  ))}
                </RadioGroup>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ color: '#aaa', mb: 1 }}>
                  Tipo de Producto principal:
                </Typography>
                <RadioGroup row value={tipoProducto} onChange={(e) => setTipoProducto(e.target.value)}>
                  {TIPOS_PRODUCTO.map((t) => (
                    <FormControlLabel key={t} value={t} control={<Radio color="primary" />} label={t} />
                  ))}
                </RadioGroup>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCerrarDialog} color="error">
              Cancelar
            </Button>
            <Button onClick={handleGuardar} variant="contained" color="primary">
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
};

export default ProveedoresPage;