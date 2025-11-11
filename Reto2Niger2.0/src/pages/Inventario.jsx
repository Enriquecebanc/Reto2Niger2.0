import React from 'react';
import BarraBusqueda from '../componentes/barraBusqueda.jsx';

const Inventario = () => {
    const [piezas, setPiezas] = React.useState([
        { id: 1, nombre: 'Plástico duro', cantidad: 120 },
        { id: 2, nombre: 'Sensor de Luz', cantidad: 45 },
        { id: 3, nombre: 'Sensor de Humedad', cantidad: 45 },
        { id: 4, nombre: 'Luz LED', cantidad: 200 },
        { id: 5, nombre: 'Bateria', cantidad: 35 },

    ]);

    // Formularios controlados
    const [nuevoNombre, setNuevoNombre] = React.useState('');
    const [nuevaCantidad, setNuevaCantidad] = React.useState(1);

    // Añadir pieza disponible
    const addPieza = (e) => {
        e && e.preventDefault();
        if (!nuevoNombre || nuevaCantidad <= 0) return;
        setPiezas(prev => {
            const existing = prev.find(p => p.nombre.toLowerCase() === nuevoNombre.trim().toLowerCase());
            if (existing) {
                return prev.map(p => p.id === existing.id ? { ...p, cantidad: p.cantidad + Number(nuevaCantidad) } : p);
            }
            return [...prev, { id: Date.now(), nombre: nuevoNombre.trim(), cantidad: Number(nuevaCantidad) }];
        });
        setNuevoNombre(''); setNuevaCantidad(1);
    };

    //  Restar una unidad de una pieza (si llega a 0, se borra)
    const restarPieza = (id) => {
        setPiezas(prev => prev.map(p => {
            if (p.id === id) {
                const nuevaCantidad = p.cantidad - 1;
                if (nuevaCantidad <= 0) {
                    // Si llega a 0, se elimina
                    return null;
                }
                return { ...p, cantidad: nuevaCantidad };
            }
            return p;
        }).filter(Boolean)); // elimina los null
    };

    // Estilos
    const containerStyle = { display: 'flex', gap: '16px', alignItems: 'flex-start' };
    const boxStyle = { border: '1px solid #ddd', padding: '12px', borderRadius: '8px', flex: 1, minWidth: 240, background: '#fff' };
    const listStyle = { maxHeight: 240, overflowY: 'auto', paddingLeft: 16 };

    return (
        <>
            <BarraBusqueda />
            <h1>INVENTARIO</h1>

            <div style={containerStyle}>
                {/* 🧩 Cuadro 1: Piezas disponibles */}
                <div style={boxStyle}>
                    <h2>Piezas disponibles</h2>
                    <ul style={{ ...listStyle, listStyle: 'none', paddingLeft: 0, margin: 0 }}>
                        {piezas.map(p => (
                            <li
                                key={p.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: 8
                                }}
                            >
                                <span>{p.nombre} — {p.cantidad} unidades</span>
                                <button
                                    onClick={() => restarPieza(p.id)}
                                    style={{
                                        marginLeft: 8,
                                        fontSize: '12px',
                                        padding: '2px 6px',
                                        color: '#333',
                                        background: '#eee',
                                        border: '1px solid #ccc',
                                        borderRadius: 4,
                                        cursor: 'pointer'
                                    }}
                                >
                                    -
                                </button>
                            </li>
                        ))}
                    </ul>

                    <form onSubmit={addPieza} style={{ marginTop: 8 }}>
                        <div>
                            <input placeholder="Nombre pieza" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} />
                        </div>
                        <div style={{ marginTop: 6 }}>
                            <input type="number" min="1" value={nuevaCantidad} onChange={e => setNuevaCantidad(e.target.value)} />
                        </div>
                        <div style={{ marginTop: 6 }}>
                            <button type="submit">Añadir pieza</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Inventario;
