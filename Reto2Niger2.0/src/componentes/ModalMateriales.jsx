import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText } from '@mui/material';

function ModalMateriales({ open, onClose, materiales }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Materiales utilizados</DialogTitle>
      <DialogContent dividers>
        <List>
          <ul>
            {materiales.map(m => (
              <li key={m.nombre + m.cantidad}>
                {m.nombre || "Material desconocido"} x {m.cantidad}
              </li>
            ))}
          </ul>
        </List>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          sx={{ bgcolor: '#D1D5DB', '&:hover': { bgcolor: '#BDBDBD' } }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ModalMateriales;
