import React, { useState, useEffect } from 'react';
import BarraBusqueda from '../componentes/barraBusqueda.jsx';
import logoNiger from '../assets/Niger-Photoroom.png';
import { commonStyles } from '../styles/commonStyles.js';

const API_URL = 'http://localhost:5000'; // URL del backend

// Estilos reutilizables (optimización para evitar repetir inline)
const modalTableTh = { padding: 8, textAlign: 'left', color: '#000' };
const modalTableTd = { padding: 8, borderBottom: '1px solid #ddd', color: '#000' };
const facturaInfoText = { margin: '6px 0', color: '#1e293b', fontSize: '14px' };
const facturaHeaderText = { margin: '4px 0', color: '#475569', fontSize: '14px' };
const facturaTableTh = { padding: '12px', fontSize: '14px' };
const facturaTableTd = { padding: '12px', fontSize: '14px' };
const btnBase = { border: 'none', borderRadius: 4, cursor: 'pointer', color: '#fff' };

const Facturacion = () => {
  // Estados del componente
  const [facturas, setFacturas] = useState([]); // Facturas de la BD
  const [ventas, setVentas] = useState([]); // Ventas disponibles
  const [mostrarModalVentas, setMostrarModalVentas] = useState(false); // Control modal
  const [ventasSeleccionadas, setVentasSeleccionadas] = useState([]); // IDs ventas seleccionadas
  const [query, setQuery] = useState(''); // Búsqueda
  const [facturaViewer, setFacturaViewer] = useState(null); // Factura en vista detalle

  useEffect(() => {
    cargarFacturas(); // Cargar facturas al montar componente
  }, []);

  // Cargar facturas y enriquecerlas con datos completos del cliente
  // Esta función hace 3 cosas: 1) Obtener facturas 2) Buscar nombre del cliente 3) Enriquecer con datos completos
  const cargarFacturas = async () => {
    try {
      // PASO 1: Obtener todas las facturas desde el backend
      const response = await fetch(`${API_URL}/facturas`);
      const data = await response.json();
      
      // PASO 2: Enriquecer cada factura con información del cliente (dirección, teléfono, email)
      // Promise.all() ejecuta todas las promesas en paralelo y espera a que terminen
      const facturasEnriquecidas = await Promise.all(
        data.map(async (factura) => {
          let clienteCompleto = null;
          let nombreCliente = factura.ventas_info?.[0]?.cliente; // Intentar desde ventas_info (backup)
          
          // PASO 2.1: Si no hay nombre en ventas_info, buscarlo en ventas_ids
          if (!nombreCliente && factura.ventas_ids?.length > 0) { // Si no, buscar en ventas_ids
            try {
              // Manejar dos casos: ID como string o como objeto con _id
              const ventaId = typeof factura.ventas_ids[0] === 'string' ? factura.ventas_ids[0] : factura.ventas_ids[0]._id;
              const ventaResponse = await fetch(`${API_URL}/ventas/${ventaId}`);
              if (ventaResponse.ok) nombreCliente = (await ventaResponse.json()).cliente;
            } catch (err) {
              console.error('Error cargando venta:', err);
            }
          }
          
          // PASO 2.2: Con el nombre del cliente, buscar sus datos completos en la BD de clientes
          if (nombreCliente) { // Buscar datos completos del cliente
            try {
              const clientesResponse = await fetch(`${API_URL}/clientes`);
              if (clientesResponse.ok) {
                const todosClientes = await clientesResponse.json();
                // find() busca el primer cliente que coincida con el nombre completo
                clienteCompleto = todosClientes.find(c => `${c.nombre} ${c.apellidos}`.trim() === nombreCliente.trim());
              }
            } catch (err) {
              console.error('Error cargando datos del cliente:', err);
            }
          }
          
          // PASO 2.3: Devolver factura original + cliente completo (spread operator ...)
          return { ...factura, clienteCompleto }; // Devolver factura + cliente completo
        })
      );
      
      // PASO 3: Actualizar el estado con las facturas enriquecidas
      setFacturas(facturasEnriquecidas);
    } catch (error) {
      console.error('Error cargando facturas:', error);
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
      console.error('Error cargando ventas:', error);
      alert('Error al cargar ventas. ¿Está el backend corriendo en http://localhost:5000?');
    }
  };

  const toggleVentaSeleccionada = (ventaId) => { // Marca/desmarca checkbox
    setVentasSeleccionadas(prev => 
      prev.includes(ventaId) ? prev.filter(id => id !== ventaId) : [...prev, ventaId]
    );
  };

  const calcularTotales = () => { // Suma totales de ventas seleccionadas
    const total = ventas.filter(v => ventasSeleccionadas.includes(v._id)).reduce((sum, v) => sum + (v.total || 0), 0);
    return { total };
  };

  // Crear factura con las ventas seleccionadas
  // Proceso: 1) Validar 2) Calcular totales e IVA 3) Construir objeto 4) Enviar al backend
  const crearFactura = async () => {
    // VALIDACIÓN 1: Debe haber al menos una venta seleccionada
    if (ventasSeleccionadas.length === 0) return alert('Selecciona al menos una venta');

    // VALIDACIÓN 2: El total debe ser mayor que 0
    const { total } = calcularTotales();
    if (!total) return alert('El total de la factura no puede ser 0');
    
    // CÁLCULOS FISCALES: IVA español estándar 21%
    const impuestos = 21; // IVA estándar España: 21%
    const subtotal = total / 1.21; // Base imponible sin IVA (restar el 21% del total)
    const ventasCompletas = ventas.filter(v => ventasSeleccionadas.includes(v._id)); // Filtrar solo las ventas seleccionadas
    
    // CONSTRUIR OBJETO FACTURA: Estructura que se enviará al backend
    const nuevaFactura = {
      ventas_ids: ventasSeleccionadas, // Array de IDs para relacionar con colección Ventas
      subtotal: Number(subtotal.toFixed(2)), // Base imponible (sin IVA)
      impuestos: impuestos, // Porcentaje de IVA aplicado
      total: Number(total.toFixed(2)), // Total final con IVA incluido
      metodo_pago: 'Efectivo', // Por defecto Efectivo (puede ser Tarjeta, Transferencia, etc.)
      estado: 'Pendiente', // Estado inicial: Pendiente (luego puede cambiar a Pagada/Cancelada)
      ventas_info: ventasCompletas.map(({ _id, cliente, tipo_maceta, cantidad, precio_unitario, total }) => 
        ({ _id, cliente, tipo_maceta, cantidad, precio_unitario, total })) // Backup: copia de datos por si se borran las ventas
    };

    // ENVIAR AL BACKEND: POST request con fetch
    try {
      const response = await fetch(`${API_URL}/facturas`, {
        method: 'POST', // POST para crear nuevo recurso
        headers: { 'Content-Type': 'application/json' }, // Indicar que enviamos JSON
        body: JSON.stringify(nuevaFactura) // Convertir objeto JavaScript a string JSON
      });
      
      // MANEJAR RESPUESTA: Si ok (status 200-299), cerrar modal y recargar
      if (response.ok) {
        alert('Factura creada exitosamente');
        setMostrarModalVentas(false); // Cerrar modal
        setVentasSeleccionadas([]); // Limpiar selección
        cargarFacturas(); // Recargar lista de facturas
      } else {
        // Si hay error del servidor (400, 500, etc.), mostrar mensaje
        const data = await response.json();
        alert(`Error al crear factura: ${data.error || data.message || 'Error desconocido'}`);
      }
    } catch (error) {
      // Manejar errores de red (backend no responde, sin conexión, etc.)
      console.error('Error:', error);
      alert('Error al crear factura');
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => { // Actualiza estado: Pendiente/Pagada/Cancelada
    try {
      const response = await fetch(`${API_URL}/facturas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (response.ok) cargarFacturas();
      else alert('Error al cambiar estado');
    } catch (error) {
      console.error('Error:', error);
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
      console.error('Error:', error);
      alert('Error al eliminar factura');
    }
  };

  // ========== FILTRO DE BÚSQUEDA EN TIEMPO REAL ==========
  // Este código se ejecuta cada vez que cambia 'facturas' o 'query'
  // Filtra las facturas según lo que el usuario escriba en el buscador
  // Lógica: Si query está vacío, mostrar todas. Si no, buscar en cliente O en ID
  const facturasFiltradas = facturas.filter(f => 
    !query ||  // Si no hay búsqueda (!query = query vacío), mostrar todas (shortcut OR)
    (f.ventas_ids?.[0]?.cliente || '').toLowerCase().includes(query.toLowerCase()) ||  // Buscar en nombre cliente (toLowerCase para case-insensitive)
    f._id.includes(query)  // O buscar en ID de factura (operador || = OR lógico)
  );

  // ========== RENDERIZADO DEL COMPONENTE (JSX) ==========
  // Todo lo que está dentro de return() es lo que se muestra en pantalla
  // JSX parece HTML pero es JavaScript (se convierte a React.createElement)
  return (
    <div style={styles.container}>  {/* Contenedor principal con estilos comunes */}
      
      {/* ===== HEADER: Logo + Barra de búsqueda ===== */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: 10 }}>
        <img src={logoNiger} alt="Niger Logo" style={{ width: 80, height: 'auto' }} />
        <div style={{ flex: 1 }}>  {/* flex: 1 hace que ocupe todo el espacio disponible */}
          <BarraBusqueda />  {/* Componente reutilizable de búsqueda */}
        </div>
      </div>
      
      {/* ===== TÍTULO DE LA PÁGINA ===== */}
      <div style={styles.header}>
        <h1 style={styles.title}>Facturación</h1>
      </div>

      {/* ===== CONTADOR: Muestra cuántas facturas se están viendo ===== */}
      {/* Las llaves {} en JSX permiten ejecutar JavaScript */}
      <p style={{ fontSize: 12, color: '#0177ed', marginBottom: 12 }}>
        Mostrando {facturasFiltradas.length} de {facturas.length} facturas.
      </p>

      {/* ===== BOTÓN PARA ABRIR MODAL Y CREAR NUEVA FACTURA ===== */}
      <div style={{ marginBottom: 16 }}>
        <button onClick={cargarVentas} style={styles.button}>  {/* onClick ejecuta la función al hacer clic */}
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
                    <th style={modalTableTh}>Sel.</th>
                    <th style={modalTableTh}>Cliente</th>
                    <th style={modalTableTh}>Producto</th>
                    <th style={modalTableTh}>Cantidad</th>
                    <th style={modalTableTh}>Total</th>
                    <th style={modalTableTh}>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ ...modalTableTd, padding: 20, textAlign: 'center' }}>
                        No hay ventas disponibles
                      </td>
                    </tr>
                  ) : (
                    ventas.map(venta => (
                      <tr key={venta._id} style={{ background: ventasSeleccionadas.includes(venta._id) ? '#e0f2fe' : '#fff' }}>
                        <td style={modalTableTd}>
                          <input
                            type="checkbox"
                            checked={ventasSeleccionadas.includes(venta._id)}
                            onChange={() => toggleVentaSeleccionada(venta._id)}
                          />
                        </td>
                        <td style={modalTableTd}>{venta.cliente || 'Sin cliente'}</td>
                        <td style={modalTableTd}>{venta.tipo_maceta || 'Sin producto'}</td>
                        <td style={modalTableTd}>{venta.cantidad || 0}</td>
                        <td style={modalTableTd}>€{venta.total?.toFixed(2) || '0.00'}</td>
                        <td style={modalTableTd}>
                          {venta.fecha_venta ? new Date(venta.fecha_venta).toLocaleDateString() : 'Sin fecha'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Resumen de selección */}
            {ventasSeleccionadas.length > 0 && (
              <div style={{ background: '#fafafa', padding: 15, borderRadius: 6, marginBottom: 15, border: '1px solid #ccc' }}>
                <p style={{ margin: '4px 0' }}>
                  <strong>Ventas seleccionadas:</strong> {ventasSeleccionadas.length}
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '18px' }}>
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

      {/* Barra de búsqueda - input controlado con two-way binding */}
      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Buscar facturas por cliente o ID..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #34b6f7ff' }}
        />
      </div>

      {/* Tabla principal con scroll horizontal responsive */}
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
            {/* Renderizado condicional: Si array vacío, mostrar mensaje. Si no, mapear cada factura a una fila */}
            {facturasFiltradas.length === 0 ? (
              <tr><td colSpan="7" style={{...styles.td, textAlign: 'center'}}>No hay facturas</td></tr>
            ) : (
              // .map() transforma cada factura (f) en un <tr> (fila de tabla)
              facturasFiltradas.map((f) => (
                <tr key={f._id}> {/* key único para que React optimice el renderizado */}
                  {/* COLUMNA 1: ID (slice(-6) obtiene últimos 6 caracteres) */}
                  <td style={styles.td}>{f._id.slice(-6)}</td>
                  {/* COLUMNA 2: Cliente(s) - puede haber varios si la factura agrupa ventas */}
                  <td style={styles.td}>
                    {/* Operador ternario: Si existe ventas_info (backup), usarlo. Si no, usar ventas_ids */}
                    {/* .map() extrae el nombre, .filter(Boolean) quita nulls/undefined, .join() une con comas */}
                    {f.ventas_info 
                      ? f.ventas_info.map(v => v.cliente).filter(Boolean).join(', ')
                      : f.ventas_ids?.map(v => v.cliente).filter(Boolean).join(', ') || 'Sin cliente'
                    }
                  </td>
                  {/* COLUMNA 3: Productos - cada uno en una línea con formato "Nombre xCantidad" */}
                  <td style={styles.td}>
                    <div style={{ fontSize: '12px' }}>
                      {/* Mismo patrón: prioridad a ventas_info, fallback a ventas_ids */}
                      {f.ventas_info 
                        ? f.ventas_info.map((v, i) => (
                            <div key={i}>{v.producto} x{v.cantidad}</div> // i es el índice (0, 1, 2...)
                          ))
                        : f.ventas_ids?.map((v, i) => (
                            <div key={i}>{v.tipo_maceta || 'Sin producto'} x{v.cantidad}</div>
                          ))
                      }
                    </div>
                  </td>
                  {/* COLUMNA 4: Total con formato moneda (€) y 2 decimales */}
                  <td style={{...styles.td, fontWeight: 'bold', color: '#0177ed'}}>€{f.total?.toFixed(2)}</td>
                  {/* COLUMNA 5: Fecha - new Date() convierte string ISO a objeto Date, toLocaleDateString() formatea */}
                  <td style={styles.td}>{f.createdAt ? new Date(f.createdAt).toLocaleDateString() : 'Sin fecha'}</td>
                  {/* COLUMNA 6: Badge de estado con color dinámico */}
                  <td style={styles.td}>
                    {/* Ternarios anidados para color: Amarillo (Pendiente) | Verde (Pagada) | Rojo (Cancelada) */}
                    <span style={{
                      padding: '4px 8px', borderRadius: '12px', fontSize: '12px',
                      background: f.estado === 'Pendiente' ? '#fbbf24' : f.estado === 'Pagada' ? '#10b981' : '#ef4444',
                      color: 'white'
                    }}>{f.estado}</span>
                  </td>
                  {/* COLUMNA 7: Botones de acción (Ver, Cambiar Estado, Eliminar) */}
                  <td style={styles.td}>
                    <button onClick={() => setFacturaViewer(f)} style={{...btnBase, fontSize: '12px', padding: '4px 8px', background: '#0177ed', marginRight: 4}}>Ver</button>
                    <select value={f.estado} onChange={(e) => cambiarEstado(f._id, e.target.value)} style={{fontSize: '12px', marginRight: 4}}>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Pagada">Pagada</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                    <button onClick={() => eliminar(f._id)} style={{...btnBase, fontSize: '12px', padding: '2px 6px', background: '#ef4444'}}>✕</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de visualización detallada de factura con overlay */}
      {facturaViewer && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
          <div style={{background: '#fff', padding: '40px', borderRadius: '8px', maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.3)'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '30px', borderBottom: '3px solid #0177ed', paddingBottom: '20px' }}>
              <div>
                <img src={logoNiger} alt="Niger" style={{ height: '60px', marginBottom: '10px' }} />
                <h2 style={{ margin: 0, color: '#1e293b', fontSize: '24px' }}>FACTURA</h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={facturaHeaderText}><strong>Nº Factura:</strong> {facturaViewer._id.slice(-8).toUpperCase()}</p>
                <p style={facturaHeaderText}><strong>Fecha:</strong> {facturaViewer.createdAt ? new Date(facturaViewer.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Sin fecha'}</p>
                <p style={{ margin: '4px 0' }}>
                  <span style={{padding: '6px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 'bold', background: facturaViewer.estado === 'Pendiente' ? '#fbbf24' : facturaViewer.estado === 'Pagada' ? '#10b981' : '#ef4444', color: 'white'}}>{facturaViewer.estado}</span>
                </p>
              </div>
            </div>

            {/* Datos del cliente - renderizado condicional según datos disponibles */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#0177ed', fontSize: '16px', marginBottom: '10px' }}>DATOS DEL CLIENTE</h3>
              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '6px' }}>
                {/* CASO 1: Si tenemos clienteCompleto (enriquecido), mostrar todos los datos */}
                {facturaViewer.clienteCompleto ? (
                  <> {/* Fragment <> permite agrupar elementos sin crear div extra */}
                    <p style={facturaInfoText}><strong>Nombre:</strong> {facturaViewer.clienteCompleto.nombre} {facturaViewer.clienteCompleto.apellidos}</p>
                    <p style={facturaInfoText}><strong>Dirección:</strong> {facturaViewer.clienteCompleto.direccion}</p>
                    <p style={facturaInfoText}><strong>Teléfono:</strong> {facturaViewer.clienteCompleto.telefono}</p>
                    <p style={facturaInfoText}><strong>Email:</strong> {facturaViewer.clienteCompleto.email}</p>
                  </>
                ) : (
                  // CASO 2: Si no hay clienteCompleto, mostrar solo nombres (sin datos adicionales)
                  <p style={facturaInfoText}>
                    {facturaViewer.ventas_info 
                      ? [...new Set(facturaViewer.ventas_info.map(v => v.cliente))].filter(Boolean).join(', ')
                      : facturaViewer.ventas_ids?.map(v => v.cliente).filter(Boolean).join(', ') || 'Sin cliente'
                    }
                  </p>
                )}
              </div>
            </div>

            {/* Detalle de productos con cálculo automático de totales */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#0177ed', fontSize: '16px', marginBottom: '10px' }}>DETALLE</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f8fafc' }}>
                <thead>
                  <tr style={{ background: '#0177ed', color: 'white' }}>
                    <th style={{...facturaTableTh, textAlign: 'left'}}>Producto</th>
                    <th style={{...facturaTableTh, textAlign: 'center'}}>Cantidad</th>
                    <th style={{...facturaTableTh, textAlign: 'right'}}>Precio Unit.</th>
                    <th style={{...facturaTableTh, textAlign: 'right'}}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {facturaViewer.ventas_info ? (
                    facturaViewer.ventas_info.map((v, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{...facturaTableTd, color: '#1e293b'}}>{v.producto || v.tipo_maceta || 'Sin producto'}</td>
                        <td style={{...facturaTableTd, textAlign: 'center', color: '#475569'}}>{v.cantidad}</td>
                        <td style={{...facturaTableTd, textAlign: 'right', color: '#475569'}}>€{v.precio_unitario?.toFixed(2) || '0.00'}</td>
                        <td style={{...facturaTableTd, textAlign: 'right', color: '#1e293b', fontWeight: 'bold'}}>€{(v.cantidad * (v.precio_unitario || 0)).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    facturaViewer.ventas_ids?.map((v, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{...facturaTableTd, color: '#1e293b'}}>{v.tipo_maceta || 'Sin producto'}</td>
                        <td style={{...facturaTableTd, textAlign: 'center', color: '#475569'}}>{v.cantidad}</td>
                        <td style={{...facturaTableTd, textAlign: 'right', color: '#475569'}}>€{v.precio_unitario?.toFixed(2) || '0.00'}</td>
                        <td style={{...facturaTableTd, textAlign: 'right', color: '#1e293b', fontWeight: 'bold'}}>€{v.total?.toFixed(2) || '0.00'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Resumen de totales: Subtotal, IVA 21% y Total final */}
            {/* Estructura: Caja de 250px alineada a la derecha con 3 filas (Subtotal, IVA, Total) */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
              <div style={{ width: '250px' }}>
                {/* FILA 1: SUBTOTAL (base imponible sin IVA) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8fafc', marginBottom: '5px' }}>
                  <span style={facturaHeaderText}>Subtotal:</span>
                  <span style={{...facturaInfoText, fontWeight: 'bold'}}>€{facturaViewer.total?.toFixed(2)}</span>
                </div>
                {/* FILA 2: IVA (Impuesto sobre el Valor Añadido) - 21% del subtotal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8fafc', marginBottom: '5px' }}>
                  <span style={facturaHeaderText}>IVA (21%):</span>
                  {/* Cálculo: total * 0.21 = 21% del subtotal (impuesto) */}
                  <span style={{...facturaInfoText, fontWeight: 'bold'}}>€{(facturaViewer.total * 0.21).toFixed(2)}</span>
                </div>
                {/* FILA 3: TOTAL FINAL - Subtotal + IVA (fondo azul destacado) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#0177ed', color: 'white' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>TOTAL:</span>
                  {/* Cálculo: total * 1.21 = subtotal + 21% = precio final que paga el cliente */}
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>€{(facturaViewer.total * 1.21).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Pie de página con información de contacto */}
            <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '20px', textAlign: 'center' }}>
              <p style={{ margin: '4px 0', color: '#64748b', fontSize: '12px' }}>Niger - Soluciones de Jardinería</p>
              <p style={{ margin: '4px 0', color: '#64748b', fontSize: '12px' }}>www.niger.com | contacto@niger.com | Tel: +34 900 000 000</p>
            </div>

            {/* ========== BOTONES DE ACCIÓN DEL MODAL ========== */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
              {/* Botón IMPRIMIR: Usa la API nativa window.print() del navegador */}
              {/* Esto abre el diálogo de impresión y permite guardar como PDF */}
              <button 
                onClick={() => window.print()}  // API del navegador para imprimir
                style={{...btnBase, padding: '10px 20px', background: '#10b981', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold'}}
              >
                 Imprimir
              </button>
              
              {/* Botón CERRAR: Cierra el modal poniendo facturaViewer a null */}
              <button 
                onClick={() => setFacturaViewer(null)}  // null hace que el modal desaparezca (ver línea del if)
                style={{...btnBase, padding: '10px 20px', background: '#64748b', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold'}}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};  // Fin del componente Facturacion

// Importar estilos comunes desde el archivo centralizado
// Esto permite mantener consistencia visual en toda la aplicación
const styles = commonStyles;

// ========== EXPORTACIÓN DEL COMPONENTE ==========
// export default permite importar este componente en otros archivos
// Ejemplo de uso: import Facturacion from './pages/Facturacion.jsx'
export default Facturacion;
