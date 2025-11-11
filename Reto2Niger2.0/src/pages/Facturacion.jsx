import React from 'react';

const Facturacion = () => {
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
	  <h1>FACTURACIÓN</h1>
	</div>
  );
};

export default Facturacion;
