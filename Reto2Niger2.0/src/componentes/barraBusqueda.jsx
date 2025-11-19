import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { Link } from 'react-router-dom';

function BarraBusqueda() {
  return (
    <ButtonGroup variant="outlined" aria-label="Basic button group">
      <Button component={Link} to="/">☖</Button>
      <Button component={Link} to="/fabricacion">Fabricación</Button>
      <Button component={Link} to="/facturacion">Facturación</Button>
      <Button component={Link} to="/inventario">Inventario</Button>
      <Button component={Link} to="/proveedores">Proveedores</Button>
      <Button component={Link} to="/ventas">Ventas</Button>
      <Button component={Link} to="/documentacion">Documentación</Button>
    </ButtonGroup>
  );
}

export default BarraBusqueda;
