import React from 'react';
import BarraBusqueda from '../componentes/barraBusqueda.jsx';
import logoNiger from '../assets/Niger.png';

const Inventario = () => {
    const [piezas, setPiezas] = React.useState([
        { id: 1, nombre: 'Plástico duro', cantidad: 120 },
        { id: 2, nombre: 'Sensor de Luz', cantidad: 45 },
        { id: 3, nombre: 'Sensor de Humedad', cantidad: 45 },
        { id: 4, nombre: 'Luz LED - Rojo', cantidad: 110 },
        { id: 5, nombre: 'Luz LED - Amarillo', cantidad: 110 },
        { id: 6, nombre: 'Luz LED - Verde', cantidad: 110 },
        { id: 7, nombre: 'Batería', cantidad: 35 },
    ]);

    const [macetas, setMacetas] = React.useState([
        { id: 1, nombre: 'Maceta Pequeña', cantidad: 50 },
        { id: 2, nombre: 'Maceta Mediana', cantidad: 30 },
        { id: 3, nombre: 'Maceta Grande', cantidad: 20 },
    ]);

    // Formularios controlados
    const [nuevoNombre, setNuevoNombre] = React.useState('');
    const [nuevaCantidad, setNuevaCantidad] = React.useState(1);

    // Añadir pieza disponible
    const addPieza = (e) => {
        e.preventDefault();
        if (!nuevoNombre || nuevaCantidad <= 0) return;

        setPiezas(prev => {
            const existing = prev.find(p => p.nombre.toLowerCase() === nuevoNombre.trim().toLowerCase());
            if (existing) {
                return prev.map(p => p.id === existing.id ? { ...p, cantidad: p.cantidad + Number(nuevaCantidad) } : p);
            }
            return [...prev, { id: Date.now(), nombre: nuevoNombre.trim(), cantidad: Number(nuevaCantidad) }];
        });

        setNuevoNombre('');
        setNuevaCantidad(1);
    };


   

    // Restar una unidad de una pieza (si llega a 0, se borra)
    const restarPieza = (id) => {
        setPiezas(prev => prev
            .map(p => {
                if (p.id === id) {
                    const nuevaCantidad = p.cantidad - 1;
                    return nuevaCantidad > 0 ? { ...p, cantidad: nuevaCantidad } : null;
                }
                return p;
            })
            .filter(Boolean)
        );
    };

    // Restar una unidad de una maceta (si llega a 0, se borra)
    const restarMaceta = (id) => {
        setMacetas(prev => prev
            .map(m => {
                if (m.id === id) {
                    const nuevaCantidad = m.cantidad - 1;
                    return nuevaCantidad > 0 ? { ...m, cantidad: nuevaCantidad } : null;
                }
                return m;
            })
            .filter(Boolean)
        );
    };

    // Estilos básicos
    const containerStyle = {
        display: 'flex',
        justifyContent: 'space-around',
        marginTop: 20,
        flexWrap: 'wrap'
    };

    const boxStyle = {
        border: '1px solid #ccc',
        borderRadius: 10,
        padding: 20,
        width: 300,
        backgroundColor: '#fafafa',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
    };

    const listStyle = {
        listStyle: 'none',
        paddingLeft: 0
    };

    return (
        <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: 10 }}>
                <img src={logoNiger} alt="Niger Logo" style={{ width: 80, height: 'auto' }} />
                <div style={{ flex: 1 }}>
                    <BarraBusqueda />
                </div>
            </div>
            <h1>INVENTARIO</h1>

            <div style={containerStyle}>
                {/* Piezas */}
                <div style={boxStyle}>
                    <h2>Piezas disponibles</h2>
                    <ul style={listStyle}>
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
                            <input
                                placeholder="Nombre pieza"
                                value={nuevoNombre}
                                onChange={e => setNuevoNombre(e.target.value)}
                            />
                        </div>
                        <div style={{ marginTop: 6 }}>
                            <input
                                type="number"
                                min="1"
                                value={nuevaCantidad}
                                onChange={e => setNuevaCantidad(Number(e.target.value))}
                            />
                        </div>
                        <div style={{ marginTop: 6 }}>
                            <button type="submit">Añadir pieza</button>
                        </div>
                    </form>
                </div>

                {/* Macetas */}
                <div style={boxStyle}>
                    <h2>Macetas disponibles</h2>
                    <ul style={listStyle}>
                        {macetas.map(m => (
                            <li
                                key={m.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: 8
                                }}
                            >
                                <span>{m.nombre} — {m.cantidad} unidades</span>
                                <button
                                    onClick={() => restarMaceta(m.id)}
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
                </div>
            </div>
        </div>
    );
};

export default Inventario;
