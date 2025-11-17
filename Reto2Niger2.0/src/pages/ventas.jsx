import React, { useState, useEffect, useMemo } from 'react';
import BarraBusqueda from '../componentes/barraBusqueda.jsx';
import { commonStyles, colors } from '../styles/commonStyles.js';
import { getVentas, crearVenta, eliminarVenta, actualizarVenta } from '../services/ventasService';
import { getClientes } from '../services/clientesService';

const styles = {
    ...commonStyles,
    header: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    title: { color: '#87CEFA', margin: 0, textAlign: 'center' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #006881ff', background: '#a7d8fcff' },
    td: { padding: '8px 10px', borderBottom: '1px solid #09025cff' },
    small: { fontSize: 12, color: '#0177edff' },
    button: { padding: '8px 12px', background: '#ffd500ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', textDecoration: 'none' },
    editButton: { padding: '8px 12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', textDecoration: 'none' },
    deleteButton: { padding: '8px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', textDecoration: 'none' },
    cancelButton: { padding: '8px 12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', textDecoration: 'none' },
};

const VentasPage = () => {
    const [ventas, setVentas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [query, setQuery] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({ cliente: '', cantidad: 0 });
    const [saving, setSaving] = useState(false);

    // NUEVOS ESTADOS PARA CREAR UNA VENTA
    const [adding, setAdding] = useState(false);
    const [newVenta, setNewVenta] = useState({
        cliente: "",
        tipo_maceta: "",
        cantidad: 1,
        precio_unitario: 0,
        metodo_pago: "",
    });

    // Cargar ventas y clientes
    const fetchVentas = async () => {
        const data = await getVentas();
        setVentas(data);
    };

    const fetchClientes = async () => {
        const data = await getClientes();
        setClientes(data);
    };

    useEffect(() => { 
        fetchVentas();
        fetchClientes();
    }, []);

    // Filtrado
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return ventas;
        return ventas.filter(v => (v.cliente || '').toLowerCase().includes(q));
    }, [ventas, query]);

    // Confirmar nueva venta
    const handleConfirmarNuevaVenta = async () => {
        if (!newVenta.cliente.trim()) return alert("Falta seleccionar un cliente");
        if (!newVenta.tipo_maceta.trim()) return alert("Falta el tipo de maceta");
        if (!newVenta.metodo_pago.trim()) return alert("Falta el método de pago");
        if (newVenta.cantidad < 1) return alert("La cantidad debe ser al menos 1");
        if (newVenta.precio_unitario < 1) return alert("El precio unitario debe ser al menos 1");

        // Obtener el nombre completo del cliente seleccionado
        const clienteSeleccionado = clientes.find(c => c._id === newVenta.cliente);
        const nombreCliente = clienteSeleccionado 
            ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellidos}` 
            : newVenta.cliente;

        const payload = {
            cliente: nombreCliente,
            tipo_maceta: newVenta.tipo_maceta,
            cantidad: newVenta.cantidad,
            precio_unitario: newVenta.precio_unitario,
            total: newVenta.cantidad * newVenta.precio_unitario,
            metodo_pago: newVenta.metodo_pago,
            fecha_venta: new Date().toISOString()
        };

        const created = await crearVenta(payload);
        setVentas(v => [...v, created]);

        setAdding(false);
        setNewVenta({
            cliente: "",
            tipo_maceta: "",
            cantidad: 1,
            precio_unitario: 0,
            metodo_pago: "",
        });
    };

    // Eliminar
    const handleEliminar = async (id) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta venta?')) return;
        
        await eliminarVenta(id);
        setVentas(ventas.filter(v => v._id !== id));
    };

    // Editar inline
    const startEdit = (v) => {
        setEditingId(v._id);
        setEditValues({ cliente: v.cliente || '', cantidad: v.cantidad ?? 1 });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValues({ cliente: '', cantidad: 0 });
    };

    const saveEdit = async (id) => {
        const name = (editValues.cliente || '').trim();
        const qty = Number(editValues.cantidad);

        if (!name) return alert('El nombre del cliente no puede quedar vacío');
        if (!Number.isFinite(qty) || qty < 1) return alert('La cantidad debe ser al menos 1');

        setSaving(true);
        try {
            // Obtener la venta actual para sacar el precio_unitario
            const ventaActual = ventas.find(v => v._id === id);
            const precioUnitario = ventaActual?.precio_unitario || 0;
            const nuevoTotal = qty * precioUnitario;
            
            const payload = { 
                cliente: name, 
                cantidad: qty,
                total: nuevoTotal
            };
            const updated = await actualizarVenta(id, payload);

            setVentas(prev => prev.map(item => item._id === id ? ({ ...item, ...updated }) : item));
            setEditingId(null);
            setEditValues({ cliente: '', cantidad: 0 });
        } catch (e) {
            console.error('Error actualizando venta', e);
            alert('Error al guardar los cambios');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={styles.container}>
            <BarraBusqueda />
            <div style={styles.header}>
                <h1 style={styles.title}>Ventas Niger</h1>
            </div>

            <p style={styles.small}>Mostrando {filtered.length} de {ventas.length} registros.</p>

            <div style={{ marginBottom: 12 }}>
                <input
                    placeholder="Buscar por nombre de cliente..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #34b6f7ff' }}
                />

                <button
                    style={{ ...styles.button, marginTop: 8 }}
                    onClick={() => setAdding(true)}
                >
                    Añadir venta
                </button>
            </div>

            {adding && (
                <div style={{
                    padding: 12,
                    border: "1px solid #0095ff",
                    borderRadius: 8,
                    marginBottom: 16,
                    background: "#e9f6ff"
                }}>
                    <h3>Nueva venta</h3>

                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Cliente:</label>
                    <select
                        value={newVenta.cliente}
                        onChange={e => setNewVenta(v => ({ ...v, cliente: e.target.value }))}
                        style={{ width: "100%", marginBottom: 8, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                    >
                        <option value="">-- Selecciona cliente --</option>
                        {clientes.map(c => (
                            <option key={c._id} value={c._id}>
                                {c.nombre} {c.apellidos}
                            </option>
                        ))}
                    </select>

                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Tipo de maceta:</label>
                    <select
                        value={newVenta.tipo_maceta}
                        onChange={e => setNewVenta(v => ({ ...v, tipo_maceta: e.target.value }))}
                        style={{ width: "100%", marginBottom: 8, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                    >
                        <option value="">-- Selecciona tipo --</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="big">Big</option>
                    </select>

                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Cantidad:</label>
                    <input
                        type="number"
                        placeholder="Cantidad"
                        min={1}
                        value={newVenta.cantidad}
                        onChange={e => setNewVenta(v => ({ ...v, cantidad: Number(e.target.value) }))}
                        style={{ width: "100%", marginBottom: 8, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                    />

                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Precio unitario (euros):</label>
                    <input
                        type="number"
                        placeholder="Precio unitario"
                        min={0.01}
                        step={0.01}
                        value={newVenta.precio_unitario}
                        onChange={e => setNewVenta(v => ({ ...v, precio_unitario: Number(e.target.value) }))}
                        style={{ width: "100%", marginBottom: 8, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                    />

                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Método de pago:</label>
                    <select
                        value={newVenta.metodo_pago}
                        onChange={e => setNewVenta(v => ({ ...v, metodo_pago: e.target.value }))}
                        style={{ width: "100%", marginBottom: 8, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                    >
                        <option value="">-- Selecciona método de pago --</option>
                        <option value="Crédito">Crédito</option>
                        <option value="Débito">Débito</option>
                        <option value="PayPal">PayPal</option>
                    </select>

                    <button
                        style={{ ...styles.editButton, marginRight: 8 }}
                        onClick={handleConfirmarNuevaVenta}
                    >
                        Confirmar
                    </button>

                    <button
                        style={styles.cancelButton}
                        onClick={() => setAdding(false)}
                    >
                        Cancelar
                    </button>
                </div>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Tipo Maceta</th>
                            <th style={styles.th}>Fecha</th>
                            <th style={styles.th}>Cliente</th>
                            <th style={styles.th}>Cantidad</th>
                            <th style={styles.th}>Precio unitario</th>
                            <th style={styles.th}>Total</th>
                            <th style={styles.th}>Método pago</th>
                            <th style={styles.th}>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filtered.map(v => (
                            <tr key={v._id}>
                                <td style={styles.td}><span style={styles.small}>{v._id}</span></td>
                                <td style={styles.td}>{v.tipo_maceta || '-'}</td>
                                <td style={styles.td}>{new Date(v.fecha_venta).toLocaleDateString('es-ES')}</td>
                                <td style={styles.td}>
                                    {editingId === v._id ? (
                                        <input
                                            value={editValues.cliente}
                                            onChange={e => setEditValues(ev => ({ ...ev, cliente: e.target.value }))}
                                        />
                                    ) : (v.cliente || '-')}
                                </td>
                                <td style={styles.td}>
                                    {editingId === v._id ? (
                                        <input
                                            type="number"
                                            min={1}
                                            value={editValues.cantidad}
                                            onChange={e => setEditValues(ev => ({ ...ev, cantidad: e.target.value }))}
                                            style={{ width: 80 }}
                                        />
                                    ) : (v.cantidad)}
                                </td>
                                <td style={styles.td}>€{Number(v.precio_unitario).toFixed(2)}</td>
                                <td style={styles.td}>€{Number(v.total).toFixed(2)}</td>
                                <td style={styles.td}>{v.metodo_pago}</td>

                                <td style={styles.td}>
                                    {editingId === v._id ? (
                                        <>
                                            <button
                                                style={{ ...styles.editButton, marginRight: 8 }}
                                                disabled={saving}
                                                onClick={() => saveEdit(v._id)}
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                style={styles.cancelButton}
                                                disabled={saving}
                                                onClick={cancelEdit}
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                style={{ ...styles.editButton, marginRight: 8 }}
                                                onClick={() => startEdit(v)}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                style={styles.deleteButton}
                                                onClick={() => handleEliminar(v._id)}
                                            >
                                                Eliminar
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VentasPage;
