import React, { useEffect, useState } from "react";
import { getStock, eliminarStock, crearStock } from "../services/stockService.js";
import BarraBusqueda from "../componentes/barraBusqueda.jsx";
import logoNiger from '../assets/Niger.png';
import { commonStyles, colors } from '../styles/commonStyles.js';

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

  const handleSeleccionProducto = (e) => {
    const id = e.target.value;
    setProductoSeleccionado(id);

    const producto = stock.find((p) => p._id === id);
    if (producto) {
      setNuevoNombre(producto.nombre);
      setNuevoTipo(producto.tipo);
      setNuevoPrecio(producto.precio_unitario);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();

    if (!productoSeleccionado) {
      alert("Debes seleccionar un producto existente.");
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
          <h3 style={{ marginLeft: "-675px" }}>Piezas Disponibles</h3>


          {Object.keys(groupedStock).map((tipo) => (
            <div
              key={tipo}
              style={{
                marginBottom: "10px",
                border: `1px solid ${colors.border}`,
                borderRadius: "8px",
                backgroundColor: colors.backgroundLight
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
            marginTop: "65px"
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
            {productosUnicos.map((p) => (
              <option key={p._id} value={p._id}>
                {p.nombre}
              </option>
            ))}
          </select>

          <input
            type="text"
            readOnly
            value={nuevoNombre}
            placeholder="Nombre"
            style={{ ...commonStyles.input, background: "#222", marginTop: "8px" }}
          />

          <input
            type="text"
            readOnly
            value={nuevoTipo}
            placeholder="Tipo"
            style={{ ...commonStyles.input, background: "#222", marginTop: "8px" }}
          />

          <input
            type="number"
            readOnly
            value={nuevoPrecio}
            placeholder="Precio"
            style={{ ...commonStyles.input, background: "#222", marginTop: "8px" }}
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
