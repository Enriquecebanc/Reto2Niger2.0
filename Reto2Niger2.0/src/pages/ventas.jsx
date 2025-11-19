// Importamos React y los hooks necesarios
import React, { useState, useEffect, useMemo } from 'react';

// Importamos la barra de búsqueda y estilos
import BarraBusqueda from '../componentes/barraBusqueda.jsx';
import { commonStyles, colors } from '../styles/commonStyles.js';

// Importamos los servicios (API) para ventas, clientes y stock
import { getVentas, crearVenta, eliminarVenta, actualizarVenta } from '../services/ventasService';
import { getClientes } from '../services/clientesService';
import { getStock } from '../services/stockService';

// Estilos (combinamos estilos comunes con estilos específicos)
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

// Componente principal de la página de ventas
const VentasPage = () => {

    // Estados principales
    const [ventas, setVentas] = useState([]);         // Lista de ventas
    const [clientes, setClientes] = useState([]);     // Lista de clientes
    const [stock, setStock] = useState([]);           // Stock disponible
    const [query, setQuery] = useState('');           // Texto para filtrar
    const [editingId, setEditingId] = useState(null); // ID de venta que se está editando
    const [editValues, setEditValues] = useState({ cliente: '', cantidad: 0 }); // Valores editados
    const [saving, setSaving] = useState(false);      // Estado de guardado

    // Estado para crear nuevas ventas
    const [adding, setAdding] = useState(false);
    const [newVenta, setNewVenta] = useState({
        cliente: "",
        tipo_maceta: "",
        cantidad: 1,
        precio_unitario: 0,
        metodo_pago: "",
    });

    // Función para cargar ventas desde el backend
    const fetchVentas = async () => {
        const data = await getVentas();
        setVentas(data);
    };

    // Función para cargar clientes
    const fetchClientes = async () => {
        const data = await getClientes();
        setClientes(data);
    };

    // Función para cargar stock
    const fetchStock = async () => {
        const data = await getStock();
        setStock(data);
    };

    // useEffect: carga inicial de datos al montar el componente
    useEffect(() => { 
        fetchVentas();
        fetchClientes();
        fetchStock();
    }, []);

    // Filtrado de ventas según el query
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return ventas;
        return ventas.filter(v => (v.cliente || '').toLowerCase().includes(q));
    }, [ventas, query]);

    // Calcula cuánta cantidad queda de un tipo de maceta (según el inventario)
    const getCantidadDisponible = (tipoMaceta) => {
        const nombreMap = {
            'Pequeña': 'Maceta pequeña',
            'Mediana': 'Maceta mediana',
            'Grande': 'Maceta grande'
        };
        
        const nombreBuscado = nombreMap[tipoMaceta];
        if (!nombreBuscado) return 0;
        
        return stock
            .filter(item => item.nombre?.toLowerCase() === nombreBuscado.toLowerCase())
            .reduce((sum, item) => sum + (item.cantidad || 0), 0);
    };

    // Confirmar nueva venta
    const handleConfirmarNuevaVenta = async () => {

        // Validaciones básicas
        if (!newVenta.cliente.trim()) return alert("Falta seleccionar un cliente");
        if (!newVenta.tipo_maceta.trim()) return alert("Falta el tipo de maceta");
        if (!newVenta.metodo_pago.trim()) return alert("Falta el método de pago");
        if (newVenta.cantidad < 1) return alert("La cantidad debe ser al menos 1");
        if (newVenta.precio_unitario < 1) return alert("El precio unitario debe ser al menos 1");

        // Verificar si hay stock suficiente
        const cantidadDisponible = getCantidadDisponible(newVenta.tipo_maceta);
        if (newVenta.cantidad > cantidadDisponible) {
            return alert(`No hay suficiente stock. Disponible: ${cantidadDisponible} unidades`);
        }

        // Convertir el ID del cliente en su nombre completo
        const clienteSeleccionado = clientes.find(c => c._id === newVenta.cliente);
        const nombreCliente = clienteSeleccionado 
            ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellidos}` 
            : newVenta.cliente;

        // Crear el payload final que se enviará a la API
        const payload = {
            cliente: nombreCliente,
            tipo_maceta: newVenta.tipo_maceta,
            cantidad: newVenta.cantidad,
            precio_unitario: newVenta.precio_unitario,
            total: newVenta.cantidad * newVenta.precio_unitario,
            metodo_pago: newVenta.metodo_pago,
            fecha_venta: new Date().toISOString()
        };

        // Enviar la venta
        try {
            const created = await crearVenta(payload);
            setVentas(v => [...v, created]);
            await fetchStock();    // Actualizar stock tras la venta
            alert('Venta creada correctamente');
            setAdding(false);      // Ocultar formulario
            setNewVenta({          // Reiniciar formulario
                cliente: "",
                tipo_maceta: "",
                cantidad: 1,
                precio_unitario: 0,
                metodo_pago: "",
            });
        } catch (err) {
            console.error('Error creando venta:', err);
            alert('Error al crear la venta: ' + err.message);
        }
    };

    // Eliminar venta
    const handleEliminar = async (id) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta venta?')) return;
        
        try {
            await eliminarVenta(id);
            setVentas(ventas.filter(v => v._id !== id));
        } catch (err) {
            console.error('Error eliminando:', err);
            alert('Error al eliminar: ' + err.message);
        }
    };

    // Empezar a editar una venta
    const startEdit = (v) => {
        setEditingId(v._id);
        setEditValues({ cliente: v.cliente || '', cantidad: v.cantidad ?? 1 });
    };

    // Cancelar edición
    const cancelEdit = () => {
        setEditingId(null);
        setEditValues({ cliente: '', cantidad: 0 });
    };

    // Guardar edición
    const saveEdit = async (id) => {
        const name = (editValues.cliente || '').trim();
        const qty = Number(editValues.cantidad);

        if (!name) return alert('El nombre del cliente no puede quedar vacío');
        if (!Number.isFinite(qty) || qty < 1) return alert('La cantidad debe ser al menos 1');

        setSaving(true);
        try {
            // Recuperamos la venta original para obtener el precio unitario
            const ventaActual = ventas.find(v => v._id === id);
            const precioUnitario = ventaActual?.precio_unitario || 0;
            const nuevoTotal = qty * precioUnitario;
            
            const payload = { 
                cliente: name, 
                cantidad: qty,
                total: nuevoTotal
            };

            const updated = await actualizarVenta(id, payload);

            // Actualizamos visualmente la venta editada
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

    // Render principal
    return (
        <div style={styles.container}>
            {/* Barra superior */}
            <BarraBusqueda />
            <div style={styles.header}>
                <h1 style={styles.title}>Ventas Niger</h1>
            </div>

            {/* Contador de registros */}
            <p style={styles.small}>Mostrando {filtered.length} de {ventas.length} registros.</p>

            {/* Buscador y botón para añadir venta */}
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

            {/* Formulario para crear nueva venta */}
            {adding && (
                <div style={{
                    padding: 12,
                    border: "1px solid #0095ff",
                    borderRadius: 8,
                    marginBottom: 16,
                    background: "#e9f6ff"
                }}>
                    <h3>Nueva venta</h3>

                    {/* Selección de cliente */}
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

                    {/* Tipo de maceta */}
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Tipo de maceta:</label>
                    <select
                        value={newVenta.tipo_maceta}
                        onChange={e => setNewVenta(v => ({ ...v, tipo_maceta: e.target.value }))}
                        style={{ width: "100%", marginBottom: 8, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                    >
                        <option value="">-- Selecciona tipo --</option>
                        <option value="Pequeña">Pequeña (Disponible: {getCantidadDisponible('Pequeña')} unidades)</option>
                        <option value="Mediana">Mediana (Disponible: {getCantidadDisponible('Mediana')} unidades)</option>
                        <option value="Grande">Grande (Disponible: {getCantidadDisponible('Grande')} unidades)</option>
                    </select>

                    {/* Mostrar stock si se eligió tipo */}
                    {newVenta.tipo_maceta && (
                        <p style={{ fontSize: 12, color: '#0177edff', marginBottom: 8 }}>
                            Stock disponible: {getCantidadDisponible(newVenta.tipo_maceta)} unidades
                        </p>
                    )}

                    {/* Cantidad */}
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Cantidad:</label>
                    <input
                        type="number"
                        min={1}
                        value={newVenta.cantidad}
                        onChange={e => setNewVenta(v => ({ ...v, cantidad: Number(e.target.value) }))}
                        style={{ width: "100%", marginBottom: 8, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                    />

                    {/* Precio unitario */}
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Precio unitario (euros):</label>
                    <input
                        type="number"
                        min={0.01}
                        step={0.01}
                        value={newVenta.precio_unitario}
                        onChange={e => setNewVenta(v => ({ ...v, precio_unitario: Number(e.target.value) }))}
                        style={{ width: "100%", marginBottom: 8, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                    />

                    {/* Método de pago */}
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

                    {/* Botones */}
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

            {/* Tabla de ventas */}
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
                                <td style={styles.td}>{v.fecha_venta ? new Date(v.fecha_venta).toLocaleDateString('es-ES') : '-'}</td>

                                {/* Cliente (editable) */}
                                <td style={styles.td}>
                                    {editingId === v._id ? (
                                        <input
                                            value={editValues.cliente}
                                            onChange={e => setEditValues(ev => ({ ...ev, cliente: e.target.value }))}
                                        />
                                    ) : (v.cliente || '-')}
                                </td>

                                {/* Cantidad (editable) */}
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

                                {/* Botones editar / eliminar */}
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

// Exportamos el componente
export default VentasPage;
