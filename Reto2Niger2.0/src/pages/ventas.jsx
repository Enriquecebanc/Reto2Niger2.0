import BarraBusqueda from '../componentes/barraBusqueda.jsx';
import ventasEjemplo from './VentasEjemplo.json';

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

import React, { useState, useMemo } from 'react';

const Ventas = () => {
    // ventasEjemplo es un array importado del JSON adjunto
    const ventas = ventasEjemplo || [];
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return ventas;
        return ventas.filter(v => (v.customerName || '').toLowerCase().includes(q));
    }, [ventas, query]);

    return (
        <div style={styles.container}>
            <BarraBusqueda />
            <div style={styles.header}>
                <h1 style={styles.title}>Ventas ejemplo</h1>
            </div>

            <p style={styles.small}>Mostrando {filtered.length} de {ventas.length} registros.</p>

            <div style={{ marginBottom: 12 }}>
                <input
                    placeholder="Buscar por nombre de cliente..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #34b6f7ff' }}
                />
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>ID Maceta</th>
                            <th style={styles.th}>Fecha</th>
                            <th style={styles.th}>Cliente</th>
                            <th style={styles.th}>Talla</th>
                            <th style={styles.th}>Cantidad</th>
                            <th style={styles.th}>Precio unitario</th>
                            <th style={styles.th}>Precio total</th>
                            <th style={styles.th}>Método pago</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(v => (
                            <tr key={v.saleId}>
                                <td style={styles.td}>{v.saleId}</td>
                                <td style={styles.td}>{v.idMaceta || '-'}</td>
                                <td style={styles.td}>{v.date}</td>
                                <td style={styles.td}>{v.customerName}</td>
                                <td style={styles.td}>{v.size}</td>
                                <td style={styles.td}>{v.quantity}</td>
                                <td style={styles.td}>€{Number(v.unitPrice).toFixed(2)}</td>
                                <td style={styles.td}>€{Number(v.totalPrice).toFixed(2)}</td>
                                <td style={styles.td}>{v.paymentMethod}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Ventas;