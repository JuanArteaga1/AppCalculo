import { useParams, Link } from 'react-router-dom';
import { getTemaById } from '../data/temas';
import { enlazarTerminos, referenciasPara } from '../data/glosario';
import TemaVideo from '../components/TemaVideo';
import SaberesRelacionados from '../components/SaberesRelacionados';
import AnimatedIcon from '../components/AnimatedIcon';
import TablaLimiteInteractiva from '../components/TablaLimiteInteractiva';
import { FiBookOpen, FiVideo, FiBarChart2, FiArrowRight } from 'react-icons/fi';
import { HiOutlineLightBulb } from 'react-icons/hi';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function renderLatex(text) {
  if (!text) return text;
  let result = text;
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');

  result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
    try {
      return katex.renderToString(latex.trim(), { displayMode: true, throwOnError: false });
    } catch {
      return latex;
    }
  });

  result = result.replace(/\$([^$\n]+?)\$/g, (_, latex) => {
    try {
      return katex.renderToString(latex.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return latex;
    }
  });

  return result;
}

/**
 * Convierte los enlaces markdown [texto](https://...) en anclas externas.
 * Solo admite http/https: el contenido vive en el repositorio, pero limitar el
 * esquema evita que un `javascript:` se cuele si alguien pega un enlace raro.
 */
function renderEnlaces(html) {
  if (!html) return html;
  return html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a class="tema-enlace" href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}

export default function TemaPage() {
  const { unidadId, temaId } = useParams();
  const tema = getTemaById(unidadId, temaId);
  const isTema11 = unidadId === 'limites' && temaId === '1.1';

  if (!tema) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Tema no encontrado</h2>
        <Link to="/calculo1">Volver a Calculo I</Link>
      </div>
    );
  }

  function getGraphMode(uid, tid) {
    if (uid === 'limites') return { modo: 'limite', subtipo: '' };
    if (uid === 'derivadas') return { modo: 'derivada', subtipo: '' };

    if (uid === 'aplicaciones') {
      const map = {
        '3.2': 'crecimiento',
        '3.3': 'extremos',
        '3.4': 'concavidad',
        '3.5': 'extremos',
        '3.6': 'optimizacion',
        '3.7': 'tvm',
        '3.8': 'tvm',
        '3.9': 'lhopital',
        '3.10': 'aproximacion',
        '3.11': 'analisis',
        '3.12': 'default'
      };
      return { modo: 'aplicacion', subtipo: map[tid] || 'default' };
    }

    return { modo: 'limite', subtipo: '' };
  }

  const { modo } = getGraphMode(unidadId, temaId);

  const renderContent = (text) => {
    // Orden: primero se enlazan los terminos del glosario (respetando formulas y
    // enlaces existentes), luego KaTeX, y al final los enlaces pasan a <a>.
    const preprocessed = renderEnlaces(renderLatex(enlazarTerminos(text)));
    const lines = preprocessed.split('\n');
    const elements = [];
    let listItems = [];
    let inList = false;
    let tableLines = [];
    let inTable = false;
    let col1Elements = [];
    let col2Elements = [];
    let afterColumnsElements = [];
    let capturingColumns = false;
    let activeColumn = 1;

    const flushList = () => {
      if (inList && listItems.length) {
        const listNode = (
          <ul key={`list-${Math.random()}`} style={styles.list}>
            {listItems.map((item, i) => (
              <li key={i} style={styles.listItem} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        );

        if (capturingColumns) {
          if (activeColumn === 1) col1Elements.push(listNode);
          else if (activeColumn === 2) col2Elements.push(listNode);
          else afterColumnsElements.push(listNode);
        } else {
          elements.push(listNode);
        }

        listItems = [];
        inList = false;
      }
    };

    const flushTable = () => {
      if (!inTable || !tableLines.length) return;

      const headerCells = tableLines[0].split('|').map(c => c.trim()).filter(Boolean);
      const bodyRows = tableLines.slice(2).map(row =>
        row.split('|').map(c => c.trim()).filter(Boolean)
      );

      const tableNode = (
        <table
          key={`table-${Math.random()}`}
          className={isTema11 ? 'tema11-table' : ''}
          style={styles.table}
        >
          <thead>
            <tr>
              {headerCells.map((cell, i) => (
                <th key={i} style={styles.th} dangerouslySetInnerHTML={{ __html: cell }} />
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className={isTema11 ? 'tema11-row' : ''}
                style={
                  isTema11
                    ? { animationDelay: `${rIdx * 0.7}s` }
                    : {}
                }
              >
                {row.map((cell, cIdx) => (
                  <td key={cIdx} style={styles.td} dangerouslySetInnerHTML={{ __html: cell }} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );

      if (capturingColumns) {
        if (activeColumn === 1) col1Elements.push(tableNode);
        else if (activeColumn === 2) col2Elements.push(tableNode);
        else afterColumnsElements.push(tableNode);
      } else {
        elements.push(tableNode);
      }

      tableLines = [];
      inTable = false;
    };

    const flushColumnsIfNeeded = () => {
      if (!capturingColumns) return;

      elements.push(
        <div key={`cols-${elements.length}`} style={styles.columnsWrapper}>
          <div style={styles.rowContainer}>
            <div style={styles.columnBox}>{col1Elements}</div>
            <div style={styles.columnBox}>{col2Elements}</div>
          </div>

          {afterColumnsElements.length > 0 && (
            <div style={styles.conclusionBox}>
              {afterColumnsElements}
            </div>
          )}
        </div>
      );

      col1Elements = [];
      col2Elements = [];
      afterColumnsElements = [];
      capturingColumns = false;
      activeColumn = 1;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      const lower = trimmed.toLowerCase();

      if (
        lower.includes('límite por la izquierda') ||
        lower.includes('tabla de valores por la izquierda')
      ) {
        flushList();
        flushTable();
        if (capturingColumns) flushColumnsIfNeeded();
        capturingColumns = true;
        activeColumn = 1;
      } else if (
        lower.includes('límite por la derecha') ||
        lower.includes('tabla de valores por la derecha')
      ) {
        flushList();
        flushTable();
        capturingColumns = true;
        activeColumn = 2;
      } else if (lower.startsWith('conclusión:') || lower.includes('conclusión:')) {
        activeColumn = 'after';
      } else if (
        trimmed.startsWith('## ') &&
        !lower.includes('izquierda') &&
        !lower.includes('derecha')
      ) {
        flushList();
        flushTable();
        flushColumnsIfNeeded();
      }

      if (!trimmed) {
        flushList();
        flushTable();
        return;
      }

      // Marcador de contenido: [[tabla-limite expr=<expresion> punto=<numero>]]
      const marcadorTabla = trimmed.match(/^\[\[tabla-limite\s+expr=(.+?)\s+punto=([-\d.]+)(?:\s+modo=(\w+))?\]\]$/);
      if (marcadorTabla) {
        flushList();
        flushTable();
        elements.push(
          <TablaLimiteInteractiva
            key={idx}
            expr={marcadorTabla[1]}
            punto={Number(marcadorTabla[2])}
            modo={marcadorTabla[3] || undefined}
          />
        );
        return;
      }

      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        flushList();
        inTable = true;
        tableLines.push(trimmed);
        return;
      } else {
        flushTable();
      }

      let generatedElement = null;

      if (trimmed.startsWith('## ')) {
        flushList();
        generatedElement = (
          <h2
            key={idx}
            style={styles.h2}
            dangerouslySetInnerHTML={{ __html: trimmed.replace('## ', '') }}
          />
        );
      } else if (trimmed.startsWith('### ')) {
        flushList();
        generatedElement = (
          <h3
            key={idx}
            style={styles.h3}
            dangerouslySetInnerHTML={{ __html: trimmed.replace('### ', '') }}
          />
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        inList = true;
        listItems.push(trimmed.slice(2));
        return;
      } else if (
        trimmed.startsWith('[') &&
        trimmed.includes(']=') &&
        !trimmed.includes('](')
      ) {
        flushList();
        generatedElement = (
          <div key={idx} style={styles.equation}>
            <code style={styles.equationCode}>
              {trimmed.replace(/\[|\]/g, '')}
            </code>
          </div>
        );
      } else {
        flushList();

        const parts = trimmed.split(/(\*\*.*?\*\*)/g);

        const children = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            // El texto en negrita puede contener fórmulas o enlaces ya convertidos
            // a HTML, así que se inserta igual que el resto del párrafo.
            return (
              <strong key={pIdx} dangerouslySetInnerHTML={{ __html: part.slice(2, -2) }} />
            );
          }

          return (
            <span
              key={pIdx}
              dangerouslySetInnerHTML={{ __html: part }}
            />
          );
        });

        generatedElement = (
          <p key={idx} style={styles.paragraph}>
            {children}
          </p>
        );
      }

      if (capturingColumns) {
        if (activeColumn === 1) {
          col1Elements.push(generatedElement);
        } else if (activeColumn === 2) {
          col2Elements.push(generatedElement);
        } else {
          afterColumnsElements.push(generatedElement);
        }
      } else {
        elements.push(generatedElement);
      }
    });

    flushList();
    flushTable();
    flushColumnsIfNeeded();

    return elements;
  };

  return (
    <div style={styles.page}>
      <div className="container">
        <div style={styles.breadcrumb}>
          <Link to="/calculo1" style={styles.breadcrumbLink}>
            Calculo I
          </Link>
          <span style={styles.breadcrumbSep}>/</span>
          <Link to={`/calculo1/${unidadId}`} style={styles.breadcrumbLink}>
            {unidadId === 'limites'
              ? 'Limites'
              : unidadId === 'derivadas'
                ? 'Derivadas'
                : 'Aplicaciones'}
          </Link>
          <span style={styles.breadcrumbSep}>/</span>
          <span style={styles.breadcrumbCurrent}>{tema.titulo}</span>
        </div>

        <div className="tema-layout" style={styles.layout}>
          <div style={styles.main}>
            <div id="seccion-contenido" style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardHeaderTop}>
                  <AnimatedIcon type={unidadId} size={72} />
                  <span style={styles.cardTag}>Leccion {tema.id}</span>
                </div>

                <h1 style={styles.cardTitle}>{tema.titulo}</h1>
                <p style={styles.cardDesc}>{tema.descripcion}</p>
              </div>

              <div style={styles.cardBody}>
                {renderContent(tema.contenido)}
                <Referencias tema={tema} />
              </div>
            </div>

            <div id="seccion-videos">
              <TemaVideo unidadId={unidadId} temaId={temaId} />
            </div>

            <div id="seccion-laboratorio" style={styles.graphWrap}>
              <LanzadorLaboratorio
                titulo={tema.titulo}
                modo={modo}
                unidadId={unidadId}
                temaId={temaId}
              />
            </div>
          </div>

          <aside className="tema-sidebar" style={styles.sidebar}>
            <div style={styles.sidebarCard}>
              <h4 style={styles.sidebarTitle}>Recursos</h4>

              <nav style={styles.navList}>
                <NavLink
                  href="#seccion-contenido"
                  icon={<FiBookOpen />}
                  label="Contenido del tema"
                />
                <NavLink
                  href="#seccion-videos"
                  icon={<FiVideo />}
                  label="Videos de apoyo"
                />
                <NavLink
                  href="#seccion-laboratorio"
                  icon={<FiBarChart2 />}
                  label="Laboratorio"
                />
                <NavLink
                  href="#seccion-saberes"
                  icon={<HiOutlineLightBulb />}
                  label="Saberes previos"
                />
              </nav>
            </div>

            <div id="seccion-saberes">
              <SaberesRelacionados unidadId={unidadId} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

const SUGERENCIAS = {
  limite: { fn: '(x^2 - 4)/(x - 2)', punto: '2' },
  derivada: { fn: 'x^2', punto: '2' },
  aplicacion: { fn: 'x^3 - 3x', punto: '1' }
};

function LanzadorLaboratorio({ titulo, modo, unidadId, temaId }) {
  const sugerencia = SUGERENCIAS[modo] || SUGERENCIAS.limite;
  const herramienta = modo === 'limite' ? 'limite' : 'derivada';

  const query = new URLSearchParams({
    fn: sugerencia.fn,
    modo: herramienta,
    a: sugerencia.punto,
    tema: titulo,
    volver: `/calculo1/${unidadId}/${temaId}`
  });

  return (
    <div className="tema-lanzador" style={styles.lanzador}>
      <div style={styles.lanzadorTexto}>
        <span style={styles.lanzadorTag}>Laboratorio interactivo</span>

        <h2 style={styles.lanzadorTitulo}>
          Grafica y analiza este tema
        </h2>

        <p style={styles.lanzadorDesc}>
          Abre el plano cartesiano a pantalla completa: escribe funciones
          con el teclado matemático, grafícalas juntas y calcula{' '}
          {herramienta === 'limite'
            ? 'límites'
            : 'derivadas y rectas tangentes'}{' '}
          sobre la curva.
        </p>

        <Link
          to={`/laboratorio?${query.toString()}`}
          style={styles.lanzadorBtn}
        >
          Abrir laboratorio
          <FiArrowRight />
        </Link>

        <p style={styles.lanzadorPista}>
          Se abrirá con{' '}
          <code style={styles.lanzadorCode}>
            f(x) = {sugerencia.fn}
          </code>
        </p>
      </div>

      <svg
        viewBox="0 0 200 130"
        style={styles.lanzadorPreview}
        aria-hidden="true"
      >
        <rect x="0" y="0" width="200" height="130" rx="12" fill="#0F172A" />

        <g stroke="rgba(255,255,255,0.08)" strokeWidth="1">
          {[20, 50, 80, 110, 140, 170].map(x => (
            <line key={x} x1={x} y1="10" x2={x} y2="120" />
          ))}

          {[25, 50, 75, 100].map(y => (
            <line key={y} x1="10" y1={y} x2="190" y2={y} />
          ))}
        </g>

        <line
          x1="10"
          y1="75"
          x2="190"
          y2="75"
          stroke="#475569"
          strokeWidth="1.5"
        />

        <line
          x1="80"
          y1="10"
          x2="80"
          y2="120"
          stroke="#475569"
          strokeWidth="1.5"
        />

        <path
          d="M 15 110 Q 60 15 105 70 T 190 25"
          fill="none"
          stroke="#F4B400"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <path
          d="M 15 95 Q 70 95 190 45"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="2"
          strokeDasharray="6 4"
        />

        <circle
          cx="105"
          cy="70"
          r="5"
          fill="#EF4444"
          stroke="#fff"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

/**
 * Enlaces de lectura del tema. Salen del glosario segun los conceptos que
 * aparecen en el propio tema, asi que ningun tema se queda sin referencias.
 */
function Referencias({ tema }) {
  const enlaces = referenciasPara(tema);
  if (!enlaces.length) return null;

  return (
    <div style={styles.referencias}>
      <h3 style={styles.referenciasTitulo}>Para profundizar</h3>
      <ul style={styles.referenciasLista}>
        {enlaces.map(({ clave, url }) => (
          <li key={url}>
            <a
              className="tema-enlace"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.referenciaEnlace}
            >
              {clave}
              <span style={styles.referenciaExterna} aria-hidden="true"> ↗</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NavLink({ href, icon, label }) {
  const handleClick = e => {
    e.preventDefault();
    const el = document.querySelector(href);

    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <a href={href} onClick={handleClick} style={styles.navLink}>
      <span style={styles.navIcon}>{icon}</span>
      <span style={styles.navLabel}>{label}</span>
    </a>
  );
}

const styles = {
  page: {
    padding: '32px 0 80px'
  },

  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '24px',
    fontSize: '14px'
  },

  breadcrumbLink: {
    color: '#F4B400',
    textDecoration: 'none',
    fontWeight: 600
  },

  breadcrumbSep: {
    color: '#94A3B8'
  },

  breadcrumbCurrent: {
    color: '#fff',
    fontWeight: 700
  },

  layout: {
    display: 'grid',
    // minmax(0, 1fr) en vez de 1fr: con `1fr` el minimo automatico de la pista es
    // su contenido, asi que cualquier hijo ancho (una grafica, una tabla) ensancha
    // la rejilla en lugar de recortarse, y la pagina se desborda sin freno.
    gridTemplateColumns: 'minmax(0, 1fr) 320px',
    gap: '32px',
    alignItems: 'start'
  },

  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    minWidth: 0,
  },

  card: {
    background: 'linear-gradient(145deg, rgba(15,26,53,0.85) 0%, rgba(11,16,32,0.95) 100%)',
    borderRadius: '20px',
    border: '1px solid rgba(244,180,0,0.08)',
    boxShadow: '0 10px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(244,180,0,0.05)',
    overflow: 'hidden'
  },

  cardHeader: {
    padding: '28px 32px',
    borderBottom: '1px solid rgba(244,180,0,0.1)',
    background: 'linear-gradient(180deg, rgba(244,180,0,0.03) 0%, transparent 100%)'
  },

  cardHeaderTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '10px'
  },

  cardTag: {
    display: 'inline-flex',
    padding: '4px 10px',
    background: 'rgba(244,180,0,0.15)',
    color: '#F4B400',
    fontSize: '11px',
    fontWeight: 700,
    borderRadius: '999px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '10px'
  },

  cardTitle: {
    fontSize: '24px',
    fontWeight: 800,
    color: '#fff',
    margin: '0 0 8px',
    fontFamily: "'Poppins', sans-serif"
  },

  cardDesc: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
    lineHeight: 1.5
  },

  cardBody: {
    padding: '28px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },

  h2: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#fff',
    margin: '16px 0 6px',
    fontFamily: "'Poppins', sans-serif"
  },

  h3: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#fff',
    margin: '12px 0 4px',
    fontFamily: "'Poppins', sans-serif"
  },

  paragraph: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.7,
    margin: 0
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
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.6
  },

  equation: {
    background: 'linear-gradient(135deg, rgba(244,180,0,0.06) 0%, rgba(15,26,53,0.8) 100%)',
    borderRadius: '12px',
    padding: '16px 20px',
    margin: '8px 0',
    textAlign: 'center',
    border: '1px solid rgba(244,180,0,0.1)'
  },

  equationCode: {
    color: '#F4B400',
    fontFamily: "'Courier New', monospace",
    fontSize: '16px',
    letterSpacing: '0.5px'
  },

  columnsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    margin: '10px 0'
  },

  rowContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
    alignItems: 'start'
  },

  columnBox: {
    background: 'rgba(15,26,53,0.4)',
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid rgba(244,180,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: 0
  },

  conclusionBox: {
    background: 'linear-gradient(135deg, rgba(244,180,0,0.08) 0%, rgba(15,26,53,0.6) 100%)',
    padding: '16px 20px',
    borderRadius: '12px',
    border: '1px solid rgba(244,180,0,0.15)',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
  },

  graphWrap: {
    marginTop: '8px'
  },

  lanzador: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 220px',
    gap: '24px',
    alignItems: 'center',
    padding: '28px 32px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, rgba(244,180,0,0.08) 0%, rgba(15,26,53,0.9) 50%, rgba(11,16,32,0.95) 100%)',
    border: '1px solid rgba(244,180,0,0.12)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(244,180,0,0.08)'
  },

  lanzadorTexto: {
    minWidth: 0
  },

  lanzadorTag: {
    display: 'inline-flex',
    padding: '4px 10px',
    borderRadius: '999px',
    background: 'rgba(244,180,0,0.15)',
    color: '#F4B400',
    fontSize: '11px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  lanzadorTitulo: {
    margin: '10px 0 8px',
    fontSize: '22px',
    fontWeight: 800,
    color: '#fff',
    fontFamily: "'Poppins', sans-serif"
  },

  lanzadorDesc: {
    margin: '0 0 18px',
    fontSize: '14.5px',
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.72)'
  },

  lanzadorBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '13px 24px',
    borderRadius: '12px',
    background: '#F4B400',
    color: '#0b1020',
    fontSize: '15px',
    fontWeight: 800,
    textDecoration: 'none',
    boxShadow: '0 8px 20px rgba(244,180,0,0.25)'
  },

  lanzadorPista: {
    margin: '14px 0 0',
    fontSize: '12.5px',
    color: 'rgba(255,255,255,0.5)'
  },

  lanzadorCode: {
    fontFamily: "'Courier New', monospace",
    color: '#7DD3FC'
  },

  lanzadorPreview: {
    width: '100%',
    height: 'auto',
    borderRadius: '12px'
  },

  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'sticky',
    top: '90px'
  },

  sidebarCard: {
    background: 'linear-gradient(145deg, rgba(15,26,53,0.8) 0%, rgba(11,16,32,0.9) 100%)',
    borderRadius: '16px',
    border: '1px solid rgba(244,180,0,0.08)',
    padding: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
  },

  sidebarTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontFamily: "'Poppins', sans-serif"
  },

  navList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '10px',
    textDecoration: 'none',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    fontWeight: 600,
    background: 'rgba(244,180,0,0.04)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: '1px solid rgba(244,180,0,0.06)'
  },

  navIcon: {
    fontSize: '16px',
    lineHeight: 1,
    color: '#F4B400'
  },

  navLabel: {
    fontSize: '14px',
    fontWeight: 600
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    margin: '8px 0',
    fontSize: '14px',
    background: 'rgba(15,26,53,0.5)',
    borderRadius: '12px',
    overflow: 'hidden'
  },

  th: {
    padding: '10px 12px',
    textAlign: 'left',
    borderBottom: '2px solid rgba(244,180,0,0.2)',
    color: '#F4B400',
    fontWeight: 700,
    fontFamily: "'Poppins', sans-serif",
    background: 'rgba(244,180,0,0.06)'
  },

  td: {
    padding: '10px 12px',
    borderBottom: '1px solid rgba(244,180,0,0.08)',
    color: 'rgba(255,255,255,0.85)'
  }
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');

  style.textContent = `
    @keyframes fillRow {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .tema11-row {
      opacity: 0;
      animation: fillRow 0.6s ease forwards;
    }

    .tema11-table {
      margin: 4px 0;
    }

    .tema11-table th,
    .tema11-table td {
      padding: 9px 10px;
    }

    @media (max-width: 1024px) {
      .tema-layout { grid-template-columns: minmax(0, 1fr) !important; }
      .tema-sidebar { position: static !important; }
    }

    @media (max-width: 768px) {
      div[style*="grid-template-columns: 1fr 1fr"] {
        grid-template-columns: 1fr !important;
      }
    }

    @media (max-width: 640px) {
      .tema-lanzador {
        grid-template-columns: minmax(0, 1fr) !important;
        padding: 22px 18px !important;
      }

      .tema-lanzador svg {
        max-width: 260px;
        margin: 0 auto;
      }
    }
    .tema-enlace {
      color: #F4B400;
      text-decoration: underline;
      text-underline-offset: 3px;
      text-decoration-color: rgba(244,180,0,0.4);
      transition: text-decoration-color 0.2s ease;
    }
    .tema-enlace:hover {
      text-decoration-color: #F4B400;
    }
    .tema-sidebar a:hover {
      background: rgba(244,180,0,0.1) !important;
      border-color: rgba(244,180,0,0.25) !important;
      color: #F4B400 !important;
      box-shadow: 0 2px 12px rgba(244,180,0,0.1);
    }

    #seccion-contenido,
    #seccion-videos,
    #seccion-laboratorio,
    #seccion-saberes {
      scroll-margin-top: 96px;
    }
  `;

  document.head.appendChild(style);
}