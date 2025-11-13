import React, { useEffect, useState } from "react";
import { getStock, eliminarStock } from "../services/stockService.js";
import BarraBusqueda from "../componentes/barraBusqueda.jsx";

const Inventario = () => {
  const [stock, setStock] = useState([]);
  const [collapsed, setCollapsed] = useState({}); // Para manejar qué tipo está abierto

  const fetchData = async () => {
    const data = await getStock();
    setStock(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEliminar = async (id) => {
    await eliminarStock(id);
    fetchData();
  };

  // Agrupar por tipo
  const groupedStock = stock.reduce((acc, item) => {
    if (!acc[item.tipo]) acc[item.tipo] = [];
    acc[item.tipo].push(item);
    return acc;
  }, {});

  const toggleCollapse = (tipo) => {
    setCollapsed((prev) => ({
      ...prev,
      [tipo]: !prev[tipo],
    }));
  };

  return (
    <div>
      <BarraBusqueda />
      <h1>Inventario</h1>
      {Object.keys(groupedStock).map((tipo) => (
        <div key={tipo} style={{ marginBottom: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
          <button
            style={{ width: "100%", textAlign: "left", padding: "10px", background: "#f0f0f0", border: "none", cursor: "pointer" }}
            onClick={() => toggleCollapse(tipo)}
          >
            {tipo} ({groupedStock[tipo].length} piezas)
          </button>
          {collapsed[tipo] && (
            <ul style={{ listStyle: "none", padding: "10px" }}>
              {groupedStock[tipo].map((item) => (
                <li key={item._id} style={{ marginBottom: "5px" }}>
                  ID: {item._id} — {item.nombre} — {item.cantidad} unidad — {item.precio_unitario} €
                  <button
                    onClick={() => handleEliminar(item._id)}
                    style={{ marginLeft: "10px", fontSize: "0.8rem" }}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default Inventario;
