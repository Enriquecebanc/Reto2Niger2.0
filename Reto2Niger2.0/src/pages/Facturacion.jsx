import React, { useState, useEffect } from 'react';
import BarraBusqueda from '../componentes/barraBusqueda.jsx';
import logoNiger from '../assets/Niger.png';
import { commonStyles, colors } from '../styles/commonStyles.js';

const API_URL = 'http://localhost:5000';

const Facturacion = () => {
  const [facturas, setFacturas] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [mostrarModalVentas, setMostrarModalVentas] = useState(false);
  const [ventasSeleccionadas, setVentasSeleccionadas] = useState([]);
  const [query, setQuery] = useState('');
  const [facturaViewer, setFacturaViewer] = useState(null);

  // Cargar facturas al montar
  useEffect(() => {
    cargarFacturas();
  }, []);

  const cargarFacturas = async () => {
    try {
      const response = await fetch(`${API_URL}/facturas`);
      const data = await response.json();
      console.log('Facturas cargadas:', data);
      
      // Enriquecer facturas con información de clientes
      const facturasEnriquecidas = await Promise.all(
        data.map(async (factura) => {
          // Obtener datos completos del cliente
          let clienteCompleto = null;
          
          // Intentar obtener el nombre del cliente desde ventas_info o ventas_ids
          let nombreCliente = null;
          if (factura.ventas_info && factura.ventas_info.length > 0) {
            nombreCliente = factura.ventas_info[0].cliente;
          } else if (factura.ventas_ids && factura.ventas_ids.length > 0) {
            // Si hay ventas_ids, intentar cargar la primera venta
            try {
              const ventaId = typeof factura.ventas_ids[0] === 'string' 
                ? factura.ventas_ids[0] 
                : factura.ventas_ids[0]._id;
              const ventaResponse = await fetch(`${API_URL}/ventas/${ventaId}`);
              if (ventaResponse.ok) {
                const ventaData = await ventaResponse.json();
                nombreCliente = ventaData.cliente;
              }
            } catch (err) {
              console.error('Error cargando venta:', err);
            }
          }
          
          // Si tenemos un nombre de cliente, buscar sus datos completos
          if (nombreCliente) {
            try {
              const clientesResponse = await fetch(`${API_URL}/clientes`);
              if (clientesResponse.ok) {
                const todosClientes = await clientesResponse.json();
                console.log('Todos los clientes:', todosClientes);
                console.log('Buscando cliente:', nombreCliente);
                
                // Buscar cliente por nombre completo
                const nombreBuscado = nombreCliente.trim();
                clienteCompleto = todosClientes.find(c => {
                  const nombreCompleto = `${c.nombre} ${c.apellidos}`.trim();
                  return nombreCompleto === nombreBuscado;
                });
                console.log('Cliente encontrado:', clienteCompleto);
              }
            } catch (err) {
              console.error('Error cargando datos del cliente:', err);
            }
          }
          
          return {
            ...factura,
            clienteCompleto: clienteCompleto
          };
        })
      );
      
      console.log('Facturas enriquecidas:', facturasEnriquecidas);
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
        cliente: v.cliente,
        tipo_maceta: v.tipo_maceta,
        cantidad: v.cantidad,
        precio_unitario: v.precio_unitario,
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
    const cliente = f.ventas_ids?.[0]?.cliente || '';
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
                          {venta.cliente || 'Sin cliente'}
                        </td>
                        <td style={{ padding: 8, borderBottom: '1px solid #ddd', color: '#000' }}>
                          {venta.tipo_maceta || 'Sin producto'}
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
                      : f.ventas_ids?.map(v => v.cliente).filter(Boolean).join(', ') || 'Sin cliente'
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
                              {v.tipo_maceta || 'Sin producto'} x{v.cantidad}
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
                    <button onClick={() => setFacturaViewer(f)} 
                            style={{fontSize: '12px', padding: '4px 8px', color: '#fff', background: '#0177ed', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 4}}>
                       Ver
                    </button>
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

      {/* Modal Ver Factura */}
      {facturaViewer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            padding: '40px',
            borderRadius: '8px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            {/* Encabezado Factura */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '30px', borderBottom: '3px solid #0177ed', paddingBottom: '20px' }}>
              <div>
                <img src={logoNiger} alt="Niger" style={{ height: '60px', marginBottom: '10px' }} />
                <h2 style={{ margin: 0, color: '#1e293b', fontSize: '24px' }}>FACTURA</h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '4px 0', color: '#475569', fontSize: '14px' }}>
                  <strong>Nº Factura:</strong> {facturaViewer._id.slice(-8).toUpperCase()}
                </p>
                <p style={{ margin: '4px 0', color: '#475569', fontSize: '14px' }}>
                  <strong>Fecha:</strong> {facturaViewer.createdAt ? new Date(facturaViewer.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Sin fecha'}
                </p>
                <p style={{ margin: '4px 0' }}>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    background: facturaViewer.estado === 'Pendiente' ? '#fbbf24' : facturaViewer.estado === 'Pagada' ? '#10b981' : '#ef4444',
                    color: 'white'
                  }}>
                    {facturaViewer.estado}
                  </span>
                </p>
              </div>
            </div>

            {/* Información del Cliente */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#0177ed', fontSize: '16px', marginBottom: '10px' }}>DATOS DEL CLIENTE</h3>
              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '6px' }}>
                {facturaViewer.clienteCompleto ? (
                  <>
                    <p style={{ margin: '6px 0', color: '#1e293b', fontSize: '14px' }}>
                      <strong>Nombre:</strong> {facturaViewer.clienteCompleto.nombre} {facturaViewer.clienteCompleto.apellidos}
                    </p>
                    <p style={{ margin: '6px 0', color: '#1e293b', fontSize: '14px' }}>
                      <strong>Dirección:</strong> {facturaViewer.clienteCompleto.direccion}
                    </p>
                    <p style={{ margin: '6px 0', color: '#1e293b', fontSize: '14px' }}>
                      <strong>Teléfono:</strong> {facturaViewer.clienteCompleto.telefono}
                    </p>
                    <p style={{ margin: '6px 0', color: '#1e293b', fontSize: '14px' }}>
                      <strong>Email:</strong> {facturaViewer.clienteCompleto.email}
                    </p>
                  </>
                ) : (
                  <p style={{ margin: '4px 0', color: '#1e293b', fontSize: '14px' }}>
                    {facturaViewer.ventas_info 
                      ? [...new Set(facturaViewer.ventas_info.map(v => v.cliente))].filter(Boolean).join(', ')
                      : facturaViewer.ventas_ids?.map(v => v.cliente).filter(Boolean).join(', ') || 'Sin cliente'
                    }
                  </p>
                )}
              </div>
            </div>

            {/* Detalle de Productos */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#0177ed', fontSize: '16px', marginBottom: '10px' }}>DETALLE</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f8fafc' }}>
                <thead>
                  <tr style={{ background: '#0177ed', color: 'white' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>Producto</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>Cantidad</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Precio Unit.</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {facturaViewer.ventas_info ? (
                    facturaViewer.ventas_info.map((v, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px', color: '#1e293b', fontSize: '14px' }}>{v.producto || v.tipo_maceta || 'Sin producto'}</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: '#475569', fontSize: '14px' }}>{v.cantidad}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#475569', fontSize: '14px' }}>€{v.precio_unitario?.toFixed(2) || '0.00'}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#1e293b', fontWeight: 'bold', fontSize: '14px' }}>€{(v.cantidad * (v.precio_unitario || 0)).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : facturaViewer.ventas_ids?.map((v, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', color: '#1e293b', fontSize: '14px' }}>{v.tipo_maceta || 'Sin producto'}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#475569', fontSize: '14px' }}>{v.cantidad}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#475569', fontSize: '14px' }}>€{v.precio_unitario?.toFixed(2) || '0.00'}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#1e293b', fontWeight: 'bold', fontSize: '14px' }}>€{v.total?.toFixed(2) || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
              <div style={{ width: '250px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8fafc', marginBottom: '5px' }}>
                  <span style={{ color: '#475569', fontSize: '14px' }}>Subtotal:</span>
                  <span style={{ color: '#1e293b', fontWeight: 'bold', fontSize: '14px' }}>€{facturaViewer.total?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8fafc', marginBottom: '5px' }}>
                  <span style={{ color: '#475569', fontSize: '14px' }}>IVA (21%):</span>
                  <span style={{ color: '#1e293b', fontWeight: 'bold', fontSize: '14px' }}>€{(facturaViewer.total * 0.21).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#0177ed', color: 'white' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>TOTAL:</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>€{(facturaViewer.total * 1.21).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Pie de página */}
            <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '20px', textAlign: 'center' }}>
              <p style={{ margin: '4px 0', color: '#64748b', fontSize: '12px' }}>Niger - Soluciones de Jardinería</p>
              <p style={{ margin: '4px 0', color: '#64748b', fontSize: '12px' }}>www.niger.com | contacto@niger.com | Tel: +34 900 000 000</p>
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => window.print()}
                style={{
                  padding: '10px 20px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                 Imprimir
              </button>
              <button 
                onClick={() => setFacturaViewer(null)}
                style={{
                  padding: '10px 20px',
                  background: '#64748b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = commonStyles;

export default Facturacion;
