import React, { useState, useEffect, useMemo } from 'react';
import BarraBusqueda from '../componentes/barraBusqueda.jsx';
import { getVentas, crearVenta, eliminarVenta } from '../services/ventasService';

const styles = {
    container: { padding: 16, fontFamily: 'Segoe UI, Roboto, Arial, sans-serif' },
    header: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    title: { color: '#87CEFA', margin: 0, textAlign: 'center' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #006881ff', background: '#a7d8fcff' },
    td: { padding: '8px 10px', borderBottom: '1px solid #09025cff' },
    small: { fontSize: 12, color: '#0177edff' },
    button: { padding: '8px 12px', background: '#097d85ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', textDecoration: 'none' },
};

const VentasPage = () => {
    const [ventas, setVentas] = useState([]);
    const [query, setQuery] = useState('');

    // 🔹 Cargar las ventas desde el backend
    const fetchVentas = async () => {
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
        return ventas.filter(v => (v.cliente_id?.nombre || '').toLowerCase().includes(q));
    }, [ventas, query]);

    // 🔹 Agregar venta de ejemplo (puedes adaptarlo con un formulario real)
    const handleAgregar = async () => {
        const nueva = {
            producto_id: ventas[0]?.producto_id?._id || '', // ejemplo, toma la primera fabricación
            cliente_id: ventas[0]?.cliente_id?._id || '',   // ejemplo, toma el primer cliente
            cantidad: 1,
            precio_unitario: 40,
            total: 40,
            metodo_pago: "Crédito"
        };
        const creada = await crearVenta(nueva);
        setVentas([...ventas, creada]);
    };

    // 🔹 Eliminar venta
    const handleEliminar = async (id) => {
        await eliminarVenta(id);
        setVentas(ventas.filter(v => v._id !== id));
    };

    return (
        <div style={styles.container}>
            <BarraBusqueda />
            <div style={styles.header}>
                <h1 style={styles.title}>Ventas</h1>
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
                            <th style={styles.th}>Producto</th>
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
                                <td style={styles.td}>{v._id}</td>
                                <td style={styles.td}>{v.producto_id?.producto || '-'}</td>
                                <td style={styles.td}>{new Date(v.fecha_venta).toLocaleDateString()}</td>
                                <td style={styles.td}>{v.cliente_id?.nombre || '-'}</td>
                                <td style={styles.td}>{v.cantidad}</td>
                                <td style={styles.td}>€{Number(v.precio_unitario).toFixed(2)}</td>
                                <td style={styles.td}>€{Number(v.total).toFixed(2)}</td>
                                <td style={styles.td}>{v.metodo_pago}</td>
                                <td style={styles.td}>
                                    <button style={styles.button} onClick={() => handleEliminar(v._id)}>Eliminar</button>
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
