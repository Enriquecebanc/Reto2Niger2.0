import './App.css';
import Fabricacion from './pages/fabricacion.jsx';
import Facturacion from './pages/Facturacion.jsx';
import Proveedores from './pages/Proveedores.jsx';
import Ventas from './pages/ventas.jsx';
import Inventario from './pages/Inventario.jsx';
import Home from './pages/home.jsx';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/fabricacion' element={<Fabricacion />} />
        <Route path='/facturacion' element={<Facturacion />} />
        <Route path='/proveedores' element={<Proveedores />} />
        <Route path='/ventas' element={<Ventas />} />
        <Route path='/inventario' element={<Inventario />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
