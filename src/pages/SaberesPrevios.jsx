import { useState } from 'react';
import { MdAdd } from 'react-icons/md';
import { FiTrendingUp, FiTriangle, FiMaximize2, FiGrid } from 'react-icons/fi';
import { HiOutlineScale, HiBookOpen, HiOutlineLightBulb } from 'react-icons/hi';

const saberes = [
  {
    id: 'sp-1',
    titulo: 'Aritmética y Álgebra Básica',
    icono: <MdAdd />,
    temas: [
      'Operaciones con fracciones y números racionales',
      'Propiedades de las potencias y raíces',
      'Factorización de expresiones algebraicas',
      'Productos notables: binomio al cuadrado, suma por diferencia',
      'Simplificación de expresiones algebraicas',
    ],
  },
  {
    id: 'sp-2',
    titulo: 'Ecuaciones e Inecuaciones',
    icono: <HiOutlineScale />,
    temas: [
      'Ecuaciones lineales de primer grado',
      'Ecuaciones cuadráticas y fórmula general',
      'Sistemas de ecuaciones lineales 2x2',
      'Inecuaciones lineales y cuadráticas',
      'Intervalos y representación en la recta real',
    ],
  },
  {
    id: 'sp-3',
    titulo: 'Funciones y Gráficas',
    icono: <FiTrendingUp />,
    temas: [
      'Concepto de función: dominio, rango y correspondencia',
      'Función lineal: forma pendiente-intercepto',
      'Función cuadrática: vértice, eje de simetría, raíces',
      'Funciones polinómicas básicas',
      'Transformaciones de gráficas: traslaciones y escalamientos',
    ],
  },
  {
    id: 'sp-4',
    titulo: 'Trigonometría Esencial',
    icono: <FiTriangle />,
    temas: [
      'Razones trigonométricas: seno, coseno y tangente',
      'Identidades pitagóricas fundamentales',
      'Funciones trigonométricas básicas y sus gráficas',
      'Resolución de triángulos rectángulos',
      'Ángulos en radianes y grados',
    ],
  },
  {
    id: 'sp-5',
    titulo: 'Geometría Analítica',
    icono: <FiMaximize2 />,
    temas: [
      'Plano cartesiano: puntos y distancias',
      'Ecuación de la recta: punto-pendiente y forma general',
      'Circunferencia y sus elementos',
      'Parábola, elipse e hipérbola (introducción)',
      'Relación entre ecuaciones y sus gráficas',
    ],
  },
  {
    id: 'sp-6',
    titulo: 'Pensamiento Lógico-Matemático',
    icono: <FiGrid />,
    temas: [
      'Reconocimiento de patrones y secuencias',
      'Razonamiento proporcional y porcentajes',
      'Interpretación de tablas y gráficos estadísticos',
      'Planteamiento de problemas con variables',
      'Estrategias de verificación de resultados',
    ],
  },
];

export default function SaberesPrevios() {
  const [active, setActive] = useState(null);

  return (
    <div style={styles.page}>
      <div className="container">
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.tag}>Preparación</span>
          <h1 style={styles.title}>Conceptos Previos</h1>
          <p style={styles.desc}>
            Antes de adentrarte en el mundo del Cálculo, es importante que revises estos conceptos 
            fundamentales. Dominarlos te permitirá avanzar con confianza y reducir la frustración 
            al estudiar temas nuevos.
          </p>
        </div>

        {/* Accordion */}
        <div className="saberes-grid" style={styles.grid}>
          {saberes.map((s) => {
            const isOpen = active === s.id;
            return (
              <div
                key={s.id}
                style={{
                  ...styles.card,
                  ...(isOpen ? styles.cardOpen : {}),
                }}
              >
                <button
                  style={styles.cardHeader}
                  onClick={() => setActive(isOpen ? null : s.id)}
                >
                  <div style={styles.cardTitleWrap}>
                    <span style={styles.cardIcon}>{s.icono}</span>
                    <span style={styles.cardTitle}>{s.titulo}</span>
                  </div>
                  <span style={styles.cardArrow}>{isOpen ? '−' : '+'}</span>
                </button>

                {isOpen && (
                  <div style={styles.cardBody}>
                    <ul style={styles.list}>
                      {s.temas.map((t, i) => (
                        <li key={i} style={styles.listItem}>
                          <span style={styles.bullet}>▸</span>
                          {t}
                        </li>
                      ))}
                    </ul>
                    <div style={styles.cardFooter}>
                      <span style={styles.note}><HiBookOpen style={{ verticalAlign: 'middle', marginRight: 6 }} /> Material de repaso disponible próximamente</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Callout */}
        <div style={styles.callout}>
          <div style={styles.calloutEmoji}><HiOutlineLightBulb /></div>
          <div>
            <h3 style={styles.calloutTitle}>¿No recuerdas alguno de estos temas?</h3>
            <p style={styles.calloutText}>
              No te preocupes. El asistente IA pronto podrá ayudarte a repasar cualquier concepto 
              paso a paso. Mientras tanto, te recomendamos repasar con tus apuntes de pre-cálculo 
              o buscar recursos complementarios en la videoteca.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: '32px 0 80px',
  },
  header: {
    textAlign: 'center',
    maxWidth: '720px',
    margin: '0 auto 48px',
  },
  tag: {
    display: 'inline-block',
    padding: '6px 14px',
    background: '#FFFBEB',
    color: '#B45309',
    fontSize: '13px',
    fontWeight: 700,
    borderRadius: '999px',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  title: {
    fontSize: '36px',
    fontWeight: 800,
    color: '#252350',
    margin: '0 0 12px',
    fontFamily: "'Poppins', sans-serif",
  },
  desc: {
    fontSize: '17px',
    color: '#64628A',
    lineHeight: 1.6,
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    maxWidth: '960px',
    margin: '0 auto',
  },
  card: {
    background: 'linear-gradient(145deg, #FFFFFF, #FFFFFF)',
    borderRadius: '16px',
    border: '1px solid #E6E5F5',
    boxShadow: '0 1px 3px rgba(37,35,80,0.04)',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s ease',
  },
  cardOpen: {
    boxShadow: '0 10px 25px rgba(37,35,80,0.08)',
    borderColor: 'rgba(245,158,11,0.35)',
  },
  cardHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  },
  cardTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  cardIcon: {
    fontSize: '22px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FFFBEB',
    color: '#B45309',
    borderRadius: '10px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#252350',
    fontFamily: "'Poppins', sans-serif",
  },
  cardArrow: {
    fontSize: '20px',
    color: '#64628A',
    fontWeight: 300,
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: '0 24px 20px',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  listItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    fontSize: '14px',
    color: '#252350',
    lineHeight: 1.5,
    padding: '8px 12px',
    background: '#FFFBEB',
    borderRadius: '8px',
  },
  bullet: {
    color: '#B45309',
    fontWeight: 700,
    lineHeight: 1.5,
  },
  cardFooter: {
    marginTop: '14px',
    padding: '10px 12px',
    background: '#FFFBEB',
    borderRadius: '8px',
  },
  note: {
    fontSize: '13px',
    color: '#B45309',
    fontWeight: 500,
  },
  callout: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
    maxWidth: '720px',
    margin: '40px auto 0',
    padding: '24px',
    background: '#FFFBEB',
    borderRadius: '16px',
    border: '1px solid rgba(245,158,11,0.35)',
  },
  calloutEmoji: {
    fontSize: '28px',
    lineHeight: 1,
    color: '#B45309',
  },
  calloutTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#B45309',
    margin: '0 0 6px',
    fontFamily: "'Poppins', sans-serif",
  },
  calloutText: {
    fontSize: '14px',
    color: '#64628A',
    lineHeight: 1.55,
    margin: 0,
  },
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      .saberes-grid { grid-template-columns: 1fr !important; }
    }
  `;
  document.head.appendChild(style);
}
