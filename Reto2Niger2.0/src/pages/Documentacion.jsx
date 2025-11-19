import React from 'react';
import BarraBusqueda from '../componentes/barraBusqueda.jsx';
import { commonStyles, colors } from '../styles/commonStyles.js';

const Documentacion = () => {
  const documentos = [
    {
      id: 1,
      nombre: 'Informe Final Reto',
      descripcion: 'Documento completo del proyecto final',
      archivo: 'Informe_Fina_reto_ej.pdf',
      tipo: 'PDF',
      fecha: '2025-11-18'
    },
    // Aquí puedes añadir más documentos
  ];

  const verDocumento = (doc) => {
    // Abrir el PDF en una nueva pestaña del navegador
    window.open(`/documentacion/${doc.archivo}`, '_blank');
  };

  const descargarDocumento = (archivo) => {
    const link = document.createElement('a');
    link.href = `/documentacion/${archivo}`;
    link.download = archivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={commonStyles.container}>
      <BarraBusqueda />
      <h1 style={{ color: colors.text, marginBottom: '20px', fontSize: '28px' }}>
        Documentación
      </h1>

      <div style={{
        background: colors.cardBackground,
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <p style={{ color: colors.textSecondary, fontSize: '14px' }}>
          Aquí encontrarás todos los documentos relacionados con el proyecto.
        </p>
      </div>

      {/* Grid de documentos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginTop: '20px'
      }}>
        {documentos.map((doc) => (
          <div
            key={doc.id}
            style={{
              background: colors.cardBackground,
              padding: '24px',
              borderRadius: '12px',
              border: `2px solid ${colors.border}`,
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(1, 119, 237, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Icono del documento */}
            <div style={{
              width: '60px',
              height: '60px',
              background: colors.primary,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              fontSize: '28px'
            }}>
              PDF
            </div>

            {/* Información del documento */}
            <h3 style={{
              color: colors.text,
              fontSize: '18px',
              marginBottom: '8px',
              fontWeight: 'bold'
            }}>
              {doc.nombre}
            </h3>

            <p style={{
              color: colors.textSecondary,
              fontSize: '14px',
              marginBottom: '12px',
              minHeight: '40px'
            }}>
              {doc.descripcion}
            </p>

            {/* Información adicional */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '16px',
              fontSize: '12px'
            }}>
              <span style={{
                background: colors.primary,
                color: 'white',
                padding: '4px 8px',
                borderRadius: '6px',
                fontWeight: 'bold'
              }}>
                {doc.tipo}
              </span>
              <span style={{
                color: colors.textSecondary
              }}>
                {new Date(doc.fecha).toLocaleDateString('es-ES')}
              </span>
            </div>

            {/* Botones de acción */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => verDocumento(doc)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = colors.primaryHover}
                onMouseLeave={(e) => e.target.style.background = colors.primary}
              >
                Ver
              </button>
              <button
                onClick={() => descargarDocumento(doc.archivo)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: colors.secondary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#0891b2'}
                onMouseLeave={(e) => e.target.style.background = colors.secondary}
              >
                Descargar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mensaje si no hay documentos */}
      {documentos.length === 0 && (
        <div style={{
          background: colors.cardBackground,
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          marginTop: '20px'
        }}>
          <p style={{ color: colors.textSecondary, fontSize: '16px' }}>
            No hay documentos disponibles en este momento.
          </p>
        </div>
      )}
    </div>
  );
};

export default Documentacion;
