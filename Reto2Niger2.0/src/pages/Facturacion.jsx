import React, { useState, useEffect } from 'react';
import BarraBusqueda from '../componentes/barraBusqueda.jsx';
import logoNiger from '../assets/Niger.png';
import { commonStyles } from '../styles/commonStyles.js';

const API_URL = 'http://localhost:5000';

const styles = {
  modalTh: { padding: 8, textAlign: 'left', color: '#000' },
  modalTd: { padding: 8, borderBottom: '1px solid #ddd', color: '#000' },
  modalTable: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  badge: (estado) => ({
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    background: estado === 'Pendiente' ? '#fbbf24' : estado === 'Pagada' ? '#10b981' : '#ef4444',
    color: 'white'
  }),
  viewerSection: { marginBottom: '30px' },
  viewerH3: { color: '#0177ed', fontSize: '16px', marginBottom: '10px' },
  viewerBox: { background: '#f8fafc', padding: '15px', borderRadius: '6px' },
  viewerText: { margin: '6px 0', color: '#1e293b', fontSize: '14px' }
};

const Facturacion = () => {
  const [facturas, setFacturas] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [mostrarModalVentas, setMostrarModalVentas] = useState(false);
  const [ventasSeleccionadas, setVentasSeleccionadas] = useState([]);
  const [query, setQuery] = useState('');
  const [facturaViewer, setFacturaViewer] = useState(null);

  useEffect(() => {
    cargarFacturas();
  }, []);

  const cargarFacturas = async () => {
    try {
      const response = await fetch(`${API_URL}/facturas`);
      const data = await response.json();
      
      const facturasEnriquecidas = await Promise.all(
        data.map(async (factura) => {
          let clienteCompleto = null;
          let nombreCliente = factura.ventas_info?.[0]?.cliente;
          
          if (nombreCliente) {
            try {
              const clientesResponse = await fetch(`${API_URL}/clientes`);
              if (clientesResponse.ok) {
                const todosClientes = await clientesResponse.json();
                clienteCompleto = todosClientes.find(c => 
                  `${c.nombre} ${c.apellidos}`.trim() === nombreCliente.trim()
                );
              }
            } catch (err) {}
          }
          
          return { ...factura, clienteCompleto };
        })
      );
      
      setFacturas(facturasEnriquecidas);
    } catch (error) {
      alert('Error al cargar facturas');
    }
  };

  const cargarVentas = async () => {
    try {
      const response = await fetch(`${API_URL}/ventas`);
      const data = await response.json();
      setVentas(data);
      setMostrarModalVentas(true);
    } catch (error) {
      alert('Error al cargar ventas');
    }
  };

  const calcularTotales = () => {
    const ventasACalcular = ventas.filter(v => ventasSeleccionadas.includes(v._id));
    return { total: ventasACalcular.reduce((sum, v) => sum + (v.total || 0), 0) };
  };

  const crearFactura = async () => {
    if (ventasSeleccionadas.length === 0) {
      return alert('Selecciona al menos una venta');
    }

    const { total } = calcularTotales();
    if (!total || total === 0) return alert('El total de la factura no puede ser 0');
    
    const impuestos = 21;
    const subtotal = total / (1 + impuestos / 100);
    const ventasCompletas = ventas.filter(v => ventasSeleccionadas.includes(v._id));
    
    const nuevaFactura = {
      ventas_ids: ventasSeleccionadas,
      subtotal: Number(subtotal.toFixed(2)),
      impuestos,
      total: Number(total.toFixed(2)),
      metodo_pago: 'Efectivo',
      estado: 'Pendiente',
      ventas_info: ventasCompletas.map(v => ({
        _id: v._id,
        cliente: v.cliente,
        tipo_maceta: v.tipo_maceta,
        cantidad: v.cantidad,
        precio_unitario: v.precio_unitario,
        total: v.total
      }))
    };

    try {
      const response = await fetch(`${API_URL}/facturas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaFactura)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Factura creada exitosamente');
        setMostrarModalVentas(false);
        setVentasSeleccionadas([]);
        cargarFacturas();
      } else {
        alert(`Error al crear factura: ${data.error || data.message || 'Error desconocido'}`);
      }
    } catch (error) {
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
      if (response.ok) cargarFacturas();
      else alert('Error al cambiar estado');
    } catch (error) {
      alert('Error al cambiar estado');
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta factura?')) return;
    try {
      const response = await fetch(`${API_URL}/facturas/${id}`, { method: 'DELETE' });
      if (response.ok) cargarFacturas();
      else alert('Error al eliminar factura');
    } catch (error) {
      alert('Error al eliminar factura');
    }
  };

  const facturasFiltradas = facturas.filter(f => {
    if (!query) return true;
    const cliente = f.ventas_info?.[0]?.cliente || '';
    return cliente.toLowerCase().includes(query.toLowerCase()) || f._id.includes(query);
  });

  return (
    <div style={commonStyles.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: 10 }}>
        <img src={logoNiger} alt="Niger Logo" style={{ width: 80, height: 'auto' }} />
        <div style={{ flex: 1 }}>
          <BarraBusqueda />
        </div>
      </div>
      <div style={commonStyles.header}>
        <h1 style={commonStyles.title}>Facturación</h1>
      </div>

      <p style={{ fontSize: 12, color: '#0177ed', marginBottom: 12 }}>
        Mostrando {facturasFiltradas.length} de {facturas.length} facturas.
      </p>

      <div style={{ marginBottom: 16 }}>
        <button onClick={cargarVentas} style={commonStyles.button}>
          Crear Nueva Factura
        </button>
      </div>

      {/* Modal de selección de ventas */}
      {mostrarModalVentas && (
        <div style={commonStyles.modalOverlay}>
          <div style={commonStyles.modalContent}>
            <h3 style={{ marginTop: 0, color: '#374151' }}>Seleccionar Ventas para la Factura</h3>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: 20 }}>
              <table style={styles.modalTable}>
                <thead>
                  <tr style={{ background: '#a7d8fc', position: 'sticky', top: 0 }}>
                    <th style={styles.modalTh}>Sel.</th>
                    <th style={styles.modalTh}>Cliente</th>
                    <th style={styles.modalTh}>Producto</th>
                    <th style={styles.modalTh}>Cantidad</th>
                    <th style={styles.modalTh}>Total</th>
                    <th style={styles.modalTh}>Fecha</th>
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
                        <td style={styles.modalTd}>
                          <input
                            type="checkbox"
                            checked={ventasSeleccionadas.includes(venta._id)}
                            onChange={() => setVentasSeleccionadas(prev => 
                              prev.includes(venta._id) 
                                ? prev.filter(id => id !== venta._id)
                                : [...prev, venta._id]
                            )}
                          />
                        </td>
                        <td style={styles.modalTd}>{venta.cliente || 'Sin cliente'}</td>
                        <td style={styles.modalTd}>{venta.tipo_maceta || 'Sin producto'}</td>
                        <td style={styles.modalTd}>{venta.cantidad || 0}</td>
                        <td style={styles.modalTd}>€{venta.total?.toFixed(2) || '0.00'}</td>
                        <td style={styles.modalTd}>
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
              <button onClick={crearFactura} style={{ ...commonStyles.button, background: '#097d85' }}>
                Crear Factura
              </button>
              <button onClick={() => { setMostrarModalVentas(false); setVentasSeleccionadas([]); }} 
                      style={{ ...commonStyles.button, background: '#6b7280' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Buscar facturas por cliente o ID..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #34b6f7ff' }}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={commonStyles.table}>
          <thead>
            <tr>
              <th style={commonStyles.th}>ID</th>
              <th style={commonStyles.th}>Cliente(s)</th>
              <th style={commonStyles.th}>Productos</th>
              <th style={commonStyles.th}>Total</th>
              <th style={commonStyles.th}>Fecha</th>
              <th style={commonStyles.th}>Estado</th>
              <th style={commonStyles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {facturasFiltradas.length === 0 ? (
              <tr><td colSpan="7" style={{...commonStyles.td, textAlign: 'center'}}>No hay facturas</td></tr>
            ) : (
              facturasFiltradas.map((f) => (
                <tr key={f._id}>
                  <td style={commonStyles.td}>{f._id.slice(-6)}</td>
                  <td style={commonStyles.td}>
                    {f.ventas_info 
                      ? f.ventas_info.map(v => v.cliente).filter(Boolean).join(', ')
                      : 'Sin cliente'
                    }
                  </td>
                  <td style={commonStyles.td}>
                    <div style={{ fontSize: '12px' }}>
                      {f.ventas_info?.map((v, i) => (
                        <div key={i}>{v.tipo_maceta} x{v.cantidad}</div>
                      ))}
                    </div>
                  </td>
                  <td style={{...commonStyles.td, fontWeight: 'bold', color: '#0177ed'}}>
                    €{f.total?.toFixed(2)}
                  </td>
                  <td style={commonStyles.td}>
                    {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : 'Sin fecha'}
                  </td>
                  <td style={commonStyles.td}>
                    <span style={styles.badge(f.estado)}>{f.estado}</span>
                  </td>
                  <td style={commonStyles.td}>
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
                  <span style={styles.badge(facturaViewer.estado)}>{facturaViewer.estado}</span>
                </p>
              </div>
            </div>

            <div style={styles.viewerSection}>
              <h3 style={styles.viewerH3}>DATOS DEL CLIENTE</h3>
              <div style={styles.viewerBox}>
                {facturaViewer.clienteCompleto ? (
                  <>
                    <p style={styles.viewerText}>
                      <strong>Nombre:</strong> {facturaViewer.clienteCompleto.nombre} {facturaViewer.clienteCompleto.apellidos}
                    </p>
                    <p style={styles.viewerText}>
                      <strong>Dirección:</strong> {facturaViewer.clienteCompleto.direccion}
                    </p>
                    <p style={styles.viewerText}>
                      <strong>Teléfono:</strong> {facturaViewer.clienteCompleto.telefono}
                    </p>
                    <p style={styles.viewerText}>
                      <strong>Email:</strong> {facturaViewer.clienteCompleto.email}
                    </p>
                  </>
                ) : (
                  <p style={styles.viewerText}>
                    {facturaViewer.ventas_info 
                      ? [...new Set(facturaViewer.ventas_info.map(v => v.cliente))].filter(Boolean).join(', ')
                      : 'Sin cliente'
                    }
                  </p>
                )}
              </div>
            </div>

            <div style={styles.viewerSection}>
              <h3 style={styles.viewerH3}>DETALLE</h3>
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
                  {facturaViewer.ventas_info?.map((v, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', color: '#1e293b', fontSize: '14px' }}>{v.tipo_maceta || 'Sin producto'}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#475569', fontSize: '14px' }}>{v.cantidad}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#475569', fontSize: '14px' }}>€{v.precio_unitario?.toFixed(2) || '0.00'}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#1e293b', fontWeight: 'bold', fontSize: '14px' }}>€{(v.cantidad * (v.precio_unitario || 0)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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

            <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '20px', textAlign: 'center' }}>
              <p style={{ margin: '4px 0', color: '#64748b', fontSize: '12px' }}>Niger - Soluciones de Jardinería</p>
              <p style={{ margin: '4px 0', color: '#64748b', fontSize: '12px' }}>www.niger.com | contacto@niger.com | Tel: +34 900 000 000</p>
            </div>

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

export default Facturacion;
