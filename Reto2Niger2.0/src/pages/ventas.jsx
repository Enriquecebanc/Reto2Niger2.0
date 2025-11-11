import { Link } from 'react-router-dom';
import ventasEjemplo from './VentasEjemplo.json';

const styles = {
    container: { padding: 16, fontFamily: 'Segoe UI, Roboto, Arial, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #006881ff', background: '#a7d8fcff' },
    td: { padding: '8px 10px', borderBottom: '1px solid #09025cff' },
    small: { fontSize: 12, color: '#0177edff' },
    button: { padding: '8px 12px', background: '#097d85ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', textDecoration: 'none' },
};

const Ventas = () => {
    // ventasEjemplo es un array importado del JSON adjunto
    const ventas = ventasEjemplo || [];

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Ventas ejemplo</h1>
                <Link to="/" style={styles.button}>Volver al menú principal</Link>
            </div>

            <p style={styles.small}>Mostrando {ventas.length} registros de ventas de ejemplo.</p>

            <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
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
                        {ventas.map(v => (
                            <tr key={v.saleId}>
                                <td style={styles.td}>{v.saleId}</td>
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