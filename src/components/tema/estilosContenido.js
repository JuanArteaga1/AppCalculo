/** Estilos del contenido de un tema: los comparten la página pública y el editor. */
export const estilosContenido = {
  bloqueTexto: {
    display: 'contents',
  },

  cita: {
    borderLeft: '3px solid #F59E0B',
    margin: '8px 0',
    padding: '10px 16px',
    background: '#FFFBEB',
    borderRadius: '0 12px 12px 0',
    fontSize: '15px',
    color: '#64628A',
    lineHeight: 1.7
  },

  desplegable: {
    margin: '14px 0',
    border: '1px solid #E6E5F5',
    borderRadius: '14px',
    background: '#FFFFFF',
    overflow: 'hidden'
  },

  desplegableCuerpo: {
    padding: '4px 18px 16px'
  },

  desplegableTitulo: {
    cursor: 'pointer',
    listStyle: 'none',
    padding: '14px 18px',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '15px',
    fontWeight: 700,
    color: '#3730A3',
    background: '#F3F2FC'
  },

  equation: {
    background: 'linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 100%)',
    borderRadius: '12px',
    padding: '16px 20px',
    margin: '8px 0',
    textAlign: 'center',
    border: '1px solid #E6E5F5'
  },

  equationCode: {
    color: '#B45309',
    fontFamily: "'Courier New', monospace",
    fontSize: '16px',
    letterSpacing: '0.5px'
  },

  h2: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#252350',
    margin: '16px 0 6px',
    fontFamily: "'Poppins', sans-serif"
  },

  h3: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#252350',
    margin: '12px 0 4px',
    fontFamily: "'Poppins', sans-serif"
  },

  hr: {
    border: 'none',
    borderTop: '1px solid #E6E5F5',
    margin: '18px 0'
  },

  list: {
    listStyle: 'none',
    padding: 0,
    margin: '4px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  listItem: {
    position: 'relative',
    paddingLeft: '20px',
    fontSize: '15px',
    color: '#64628A',
    lineHeight: 1.6
  },

  paragraph: {
    fontSize: '15px',
    color: '#64628A',
    lineHeight: 1.7,
    margin: 0
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    margin: '8px 0',
    fontSize: '14px',
    background: 'rgba(255,255,255,0.9)',
    borderRadius: '12px',
    overflow: 'hidden'
  },

  td: {
    padding: '10px 12px',
    borderBottom: '1px solid #E6E5F5',
    color: '#252350'
  },

  th: {
    padding: '10px 12px',
    textAlign: 'left',
    borderBottom: '2px solid rgba(245,158,11,0.35)',
    color: '#B45309',
    fontWeight: 700,
    fontFamily: "'Poppins', sans-serif",
    background: '#FFFBEB'
  },
};
