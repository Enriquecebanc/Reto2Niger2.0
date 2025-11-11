import { useState, useEffect } from 'react';
import BarraBusqueda from '../componentes/barraBusqueda.jsx';

function Fabricacion() {
  const [fabricaciones, setFabricaciones] = useState([]);

  // Función para abrir la ventana emergente de nueva fabricación
  const abrirVentanaNuevaFabricacion = () => {
    const nuevaVentana = window.open(
      '',
      'NuevaFabricacion',
      'width=400,height=400,left=200,top=200'
    );

    nuevaVentana.document.write(`
      <html>
        <head>
          <title>Nueva Fabricación</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            button { padding: 8px 16px; margin-top: 10px; }
            select { width: 100%; padding: 6px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h2>Nueva Fabricación</h2>
          <label>Tamaño de maceta:</label>
          <select id="tamano">
            <option value="">-- Selecciona --</option>
            <option value="pequeña">Pequeña</option>
            <option value="mediana">Mediana</option>
            <option value="grande">Grande</option>
          </select>
          <br/>
          <button id="crearBtn">Crear</button>

          <script>
            const materialesPorTamano = {
              pequeña: ['Barro', 'Pintura'],
              mediana: ['Barro', 'Pintura', 'Arena'],
              grande: ['Barro', 'Pintura', 'Arena', 'Fertilizante']
            };

            document.getElementById('crearBtn').addEventListener('click', () => {
              const tamano = document.getElementById('tamano').value;
              if(!tamano) { alert('Selecciona un tamaño'); return; }

              const materiales = materialesPorTamano[tamano];

              // Enviar mensaje a la ventana principal
              window.opener.postMessage({ tamano, materiales }, '*');

              window.close();
            });
          </script>
        </body>
      </html>
    `);
  };

  // Función para abrir ventana emergente de materiales
  const abrirVentanaMateriales = (materiales) => {
    const ventana = window.open(
      '',
      'MaterialesFabricacion',
      'width=300,height=300,left=300,top=200'
    );

    const lista = materiales.map(mat => `<li>${mat}</li>`).join('');

    ventana.document.write(`
      <html>
        <head>
          <title>Materiales</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h2 { margin-bottom: 10px; }
            ul { padding-left: 20px; }
            button { margin-top: 15px; padding: 6px 12px; }
          </style>
        </head>
        <body>
          <h2>Materiales utilizados</h2>
          <ul>
            ${lista}
          </ul>
          <button onclick="window.close()">Cerrar</button>
        </body>
      </html>
    `);
  };

  // useEffect para escuchar los mensajes de la ventana emergente de nueva fabricación
  useEffect(() => {
    const recibirFabricacion = (event) => {
      if (!event.data) return;
      const { tamano, materiales } = event.data;

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

    window.addEventListener('message', recibirFabricacion);
    return () => window.removeEventListener('message', recibirFabricacion);
  }, [fabricaciones]);

  return (
    <div className="p-4">
      <BarraBusqueda />
      <h1 className="text-2xl font-bold my-4">Fabricación de Macetas</h1>

      {/* Botón para abrir la ventana emergente */}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        onClick={abrirVentanaNuevaFabricacion}
      >
        Nueva Fabricación
      </button>

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
                  onClick={() => abrirVentanaMateriales(fab.materiales)}
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
