import { useState } from 'react';
import FormularioFabricacionModal from '../componentes/FormularioFabricacionModal';
import ModalMateriales from '../componentes/ModalMateriales';
import BarraBusqueda from '../componentes/barraBusqueda.jsx';

function Fabricacion() {
  const [fabricaciones, setFabricaciones] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [materialesModalOpen, setMaterialesModalOpen] = useState(false);
  const [materialesSeleccionados, setMaterialesSeleccionados] = useState([]);

  const handleNuevaFabricacion = ({ tamano, materiales }) => {
    const nuevoId = fabricaciones.length > 0 ? Math.max(...fabricaciones.map(f => f.id)) + 1 : 1;
    const nuevaFabricacion = {
      id: nuevoId,
      tamano,
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: '',
      estado: 'Pendiente',
      materiales
    };
    setFabricaciones(prev => [...prev, nuevaFabricacion]);
  };

  const abrirModalMateriales = (materiales) => {
    setMaterialesSeleccionados(materiales);
    setMaterialesModalOpen(true);
  };

  return (
    <div className="p-4">
      <BarraBusqueda />
      <h1 className="text-2xl font-bold my-4">Fabricación de Macetas</h1>

      {/* Botón para abrir modal nueva fabricación */}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        onClick={() => setModalOpen(true)}
      >
        Nueva Fabricación
      </button>

      {/* Modal para nueva fabricación */}
      <FormularioFabricacionModal 
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCrear={handleNuevaFabricacion}
      />

      {/* Modal para ver materiales */}
      <ModalMateriales
        open={materialesModalOpen}
        onClose={() => setMaterialesModalOpen(false)}
        materiales={materialesSeleccionados}
      />

      {/* Tabla de fabricaciones */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th>ID</th>
            <th>Tamaño</th>
            <th>Fecha Inicio</th>
            <th>Fecha Fin</th>
            <th>Estado</th>
            <th>Materiales</th>
          </tr>
        </thead>
        <tbody>
          {fabricaciones.map(fab => (
            <tr key={fab.id} className="text-center border-t">
              <td>{fab.id}</td>
              <td>{fab.tamano}</td>
              <td>{fab.fechaInicio}</td>
              <td>{fab.fechaFin || '-'}</td>
              <td>{fab.estado}</td>
              <td>
                <button
                  className="text-blue-500 underline"
                  onClick={() => abrirModalMateriales(fab.materiales)}
                >
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Fabricacion;
