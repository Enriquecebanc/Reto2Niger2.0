import React, { useState, useEffect, useMemo } from 'react';
import BarraBusqueda from '../componentes/barraBusqueda.jsx';
import logoNiger from '../assets/Niger.png';
import { getVentas, crearVenta, eliminarVenta } from '../services/ventasService';
import { commonStyles, colors } from '../styles/commonStyles.js';

const styles = commonStyles;

const VentasPage = () => {
    const [ventas, setVentas] = useState([]);
    const [query, setQuery] = useState('');

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

    return (
        <div style={styles.container}>
            <BarraBusqueda />
            <div style={styles.header}>
                <h1 style={styles.title}>Ventas de Macetas Inteligentes</h1>
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
                                <td style={styles.td}>{v.cliente || '-'}</td> 
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