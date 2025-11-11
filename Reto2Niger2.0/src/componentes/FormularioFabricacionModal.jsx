import { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button 
} from '@mui/material';

function FormularioFabricacionModal({ open, onClose, onCrear }) {
  const [tamano, setTamano] = useState('');

  // Materiales por tipo de maceta
  const materialesPorTamano = {
    pequeña: ['Barro', 'Pintura'],
    mediana: ['Barro', 'Pintura', 'Arena'],
    grande: ['Barro', 'Pintura', 'Arena', 'Fertilizante']
  };

  const handleCrear = () => {
    if (!tamano) {
      alert('Selecciona un tamaño de maceta');
      return;
    }
    const materiales = materialesPorTamano[tamano];
    onCrear({ tamano, materiales });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Nueva Fabricación</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="tamano-label">Tamaño de maceta</InputLabel>
          <Select
            labelId="tamano-label"
            value={tamano}
            onChange={(e) => setTamano(e.target.value)}
            label="Tamaño de maceta"
          >
            <MenuItem value=""><em>-- Selecciona --</em></MenuItem>
            <MenuItem value="pequeña">Maceta pequeña</MenuItem>
            <MenuItem value="mediana">Maceta mediana</MenuItem>
            <MenuItem value="grande">Maceta grande</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          sx={{ bgcolor: '#D1D5DB', '&:hover': { bgcolor: '#BDBDBD' } }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleCrear} 
          sx={{ bgcolor: '#3B82F6', '&:hover': { bgcolor: '#2563EB' }, color: 'white' }}
        >
          Crear
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FormularioFabricacionModal;
