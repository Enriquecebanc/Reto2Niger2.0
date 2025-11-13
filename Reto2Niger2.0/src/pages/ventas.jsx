import React, { useState, useEffect, useMemo } from 'react';
import BarraBusqueda from '../componentes/barraBusqueda.jsx';
// Asegúrate de que tus servicios 'ventasService' devuelvan el JSON sin populate,
// o adapta el servicio para simular la estructura aplanada si usas populate.
import { getVentas, crearVenta, eliminarVenta, actualizarVenta } from '../services/ventasService';

const styles = {
    container: { padding: 16, fontFamily: 'Segoe UI, Roboto, Arial, sans-serif' },
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
    const [query, setQuery] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({ cliente: '', cantidad: 0 });
    const [saving, setSaving] = useState(false);

    // 🔹 Cargar las ventas desde el backend
    const fetchVentas = async () => {
        // Asume que getVentas() devuelve el JSON con el campo 'cliente' y 'tipo_maceta' ya aplanados
        const data = await getVentas();
        setVentas(data);
    };

    useEffect(() => {
        fetchVentas();
    }, []);

    // 🔹 Filtrado de búsqueda
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return ventas;
        
        // Ahora busca directamente en el campo 'cliente' (nombre y apellido completo)
        return ventas.filter(v => (v.cliente || '').toLowerCase().includes(q));
    }, [ventas, query]);

    // 🔹 Agregar venta de ejemplo (adaptado a la nueva estructura)
    const handleAgregar = async () => {
        const nueva = {
            // Producto: Usamos el campo tipo_maceta con el valor aplanado
            tipo_maceta: ventas[0]?.tipo_maceta || 'big', 
            // Cliente: Usamos el campo cliente con el valor aplanado (nombre y apellido)
            cliente: ventas[0]?.cliente || 'Aitor García', 
            cantidad: 1,
            precio_unitario: 40,
            total: 40,
            metodo_pago: "Crédito",
            fecha_venta: new Date().toISOString() // Añadir fecha actual
        };
        const creada = await crearVenta(nueva);
        setVentas([...ventas, creada]);
    };

    // 🔹 Eliminar venta
    const handleEliminar = async (id) => {
        await eliminarVenta(id);
        setVentas(ventas.filter(v => v._id !== id));
    };

    // 🔹 Editar venta (inline: solo cliente y cantidad)
    const startEdit = (v) => {
        setEditingId(v._id);
        setEditValues({ cliente: v.cliente || '', cantidad: v.cantidad ?? 1 });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValues({ cliente: '', cantidad: 0 });
    };

    const saveEdit = async (id) => {
        // validaciones simples
        const name = (editValues.cliente || '').toString().trim();
        const qty = Number(editValues.cantidad);
        if (!name) return alert('El nombre del cliente no puede quedar vacío');
        if (!Number.isFinite(qty) || qty < 1) return alert('La cantidad debe ser al menos 1');

        setSaving(true);
        try {
            const payload = { cliente: name, cantidad: qty };
            const updated = await actualizarVenta(id, payload);
            // actualizar estado local con lo que devuelva el backend si lo hace
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
                <button style={{ ...styles.button, marginTop: 8 }} onClick={handleAgregar}>Agregar venta de ejemplo</button>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            {/* Cambiado de 'Producto' a 'Tipo Maceta' para reflejar el campo 'tipo_maceta' */}
                            <th style={styles.th}>Tipo Maceta</th> 
                            <th style={styles.th}>Fecha</th>
                            {/* Accede a 'v.cliente' directamente, que ahora contiene el nombre completo */}
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
                                {/* Accede directamente al campo 'tipo_maceta' */}
                                <td style={styles.td}>{v.tipo_maceta || '-'}</td> 
                                <td style={styles.td}>{new Date(v.fecha_venta).toLocaleDateString('es-ES')}</td>
                                {/* Accede directamente al campo 'cliente' */}
                                <td style={styles.td}>
                                    {editingId === v._id ? (
                                        <input value={editValues.cliente} onChange={e => setEditValues(ev => ({ ...ev, cliente: e.target.value }))} />
                                    ) : (v.cliente || '-')}
                                </td> 
                                <td style={styles.td}>
                                    {editingId === v._id ? (
                                        <input type="number" min={1} value={editValues.cantidad} onChange={e => setEditValues(ev => ({ ...ev, cantidad: e.target.value }))} style={{ width: 80 }} />
                                    ) : (v.cantidad)}</td>
                                <td style={styles.td}>€{Number(v.precio_unitario).toFixed(2)}</td>
                                <td style={styles.td}>€{Number(v.total).toFixed(2)}</td>
                                <td style={styles.td}>{v.metodo_pago}</td>
                                <td style={styles.td}>
                                    {editingId === v._id ? (
                                        <>
                                            <button style={{ ...styles.editButton, marginRight: 8 }} disabled={saving} onClick={() => saveEdit(v._id)}>Guardar</button>
                                            <button style={styles.cancelButton} disabled={saving} onClick={cancelEdit}>Cancelar</button>
                                        </>
                                    ) : (
                                        <>
                                            <button style={{ ...styles.editButton, marginRight: 8 }} onClick={() => startEdit(v)}>Editar</button>
                                            <button style={styles.deleteButton} onClick={() => handleEliminar(v._id)}>Eliminar</button>
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