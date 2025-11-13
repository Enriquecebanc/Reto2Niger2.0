import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText } from '@mui/material';

function ModalMateriales({ open, onClose, materiales }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Materiales utilizados</DialogTitle>
      <DialogContent dividers>
        <List>
          {materiales.map((mat, index) => (
            <ListItem key={index} disablePadding>
              <ListItemText
                primary={`${mat.id_pieza.nombre} ${mat.cantidad > 1 ? `: ${mat.cantidad}` : ''}`}
              />
            </ListItem>
          ))}
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
