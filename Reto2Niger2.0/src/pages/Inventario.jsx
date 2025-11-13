import React, { useEffect, useState } from "react";
import { getStock, eliminarStock } from "../services/stockService.js";
import BarraBusqueda from "../componentes/barraBusqueda.jsx";

const Inventario = () => {
  const [stock, setStock] = useState([]);

  const fetchData = async () => {
    const data = await getStock();
    setStock(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEliminar = async (id) => {
    await eliminarStock(id);
    fetchData(); // refresca la lista
  };

  return (
    <div>
        <BarraBusqueda/>
      <h1>Inventario</h1>
      <ul>
        {stock.map((item) => (
          <li key={item._id}>
            {item.nombre} — {item.cantidad} unidades — {item.precio_unitario} €
            <button onClick={() => handleEliminar(item._id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Inventario;
