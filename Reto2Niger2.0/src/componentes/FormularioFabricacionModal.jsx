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
    pequeña: ['Led rojo: 2', 'Led verde: 2', 'Led amarillo: 2', 'Maceta de plástico: Pequeña', 'Sensor de humedad: 1', 'Sensor de luz: 1', 'Bateria: 1'],
    mediana: ['Led rojo: 2', 'Led verde: 2', 'Led amarillo: 2', 'Maceta de plástico: Mediana', 'Sensor de humedad: 1', 'Sensor de luz: 1', 'Bateria: 1'],
    grande: ['Led rojo: 2', 'Led verde: 2', 'Led amarillo: 2', 'Maceta de plástico: Grande', 'Sensor de humedad: 1', 'Sensor de luz: 1', 'Bateria: 1']
  };

  const handleCrear = () => {
  if (!tamano) {
    alert('Selecciona un tamaño de maceta');
    return;
  }

  const productoMap = {
    pequeña: "Maceta pequeña",
    mediana: "Maceta mediana",
    grande: "Maceta grande"
  };

  const producto = productoMap[tamano];
  const materiales = materialesPorTamano[tamano];

  console.log("FRONTEND -> creando fabricación. Payload que voy a enviar a onCrear:", {
    producto,
    materiales
  });

  onCrear({ producto, materiales });
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
