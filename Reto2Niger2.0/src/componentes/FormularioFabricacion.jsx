import { useState } from 'react';

function FormularioFabricacion({ setModalVisible, setFabricaciones, fabricaciones }) {
  const [tamano, setTamano] = useState('');

  // Materiales necesarios por tipo de maceta
  const materialesPorTamano = {
    pequeña: ['Barro', 'Pintura'],
    mediana: ['Barro', 'Pintura', 'Arena'],
    grande: ['Barro', 'Pintura', 'Arena', 'Fertilizante']
  };

  const handleCrear = () => {
    if (!tamano) return alert('Selecciona un tamaño de maceta');

    const nuevosMateriales = materialesPorTamano[tamano];

    // Generar ID automático
    const nuevoId = fabricaciones.length > 0 ? Math.max(...fabricaciones.map(f => f.id)) + 1 : 1;

    const nuevaFabricacion = {
      id: nuevoId,
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: '',
      estado: 'Pendiente',
      materiales: nuevosMateriales,
      tamano
    };

    setFabricaciones([...fabricaciones, nuevaFabricacion]);
    setModalVisible(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">Nueva Fabricación</h2>

        <label className="block mb-2">Selecciona tamaño de maceta:</label>
        <select 
          className="w-full border p-2 mb-4"
          value={tamano} 
          onChange={e => setTamano(e.target.value)}
        >
          <option value="">-- Selecciona --</option>
          <option value="pequeña">Maceta pequeña</option>
          <option value="mediana">Maceta mediana</option>
          <option value="grande">Maceta grande</option>
        </select>

        <div className="flex justify-end gap-2">
          <button 
            className="px-4 py-2 bg-gray-300 rounded" 
            onClick={() => setModalVisible(false)}
          >
            Cancelar
          </button>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded" 
            onClick={handleCrear}
          >
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormularioFabricacion;
