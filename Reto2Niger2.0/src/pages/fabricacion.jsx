import { useState, useEffect } from 'react';
import FormularioFabricacionModal from '../componentes/FormularioFabricacionModal';
import ModalMateriales from '../componentes/ModalMateriales';
import BarraBusqueda from '../componentes/barraBusqueda.jsx';
import logoNiger from '../assets/Niger.png';
import { getFabricaciones, crearFabricacion, actualizarFabricacion } from '../services/fabricacionService';

function Fabricacion() {
  const [fabricaciones, setFabricaciones] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [materialesModalOpen, setMaterialesModalOpen] = useState(false);
  const [materialesSeleccionados, setMaterialesSeleccionados] = useState([]);
  const [query, setQuery] = useState('');

  // 1️⃣ Cargar fabricaciones del backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFabricaciones();
        setFabricaciones(data);
      } catch (err) {
        console.error("Error al obtener fabricaciones:", err);
      }
    };
    fetchData();
  }, []);

  // 2️⃣ Crear nueva fabricación
  const handleNuevaFabricacion = async ({ tamano }) => {
    try {
      const nuevaFab = await crearFabricacion({ producto: tamano });
      setFabricaciones(prev => [...prev, nuevaFab]);
    } catch (err) {
      console.error("Error al crear fabricación:", err);
    }
  };

  // 3️⃣ Actualizar estado
  const handleActualizarEstado = async (id, nuevoEstado) => {
    try {
      const updated = await actualizarFabricacion(id, { estado: nuevoEstado });
      setFabricaciones(prev =>
        prev.map(fab => (fab._id === id ? updated : fab))
      );
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  // 4️⃣ Abrir modal de materiales
  const abrirModalMateriales = (materiales) => {
    setMaterialesSeleccionados(materiales);
    setMaterialesModalOpen(true);
  };

  // 5️⃣ Filtrado por búsqueda
  const filtered = fabricaciones.filter(fab =>
    fab.producto.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-4">
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: 10 }}>
        <img src={logoNiger} alt="Niger Logo" style={{ width: 80, height: 'auto' }} />
        <div style={{ flex: 1 }}>
          <BarraBusqueda />
        </div>
      </div>

      <h1 className="text-2xl font-bold my-4">Fabricación de Macetas</h1>

      {/* Buscador y botón nueva fabricación */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Buscar por tamaño de maceta..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="border rounded px-2 py-1 flex-1"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setModalOpen(true)}
        >
          Nueva Fabricación
        </button>
      </div>

      {/* Modal para crear nueva fabricación */}
      <FormularioFabricacionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCrear={handleNuevaFabricacion}
      />

      {/* Modal para ver materiales */}
      <ModalMateriales
        open={materialesModalOpen}
        onClose={() => setMaterialesModalOpen(false)}
        materiales={materialesSeleccionados || []}
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
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(fab => (
            <tr key={fab._id} className="text-center border-t">
              <td>{fab._id}</td>
              <td>{fab.producto}</td>
              <td>{new Date(fab.fecha_inicio).toLocaleDateString()}</td>
              <td>{fab.fecha_fin ? new Date(fab.fecha_fin).toLocaleDateString() : '-'}</td>
              <td>{fab.estado}</td>
              <td>
                <button
                  className="text-blue-500 underline"
                  onClick={() => abrirModalMateriales(fab.materiales)}
                >
                  Ver
                </button>
              </td>
              <td>
                <select
                  value={fab.estado}
                  onChange={e => handleActualizarEstado(fab._id, e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Finalizado">Finalizado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Fabricacion;
