import React, { useState, useEffect } from 'react';
import BarraBusqueda from '../componentes/barraBusqueda.jsx';
import logoNiger from '../assets/Niger.png';

const API_URL = 'http://localhost:5000';

const Facturacion = () => {
  const [facturas, setFacturas] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [mostrarModalVentas, setMostrarModalVentas] = useState(false);
  const [ventasSeleccionadas, setVentasSeleccionadas] = useState([]);
  const [query, setQuery] = useState('');

  // Cargar facturas al montar
  useEffect(() => {
    cargarFacturas();
  }, []);

  const cargarFacturas = async () => {
    try {
      const response = await fetch(`${API_URL}/facturas`);
      const data = await response.json();
      console.log('Facturas cargadas:', data);
      
      // Enriquecer facturas con información de ventas
      const facturasEnriquecidas = await Promise.all(
        data.map(async (factura) => {
          if (!factura.ventas_ids || factura.ventas_ids.length === 0) {
            return factura;
          }
          
          // Si ventas_ids tiene ObjectIds (strings), buscar las ventas
          if (typeof factura.ventas_ids[0] === 'string' || factura.ventas_ids[0]._id) {
            try {
              const ventasPromises = factura.ventas_ids.map(async (ventaId) => {
                const id = typeof ventaId === 'string' ? ventaId : ventaId._id;
                const ventaResponse = await fetch(`${API_URL}/ventas/${id}`);
                if (ventaResponse.ok) {
                  return await ventaResponse.json();
                }
                return null;
              });
              
              const ventasData = await Promise.all(ventasPromises);
              return {
                ...factura,
                ventas_ids: ventasData.filter(v => v !== null)
              };
            } catch (error) {
              console.error('Error cargando ventas de factura:', error);
              return factura;
            }
          }
          
          return factura;
        })
      );
      
      console.log('Facturas enriquecidas:', facturasEnriquecidas);
      if (facturasEnriquecidas.length > 0) {
        console.log('Primera factura enriquecida:', facturasEnriquecidas[0]);
        console.log('Ventas de primera factura:', facturasEnriquecidas[0].ventas_ids);
      }
      setFacturas(facturasEnriquecidas);
    } catch (error) {
      console.error('Error cargando facturas:', error);
      alert('Error al cargar facturas');
    }
  };

  const cargarVentas = async () => {
    console.log('Cargando ventas...');
    try {
      const response = await fetch(`${API_URL}/ventas`);
      const data = await response.json();
      console.log('Ventas cargadas:', data.length, 'ventas');
      setVentas(data);
      setMostrarModalVentas(true);
    } catch (error) {
      console.error('Error cargando ventas:', error);
      alert('Error al cargar ventas. ¿Está el backend corriendo en http://localhost:5000?');
    }
  };

  const toggleVentaSeleccionada = (ventaId) => {
    setVentasSeleccionadas(prev => 
      prev.includes(ventaId) 
        ? prev.filter(id => id !== ventaId)
        : [...prev, ventaId]
    );
  };

  const calcularTotales = () => {
    const ventasACalcular = ventas.filter(v => ventasSeleccionadas.includes(v._id));
    const total = ventasACalcular.reduce((sum, v) => sum + (v.total || 0), 0);
    console.log('Calculando totales:', { ventasACalcular, total });
    return { total };
  };

  const crearFactura = async () => {
    if (ventasSeleccionadas.length === 0) {
      return alert('Selecciona al menos una venta');
    }

    const { total } = calcularTotales();
    
    if (!total || total === 0) {
      return alert('El total de la factura no puede ser 0');
    }
    
    const impuestos = 21; // IVA estándar en %
    const subtotal = total / (1 + impuestos / 100);
    
    console.log('IDs de ventas seleccionadas:', ventasSeleccionadas);
    
    // Guardar las ventas completas para usarlas después
    const ventasCompletas = ventas.filter(v => ventasSeleccionadas.includes(v._id));
    console.log('Ventas completas:', ventasCompletas);
    
    const nuevaFactura = {
      ventas_ids: ventasSeleccionadas,
      subtotal: Number(subtotal.toFixed(2)),
      impuestos: impuestos,
      total: Number(total.toFixed(2)),
      metodo_pago: 'Efectivo',
      estado: 'Pendiente',
      // Guardar información de las ventas directamente en la factura como backup
      ventas_info: ventasCompletas.map(v => ({
        _id: v._id,
        cliente: v.cliente_id?.nombre || v.cliente,
        producto: v.producto_id?.producto || v.tipo_maceta,
        cantidad: v.cantidad,
        total: v.total
      }))
    };

    console.log('Enviando factura:', nuevaFactura);

    try {
      const response = await fetch(`${API_URL}/facturas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaFactura)
      });
      
      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      
      if (response.ok) {
        alert('Factura creada exitosamente');
        setMostrarModalVentas(false);
        setVentasSeleccionadas([]);
        cargarFacturas();
      } else {
        console.error('Error del servidor:', data);
        alert(`Error al crear factura: ${data.error || data.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear factura');
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const response = await fetch(`${API_URL}/facturas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      
      if (response.ok) {
        cargarFacturas();
      } else {
        alert('Error al cambiar estado');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cambiar estado');
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta factura?')) return;
    
    try {
      const response = await fetch(`${API_URL}/facturas/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        cargarFacturas();
      } else {
        alert('Error al eliminar factura');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar factura');
    }
  };

  const facturasFiltradas = facturas.filter(f => {
    if (!query) return true;
    const cliente = f.ventas_ids?.[0]?.cliente_id?.nombre || f.ventas_ids?.[0]?.cliente || '';
    return cliente.toLowerCase().includes(query.toLowerCase()) ||
           f._id.includes(query);
  });

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: 10 }}>
        <img src={logoNiger} alt="Niger Logo" style={{ width: 80, height: 'auto' }} />
        <div style={{ flex: 1 }}>
          <BarraBusqueda />
        </div>
      </div>
      <div style={styles.header}>
        <h1 style={styles.title}>Facturación</h1>
      </div>

      <p style={{ fontSize: 12, color: '#0177ed', marginBottom: 12 }}>
        Mostrando {facturasFiltradas.length} de {facturas.length} facturas.
      </p>

      {/* Botón para crear factura */}
      <div style={{ marginBottom: 16 }}>
        <button onClick={cargarVentas} style={styles.button}>
          Crear Nueva Factura
        </button>
      </div>

      {/* Modal de selección de ventas */}
      {mostrarModalVentas && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginTop: 0, color: '#374151' }}>Seleccionar Ventas para la Factura</h3>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: 20 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#a7d8fc', position: 'sticky', top: 0 }}>
                    <th style={{ padding: 8, textAlign: 'left', color: '#000' }}>Sel.</th>
                    <th style={{ padding: 8, textAlign: 'left', color: '#000' }}>Cliente</th>
                    <th style={{ padding: 8, textAlign: 'left', color: '#000' }}>Producto</th>
                    <th style={{ padding: 8, textAlign: 'left', color: '#000' }}>Cantidad</th>
                    <th style={{ padding: 8, textAlign: 'left', color: '#000' }}>Total</th>
                    <th style={{ padding: 8, textAlign: 'left', color: '#000' }}>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: 20, textAlign: 'center', color: '#000' }}>
                        No hay ventas disponibles
                      </td>
                    </tr>
                  ) : (
                    ventas.map(venta => (
                      <tr key={venta._id} style={{ background: ventasSeleccionadas.includes(venta._id) ? '#e0f2fe' : '#fff' }}>
                        <td style={{ padding: 8, borderBottom: '1px solid #ddd', color: '#000' }}>
                          <input
                            type="checkbox"
                            checked={ventasSeleccionadas.includes(venta._id)}
                            onChange={() => toggleVentaSeleccionada(venta._id)}
                          />
                        </td>
                        <td style={{ padding: 8, borderBottom: '1px solid #ddd', color: '#000' }}>
                          {venta.cliente_id?.nombre || venta.cliente || 'Sin cliente'}
                        </td>
                        <td style={{ padding: 8, borderBottom: '1px solid #ddd', color: '#000' }}>
                          {venta.producto_id?.producto || venta.tipo_maceta || 'Sin producto'}
                        </td>
                        <td style={{ padding: 8, borderBottom: '1px solid #ddd', color: '#000' }}>
                          {venta.cantidad || 0}
                        </td>
                        <td style={{ padding: 8, borderBottom: '1px solid #ddd', color: '#000' }}>
                          €{venta.total?.toFixed(2) || '0.00'}
                        </td>
                        <td style={{ padding: 8, borderBottom: '1px solid #ddd', color: '#000' }}>
                          {venta.fecha_venta ? new Date(venta.fecha_venta).toLocaleDateString() : 'Sin fecha'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {ventasSeleccionadas.length > 0 && (
              <div style={{ background: '#fafafa', padding: 15, borderRadius: 6, marginBottom: 15, border: '1px solid #ccc' }}>
                <p style={{ margin: '4px 0', color: '#000' }}>
                  <strong>Ventas seleccionadas:</strong> {ventasSeleccionadas.length}
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '18px', color: '#000' }}>
                  <strong>Total: €{calcularTotales().total.toFixed(2)}</strong>
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={crearFactura} style={{ ...styles.button, background: '#097d85' }}>
                Crear Factura
              </button>
              <button onClick={() => { setMostrarModalVentas(false); setVentasSeleccionadas([]); }} 
                      style={{ ...styles.button, background: '#6b7280' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Búsqueda */}
      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Buscar facturas por cliente o ID..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #34b6f7ff' }}
        />
      </div>

      {/* Tabla de facturas */}
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Cliente(s)</th>
              <th style={styles.th}>Productos</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Fecha</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {facturasFiltradas.length === 0 ? (
              <tr><td colSpan="7" style={{...styles.td, textAlign: 'center'}}>No hay facturas</td></tr>
            ) : (
              facturasFiltradas.map((f) => (
                <tr key={f._id}>
                  <td style={styles.td}>{f._id.slice(-6)}</td>
                  <td style={styles.td}>
                    {f.ventas_info 
                      ? f.ventas_info.map(v => v.cliente).filter(Boolean).join(', ')
                      : f.ventas_ids?.map(v => v.cliente_id?.nombre || v.cliente).filter(Boolean).join(', ') || 'Sin cliente'
                    }
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontSize: '12px' }}>
                      {f.ventas_info 
                        ? f.ventas_info.map((v, i) => (
                            <div key={i}>{v.producto} x{v.cantidad}</div>
                          ))
                        : f.ventas_ids?.map((v, i) => (
                            <div key={i}>
                              {v.producto_id?.producto || v.tipo_maceta || 'Sin producto'} x{v.cantidad}
                            </div>
                          ))
                      }
                    </div>
                  </td>
                  <td style={{...styles.td, fontWeight: 'bold', color: '#0177ed'}}>
                    €{f.total?.toFixed(2)}
                  </td>
                  <td style={styles.td}>
                    {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : 'Sin fecha'}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      background: f.estado === 'Pendiente' ? '#fbbf24' : f.estado === 'Pagada' ? '#10b981' : '#ef4444',
                      color: 'white'
                    }}>
                      {f.estado}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <select 
                      value={f.estado}
                      onChange={(e) => cambiarEstado(f._id, e.target.value)}
                      style={{fontSize: '12px', marginRight: 4}}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Pagada">Pagada</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                    <button onClick={() => eliminar(f._id)} 
                            style={{fontSize: '12px', padding: '2px 6px', color: '#fff', background: '#ef4444', border: 'none', borderRadius: 4, cursor: 'pointer'}}>
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
  container: { padding: 16, fontFamily: 'Segoe UI, Roboto, Arial, sans-serif', position: 'relative' },
  header: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  title: { color: '#87CEFA', margin: 0, textAlign: 'center' },
  button: { padding: '8px 12px', background: '#097d85', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', margin: '0 4px' },
  input: { padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' },
  label: { display: 'block', marginBottom: '4px', color: '#374151', fontWeight: '600', fontSize: '14px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #006881', background: '#a7d8fc' },
  td: { padding: '8px 10px', borderBottom: '1px solid #09025c' },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 8,
    maxWidth: '800px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto'
  }
};

export default Facturacion;
