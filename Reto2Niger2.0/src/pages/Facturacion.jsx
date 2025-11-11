import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BarraBusqueda from '../componentes/barraBusqueda.jsx';

const STORAGE_KEY = 'facturas_data';

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

  // Cargar facturas al inicializar
  useEffect(() => {
    const facturasGuardadas = localStorage.getItem(STORAGE_KEY);
    if (facturasGuardadas) {
      try {
        setFacturas(JSON.parse(facturasGuardadas));
      } catch (error) {
        console.error('Error al cargar facturas:', error);
        setFacturas([]);
      }
    }
  }, []);

  // Guardar facturas cuando cambien
  useEffect(() => {
    if (facturas.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(facturas));
    }
  }, [facturas]);

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

  // Función para exportar facturas a JSON
  const exportarFacturas = () => {
    const dataStr = JSON.stringify(facturas, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'facturas.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Función para importar facturas desde JSON
  const importarFacturas = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const facturasImportadas = JSON.parse(e.target.result);
          if (Array.isArray(facturasImportadas)) {
            setFacturas(facturasImportadas);
            alert('Facturas importadas correctamente');
          } else {
            alert('El archivo no contiene un formato válido');
          }
        } catch (error) {
          alert('Error al leer el archivo JSON');
        }
      };
      reader.readAsText(file);
    } else {
      alert('Por favor selecciona un archivo JSON válido');
    }
  };

  return (
    <div>
      <BarraBusqueda />
      <div style={{ padding: '20px' }}>
        <h1>FACTURACIÓN</h1>
        
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setMostrarForm(!mostrarForm)}
            style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            {mostrarForm ? 'Cancelar' : 'Nueva Factura'}
          </button>
          
          <button 
            onClick={exportarFacturas}
            style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}
            disabled={facturas.length === 0}
          >
            Exportar JSON
          </button>
          
          <label style={{ 
            padding: '10px 20px', 
            background: '#6c757d', 
            color: 'white', 
            borderRadius: '5px', 
            cursor: 'pointer',
            display: 'inline-block'
          }}>
            Importar JSON
            <input 
              type="file" 
              accept=".json"
              onChange={importarFacturas}
              style={{ display: 'none' }}
            />
          </label>
        </div>

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
                Eliminar
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
