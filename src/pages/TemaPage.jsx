import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AnimacionLimite from '../components/tema/AnimacionLimite';
import ContenidoTema from '../components/tema/ContenidoTema';
import PracticaLaboratorio from '../components/tema/PracticaLaboratorio';
import { useTema } from '../hooks/useCurso';
import { useSesion } from '../context/sesion';
import { registrarVisita } from '../services/temasService';
import { registrarTemaAbierto } from '../services/progresoService';
import TemaVideo from '../components/TemaVideo';
import SaberesRelacionados from '../components/SaberesRelacionados';
import { ChatEstudiante } from '../components/ChatSection';
import AnimatedIcon from '../components/AnimatedIcon';
import { FiBookOpen, FiVideo, FiBarChart2, FiMessageCircle } from 'react-icons/fi';
import { HiOutlineLightBulb } from 'react-icons/hi';
import EstadoServicio from '../components/EstadoServicio';
import NoEncontrado from './NoEncontrado';

const TEMAS_CON_ANIMACION = ['limites/1.1', 'limites/1.2'];

export default function TemaPage() {
  const { unidadId, temaId } = useParams();
  const { tema, estado, reintentar } = useTema(unidadId, temaId);
  const { usuario } = useSesion();
  const navigate = useNavigate();

  useEffect(() => {
    if (!tema) return;
    registrarVisita(unidadId, temaId);
    if (usuario?.rol === 'estudiante') {
      registrarTemaAbierto({ modulo: unidadId, tema: temaId, titulo: tema.titulo });
    }
  }, [tema, unidadId, temaId, usuario]);

  // El contenido llega como HTML, así que sus enlaces internos no son <Link>:
  // se atrapan aquí para cambiar de tema sin recargar la página.
  const abrirEnlaceInterno = (evento) => {
    const enlace = evento.target.closest('a[data-interno]');
    if (!enlace) return;
    evento.preventDefault();
    navigate(enlace.getAttribute('href'));
    window.scrollTo(0, 0);
  };

  if (estado === 'cargando') {
    return <div className="sesion-espera" role="status">Cargando el tema…</div>;
  }

  if (estado === 'error') {
    return (
      <EstadoServicio
        titulo="No pudimos abrir este tema"
        mensaje="El servidor no respondió. Revisa tu conexión e inténtalo de nuevo."
        onReintentar={reintentar}
      />
    );
  }

  if (!tema) {
    return <NoEncontrado titulo="Tema no encontrado" mensaje="Ese tema no existe en Cálculo I." destino="/calculo1" textoDestino="Volver a Cálculo I" />;
  }

  const claveTema = `${unidadId}/${temaId}`;
  const conAnimacion = TEMAS_CON_ANIMACION.includes(claveTema);

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
              <div className={`tema-lectura ${conAnimacion ? 'tema-apertura' : ''}`} style={styles.cardHeader}>
                <div>
                  <div style={styles.cardHeaderTop}>
                    <AnimatedIcon type={unidadId} size={72} />
                    <span style={styles.cardTag}>Leccion {tema.id}</span>
                  </div>

                  <h1 style={styles.cardTitle}>{tema.titulo}</h1>
                  <p style={styles.cardDesc}>{tema.descripcion}</p>
                </div>

                {conAnimacion && <AnimacionLimite key={claveTema} clave={claveTema} />}
              </div>

              <div className="tema-lectura" style={styles.cardBody} onClick={abrirEnlaceInterno}>
                <ContenidoTema bloques={tema.bloques} />
              </div>
            </div>

            <div id="seccion-videos">
              <TemaVideo key={temaId} videos={tema.videos} unidad={unidadId} sinAviso={tema.bloques.some((b) => b.tipo === 'video')} />
            </div>

            <div id="seccion-laboratorio" style={styles.graphWrap}>
              <PracticaLaboratorio
                titulo={tema.titulo}
                modo={modo}
                unidadId={unidadId}
                temaId={temaId}
                practicas={tema.practicas}
              />
            </div>

            <div id="seccion-chat" style={styles.chatSection}>
              <div style={styles.chatSectionHeader}>
                <span style={styles.chatSectionTag}>Ayuda en vivo</span>
                <h2 style={styles.chatSectionTitle}>¿Se te atoró algo? Pregúntale al asistente</h2>
                <p style={styles.chatSectionDesc}>
                  Resuelve dudas de este tema al instante, paso a paso y con la notación matemática bien escrita.
                </p>
              </div>
              <ChatEstudiante tema={unidadId} unidadTitulo={tema.titulo} />
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
                  label="Ejercicios de práctica"
                />
                <NavLink
                  href="#seccion-chat"
                  icon={<FiMessageCircle />}
                  label="Asistente IA"
                />
                <NavLink
                  href="#seccion-saberes"
                  icon={<HiOutlineLightBulb />}
                  label="Conceptos previos"
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
    color: '#B45309',
    textDecoration: 'none',
    fontWeight: 600
  },

  breadcrumbSep: {
    color: '#64628A'
  },

  breadcrumbCurrent: {
    color: '#252350',
    fontWeight: 700
  },

  layout: {
    display: 'grid',
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
    background: 'linear-gradient(145deg, #FFFFFF 0%, #FFFFFF 100%)',
    borderRadius: '20px',
    border: '1px solid #E6E5F5',
    boxShadow: '0 10px 40px rgba(37,35,80,0.12), inset 0 1px 0 rgba(245,158,11,0.05)',
    overflow: 'hidden'
  },

  cardHeader: {
    padding: '28px 32px',
    borderBottom: '1px solid #E6E5F5',
    background: 'linear-gradient(180deg, #FFFBEB 0%, transparent 100%)'
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
    background: '#FFFBEB',
    color: '#B45309',
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
    color: '#252350',
    margin: '0 0 8px',
    fontFamily: "'Poppins', sans-serif"
  },

  cardDesc: {
    fontSize: '15px',
    color: '#64628A',
    margin: 0,
    lineHeight: 1.5
  },

  cardBody: {
    padding: '28px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },

  graphWrap: {
    marginTop: '8px'
  },

  chatSection: {
    borderRadius: '22px',
  },

  chatSectionHeader: {
    padding: '4px 8px 14px',
  },

  chatSectionTag: {
    display: 'inline-flex',
    padding: '4px 10px',
    borderRadius: '999px',
    background: 'rgba(5,150,105,0.12)',
    color: '#047857',
    fontSize: '11px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  chatSectionTitle: {
    margin: '10px 0 6px',
    fontSize: '22px',
    fontWeight: 800,
    color: '#3730A3',
    fontFamily: "'Poppins', sans-serif"
  },

  chatSectionDesc: {
    margin: 0,
    fontSize: '14.5px',
    lineHeight: 1.6,
    color: '#64628A'
  },

  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'sticky',
    top: '90px'
  },

  sidebarCard: {
    background: 'linear-gradient(145deg, #FFFFFF 0%, #FFFFFF 100%)',
    borderRadius: '16px',
    border: '1px solid #E6E5F5',
    padding: '20px',
    boxShadow: '0 8px 32px rgba(37,35,80,0.1)'
  },

  sidebarTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#252350',
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
    color: '#64628A',
    fontSize: '14px',
    fontWeight: 600,
    background: '#FFFBEB',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: '1px solid #E6E5F5'
  },

  navIcon: {
    fontSize: '16px',
    lineHeight: 1,
    color: '#B45309'
  },

  navLabel: {
    fontSize: '14px',
    fontWeight: 600
  },

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

    /* La tarjeta crece con la pantalla; el texto conserva un ancho de lectura comodo. */
    @media (min-width: 1280px) {
      .tema-lectura { padding-inline: max(32px, calc((100% - 856px) / 2)) !important; }
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
      color: #B45309;
      text-decoration: underline;
      text-underline-offset: 3px;
      text-decoration-color: #B45309;
      transition: all 0.2s ease;
    }
    .tema-enlace:hover {
      text-decoration-color: #B45309;
    }
    .glosario-enlace {
      position: relative;
      display: inline-block;
      background: #FFFBEB;
      padding: 1px 6px;
      border-radius: 6px;
      border: 1px solid rgba(245,158,11,0.35);
      font-weight: 600;
      text-decoration: none !important;
    }
    .glosario-enlace:hover {
      background: #FFFBEB;
      border-color: rgba(245,158,11,0.35);
      box-shadow: 0 2px 8px rgba(245,158,11,0.15);
    }
    .glosario-enlace::after {
      content: attr(data-definicion);
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%) scale(0.95);
      width: max-content;
      max-width: 280px;
      padding: 10px 14px;
      background: #FFFFFF;
      color: #64628A;
      font-size: 12.5px;
      font-weight: 500;
      line-height: 1.5;
      border-radius: 10px;
      border: 1px solid rgba(245,158,11,0.35);
      box-shadow: 0 8px 24px rgba(37,35,80,0.1);
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s ease;
      pointer-events: none;
      z-index: 100;
      text-align: center;
    }
    .glosario-enlace::before {
      content: '';
      position: absolute;
      bottom: calc(100% + 2px);
      left: 50%;
      transform: translateX(-50%);
      border-width: 6px;
      border-style: solid;
      border-color: rgba(245,158,11,0.35) transparent transparent transparent;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s ease;
      pointer-events: none;
      z-index: 100;
    }
    .glosario-enlace:hover::after,
    .glosario-enlace:hover::before {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) scale(1);
    }
    .tema-sidebar a:hover {
      background: #FFFBEB !important;
      border-color: rgba(245,158,11,0.35) !important;
      color: #B45309 !important;
      box-shadow: 0 2px 12px rgba(245,158,11,0.1);
    }

    #seccion-contenido,
    #seccion-videos,
    #seccion-laboratorio,
    #seccion-chat,
    #seccion-saberes {
      scroll-margin-top: 96px;
    }
  `;

  document.head.appendChild(style);
}