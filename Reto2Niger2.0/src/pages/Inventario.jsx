import React, { useEffect, useState } from "react";
import { getStock, eliminarStock } from "../services/stockService.js";
import BarraBusqueda from "../componentes/barraBusqueda.jsx";
import logoNiger from '../assets/Niger.png';
import { commonStyles, colors } from '../styles/commonStyles.js';

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
    <div style={commonStyles.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: 20 }}>
        <img src={logoNiger} alt="Niger Logo" style={{ width: 80, height: 'auto' }} />
        <div style={{ flex: 1 }}>
          <BarraBusqueda />
        </div>
      </div>
      <h1 style={commonStyles.title}>Inventario</h1>
      {Object.keys(groupedStock).map((tipo) => (
        <div key={tipo} style={{ marginBottom: "10px", border: `1px solid ${colors.border}`, borderRadius: "8px", backgroundColor: colors.backgroundLight }}>
          <button
            style={{ 
              width: "100%", 
              textAlign: "left", 
              padding: "14px 16px", 
              background: colors.backgroundDark, 
              color: colors.textLight,
              border: "none", 
              cursor: "pointer",
              borderRadius: "6px 6px 0 0",
              fontSize: "1rem",
              fontWeight: "700"
            }}
            onClick={() => toggleCollapse(tipo)}
          >
            {tipo} ({groupedStock[tipo].length} piezas)
          </button>
          {collapsed[tipo] && (
            <ul style={{ listStyle: "none", padding: "15px", margin: 0, backgroundColor: colors.backgroundLight }}>
              {groupedStock[tipo].map((item) => (
                <li key={item._id} style={{ 
                  marginBottom: "8px", 
                  padding: "12px",
                  borderBottom: `1px solid ${colors.borderLight}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: colors.text
                }}>
                  <span style={{ color: colors.text }}>
                    <strong>ID:</strong> {item._id} — <strong>{item.nombre}</strong> — {item.cantidad} unidad — {item.precio_unitario} €
                  </span>
                  <button
                    onClick={() => handleEliminar(item._id)}
                    style={{ 
                      ...commonStyles.button,
                      backgroundColor: colors.danger,
                      fontSize: "0.85rem",
                      padding: "6px 12px"
                    }}
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
