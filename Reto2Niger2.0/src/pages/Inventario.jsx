import React, { useEffect, useState } from "react";
import { getStock, eliminarStock, crearStock } from "../services/stockService.js";
import BarraBusqueda from "../componentes/barraBusqueda.jsx";
import logoNiger from '../assets/Niger.png';
import { commonStyles, colors } from '../styles/commonStyles.js';

// Productos predefinidos para fabricación
const PRODUCTOS_PREDEFINIDOS = [
  { nombre: "LED Rojo", tipo: "LED", precio: 0.8 },
  { nombre: "LED Verde", tipo: "LED", precio: 0.8 },
  { nombre: "LED Amarillo", tipo: "LED", precio: 0.8 },
  { nombre: "Maceta de plástico Pequeño", tipo: "Maceta", precio: 1.8 },
  { nombre: "Maceta de plástico Mediano", tipo: "Maceta", precio: 2.5 },
  { nombre: "Maceta de plástico Grande", tipo: "Maceta", precio: 3.2 },
  { nombre: "Sensor de humedad", tipo: "Sensor", precio: 2.5 },
  { nombre: "Sensor de luz", tipo: "Sensor", precio: 2 },
  { nombre: "Batería", tipo: "Batería", precio: 1.5 }
];

const Inventario = () => {
  const [stock, setStock] = useState([]);
  const [collapsed, setCollapsed] = useState({});

  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState("");
  const [nuevoPrecio, setNuevoPrecio] = useState(0);
  const [nuevaCantidad, setNuevaCantidad] = useState(1);

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
      await eliminarStock(id);
      await fetchData();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const productosUnicos = Object.values(
    stock.reduce((acc, item) => {
      if (!acc[item.nombre]) acc[item.nombre] = item;
      return acc;
    }, {})
  );

  // Combinar productos únicos del stock con productos predefinidos
  const todosLosProductos = [...PRODUCTOS_PREDEFINIDOS];
  
  // Agregar productos del stock que no estén en la lista predefinida
  productosUnicos.forEach(p => {
    if (!PRODUCTOS_PREDEFINIDOS.find(prod => prod.nombre === p.nombre)) {
      todosLosProductos.push({
        nombre: p.nombre,
        tipo: p.tipo,
        precio: p.precio_unitario
      });
    }
  });

  const handleSeleccionProducto = (e) => {
    const nombreProducto = e.target.value;
    setProductoSeleccionado(nombreProducto);

    // Buscar primero en productos predefinidos
    let producto = PRODUCTOS_PREDEFINIDOS.find(p => p.nombre === nombreProducto);
    
    // Si no está en predefinidos, buscar en stock
    if (!producto) {
      const stockItem = stock.find((p) => p.nombre === nombreProducto);
      if (stockItem) {
        producto = {
          nombre: stockItem.nombre,
          tipo: stockItem.tipo,
          precio: stockItem.precio_unitario
        };
      }
    }

    if (producto) {
      setNuevoNombre(producto.nombre);
      setNuevoTipo(producto.tipo);
      setNuevoPrecio(producto.precio);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();

    if (!productoSeleccionado) {
      alert("Debes seleccionar un producto.");
      return;
    }

    try {
      await crearStock({
        nombre: nuevoNombre,
        tipo: nuevoTipo,
        cantidad: nuevaCantidad,
        precio_unitario: nuevoPrecio
      });

      setProductoSeleccionado("");
      setNuevoNombre("");
      setNuevoTipo("");
      setNuevoPrecio(0);
      setNuevaCantidad(1);

      await fetchData();
      alert("Pieza creada correctamente");
    } catch (error) {
      console.error("Error al crear pieza:", error);
      alert(`Error: ${error.message}`);
    }
  };

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
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: 20 }}>
        <img src={logoNiger} alt="Niger Logo" style={{ width: 80 }} />
        <div style={{ flex: 1 }}>
          <BarraBusqueda />
        </div>
      </div>

      <h1 style={commonStyles.title}>Inventario</h1>

      <div style={{ display: "flex", gap: "25px", alignItems: "flex-start" }}>

        {/* COLUMNA IZQUIERDA */}
        <div style={{ flex: 3 }}>
          <h3 style={{ marginLeft: "-620px" }}>Piezas Disponibles</h3>


          {Object.keys(groupedStock).map((tipo) => (
            <div
              key={tipo}
              style={{
                marginBottom: "10px",
                border: `1px solid ${colors.border}`,
                borderRadius: "8px",
                backgroundColor: colors.backgroundLight,
                width: "110%",
              }}
            >
              <button
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "18px 20px",
                  background: colors.backgroundDark,
                  color: colors.textLight,
                  borderRadius: "6px 6px 0 0"
                }}
                onClick={() => toggleCollapse(tipo)}
              >
                {tipo} ({groupedStock[tipo].length} piezas)
              </button>

              {collapsed[tipo] && (
                <ul
                  style={{
                    listStyle: "none",
                    padding: "15px",
                    margin: 0,
                    backgroundColor: colors.backgroundLight
                  }}
                >
                  {groupedStock[tipo].map((item) => (
                    <li
                      key={item._id}
                      style={{
                        marginBottom: "8px",
                        padding: "12px",
                        borderBottom: `1px solid ${colors.borderLight}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        color: colors.text
                      }}
                    >
                      <span>
                        <strong>ID:</strong> {item._id} — 
                        <strong>{item.nombre}</strong> — 
                        {item.precio_unitario} € — 
                        <strong>Proveedor:</strong> {item.proveedor_nombre || "Sin proveedor"}
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
        </div>

        {/* COLUMNA DERECHA (FORMULARIO) */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            border: `1px solid ${colors.border}`,
            borderRadius: "8px",
            background: colors.backgroundLight,
            position: "sticky",
            top: "0px",
            maxHeight: "600px",
            marginTop: "65px",
            marginLeft: "80px",
          }}
        >
          <h3>Añadir nueva pieza</h3>

          <select
            value={productoSeleccionado}
            onChange={handleSeleccionProducto}
            style={commonStyles.input}
            required
          >
            <option value="">Selecciona un producto...</option>
            {todosLosProductos.map((p, idx) => (
              <option key={`${p.nombre}-${idx}`} value={p.nombre}>
                {p.nombre}
              </option>
            ))}
          </select>

          <input
            type="text"
            readOnly
            value={nuevoNombre}
            placeholder="Nombre"
            style={{ 
              ...commonStyles.input, 
              background: "#222", 
              marginTop: "8px" 
            }}
          />

          <input
            type="text"
            readOnly
            value={nuevoTipo}
            placeholder="Tipo"
            style={{ 
              ...commonStyles.input, 
              background: "#222", 
              marginTop: "8px" 
            }}
          />

          <input
            type="number"
            readOnly
            value={nuevoPrecio}
            placeholder="Precio"
            style={{ 
              ...commonStyles.input, 
              background: "#222", 
              marginTop: "8px" 
            }}
          />

          <input
            type="number"
            min={1}
            value={nuevaCantidad}
            onChange={(e) => setNuevaCantidad(Number(e.target.value))}
            placeholder="Cantidad"
            style={{ ...commonStyles.input, background: "#222", marginTop: "8px" }}
          />

          <button
            onClick={handleCrear}
            style={{ ...commonStyles.button, backgroundColor: colors.success, width: "50%", marginTop: "12px" }}
          >
            Crear pieza
          </button>
        </div>
      </div>
    </div>
  );
};

export default Inventario;
