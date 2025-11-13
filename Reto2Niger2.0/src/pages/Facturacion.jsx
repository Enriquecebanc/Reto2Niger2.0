import React, { useState, useEffect, useMemo } from 'react';
import BarraBusqueda from '../componentes/barraBusqueda.jsx';

const STORAGE_KEY = 'facturas_data';
const PRECIOS_MACETAS = { 'pequeña': 27, 'mediana': 34, 'grande': 40 };
const METODOS_PAGO = ['Efectivo', 'Tarjeta de Crédito', 'Transferencia'];

const Facturacion = () => {
  const [facturas, setFacturas] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({
    cliente: '',
    impuestos: 21,
    metodoPago: 'Efectivo'
  });
  const [productos, setProductos] = useState([]);
  const [productoActual, setProductoActual] = useState({
    tipoMaceta: 'pequeña',
    cantidad: ''
  });

  // Cargar facturas
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setFacturas(JSON.parse(saved));
  }, []);

  // Guardar facturas
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(facturas));
  }, [facturas]);

  // Filtrar facturas
  const facturasFiltradas = useMemo(() => {
    if (!query) return facturas;
    return facturas.filter(f => 
      f.cliente.toLowerCase().includes(query.toLowerCase()) ||
      f.id.toString().includes(query)
    );
  }, [facturas, query]);

  const calcularTotales = () => {
    const subtotal = productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
    const impuestos = (subtotal * parseFloat(form.impuestos)) / 100;
    return { subtotal, impuestos, total: subtotal + impuestos };
  };

  const agregarProducto = () => {
    if (!productoActual.cantidad || productoActual.cantidad <= 0) {
      return alert('Ingresa una cantidad válida');
    }
    
    const nuevoProducto = {
      id: Date.now(),
      tipoMaceta: productoActual.tipoMaceta,
      precio: PRECIOS_MACETAS[productoActual.tipoMaceta],
      cantidad: parseInt(productoActual.cantidad)
    };
    
    console.log('Agregando producto:', nuevoProducto);
    setProductos([...productos, nuevoProducto]);
    setProductoActual({ tipoMaceta: 'pequeña', cantidad: '' });
  };

  const eliminarProducto = (id) => {
    setProductos(productos.filter(p => p.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.cliente) return alert('Ingresa el nombre del cliente');
    if (productos.length === 0) return alert('Agrega al menos un producto');

    const { subtotal, impuestos, total } = calcularTotales();
    const nuevaFactura = {
      id: Date.now(),
      cliente: form.cliente,
      productos: productos.map(p => ({
        tipoMaceta: p.tipoMaceta,
        cantidad: p.cantidad,
        precioUnitario: p.precio,
        subtotal: p.precio * p.cantidad
      })),
      subtotal,
      impuestos: parseFloat(form.impuestos),
      montoImpuestos: impuestos,
      total,
      metodoPago: form.metodoPago,
      fecha: new Date().toLocaleDateString(),
      estado: 'Pendiente'
    };

    setFacturas([...facturas, nuevaFactura]);
    setForm({ cliente: '', impuestos: 21, metodoPago: 'Efectivo' });
    setProductos([]);
    setMostrarForm(false);
  };

  const cambiarEstado = (id, estado) => {
    setFacturas(facturas.map(f => f.id === id ? { ...f, estado } : f));
  };

  const eliminar = (id) => {
    setFacturas(facturas.filter(f => f.id !== id));
  };

  return (
    <div style={styles.container}>
      <BarraBusqueda />
      <div style={styles.header}>
        <h1 style={styles.title}>Facturación</h1>
      </div>

      <p style={{ fontSize: 12, color: '#0177ed', marginBottom: 12 }}>Mostrando {facturasFiltradas.length} de {facturas.length} facturas.</p>

      {/* Botones */}
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setMostrarForm(!mostrarForm)} style={styles.button}>
          {mostrarForm ? 'Cancelar' : 'Nueva Factura'}
        </button>
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 20, border: '1px solid #ddd' }}>
          <h3 style={{ marginTop: 0, color: '#374151' }}>Nueva Factura</h3>
          <form onSubmit={handleSubmit}>
            {/* Información del cliente */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15, marginBottom: 20 }}>
              <div>
                <label style={styles.label}>Cliente:</label>
                <input 
                  value={form.cliente} 
                  onChange={(e) => setForm({...form, cliente: e.target.value})} 
                  style={{...styles.input, width: '100%'}} 
                  required 
                />
              </div>
              <div>
                <label style={styles.label}>Impuestos (%):</label>
                <input 
                  type="number" 
                  value={form.impuestos} 
                  onChange={(e) => setForm({...form, impuestos: e.target.value})} 
                  style={{...styles.input, width: '100%'}} 
                />
              </div>
              <div>
                <label style={styles.label}>Método Pago:</label>
                <select value={form.metodoPago} onChange={(e) => setForm({...form, metodoPago: e.target.value})} style={{...styles.input, width: '100%'}}>
                  {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            {/* Agregar productos */}
            <div style={{ background: '#f9fafb', padding: 15, borderRadius: 6, marginBottom: 15 }}>
              <h4 style={{ marginTop: 0, color: '#374151' }}>Agregar Macetas</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end' }}>
                <div>
                  <label style={styles.label}>Tipo:</label>
                  <select 
                    value={productoActual.tipoMaceta} 
                    onChange={(e) => setProductoActual({...productoActual, tipoMaceta: e.target.value})} 
                    style={{...styles.input, width: '100%'}}
                  >
                    <option value="pequeña">Pequeña (€27)</option>
                    <option value="mediana">Mediana (€34)</option>
                    <option value="grande">Grande (€40)</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Cantidad:</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={productoActual.cantidad} 
                    onChange={(e) => setProductoActual({...productoActual, cantidad: e.target.value})} 
                    style={{...styles.input, width: '100%'}} 
                  />
                </div>
                <button 
                  type="button" 
                  onClick={agregarProducto}
                  style={{...styles.button, background: '#059669'}}
                >
                  + Agregar
                </button>
              </div>
            </div>

            {/* Lista de productos agregados */}
            {productos.length > 0 && (
              <div style={{ marginBottom: 15 }}>
                <h4 style={{ color: '#374151' }}>Productos en la factura:</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', border: '1px solid #ddd' }}>
                  <thead>
                    <tr style={{ background: '#a7d8fc' }}>
                      <th style={{ padding: 8, textAlign: 'left', borderBottom: '2px solid #006881' }}>Tipo</th>
                      <th style={{ padding: 8, textAlign: 'left', borderBottom: '2px solid #006881' }}>Precio Unit.</th>
                      <th style={{ padding: 8, textAlign: 'left', borderBottom: '2px solid #006881' }}>Cantidad</th>
                      <th style={{ padding: 8, textAlign: 'left', borderBottom: '2px solid #006881' }}>Subtotal</th>
                      <th style={{ padding: 8, textAlign: 'left', borderBottom: '2px solid #006881' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody style={{ background: '#fff' }}>
                    {productos.map(p => (
                      <tr key={p.id} style={{ background: '#fff' }}>
                        <td style={{ padding: 8, borderBottom: '1px solid #09025c', color: '#000' }}>{p.tipoMaceta}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #09025c', color: '#000' }}>€{p.precio}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #09025c', color: '#000' }}>{p.cantidad}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #09025c', color: '#000' }}>€{(p.precio * p.cantidad).toFixed(2)}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #09025c' }}>
                          <button 
                            type="button"
                            onClick={() => eliminarProducto(p.id)}
                            style={{ fontSize: '12px', padding: '2px 6px', color: '#333', background: '#eee', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Resumen de totales */}
            {productos.length > 0 && (
              <div style={{ background: '#fafafa', padding: 15, borderRadius: 6, marginBottom: 15, border: '1px solid #ccc' }}>
                <p style={{ margin: '4px 0' }}><strong>Subtotal:</strong> €{calcularTotales().subtotal.toFixed(2)}</p>
                <p style={{ margin: '4px 0' }}><strong>Impuestos ({form.impuestos}%):</strong> €{calcularTotales().impuestos.toFixed(2)}</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '18px' }}><strong>Total: €{calcularTotales().total.toFixed(2)}</strong></p>
              </div>
            )}
            
            <button type="submit" style={{...styles.button, background: '#097d85'}}>Crear Factura</button>
          </form>
        </div>
      )}

      {/* Búsqueda */}
      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Buscar facturas..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #34b6f7ff' }}
        />
      </div>

      {/* Tabla */}
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Cliente</th>
              <th style={styles.th}>Productos</th>
              <th style={styles.th}>Subtotal</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Método Pago</th>
              <th style={styles.th}>Fecha</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {facturasFiltradas.length === 0 ? (
              <tr><td colSpan="9" style={{...styles.td, textAlign: 'center'}}>No hay facturas</td></tr>
            ) : (
              facturasFiltradas.map((f) => (
                <tr key={f.id}>
                  <td style={styles.td}>{f.id}</td>
                  <td style={styles.td}>{f.cliente}</td>
                  <td style={styles.td}>
                    {f.productos ? (
                      <div style={{ fontSize: '12px' }}>
                        {f.productos.map((p, i) => (
                          <div key={i}>{p.tipoMaceta} x{p.cantidad}</div>
                        ))}
                      </div>
                    ) : (
                      `${f.tipoMaceta} x${f.cantidad}`
                    )}
                  </td>
                  <td style={styles.td}>€{f.subtotal.toFixed(2)}</td>
                  <td style={{...styles.td, fontWeight: 'bold', color: '#0177ed'}}>€{f.total.toFixed(2)}</td>
                  <td style={styles.td}>{f.metodoPago}</td>
                  <td style={styles.td}>{f.fecha}</td>
                  <td style={styles.td}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      background: f.estado === 'Pendiente' ? '#fbbf24' : '#10b981',
                      color: 'white'
                    }}>
                      {f.estado}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <select 
                      value={f.estado}
                      onChange={(e) => cambiarEstado(f.id, e.target.value)}
                      style={{fontSize: '12px', marginRight: 4}}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Pagada">Pagada</option>
                    </select>
                    <button onClick={() => eliminar(f.id)} style={{fontSize: '12px', padding: '2px 6px', color: '#333', background: '#eee', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer'}}>
                      ✕
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: 16, fontFamily: 'Segoe UI, Roboto, Arial, sans-serif' },
  header: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  title: { color: '#87CEFA', margin: 0, textAlign: 'center' },
  button: { padding: '8px 12px', background: '#097d85', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', margin: '0 4px' },
  input: { padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' },
  label: { display: 'block', marginBottom: '4px', color: '#374151', fontWeight: '600', fontSize: '14px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #006881', background: '#a7d8fc' },
  td: { padding: '8px 10px', borderBottom: '1px solid #09025c' }
};

export default Facturacion;
