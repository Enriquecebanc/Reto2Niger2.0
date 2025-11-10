import { useState } from 'react'
import './App.css'
import Fabricacion from './pages/fabricacion.jsx'
import Facturacion from './pages/Facturacion.jsx'
import Proveedores from './pages/Proveedores.jsx'
import Ventas from './pages/ventas.jsx'
import Inventario from './pages/Inventario.jsx'

function App() {
  

  return (
    <>
      <h1>Reto 2 Niger 2.0</h1>
      <div>
        <Fabricacion />
        <Facturacion />
        <Proveedores />
        <Ventas />
        <Inventario />
      </div>

      
    </>
  )
}

export default App
