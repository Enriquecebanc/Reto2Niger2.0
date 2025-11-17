import { useState, useEffect } from 'react';
import FormularioFabricacionModal from '../componentes/FormularioFabricacionModal';
import ModalMateriales from '../componentes/ModalMateriales';
import BarraBusqueda from '../componentes/barraBusqueda.jsx';
import logoNiger from '../assets/Niger.png';
import { getFabricaciones, crearFabricacion, actualizarFabricacion } from '../services/fabricacionService';
import { commonStyles, colors } from '../styles/commonStyles.js';

function Fabricacion() {
  const [fabricaciones, setFabricaciones] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [materialesModalOpen, setMaterialesModalOpen] = useState(false);
  const [materialesSeleccionados, setMaterialesSeleccionados] = useState([]);
  const [query, setQuery] = useState('');

  // ⿡ Cargar fabricaciones del backend
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

  // ⿢ Crear nueva fabricación
  const handleNuevaFabricacion = async ({ producto }) => {
    const nuevaFab = await crearFabricacion({ producto });
    setFabricaciones(prev => [...prev, nuevaFab]);
  };

  // ⿣ Actualizar estado
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

  // ⿤ Abrir modal de materiales
  const abrirModalMateriales = (materiales) => {
    setMaterialesSeleccionados(materiales);
    setMaterialesModalOpen(true);
  };

  // ⿥ Filtrado por búsqueda
  const filtered = fabricaciones.filter(fab =>
    fab.producto.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={commonStyles.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: 10 }}>
        <img src={logoNiger} alt="Niger Logo" style={{ width: 80, height: 'auto' }} />
        <div style={{ flex: 1 }}>
          <BarraBusqueda />
        </div>
      </div>

      <h1 style={commonStyles.title}>Fabricación de Macetas</h1>

      {/* Buscador y botón nueva fabricación */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Buscar por tamaño de maceta..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={commonStyles.input}
        />
        <button
          style={commonStyles.button}
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
      <table style={commonStyles.table}>
        <thead>
          <tr>
            <th style={commonStyles.th}>ID</th>
            <th style={commonStyles.th}>Tamaño</th>
            <th style={commonStyles.th}>Fecha Inicio</th>
            <th style={commonStyles.th}>Fecha Fin</th>
            <th style={commonStyles.th}>Estado</th>
            <th style={commonStyles.th}>Materiales</th>
            <th style={commonStyles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(fab => (
            <tr key={fab._id}>
              <td style={commonStyles.td}>{fab._id}</td>
              <td style={commonStyles.td}>{fab.producto}</td>
              <td style={commonStyles.td}>{new Date(fab.fecha_inicio).toLocaleDateString()}</td>
              <td style={commonStyles.td}>{fab.fecha_fin ? new Date(fab.fecha_fin).toLocaleDateString() : '-'}</td>
              <td style={commonStyles.td}>{fab.estado}</td>
              <td style={commonStyles.td}>
                <button
                  style={{ ...commonStyles.button, textDecoration: 'underline' }}
                  onClick={() => abrirModalMateriales(fab.materiales)}
                >
                  Ver
                </button>
              </td>
              <td style={commonStyles.td}>
                <select
                  value={fab.estado}
                  onChange={e => handleActualizarEstado(fab._id, e.target.value)}
                  style={{ 
                    ...commonStyles.input,
                    padding: '6px 8px'
                  }}
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

export default Fabricacion;