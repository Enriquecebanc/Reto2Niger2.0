import React, { useEffect, useState } from "react";
import { getStock, eliminarStock, crearStock } from "../services/stockService.js";
import BarraBusqueda from "../componentes/barraBusqueda.jsx";
import logoNiger from '../assets/Niger.png';
import { commonStyles, colors } from '../styles/commonStyles.js';

const Inventario = () => {
  const [stock, setStock] = useState([]);
  const [collapsed, setCollapsed] = useState({});
  
  // Estados para nuevo producto
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState("");
  const [nuevaCantidad, setNuevaCantidad] = useState(1);
  const [nuevoPrecio, setNuevoPrecio] = useState(0);

  const fetchData = async () => {
    const data = await getStock();
    setStock(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este elemento?')) return;

    try {
      const result = await eliminarStock(id);
      await fetchData();
      alert('Elemento eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      await fetchData();
      alert(`Error: ${error.message}`);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!nuevoNombre || !nuevoTipo || nuevaCantidad <= 0 || nuevoPrecio < 0) {
      alert("Por favor, rellena todos los campos correctamente");
      return;
    }

    try {
      await crearStock({
        nombre: nuevoNombre,
        tipo: nuevoTipo,
        cantidad: nuevaCantidad,
        precio_unitario: nuevoPrecio
      });

      // Limpiar formulario
      setNuevoNombre("");
      setNuevoTipo("");
      setNuevaCantidad(1);
      setNuevoPrecio(0);

      await fetchData();
      alert("Pieza creada correctamente");
    } catch (error) {
      console.error("Error al crear pieza:", error);
      alert(`Error: ${error.message}`);
    }
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

    <h3>Piezas Disponibles</h3>
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
                <span>
                  <strong>ID:</strong> {item._id} — <strong>{item.nombre}</strong> — {item.cantidad} unidad — {item.precio_unitario} €
                </span>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleEliminar(item._id);
                  }}
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

    {/* FORMULARIO ABAJO */}
    <form onSubmit={handleCrear} style={{ marginTop: "30px" }}>
      <h3>Añadir nueva pieza</h3>
      <input
        type="text"
        placeholder="Nombre"
        value={nuevoNombre}
        onChange={(e) => setNuevoNombre(e.target.value)}
        style={commonStyles.input}
        required
      />
      <br/>
      <input
        type="text"
        placeholder="Tipo"
        value={nuevoTipo}
        onChange={(e) => setNuevoTipo(e.target.value)}
        style={commonStyles.input}
        required
      />
      <br/>
      <input
        type="number"
        placeholder="Cantidad"
        value={nuevaCantidad}
        min={1}
        onChange={(e) => setNuevaCantidad(Number(e.target.value))}
        style={commonStyles.input}
        required
      />
      <br/>
      <input
        type="number"
        placeholder="Precio unitario"
        value={nuevoPrecio}
        min={0}
        step="0.01"
        onChange={(e) => setNuevoPrecio(Number(e.target.value))}
        style={commonStyles.input}
        required
      />
      <br/>
      <button type="submit" style={{ ...commonStyles.button, backgroundColor: colors.success }}>
        Crear Pieza
      </button>
    </form>
  </div>
);

}

     

export default Inventario;
