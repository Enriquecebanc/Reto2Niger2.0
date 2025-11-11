import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BarraBusqueda from '../componentes/barraBusqueda.jsx';

const Facturacion = () => {
  const navigate = useNavigate();
  const [facturas, setFacturas] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({
    cliente: '',
    concepto: '',
    cantidad: '',
    precio: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.cliente || !form.concepto || !form.cantidad || !form.precio) {
      alert('Completa todos los campos');
      return;
    }

    const nuevaFactura = {
      id: Date.now(),
      ...form,
      cantidad: parseInt(form.cantidad),
      precio: parseFloat(form.precio),
      total: parseInt(form.cantidad) * parseFloat(form.precio),
      fecha: new Date().toLocaleDateString(),
      estado: 'Pendiente'
    };

    setFacturas([...facturas, nuevaFactura]);
    setForm({ cliente: '', concepto: '', cantidad: '', precio: '' });
    setMostrarForm(false);
  };

  const cambiarEstado = (id, estado) => {
    setFacturas(facturas.map(f => f.id === id ? { ...f, estado } : f));
  };

  const eliminar = (id) => {
    setFacturas(facturas.filter(f => f.id !== id));
  };

  return (
    <div>
      <BarraBusqueda />
      <div style={{ padding: '20px' }}>
        <h1>📄 FACTURACIÓN</h1>
        
        <button 
          onClick={() => setMostrarForm(!mostrarForm)}
          style={{ marginBottom: '20px', padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
        >
        {mostrarForm ? 'Cancelar' : 'Nueva Factura'}
      </button>

      {mostrarForm && (
        <form onSubmit={handleSubmit} style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Cliente"
              value={form.cliente}
              onChange={(e) => setForm({ ...form, cliente: e.target.value })}
              style={{ padding: '8px', marginRight: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <input
              type="text"
              placeholder="Concepto"
              value={form.concepto}
              onChange={(e) => setForm({ ...form, concepto: e.target.value })}
              style={{ padding: '8px', marginRight: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="number"
              placeholder="Cantidad"
              value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
              style={{ padding: '8px', width: '80px', marginRight: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Precio €"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              style={{ padding: '8px', width: '80px', marginRight: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <button type="submit" style={{ padding: '8px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
              Crear
            </button>
          </div>
        </form>
      )}

      <h3>Facturas ({facturas.length})</h3>
      
      {facturas.length === 0 ? (
        <p>No hay facturas</p>
      ) : (
        facturas.map((factura) => (
          <div key={factura.id} style={{ 
            border: '1px solid #ddd', 
            padding: '15px', 
            marginBottom: '10px', 
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h4>#{factura.id}</h4>
              <p><strong>Cliente:</strong> {factura.cliente}</p>
              <p><strong>Concepto:</strong> {factura.concepto}</p>
              <p><strong>Cantidad:</strong> {factura.cantidad} | <strong>Precio:</strong> €{factura.precio}</p>
              <p><strong>Total:</strong> €{factura.total.toFixed(2)} | <strong>Fecha:</strong> {factura.fecha}</p>
            </div>
            <div>
              <span style={{ 
                padding: '5px 10px', 
                borderRadius: '15px', 
                background: factura.estado === 'Pendiente' ? '#ffeaa7' : '#74b9ff',
                fontSize: '12px',
                marginRight: '10px'
              }}>
                {factura.estado}
              </span>
              <select 
                value={factura.estado}
                onChange={(e) => cambiarEstado(factura.id, e.target.value)}
                style={{ marginRight: '10px', padding: '4px' }}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Pagada">Pagada</option>
              </select>
              <button 
                onClick={() => eliminar(factura.id)}
                style={{ padding: '4px 8px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '3px' }}
              >
                ✖
              </button>
            </div>
          </div>
        ))
      )}
      </div>
    </div>
  );
};

export default Facturacion;
