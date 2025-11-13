// Colores comunes para toda la aplicación (optimizados para modo oscuro)
export const colors = {
  primary: '#60a5fa',        // Azul claro - títulos
  secondary: '#06b6d4',      // Cyan brillante - botones
  secondaryHover: '#0891b2', // Cyan medio - hover
  background: '#1e293b',     // Gris azulado oscuro - fondo general
  backgroundDark: '#0f172a', // Gris muy oscuro - encabezados de tabla
  backgroundLight: '#334155', // Gris medio - cards y secciones
  border: '#475569',         // Gris medio - bordes principales
  borderLight: '#334155',    // Gris oscuro - bordes de filas
  text: '#f1f5f9',           // Gris muy claro - texto principal
  textLight: '#ffffff',      // Blanco - texto sobre fondos oscuros
  textMuted: '#94a3b8',      // Gris claro - texto secundario
  success: '#10b981',        // Verde brillante - estados positivos
  warning: '#f59e0b',        // Naranja brillante - estados pendientes
  danger: '#ef4444',         // Rojo brillante - estados negativos/eliminar
};

// Estilos comunes para todos los módulos
export const commonStyles = {
  container: { 
    padding: 16, 
    fontFamily: 'Segoe UI, Roboto, Arial, sans-serif', 
    position: 'relative',
    backgroundColor: colors.background,
    color: colors.text,
    minHeight: '100vh'
  },
  header: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  title: { 
    color: colors.primary, 
    margin: 0, 
    textAlign: 'center' 
  },
  button: { 
    padding: '8px 12px', 
    background: colors.secondary, 
    color: colors.textLight, 
    border: 'none', 
    borderRadius: 4, 
    cursor: 'pointer', 
    margin: '0 4px',
    fontWeight: '600'
  },
  input: { 
    padding: '8px', 
    border: `1px solid ${colors.border}`, 
    borderRadius: '4px', 
    fontSize: '14px',
    backgroundColor: colors.backgroundLight,
    color: colors.text
  },
  label: { 
    display: 'block', 
    marginBottom: '4px', 
    color: colors.text, 
    fontWeight: '600', 
    fontSize: '14px' 
  },
  table: { 
    width: '100%', 
    borderCollapse: 'collapse' 
  },
  th: { 
    textAlign: 'left', 
    padding: '10px 12px', 
    borderBottom: `2px solid ${colors.border}`, 
    background: colors.backgroundDark,
    color: colors.textLight,
    fontWeight: '700'
  },
  td: { 
    padding: '10px 12px', 
    borderBottom: `1px solid ${colors.borderLight}`,
    color: colors.text
  },
  small: { 
    fontSize: 12, 
    color: colors.textMuted
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: colors.backgroundLight,
    color: colors.text,
    padding: 30,
    borderRadius: 8,
    maxWidth: '800px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto'
  }
};
