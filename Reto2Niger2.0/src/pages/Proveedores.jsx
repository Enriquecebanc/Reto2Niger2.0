import BarraBusqueda from '../componentes/barraBusqueda.jsx';
import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'proveedores_v1';

const sampleProviders = [
  { id: 1, nombre: 'Distribuciones Norte', contacto: 'María Pérez', telefono: '612345678' },
  { id: 2, nombre: 'Suministros Agro', contacto: 'Carlos Gómez', telefono: '698765432' },
  { id: 3, nombre: 'Industrias La Rosa', contacto: 'Ana Ruiz', telefono: '600111222' }
];

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [filtro, setFiltro] = useState('');

  // Form
  const [nombre, setNombre] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setProveedores(JSON.parse(raw));
      } else {
        setProveedores(sampleProviders);
      }
    } catch (e) {
      setProveedores(sampleProviders);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(proveedores));
    } catch (e) {
      // ignore storage errors
    }
  }, [proveedores]);

  const añadirProveedor = (e) => {
    e.preventDefault();
    setError('');
    if (!nombre.trim()) return setError('El nombre es obligatorio.');
    if (!contacto.trim()) return setError('El contacto es obligatorio.');
    const telClean = telefono.replace(/[^0-9]/g, '');
    if (telefono && telClean.length < 6) return setError('Teléfono inválido.');

    const nuevo = {
      id: Date.now(),
      nombre: nombre.trim(),
      contacto: contacto.trim(),
      telefono: telefono.trim()
    };
    setProveedores((s) => [nuevo, ...s]);
    setNombre('');
    setContacto('');
    setTelefono('');
  };

  const eliminar = (id) => {
    if (!confirm('¿Eliminar proveedor?')) return;
    setProveedores((s) => s.filter((p) => p.id !== id));
  };

  const proveedoresFiltrados = proveedores.filter((p) => {
    const q = filtro.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(q) ||
      p.contacto.toLowerCase().includes(q) ||
      (p.telefono && p.telefono.includes(q))
    );
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ marginBottom: '0.25rem' }}>Proveedores</h1>
      <p style={{ color: '#555', marginTop: 0 }}>Gestiona tus proveedores: búsqueda rápida, alta y eliminación.</p>

      <BarraBusqueda value={filtro} onChange={setFiltro} placeholder="Buscar por nombre, contacto o teléfono" />

      <section style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <form onSubmit={añadirProveedor} style={{ flex: 1, minWidth: 260 }}>
          <h3>Agregar proveedor</h3>
          <div style={{ marginBottom: 8 }}>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre *"
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <input
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              placeholder="Persona de contacto *"
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Teléfono (opcional)"
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
            />
          </div>
          {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
          <div>
            <button type="submit" style={{ padding: '0.5rem 1rem', borderRadius: 6, cursor: 'pointer' }}>
              Añadir
            </button>
          </div>
        </form>

        <div style={{ flex: 2, minWidth: 320 }}>
          <h3 style={{ marginTop: 0 }}>Lista ({proveedoresFiltrados.length})</h3>
          {proveedoresFiltrados.length === 0 ? (
            <div style={{ color: '#666' }}>No hay proveedores que coincidan.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '8px' }}>Nombre</th>
                  <th style={{ padding: '8px' }}>Contacto</th>
                  <th style={{ padding: '8px' }}>Teléfono</th>
                  <th style={{ padding: '8px' }}></th>
                </tr>
              </thead>
              <tbody>
                {proveedoresFiltrados.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '8px' }}>{p.nombre}</td>
                    <td style={{ padding: '8px' }}>{p.contacto}</td>
                    <td style={{ padding: '8px' }}>{p.telefono || '-'}</td>
                    <td style={{ padding: '8px' }}>
                      <button
                        onClick={() => eliminar(p.id)}
                        style={{ padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default Proveedores;