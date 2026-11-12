import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiRefreshCw, FiSearch } from 'react-icons/fi';
import { FaPlay, FaCheck, FaYoutube } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { extraerYoutubeId, youtubeThumb, youtubeEmbed, leerVideosLocales } from '../data/videos';
import { useSesion } from '../context/sesion';
import { listarVideosVistos, registrarVideoVisto } from '../services/progresoService';
import { api } from '../services/api';

export default function BibliotecaMultimedia() {
  const { usuario } = useSesion();
  const [estado, setEstado] = useState('cargando');
  const [datos, setDatos] = useState({ modulos: [], videos: [] });
  const [error, setError] = useState('');
  const [recarga, setRecarga] = useState(0);
  const [search, setSearch] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [vistos, setVistos] = useState({});
  const [reproduciendo, setReproduciendo] = useState(null);
  const [locales] = useState(() => leerVideosLocales().length);

  useEffect(() => {
    let vigente = true;

    api('/videos')
      .then((respuesta) => {
        if (!vigente) return;
        setDatos({ modulos: respuesta.modulos ?? [], videos: respuesta.videos ?? [] });
        setEstado('listo');
      })
      .catch((e) => {
        if (!vigente) return;
        setError(e.message);
        setEstado('error');
      });

    return () => {
      vigente = false;
    };
  }, [recarga]);

  useEffect(() => {
    if (usuario?.rol !== 'estudiante') return undefined;

    let vigente = true;

    listarVideosVistos().then((lista) => {
      if (!vigente) return;
      setVistos(Object.fromEntries(lista.map((video) => [video.youtubeId, true])));
    });

    return () => {
      vigente = false;
    };
  }, [usuario]);

  const videoActual = datos.videos.find((video) => video.id === reproduciendo) ?? null;

  useEffect(() => {
    if (usuario?.rol !== 'estudiante' || !videoActual) return;

    registrarVideoVisto({
      videoId: videoActual.videoId || videoActual.id,
      youtubeId: videoActual.youtubeId,
      titulo: videoActual.titulo,
      unidad: videoActual.modulo,
    });
  }, [usuario, videoActual]);

  const filtrados = useMemo(() => {
    const texto = search.trim().toLowerCase();

    return datos.videos.filter((video) => {
      const coincide = !texto
        || `${video.titulo} ${video.descripcion}`.toLowerCase().includes(texto);
      const delModulo = categoriaActiva === 'todos' || video.modulo === categoriaActiva;

      return coincide && delModulo;
    });
  }, [search, categoriaActiva, datos.videos]);

  const nombreModulo = (id) => datos.modulos.find((modulo) => modulo.id === id)?.titulo ?? id;
  const estaVisto = (video) => usuario?.rol === 'estudiante' && Boolean(vistos[video.youtubeId]);

  const toggleVisto = (video) => {
    const nuevo = !estaVisto(video);
    setVistos((previos) => ({ ...previos, [video.youtubeId]: nuevo }));

    if (nuevo && usuario?.rol === 'estudiante') {
      registrarVideoVisto({
        videoId: video.videoId || video.id,
        youtubeId: video.youtubeId,
        titulo: video.titulo,
        unidad: video.modulo,
      });
    }
  };

  return (
    <div style={styles.page}>
      <div className="container">
        <div style={styles.header}>
          <span style={styles.tag}>Recursos</span>
          <h1 style={styles.title}>Videoteca</h1>
          <p style={styles.desc}>
            Refuerza tu comprensión con explicaciones audiovisuales organizadas por módulo y tema.
          </p>
        </div>

        {locales > 0 && (
          <div style={styles.aviso}>
            <FaYoutube style={styles.avisoIcono} />
            <div style={styles.avisoTexto}>
              <b>{locales} video{locales !== 1 ? 's' : ''} guardado{locales !== 1 ? 's' : ''} en este navegador</b>
              <p>
                Son de la versión anterior de la videoteca. Un administrador puede importarlos
                desde Recursos y asignarles un tema.
              </p>
            </div>
            {usuario?.rol === 'administrador' && (
              <Link style={styles.avisoBoton} to="/admin/recursos">Importar en Recursos</Link>
            )}
          </div>
        )}

        {estado === 'cargando' && (
          <div className="sesion-espera" role="status">Cargando la videoteca…</div>
        )}

        {estado === 'error' && (
          <div style={styles.estadoCaja}>
            <b>No se pudo cargar la videoteca</b>
            <p style={styles.estadoTexto}>{error}</p>
            <button
              type="button"
              style={styles.reintentar}
              onClick={() => {
                setEstado('cargando');
                setError('');
                setRecarga((n) => n + 1);
              }}
            >
              <FiRefreshCw /> Reintentar
            </button>
          </div>
        )}

        {estado === 'listo' && videoActual && (
          <div style={styles.playerWrap}>
            <div style={styles.playerHeader}>
              <div>
                <h3 style={styles.playerTitle}>{videoActual.titulo || 'Video de YouTube'}</h3>
                <p style={styles.playerMeta}>
                  {videoActual.descripcion || `${nombreModulo(videoActual.modulo)} · Tema ${videoActual.numero}`}
                </p>
              </div>
              <button style={styles.playerClose} onClick={() => setReproduciendo(null)} title="Cerrar reproductor">
                <IoClose />
              </button>
            </div>
            <div style={styles.videoBox}>
              <iframe
                style={styles.iframe}
                src={youtubeEmbed(extraerYoutubeId(videoActual.youtubeId))}
                title={videoActual.titulo || 'Video de YouTube'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div style={styles.playerControls}>
              <span style={styles.playerBadge}>{nombreModulo(videoActual.modulo)}</span>
              <span style={styles.playerBadge}>Tema {videoActual.numero}</span>
              {estaVisto(videoActual) && (
                <span style={styles.playerBadgeVisto}><FaCheck style={{ marginRight: 4 }} /> Visto</span>
              )}
            </div>
          </div>
        )}

        {estado === 'listo' && datos.videos.length > 0 && (
          <>
            <div style={styles.filters}>
              <div style={styles.searchWrap}>
                <FiSearch style={{ color: '#8B89AE', flexShrink: 0 }} />
                <input
                  style={styles.searchInput}
                  placeholder="Buscar videos por título o tema..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {datos.modulos.length > 0 && (
                <div style={styles.filterGroup}>
                  <span style={styles.filterLabel}>Módulo:</span>
                  <div style={styles.filterButtons}>
                    <button
                      style={{ ...styles.filterBtn, ...(categoriaActiva === 'todos' ? styles.filterBtnActive : {}) }}
                      onClick={() => setCategoriaActiva('todos')}
                    >
                      Todos
                    </button>
                    {datos.modulos.map((modulo) => (
                      <button
                        key={modulo.id}
                        style={{ ...styles.filterBtn, ...(categoriaActiva === modulo.id ? styles.filterBtnActive : {}) }}
                        onClick={() => setCategoriaActiva(modulo.id)}
                      >
                        {modulo.titulo}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={styles.addBar}>
              <div style={styles.resultsCount}>
                {filtrados.length} video{filtrados.length !== 1 ? 's' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}
                {' · '}
                {datos.videos.filter(estaVisto).length}/{datos.videos.length} vistos
              </div>
            </div>

            <div style={styles.grid}>
              {filtrados.map((video) => (
                <div key={video.id} style={styles.card}>
                  <div style={styles.thumbWrap} onClick={() => setReproduciendo(video.id)}>
                    <img
                      src={youtubeThumb(extraerYoutubeId(video.youtubeId))}
                      alt={video.titulo || 'Video'}
                      style={styles.thumb}
                      onError={(e) => { e.target.src = '/Estudiantes(1).jpeg'; }}
                    />
                    <div style={styles.thumbOverlay}>
                      <div style={styles.playBtn}><FaPlay /></div>
                    </div>
                    {estaVisto(video) && (
                      <span style={styles.vistoBadge}><FaCheck style={{ marginRight: 4 }} /> Visto</span>
                    )}
                  </div>
                  <div style={styles.cardBody}>
                    <h3 style={styles.cardTitle}>{video.titulo || 'Video de YouTube'}</h3>
                    <p style={styles.cardDesc}>{video.descripcion || 'Video de apoyo del tema.'}</p>
                    <div style={styles.cardMeta}>
                      <span style={styles.unidadBadge}>{nombreModulo(video.modulo)}</span>
                      <span style={styles.temaBadge}>Tema {video.numero}</span>
                    </div>
                    <div style={styles.cardActions}>
                      <button style={styles.actionBtnPlay} onClick={() => setReproduciendo(video.id)}>
                        <FaPlay style={{ marginRight: 4 }} /> Reproducir
                      </button>
                      <button
                        style={{
                          ...styles.actionBtnCheck,
                          ...(estaVisto(video) ? styles.actionBtnCheckActive : {}),
                        }}
                        onClick={() => toggleVisto(video)}
                      >
                        {estaVisto(video) ? <><FaCheck style={{ marginRight: 4 }} /> Visto</> : 'Marcar visto'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filtrados.length === 0 && (
              <div style={styles.empty}>
                <div style={styles.emptyIcon}><FiSearch /></div>
                <h3 style={styles.emptyTitle}>No se encontraron videos</h3>
                <p style={styles.emptyText}>Intenta con otro término de búsqueda o cambia el módulo.</p>
              </div>
            )}
          </>
        )}

        {estado === 'listo' && datos.videos.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}><FaYoutube /></div>
            <h3 style={styles.emptyTitle}>La videoteca está vacía</h3>
            <p style={styles.emptyText}>
              Los videos se agregan desde el editor de cada tema y aparecen aquí al publicarlo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '32px 0 80px' },
  header: {
    textAlign: 'center', maxWidth: '720px', margin: '0 auto 32px',
  },
  tag: {
    display: 'inline-block', padding: '6px 14px', background: '#FFFBEB',
    color: '#B45309', fontSize: '13px', fontWeight: 700, borderRadius: '999px',
    marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  title: {
    fontSize: '32px', fontWeight: 800, color: '#252350', margin: '0 0 10px',
    fontFamily: "'Poppins', sans-serif",
  },
  desc: {
    fontSize: '16px', color: '#64628A', margin: 0, lineHeight: 1.55,
  },

  aviso: {
    display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap',
    padding: '16px 20px', marginBottom: '24px', borderRadius: '14px',
    background: '#FFFBEB', border: '1px solid rgba(245,158,11,0.35)',
  },
  avisoIcono: { fontSize: '24px', color: '#DC2626', flexShrink: 0 },
  avisoTexto: { flex: 1, minWidth: '220px' },
  avisoBoton: {
    padding: '9px 16px', borderRadius: '10px', background: '#F59E0B',
    color: '#252350', fontSize: '13px', fontWeight: 700, textDecoration: 'none',
  },

  estadoCaja: {
    padding: '40px 24px', textAlign: 'center', color: '#252350',
    background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E6E5F5',
  },
  estadoTexto: { color: '#64628A', fontSize: '14px', margin: '8px 0 18px' },
  reintentar: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '10px 18px', borderRadius: '10px', border: '1px solid #E6E5F5',
    background: '#FFFBEB', color: '#B45309', fontSize: '14px',
    fontWeight: 700, cursor: 'pointer',
  },

  playerWrap: {
    background: '#FFFFFF', borderRadius: '20px', overflow: 'hidden',
    marginBottom: '32px', boxShadow: '0 20px 40px rgba(37,35,80,0.05)',
  },
  playerHeader: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    padding: '20px 24px 12px', gap: '16px',
  },
  playerTitle: {
    color: '#252350', fontSize: '18px', fontWeight: 700, margin: '0 0 4px',
    fontFamily: "'Poppins', sans-serif",
  },
  playerMeta: {
    color: '#64628A', fontSize: '13px', margin: 0,
  },
  playerClose: {
    background: '#F3F2FC', border: 'none', color: '#252350',
    width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer',
    fontSize: '16px', lineHeight: 1, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  videoBox: {
    background: '#000000', aspectRatio: '16/9',
    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  iframe: {
    width: '100%', height: '100%', border: 'none', display: 'block',
  },
  playerControls: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '14px 24px', background: '#F3F2FC',
    borderTop: '1px solid #E6E5F5', flexWrap: 'wrap',
  },
  playerBadge: {
    fontSize: '12px', color: '#64628A',
    padding: '6px 12px', background: '#FFFFFF', borderRadius: '8px',
    display: 'inline-flex', alignItems: 'center',
  },
  playerBadgeVisto: {
    fontSize: '12px', color: '#FFFFFF',
    padding: '6px 12px', background: '#10B981', borderRadius: '8px', fontWeight: 700,
    display: 'inline-flex', alignItems: 'center',
  },

  filters: {
    display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px',
  },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: '12px',
    background: '#FFFFFF', border: '1px solid #E6E5F5',
    borderRadius: '12px', padding: '0 16px',
  },
  searchInput: {
    flex: 1, padding: '14px 0', border: 'none', outline: 'none',
    fontSize: '15px', fontFamily: "'Inter', sans-serif", color: '#252350',
  },
  filterGroup: {
    display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: '13px', fontWeight: 600, color: '#64628A',
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  filterButtons: {
    display: 'flex', gap: '8px', flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '8px 14px', borderRadius: '10px', border: '1px solid #E6E5F5',
    background: '#FFFBEB', color: '#64628A', fontSize: '13px', fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s ease',
  },
  filterBtnActive: {
    background: '#F59E0B', color: '#252350', borderColor: '#F59E0B',
  },

  addBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '20px', flexWrap: 'wrap', gap: '10px',
  },
  resultsCount: {
    fontSize: '13px', color: '#64628A', fontWeight: 600,
  },

  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(360px, 100%), 1fr))', gap: '24px',
  },
  card: {
    background: 'linear-gradient(145deg, #FFFFFF, #FFFFFF)',
    borderRadius: '16px', border: '1px solid #E6E5F5',
    overflow: 'hidden', boxShadow: '0 1px 3px rgba(37,35,80,0.04)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    display: 'flex', flexDirection: 'column',
  },
  thumbWrap: {
    position: 'relative', cursor: 'pointer', overflow: 'hidden',
  },
  thumb: {
    width: '100%', height: '180px', objectFit: 'cover', display: 'block',
    transition: 'transform 0.3s ease',
  },
  thumbOverlay: {
    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: 0, transition: 'opacity 0.2s ease',
  },
  playBtn: {
    width: '56px', height: '56px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.95)', color: '#252350',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px', paddingLeft: '4px',
    boxShadow: '0 4px 12px rgba(37,35,80,0.07)',
  },
  vistoBadge: {
    position: 'absolute', top: '10px', left: '10px',
    background: '#047857', color: '#FFFFFF', fontSize: '11px',
    fontWeight: 700, padding: '4px 10px', borderRadius: '6px',
    display: 'inline-flex', alignItems: 'center',
  },
  cardBody: {
    padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1,
  },
  cardTitle: {
    fontSize: '15px', fontWeight: 700, color: '#252350', margin: 0,
    fontFamily: "'Poppins', sans-serif", lineHeight: 1.3,
  },
  cardDesc: {
    fontSize: '13px', color: '#64628A', lineHeight: 1.5, margin: 0, flex: 1,
  },
  cardMeta: {
    display: 'flex', gap: '8px', flexWrap: 'wrap',
  },
  unidadBadge: {
    fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px',
    textTransform: 'uppercase', letterSpacing: '0.5px',
    background: '#FFFBEB', color: '#B45309',
  },
  temaBadge: {
    fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px',
    textTransform: 'uppercase', letterSpacing: '0.5px',
    background: '#F3F2FC', color: '#4F46E5',
  },
  cardActions: {
    display: 'flex', gap: '8px', marginTop: '4px',
  },
  actionBtnPlay: {
    flex: 1, padding: '10px 0', borderRadius: '10px', border: 'none',
    background: '#F59E0B', color: '#252350', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  },
  actionBtnCheck: {
    padding: '10px 14px', borderRadius: '10px', border: '1px solid #E6E5F5',
    background: '#FFFBEB', color: '#64628A', fontSize: '12px', fontWeight: 700,
    cursor: 'pointer', whiteSpace: 'nowrap',
    display: 'inline-flex', alignItems: 'center',
  },
  actionBtnCheckActive: {
    background: '#047857', color: '#FFFFFF', borderColor: '#047857',
  },

  empty: {
    textAlign: 'center', padding: '64px 24px',
  },
  emptyIcon: { fontSize: '48px', marginBottom: '16px', color: '#8B89AE' },
  emptyTitle: {
    fontSize: '20px', fontWeight: 700, color: '#252350', margin: '0 0 6px',
    fontFamily: "'Poppins', sans-serif",
  },
  emptyText: { fontSize: '15px', color: '#64628A', margin: 0 },
};
