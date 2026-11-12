import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiArrowRight,
  FiBarChart2,
  FiBookOpen,
  FiClipboard,
  FiFolder,
  FiGrid,
  FiLogOut,
  FiPlus,
  FiSearch,
  FiSettings,
  FiTrash2,
  FiUsers,
  FiVideo,
} from 'react-icons/fi';
import { alerta, alertaError } from '../services/alertas';
import EditorTema from '../components/admin/EditorTema';
import { decimal, entero } from '../components/admin/formato';
import { BarrasMagnitud, LineaSemanas } from '../components/admin/GraficasAdmin';
import {
  CREACIONES,
  DOCENTES,
  PASTILLA_ESTADO,
} from '../data/mockAdmin';
import { unidades } from '../data/temas';
import { extraerYoutubeId, youtubeThumb, leerVideosLocales, quitarVideoLocal } from '../data/videos';
import { useSesion } from '../context/sesion';
import { api } from '../services/api';
import NoEncontrado from './NoEncontrado';

/** Nombres de los módulos para Evalúate y Usuarios, que aún usan datos de ejemplo. */
const MODULOS = unidades.map(({ id, titulo, temas }) => ({ id, titulo, temas }));

const SECCIONES = [
  ['panel', 'Panel', FiGrid, null],
  ['modulos', 'Módulos', FiFolder, MODULOS.length],
  ['evaluate', 'Evalúate', FiClipboard, CREACIONES.length],
  ['recursos', 'Recursos', FiGrid, null],
  ['usuarios', 'Usuarios', FiUsers, DOCENTES.length],
  ['papelera', 'Papelera', FiTrash2, null],
  ['configuracion', 'Configuración', FiSettings, null],
];

/** Módulo especial del curso: no aparece en Cálculo I. */
const MODULO_CONCEPTOS_PREVIOS = 'conceptos-previos';

const moduloPorId = (id) => MODULOS.find((m) => m.id === id);
const docentePorId = (id) => DOCENTES.find((d) => d.id === id);
const creadoPor = (docente) => CREACIONES.filter((c) => c.docente === docente);
const cuantos = (lista, tipo) => lista.filter((c) => c.tipo === tipo).length;
const sinAcentos = (texto) => texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/** "3 lecciones · 2 quices · 1 examen", sin los tipos en cero. */
function desglose(lista) {
  const partes = [
    [cuantos(lista, 'Lección'), 'lección', 'lecciones'],
    [cuantos(lista, 'Quiz'), 'quiz', 'quices'],
    [cuantos(lista, 'Examen'), 'examen', 'exámenes'],
  ];
  return partes.filter(([n]) => n > 0).map(([n, uno, varios]) => `${n} ${n === 1 ? uno : varios}`).join(' · ');
}

/** Módulos, temas y visitas reales. El panel los necesita en varias vistas. */
function pedirDatos() {
  return Promise.all([api('/admin/temas'), api('/admin/visitas')])
    .then(([curso, visitas]) => ({ estado: 'listo', curso, visitas }))
    .catch((e) => ({ estado: 'error', mensaje: e.message }));
}

function useDatosAdmin() {
  const [datos, setDatos] = useState({ estado: 'cargando' });

  useEffect(() => {
    let vigente = true;
    pedirDatos().then((resultado) => {
      if (vigente) setDatos(resultado);
    });
    return () => {
      vigente = false;
    };
  }, []);

  const reintentar = () => {
    setDatos({ estado: 'cargando' });
    pedirDatos().then(setDatos);
  };

  return { datos, reintentar };
}

// conceptos-previos no tiene color de serie: se pinta con el ámbar del repaso.
const COLOR_MODULO = (id) => (id === MODULO_CONCEPTOS_PREVIOS ? '#B45309' : `var(--serie-${id})`);
const visitasDe = (modulo, porTema) => modulo.temas.reduce((suma, t) => suma + (porTema[t.id] ?? 0), 0);

function Carga({ datos, reintentar, children }) {
  if (datos.estado === 'cargando') return <div className="sesion-espera" role="status">Cargando…</div>;

  if (datos.estado === 'error') {
    return (
      <div className="admin-vacio">
        <b>No se pudieron cargar los datos</b>
        <p className="suave-txt">{datos.mensaje}</p>
        <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico" onClick={reintentar}>Reintentar</button>
      </div>
    );
  }

  return children(datos);
}

function Pastilla({ estado }) {
  const [clase, texto] = PASTILLA_ESTADO[estado] || PASTILLA_ESTADO.borrador;
  return <span className={`pastilla ${clase}`}>{texto}</span>;
}

/**
 * Panel de administrador: muestra el uso de la plataforma y lo que crean los docentes.
 * Maqueta estática, sin guardado; la navegación y los filtros sí funcionan.
 */
export default function Admin() {
  const { seccion, detalle, tema } = useParams();
  const { usuario, salir } = useSesion();
  const navigate = useNavigate();
  const { datos, reintentar } = useDatosAdmin();

  if (seccion === 'lecciones') return <Navigate to="/admin/evaluate" replace />;

  const activa = SECCIONES.some(([k]) => k === seccion) ? seccion : null;
  // Solo Módulos y Evalúate tienen subpáginas, y solo Módulos llega al tercer nivel.
  const rutaValida = activa
    && (!detalle || activa === 'modulos' || activa === 'evaluate')
    && (!tema || activa === 'modulos');

  const vistas = {
    panel: <Carga datos={datos} reintentar={reintentar}>{(d) => <VistaPanel {...d} />}</Carga>,
    modulos: tema
      ? <EditorTema key={`${detalle}/${tema}`} modulo={detalle} numero={tema} />
      : (
        <Carga datos={datos} reintentar={reintentar}>
          {(d) => (detalle
            ? <VistaModulo id={detalle} {...d} recargar={reintentar} />
            : <VistaModulos {...d} />)}
        </Carga>
      ),
    evaluate: detalle ? <VistaCreacion id={detalle} /> : <VistaEvaluate />,
    recursos: <VistaRecursos />,
    usuarios: <VistaUsuarios />,
    papelera: <VistaPapelera recargar={reintentar} />,
    configuracion: <VistaConfiguracion />,
  };

  return (
    <div className="admin">
      <aside className="admin-lateral">
        <Link className="admin-marca" to="/">
          <img className="admin-logo" src="/LogoUniversidad.png" alt="Logo de la Universidad Autónoma" />
          <div>
            <b>EDUCALC XE</b>
            <small>Panel de administrador</small>
          </div>
        </Link>

        <nav className="menu-lat">
          {SECCIONES.map(([clave, texto, Icono, cuenta]) => (
            <Link key={clave} to={`/admin/${clave}`} aria-current={clave === activa ? 'page' : undefined}>
              <Icono />
              {texto}
              {cuenta != null && <em>{cuenta}</em>}
            </Link>
          ))}
        </nav>

        <div className="admin-pie">
          <div className="lat-perfil" style={{ borderBottom: 0, paddingBottom: 0 }}>
            <span className="lat-avatar">AD</span>
            <div>
              <div className="lat-nombre">{usuario?.nombre ?? 'Administrador'}</div>
              <div className="lat-sub">{usuario?.correo}</div>
            </div>
          </div>
          <nav className="menu-lat">
            <button
              type="button"
              className="menu-lat-boton"
              onClick={async () => {
                await salir();
                navigate('/');
              }}
            >
              <FiLogOut />Cerrar sesión
            </button>
          </nav>
        </div>
      </aside>

      <main className="admin-cuerpo">
        {rutaValida ? vistas[activa] : <NoEncontrado destino="/admin/panel" textoDestino="Ir al panel" />}
      </main>
    </div>
  );
}

function VistaPanel({ curso, visitas }) {
  const { semanas, porModulo, porTema } = visitas;
  const modulos = curso.modulos.map((m) => ({ ...m, color: COLOR_MODULO(m.id), visitas: visitasDe(m, porTema) }));
  const ordenados = [...modulos].sort((a, b) => b.visitas - a.visitas);
  const masVisitado = ordenados[0];
  const totalVisitas = modulos.reduce((suma, m) => suma + m.visitas, 0);
  const hayVisitas = totalVisitas > 0;
  const porSemana = semanas.map((_, i) => modulos.reduce((suma, m) => suma + (porModulo[m.id]?.[i] ?? 0), 0));
  const [anterior, actual] = porSemana.slice(-2);
  const totalTemas = modulos.reduce((suma, m) => suma + m.temas.length, 0);
  const borradores = modulos.reduce((suma, m) => suma + m.temas.filter((t) => t.tieneBorrador).length, 0);
  const pendientes = DOCENTES.filter((d) => d.estado === 'pendiente').length;

  const docentes = DOCENTES
    .map((d) => ({ docente: d, creado: creadoPor(d.id) }))
    .sort((a, b) => b.creado.length - a.creado.length);

  return (
    <>
      <div className="admin-cabeza">
        <div>
          <h1>Panel</h1>
          <p>Cómo se usa la plataforma y qué están creando los docentes.</p>
        </div>
      </div>

      <section className="tira" aria-label="Resumen">
        <Link className="tira-dato" to="/admin/modulos">
          <span className="tira-tit"><FiGrid />Visitas, 8 semanas</span>
          <span className="tira-num">{entero(totalVisitas)}</span>
          <span className="tira-desc">
            {anterior > 0
              ? `${actual >= anterior ? '+' : ''}${decimal(((actual - anterior) / anterior) * 100)} % frente a la semana anterior`
              : 'Se cuentan desde que se activó el registro'}
          </span>
        </Link>
        <Link className="tira-dato" to={hayVisitas ? `/admin/modulos/${masVisitado.id}` : '/admin/modulos'}>
          <span className="tira-tit"><FiFolder />Módulo más visitado</span>
          <span className="tira-num-txt">{hayVisitas ? masVisitado.titulo : 'Sin visitas aún'}</span>
          <span className="tira-desc">
            {hayVisitas ? `${decimal((masVisitado.visitas / totalVisitas) * 100)} % de las visitas` : 'Aparece con la primera visita'}
          </span>
        </Link>
        <Link className="tira-dato" to="/admin/modulos">
          <span className="tira-tit"><FiFolder />Temas del curso</span>
          <span className="tira-num">{totalTemas}</span>
          <span className="tira-desc">{borradores ? `${borradores} con borrador sin publicar` : 'Todos publicados'}</span>
        </Link>
        <Link className="tira-dato" to="/admin/usuarios">
          <span className="tira-tit"><FiUsers />Docentes activos</span>
          <span className="tira-num">{DOCENTES.length - pendientes}</span>
          <span className="tira-desc">Datos de ejemplo</span>
        </Link>
      </section>

      <div className="panel-graficas">
        <section className="tarjeta">
          <div className="tarjeta-cabeza">
            <h2>Visitas por módulo</h2>
            <p className="suave-txt">Entra a un módulo para ver sus temas.</p>
          </div>
          <BarrasMagnitud
            columnaValor="Visitas"
            filas={ordenados.map((m) => ({
              clave: m.id,
              etiqueta: m.titulo,
              valor: m.visitas,
              color: m.color,
              a: `/admin/modulos/${m.id}`,
              insignia: hayVisitas && m.id === masVisitado.id ? 'Más visitado' : null,
            }))}
          />
        </section>

        <section className="tarjeta">
          <div className="tarjeta-cabeza">
            <h2>Visitas por semana</h2>
            <p className="suave-txt">
              {hayVisitas ? 'Pasa el cursor sobre la gráfica para ver cada semana.' : 'Las visitas aparecerán aquí a medida que los estudiantes abran los temas.'}
            </p>
          </div>
          <LineaSemanas
            semanas={semanas}
            series={modulos.map((m) => ({
              clave: m.id,
              etiqueta: m.titulo,
              color: m.color,
              valores: porModulo[m.id] ?? semanas.map(() => 0),
            }))}
          />
        </section>
      </div>

      <div className="fila-2">
        <section className="tarjeta">
          <div className="cabeza-fila">
            <div className="tarjeta-cabeza">
              <h2>Contenido por docente</h2>
              <p className="suave-txt">Lecciones, quices y exámenes que ha creado cada uno.</p>
            </div>
            <span className="pastilla pastilla-borrador">Datos de ejemplo</span>
          </div>
          <BarrasMagnitud
            columnaValor="Creado"
            filas={docentes.map(({ docente, creado }) => ({
              clave: docente.id,
              etiqueta: docente.nombre,
              valor: creado.length,
              color: 'var(--texto-2)',
              detalle: creado.length ? desglose(creado) : 'Sin contenido todavía',
              a: `/admin/evaluate?docente=${docente.id}`,
            }))}
          />
        </section>

        <section className="tarjeta">
          <div className="cabeza-fila">
            <h2>Creado recientemente</h2>
            <span className="pastilla pastilla-borrador">Datos de ejemplo</span>
          </div>
          <ul className="lista">
            {CREACIONES.slice(0, 5).map((c) => (
              <li key={c.id} className="item">
                <span className="item-icono">{c.tipo.slice(0, 1)}</span>
                <span className="item-txt">
                  <b>{c.titulo}</b>
                  <span>{c.tipo} · {docentePorId(c.docente).nombre} · {c.creado}</span>
                </span>
                <Link className="pnl-btn pnl-btn-secundario pnl-btn-chico" to={`/admin/evaluate/${c.id}`}>Ver</Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

function VistaModulos({ curso, visitas }) {
  return (
    <>
      <div className="admin-cabeza">
        <div>
          <h1>Módulos</h1>
          <p>Los tres módulos del curso. Entra a uno para ver y editar sus temas.</p>
        </div>
      </div>

      <div className="rejilla-modulos">
        {curso.modulos.map((m) => {
          const borradores = m.temas.filter((t) => t.tieneBorrador).length;

          return (
            <Link key={m.id} className="modulo-tarjeta" to={`/admin/modulos/${m.id}`}>
              <h2><span className="modulo-punto" style={{ background: COLOR_MODULO(m.id) }} />{m.titulo}</h2>
              <p className="suave-txt modulo-resumen">{m.descripcion}</p>
              <dl className="modulo-datos">
                <div><dt>Temas</dt><dd>{m.temas.length}</dd></div>
                <div><dt>Visitas</dt><dd>{entero(visitasDe(m, visitas.porTema))}</dd></div>
                <div><dt>Borradores</dt><dd>{borradores}</dd></div>
              </dl>
              <span className="modulo-ir">Ver temas<FiArrowRight /></span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

const PREFIJO_MODULO = { limites: '1', derivadas: '2', aplicaciones: '3', 'conceptos-previos': 'CP' };

const rutaTema = (modulo, numero) => `/admin/temas/${encodeURIComponent(modulo)}/${encodeURIComponent(numero)}`;

/** Sugiere el siguiente número del módulo: 1.11, 2.9, CP.2… */
function siguienteNumero(modulo) {
  const numeros = modulo.temas
    .map((tema) => String(tema.id).match(/^([\w]+)\.(\d+)$/))
    .filter(Boolean)
    .map(([, prefijo, numero]) => ({ prefijo, numero: Number(numero) }));

  const prefijo = PREFIJO_MODULO[modulo.id] ?? numeros[0]?.prefijo ?? '1';
  const mayor = numeros
    .filter((n) => n.prefijo === prefijo)
    .reduce((maximo, n) => Math.max(maximo, n.numero), 0);

  return `${prefijo}.${mayor + 1}`;
}

function NuevoTema({ modulo, onCerrar, onCreado }) {
  const [numero, setNumero] = useState(() => siguienteNumero(modulo));
  const [titulo, setTitulo] = useState('');
  const [visibilidad, setVisibilidad] = useState('privado');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const enviar = async (evento) => {
    evento.preventDefault();
    setError('');

    if (!titulo.trim()) {
      setError('Escribe el título del tema.');
      return;
    }

    setGuardando(true);

    try {
      const creado = await api('/admin/temas', {
        metodo: 'POST',
        cuerpo: {
          modulo: modulo.id,
          numero: numero.trim(),
          titulo: titulo.trim(),
          visibilidad,
        },
      });
      onCreado(creado);
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-fondo" role="dialog" aria-modal="true" aria-labelledby="nuevo-tema-titulo">
      <form className="modal-caja tarjeta" onSubmit={enviar}>
        <div className="cabeza-fila">
          <h2 id="nuevo-tema-titulo">Nuevo tema en {modulo.titulo}</h2>
          <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico" onClick={onCerrar}>Cerrar</button>
        </div>

        {error && <div className="aviso-caja" role="alert">{error}</div>}

        <div className="campo">
          <label htmlFor="nuevo-numero">Número del tema</label>
          <input
            id="nuevo-numero"
            value={numero}
            maxLength={20}
            onChange={(e) => setNumero(e.target.value)}
            disabled={guardando}
          />
          <span className="campo-ayuda">Es el identificador de la URL, por ejemplo 1.11.</span>
        </div>

        <div className="campo">
          <label htmlFor="nuevo-titulo">Título</label>
          <input
            id="nuevo-titulo"
            value={titulo}
            maxLength={200}
            onChange={(e) => setTitulo(e.target.value)}
            disabled={guardando}
            autoFocus
          />
        </div>

        <div className="campo">
          <label htmlFor="nuevo-visibilidad">Visibilidad</label>
          <select
            id="nuevo-visibilidad"
            value={visibilidad}
            onChange={(e) => setVisibilidad(e.target.value)}
            disabled={guardando}
          >
            <option value="privado">Privado (solo administradores)</option>
            <option value="publico">Público (visible para estudiantes)</option>
          </select>
          <span className="campo-ayuda">Nace privado para que puedas prepararlo antes de mostrarlo.</span>
        </div>

        <div className="fila-botones">
          <button type="button" className="pnl-btn pnl-btn-secundario" onClick={onCerrar} disabled={guardando}>Cancelar</button>
          <button type="submit" className="pnl-btn pnl-btn-primario" disabled={guardando}>
            {guardando ? 'Creando…' : 'Crear tema'}
          </button>
        </div>
      </form>
    </div>
  );
}

function VistaModulo({ id, curso, visitas, recargar }) {
  const modulo = curso.modulos.find((m) => m.id === id);
  const navigate = useNavigate();
  const [creando, setCreando] = useState(false);
  const [confirmarBorrado, setConfirmarBorrado] = useState('');
  const [ocupado, setOcupado] = useState('');

  if (!modulo) return <NoEncontrado titulo="Módulo no encontrado" mensaje="Ese módulo no existe." destino="/admin/modulos" textoDestino="Volver a Módulos" />;

  const color = COLOR_MODULO(modulo.id);
  const { porTema } = visitas;
  const maximo = Math.max(...modulo.temas.map((t) => porTema[t.id] ?? 0), 1);

  const cambiarVisibilidad = async (tema) => {
    const visibilidad = tema.visibilidad === 'privado' ? 'publico' : 'privado';
    setOcupado(tema.id);

    try {
      await api(`${rutaTema(modulo.id, tema.id)}/visibilidad`, { metodo: 'PUT', cuerpo: { visibilidad } });
      alerta.ok(visibilidad === 'publico' ? 'Tema visible' : 'Tema oculto', visibilidad === 'publico'
        ? 'Los estudiantes ya pueden verlo.'
        : 'Los estudiantes y docentes recibirán un 404.');
      recargar();
    } catch (e) {
      alertaError('No se pudo cambiar la visibilidad', e);
    } finally {
      setOcupado('');
    }
  };

  const moverAPapelera = async (tema) => {
    setConfirmarBorrado('');
    setOcupado(tema.id);

    try {
      await api(rutaTema(modulo.id, tema.id), { metodo: 'DELETE' });
      alerta.info('Tema en la papelera', 'Puedes restaurarlo desde la sección Papelera.');
      recargar();
    } catch (e) {
      alertaError('No se pudo mover el tema a la papelera', e);
    } finally {
      setOcupado('');
    }
  };

  return (
    <>
      <Link className="boton-volver" to="/admin/modulos"><FiArrowLeft />Módulos</Link>

      <div className="admin-cabeza">
        <div>
          <h1>{modulo.titulo}</h1>
          <p>{modulo.temas.length} temas · {entero(visitasDe(modulo, porTema))} visitas en 8 semanas</p>
        </div>
        <button type="button" className="pnl-btn pnl-btn-primario" onClick={() => setCreando(true)}>
          <FiPlus />Nuevo tema
        </button>
      </div>

      {creando && (
        <NuevoTema
          modulo={modulo}
          onCerrar={() => setCreando(false)}
          onCreado={(creado) => {
            setCreando(false);
            recargar();
            alerta.ok('Tema creado', 'Se abrió el editor para que agregues el contenido.');
            navigate(`/admin/modulos/${encodeURIComponent(modulo.id)}/${encodeURIComponent(creado.numero)}`);
          }}
        />
      )}

      <div className="tarjeta">
        <div className="tabla-caja">
          <table className="tabla-panel">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Tema</th>
                <th>Visitas</th>
                <th>Estado</th>
                <th>Visibilidad</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {modulo.temas.map((t) => {
                const cantidad = porTema[t.id] ?? 0;
                const privado = t.visibilidad === 'privado';
                return (
                  <tr key={t.id}>
                    <td><b>{t.id}</b></td>
                    <td>{t.titulo}</td>
                    <td>
                      <span className="tema-visitas">
                        <span className="graf-pista">
                          <i style={{ width: `${(cantidad / maximo) * 100}%`, background: color }} />
                        </span>
                        <span className="num-celda">{entero(cantidad)}</span>
                      </span>
                    </td>
                    <td><Pastilla estado={t.tieneBorrador ? 'borrador' : 'publicada'} /></td>
                    <td>
                      <button
                        type="button"
                        className={`pastilla ${privado ? 'pastilla-off' : 'pastilla-ok'}`}
                        title={privado ? 'Hacer público' : 'Hacer privado'}
                        onClick={() => cambiarVisibilidad(t)}
                        disabled={ocupado === t.id}
                      >
                        {privado ? 'Privado' : 'Público'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {confirmarBorrado === t.id ? (
                        <span className="fila-botones">
                          <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico" onClick={() => setConfirmarBorrado('')}>Cancelar</button>
                          <button
                            type="button"
                            className="pnl-btn pnl-btn-peligro pnl-btn-chico"
                            onClick={() => moverAPapelera(t)}
                            disabled={ocupado === t.id}
                          >
                            Sí, mover
                          </button>
                        </span>
                      ) : (
                        <span className="fila-botones">
                          <Link className="pnl-btn pnl-btn-secundario pnl-btn-chico" to={`/admin/modulos/${modulo.id}/${t.id}`}>Editar</Link>
                          <button
                            type="button"
                            className="pnl-btn pnl-btn-secundario pnl-btn-chico"
                            onClick={() => setConfirmarBorrado(t.id)}
                            disabled={ocupado === t.id}
                          >
                            <FiTrash2 />Papelera
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function VistaEvaluate() {
  const [params] = useSearchParams();
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [estado, setEstado] = useState('todos');
  const [modulo, setModulo] = useState('todos');
  const [docente, setDocente] = useState(params.get('docente') ?? 'todos');
  const [busqueda, setBusqueda] = useState('');
  const [actualizando, setActualizando] = useState('');

  useEffect(() => {
    const cargarEvaluaciones = async () => {
      try {
        setCargando(true);
        setError('');

        const datos = await api('/evaluaciones/administrador');
        setEvaluaciones(datos.evaluaciones ?? []);
      } catch (err) {
        setError(err.message || 'No se pudieron cargar los quices.');
      } finally {
        setCargando(false);
      }
    };

    cargarEvaluaciones();
  }, []);

  useEffect(() => {
    if (!mensaje) return;

    const temporizador = setTimeout(() => {
      setMensaje('');
    }, 3500);

    return () => clearTimeout(temporizador);
  }, [mensaje]);

  const obtenerEstado = (quiz) => {
    if (quiz.estado === 'borrador') return 'borrador';
    if (quiz.vencido) return 'vencida';
    if (!quiz.habilitado) return 'oculta';
    return 'publicada';
  };

  const estados = [
    ['todos', 'Todos'],
    ['borrador', 'Borradores'],
    ['publicada', 'Publicadas'],
    ['oculta', 'Ocultas'],
    ['vencida', 'Vencidas'],
  ];

  const texto = sinAcentos(busqueda.trim());

  const filas = evaluaciones.filter((quiz) => (
    (estado === 'todos' || obtenerEstado(quiz) === estado)
    && (modulo === 'todos' || quiz.modulo?.clave === modulo)
    && (docente === 'todos' || String(quiz.docente?._id) === docente)
    && sinAcentos(quiz.titulo || '').includes(texto)
  ));

  const docentesDisponibles = [
    ...new Map(
      evaluaciones
        .filter((quiz) => quiz.docente?._id)
        .map((quiz) => [
          String(quiz.docente._id),
          quiz.docente,
        ])
    ).values(),
  ];

  const contarEstado = (valor) => (
    evaluaciones.filter((quiz) => (
      valor === 'todos' || obtenerEstado(quiz) === valor
    )).length
  );

  const limpiar = () => {
    setEstado('todos');
    setModulo('todos');
    setDocente('todos');
    setBusqueda('');
  };

  const cambiarHabilitado = async (quiz) => {
    const nuevoEstado = !quiz.habilitado;

    try {
      setError('');
      setMensaje('');
      setActualizando(quiz.id);

      await api(`/evaluaciones/administrador/${quiz.id}/habilitado`, {
        metodo: 'PATCH',
        cuerpo: { habilitado: nuevoEstado },
      });

      setEvaluaciones((actuales) => (
        actuales.map((item) => (
          item.id === quiz.id
            ? { ...item, habilitado: nuevoEstado }
            : item
        ))
      ));

      setMensaje(
        nuevoEstado
          ? 'Quiz habilitado correctamente.'
          : 'Quiz deshabilitado correctamente.'
      );
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el estado del quiz.');
    } finally {
      setActualizando('');
    }
  };

  const fechaFormato = (fecha) => {
    if (!fecha) return '—';

    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'short',
      timeZone: 'America/Bogota',
    }).format(new Date(fecha));
  };

  const mostrarEstado = (quiz) => {
    const valor = obtenerEstado(quiz);

    const apariencia = {
      publicada: ['pastilla-ok', 'Publicada'],
      borrador: ['pastilla-borrador', 'Borrador'],
      oculta: ['pastilla-off', 'Oculta'],
      vencida: ['pastilla-off', 'Vencida'],
    };

    const [clase, nombre] = apariencia[valor];

    return <span className={`pastilla ${clase}`}>{nombre}</span>;
  };

  return (
    <>
      <div className="admin-cabeza">
        <div>
          <h1>Evalúate</h1>
          <p>Todos los quices creados por los docentes en sus módulos.</p>
        </div>
      </div>

      <div className="tarjeta">
        <div className="admin-filtros">
          {estados.map(([valor, nombre]) => (
            <button
              key={valor}
              type="button"
              className="pildora"
              aria-pressed={estado === valor}
              onClick={() => setEstado(valor)}
            >
              {nombre} ({contarEstado(valor)})
            </button>
          ))}
        </div>

        <div className="admin-filtros">
          <label className="pregunta-caja" htmlFor="buscar-creado">
            <FiSearch aria-hidden="true" />
            <input
              id="buscar-creado"
              type="search"
              placeholder="Buscar por título"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </label>

          <select
            className="admin-select"
            aria-label="Filtrar por módulo"
            value={modulo}
            onChange={(e) => setModulo(e.target.value)}
          >
            <option value="todos">Todos los módulos</option>
            {MODULOS.map((m) => (
              <option key={m.id} value={m.id}>{m.titulo}</option>
            ))}
          </select>

          <select
            className="admin-select"
            aria-label="Filtrar por docente"
            value={docente}
            onChange={(e) => setDocente(e.target.value)}
          >
            <option value="todos">Todos los docentes</option>
            {docentesDisponibles.map((d) => (
              <option key={d._id} value={String(d._id)}>
                {d.nombre}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="admin-vacio">
            <p>{error}</p>
          </div>
        )}

        {mensaje && (
          <div
            role="status"
            style={{
              position: 'fixed',
              top: '24px',
              right: '24px',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '14px 18px',
              background: '#e8f5e9',
              color: '#246b35',
              border: '1px solid #b7dfbd',
              borderRadius: '10px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
              maxWidth: '360px',
            }}
          >
            <span>{mensaje}</span>

            <button
              type="button"
              onClick={() => setMensaje('')}
              aria-label="Cerrar notificación"
              style={{
                border: 'none',
                background: 'transparent',
                color: 'inherit',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '0 4px',
              }}
            >
              ×
            </button>
          </div>
        )}

        {cargando ? (
          <div className="admin-vacio">
            <p>Cargando quices...</p>
          </div>
        ) : !error && filas.length === 0 ? (
          <div className="admin-vacio">
            <b>No hay quices con estos filtros</b>
            <p className="suave-txt">
              Prueba con otro estado, módulo o docente.
            </p>
            <button
              type="button"
              className="pnl-btn pnl-btn-secundario pnl-btn-chico"
              onClick={limpiar}
            >
              Limpiar filtros
            </button>
          </div>
        ) : !error ? (
          <div className="tabla-caja">
            <table className="tabla-panel">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Módulo</th>
                  <th>Docente</th>
                  <th>Estado</th>
                  <th>Fecha límite</th>
                  <th>Creado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filas.map((quiz) => (
                  <tr key={quiz.id}>
                    <td><b>{quiz.titulo}</b></td>

                    <td>{quiz.modulo?.titulo || '—'}</td>

                    <td>{quiz.docente?.nombre || '—'}</td>

                    <td>{mostrarEstado(quiz)}</td>

                    <td className="suave-txt num-celda">
                      {fechaFormato(quiz.fechaLimite)}
                    </td>

                    <td className="suave-txt num-celda">
                      {fechaFormato(quiz.createdAt)}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-filtros">
                        <Link
                          className="pnl-btn pnl-btn-secundario pnl-btn-chico"
                          to={`/admin/evaluate/${quiz.id}`}
                        >
                          Ver
                        </Link>

                        {quiz.estado === 'publicado' && (
                          <button
                            type="button"
                            className="pnl-btn pnl-btn-secundario pnl-btn-chico"
                            disabled={actualizando === quiz.id}
                            onClick={() => cambiarHabilitado(quiz)}
                          >
                            {actualizando === quiz.id
                              ? 'Actualizando...'
                              : quiz.habilitado
                                ? 'Deshabilitar'
                                : 'Habilitar'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </>
  );
}

function VistaCreacion({ id }) {
  const [quiz, setQuiz] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarQuiz = async () => {
      try {
        setCargando(true);
        setError('');

        const datos = await api('/evaluaciones/administrador');

        const encontrado = (datos.evaluaciones ?? []).find(
          (evaluacion) => evaluacion.id === id
        );

        setQuiz(encontrado ?? null);
      } catch (err) {
        setError(err.message || 'No se pudo cargar el quiz.');
      } finally {
        setCargando(false);
      }
    };

    cargarQuiz();
  }, [id]);

  const fechaFormato = (fecha) => {
    if (!fecha) return 'Sin fecha definida';

    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Bogota',
    }).format(new Date(fecha));
  };

  if (cargando) {
    return (
      <div className="sesion-espera" role="status">
        Cargando evaluación...
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-vacio">
        <b>No se pudo cargar la evaluación</b>
        <p className="suave-txt">{error}</p>
        <Link
          className="pnl-btn pnl-btn-secundario pnl-btn-chico"
          to="/admin/evaluate"
        >
          Volver a Evalúate
        </Link>
      </div>
    );
  }

  if (!quiz) {
    return (
      <NoEncontrado
        titulo="Evaluación no encontrada"
        mensaje="Ese quiz no existe o ya no está disponible."
        destino="/admin/evaluate"
        textoDestino="Volver a Evalúate"
      />
    );
  }

  const estadoVisual = quiz.estado === 'borrador'
    ? 'borrador'
    : quiz.vencido
      ? 'vencida'
      : !quiz.habilitado
        ? 'oculta'
        : 'publicada';

  return (
    <>
      <Link className="boton-volver" to="/admin/evaluate">
        <FiArrowLeft />
        Evalúate
      </Link>

      <div className="admin-cabeza">
        <div>
          <h1>{quiz.titulo}</h1>
          <p>
            Quiz de {quiz.docente?.nombre || 'Docente no disponible'}
            {' · '}
            Creado el {fechaFormato(quiz.createdAt)}
          </p>
        </div>

        {estadoVisual === 'vencida' ? (
          <span className="pastilla pastilla-off">Vencida</span>
        ) : (
          <Pastilla estado={estadoVisual} />
        )}
      </div>

      <div className="tarjeta">
        <h2>Información del quiz</h2>

        <dl className="ficha">
          <div>
            <dt>Módulo</dt>
            <dd>{quiz.modulo?.titulo || 'No disponible'}</dd>
          </div>

          <div>
            <dt>Temas</dt>
            <dd>
              {quiz.temas?.length
                ? quiz.temas.map((t) => `${t.numero} ${t.titulo}`).join(', ')
                : 'Sin tema'}
            </dd>
          </div>

          <div>
            <dt>Docente</dt>
            <dd>{quiz.docente?.nombre || 'No disponible'}</dd>
          </div>

          <div>
            <dt>Preguntas</dt>
            <dd>{quiz.preguntas?.length ?? 0}</dd>
          </div>

          <div>
            <dt>Fecha límite</dt>
            <dd>{fechaFormato(quiz.fechaLimite)}</dd>
          </div>

          <div>
            <dt>Estado</dt>
            <dd>
              {estadoVisual === 'vencida'
                ? 'Vencida'
                : estadoVisual === 'borrador'
                  ? 'Borrador'
                  : estadoVisual === 'oculta'
                    ? 'Deshabilitada'
                    : 'Publicada'}
            </dd>
          </div>
        </dl>
      </div>

      <div className="tarjeta">
        <h2>Preguntas del quiz</h2>

        {!quiz.preguntas?.length ? (
          <div className="admin-vacio">
            <p>Este quiz todavía no tiene preguntas.</p>
          </div>
        ) : (
          <ol className="lista">
            {quiz.preguntas.map((pregunta, indice) => (
              <li
                key={pregunta._id || indice}
                className="item"
                style={{ display: 'block' }}
              >
                <b>
                  Pregunta {indice + 1}
                </b>

                <p>{pregunta.enunciado}</p>

                <ol type="A">
                  {pregunta.opciones.map((opcion, opcionIndice) => (
                    <li key={opcionIndice}>
                      {opcion}

                      {pregunta.respuestaCorrecta === opcionIndice && (
                        <span className="pastilla pastilla-ok">
                          Respuesta correcta
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}

const PESTANAS_RECURSOS = [
  ['videoteca', 'Videoteca', FiVideo],
  ['laboratorio', 'Laboratorio', FiBarChart2],
  ['conceptos', 'Conceptos previos', FiBookOpen],
];

function VistaRecursos() {
  const [pestana, setPestana] = useState('videoteca');

  const contenido = {
    videoteca: <RecursosVideoteca />,
    laboratorio: <RecursosLaboratorio />,
    conceptos: <RecursosConceptosPrevios />,
  };

  return (
    <>
      <div className="admin-cabeza">
        <div>
          <h1>Recursos</h1>
          <p>
            Videos, ejercicios de práctica y conceptos previos del curso. Aquí solo se consultan:
            la edición vive en el editor de cada tema.
          </p>
        </div>
      </div>

      <div className="filtros" role="tablist" aria-label="Recursos">
        {PESTANAS_RECURSOS.map(([clave, texto, Icono]) => (
          <button
            key={clave}
            type="button"
            role="tab"
            className="pildora"
            aria-selected={pestana === clave}
            aria-pressed={pestana === clave}
            onClick={() => setPestana(clave)}
          >
            <Icono aria-hidden="true" /> {texto}
          </button>
        ))}
      </div>

      {contenido[pestana]}
    </>
  );
}

function RecursosVideoteca() {
  const [datos, setDatos] = useState({ estado: 'cargando' });
  const [modulosCurso, setModulosCurso] = useState([]);
  const [locales, setLocales] = useState(() => leerVideosLocales());
  const [destinos, setDestinos] = useState({});
  const [importando, setImportando] = useState('');
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let vigente = true;

    Promise.all([api('/videos'), api('/admin/temas')])
      .then(([videoteca, curso]) => {
        if (!vigente) return;
        setDatos({ estado: 'listo', modulos: videoteca.modulos ?? [], videos: videoteca.videos ?? [] });
        setModulosCurso(curso.modulos ?? []);
      })
      .catch((e) => {
        if (!vigente) return;
        setDatos({ estado: 'error', mensaje: e.message });
      });

    return () => {
      vigente = false;
    };
  }, [recarga]);

  const reintentar = () => {
    setDatos({ estado: 'cargando' });
    setRecarga((valor) => valor + 1);
  };

  const destinoDe = (video) => destinos[video.id] ?? { modulo: '', tema: '' };

  const cambiarDestino = (id, campo, valor) => {
    setDestinos((actual) => ({
      ...actual,
      [id]: {
        ...(actual[id] ?? { modulo: '', tema: '' }),
        [campo]: valor,
        ...(campo === 'modulo' ? { tema: '' } : {}),
      },
    }));
  };

  const importar = async (video) => {
    const destino = destinoDe(video);

    if (!destino.modulo || !destino.tema) {
      alerta.aviso('Falta el destino', 'Elige el módulo y el tema al que pertenece el video.');
      return;
    }

    setImportando(video.id);

    try {
      const respuesta = await api('/admin/videos/importar', {
        metodo: 'POST',
        cuerpo: {
          modulo: destino.modulo,
          tema: destino.tema,
          url: video.youtubeId ?? video.url,
          titulo: video.titulo,
          descripcion: video.descripcion,
        },
      });

      setLocales(quitarVideoLocal(video.id));
      alerta.ok(
        'Video importado',
        `Se agregó al borrador de ${respuesta.tema.titulo}. Publica ese tema para verlo en la videoteca.`,
      );
    } catch (e) {
      alertaError('No se pudo importar el video', e);
    } finally {
      setImportando('');
    }
  };

  return (
    <>
      {locales.length > 0 && (
        <div className="tarjeta">
          <div className="tarjeta-cabeza">
            <h2>Videos guardados en este navegador</h2>
            <p className="suave-txt">
              Se agregaron antes de que la videoteca viviera en la base de datos. Asigna cada uno a un
              tema y publícalo para que quede disponible para los estudiantes.
            </p>
          </div>

          <ul className="lista">
            {locales.map((video) => {
              const destino = destinoDe(video);
              const temas = modulosCurso.find((modulo) => modulo.id === destino.modulo)?.temas ?? [];

              return (
                <li key={video.id} className="item recursos-fila">
                  <img
                    className="recursos-mini"
                    src={youtubeThumb(extraerYoutubeId(video.youtubeId))}
                    alt=""
                  />
                  <span className="item-txt">
                    <b>{video.titulo || 'Video sin título'}</b>
                    <span>{video.descripcion || 'Sin descripción'}</span>
                  </span>
                  <div className="recursos-destino">
                    <select
                      className="admin-select"
                      value={destino.modulo}
                      onChange={(e) => cambiarDestino(video.id, 'modulo', e.target.value)}
                      aria-label="Módulo de destino"
                    >
                      <option value="">Módulo…</option>
                      {modulosCurso.map((modulo) => (
                        <option key={modulo.id} value={modulo.id}>{modulo.titulo}</option>
                      ))}
                    </select>
                    <select
                      className="admin-select"
                      value={destino.tema}
                      onChange={(e) => cambiarDestino(video.id, 'tema', e.target.value)}
                      disabled={!destino.modulo}
                      aria-label="Tema de destino"
                    >
                      <option value="">Tema…</option>
                      {temas.map((tema) => (
                        <option key={tema.id} value={tema.id}>{tema.titulo}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="pnl-btn pnl-btn-primario pnl-btn-chico"
                      disabled={importando === video.id}
                      onClick={() => importar(video)}
                    >
                      {importando === video.id ? 'Importando…' : 'Importar'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <Carga datos={datos} reintentar={reintentar}>
        {(d) => {
          if (d.videos.length === 0) {
            return (
              <div className="admin-vacio">
                <b>La videoteca está vacía</b>
                <p className="suave-txt">
                  Agrega videos desde la pestaña Videos del editor de un tema y publícalo.
                </p>
              </div>
            );
          }

          return d.modulos.map((modulo) => {
            const videos = d.videos.filter((video) => video.modulo === modulo.id);

            return (
              <div key={modulo.id} className="tarjeta">
                <div className="tarjeta-cabeza">
                  <h2>{modulo.titulo}</h2>
                  <p className="suave-txt">
                    {videos.length} {videos.length === 1 ? 'video' : 'videos'}
                  </p>
                </div>

                <ul className="lista">
                  {videos.map((video) => (
                    <li key={video.id} className="item">
                      <img className="recursos-mini" src={youtubeThumb(video.youtubeId)} alt="" />
                      <span className="item-txt">
                        <b>{video.titulo || 'Video sin título'}</b>
                        <span>{video.descripcion || 'Sin descripción'}</span>
                        <span className="recursos-meta">
                          Tema {video.numero} · {video.temaTitulo}
                        </span>
                      </span>
                      <Link
                        className="pnl-btn pnl-btn-secundario pnl-btn-chico"
                        to={rutaTema(video.modulo, video.numero)}
                      >
                        Editar tema
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          });
        }}
      </Carga>
    </>
  );
}

function RecursosLaboratorio() {
  const [datos, setDatos] = useState({ estado: 'cargando' });
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let vigente = true;

    api('/admin/practicas')
      .then((respuesta) => {
        if (!vigente) return;

        const modulos = (respuesta.modulos ?? [])
          .filter((modulo) => modulo.id !== MODULO_CONCEPTOS_PREVIOS)
          .map((modulo) => ({
            ...modulo,
            temas: modulo.temas.filter((tema) => (tema.practicas ?? []).length > 0),
          }))
          .filter((modulo) => modulo.temas.length > 0);

        setDatos({ estado: 'listo', modulos });
      })
      .catch((e) => {
        if (!vigente) return;
        setDatos({ estado: 'error', mensaje: e.message });
      });

    return () => {
      vigente = false;
    };
  }, [recarga]);

  const reintentar = () => {
    setDatos({ estado: 'cargando' });
    setRecarga((valor) => valor + 1);
  };

  return (
    <Carga datos={datos} reintentar={reintentar}>
      {(d) => {
        if (d.modulos.length === 0) {
          return (
            <div className="admin-vacio">
              <b>Sin ejercicios de práctica</b>
              <p className="suave-txt">
                Agrega ejercicios desde la pestaña Laboratorio del editor de un tema.
              </p>
            </div>
          );
        }

        return d.modulos.map((modulo) => {
          const total = modulo.temas.reduce((suma, tema) => suma + tema.practicas.length, 0);

          return (
            <div key={modulo.id} className="tarjeta">
              <div className="tarjeta-cabeza">
                <h2>{modulo.titulo}</h2>
                <p className="suave-txt">
                  {total} {total === 1 ? 'ejercicio' : 'ejercicios'} en {modulo.temas.length} {' '}
                  {modulo.temas.length === 1 ? 'tema' : 'temas'}
                </p>
              </div>

              <div className="recursos-temas">
                {modulo.temas.map((tema) => (
                  <div key={tema.id} className="recursos-tema">
                    <div className="recursos-tema-cabeza">
                      <b>{tema.titulo}</b>
                      {tema.tieneBorrador && <Pastilla estado="borrador" />}
                      {tema.visibilidad === 'privado' && <Pastilla estado="oculta" />}
                      <Link
                        className="pnl-btn pnl-btn-secundario pnl-btn-chico"
                        to={rutaTema(modulo.id, tema.id)}
                      >
                        Editar tema
                      </Link>
                    </div>

                    <ul className="lista">
                      {tema.practicas.map((practica) => (
                        <li key={practica.id} className="item">
                          <span className="item-txt">
                            <b>{practica.titulo}</b>
                            <span>
                              {practica.funcion} · {practica.herramienta === 'limite' ? 'Límite' : 'Derivada'} en x = {practica.punto}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          );
        });
      }}
    </Carga>
  );
}

function RecursosConceptosPrevios() {
  const [datos, setDatos] = useState({ estado: 'cargando' });
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let vigente = true;

    api('/admin/temas')
      .then((respuesta) => {
        if (!vigente) return;
        const modulo = (respuesta.modulos ?? []).find((item) => item.id === MODULO_CONCEPTOS_PREVIOS) ?? null;
        setDatos({ estado: 'listo', modulo });
      })
      .catch((e) => {
        if (!vigente) return;
        setDatos({ estado: 'error', mensaje: e.message });
      });

    return () => {
      vigente = false;
    };
  }, [recarga]);

  const reintentar = () => {
    setDatos({ estado: 'cargando' });
    setRecarga((valor) => valor + 1);
  };

  return (
    <>
      <div className="tarjeta">
        <div className="tarjeta-cabeza">
          <h2>Cómo funcionan</h2>
          <p className="suave-txt">
            Viven en el módulo especial «Conceptos previos», fuera de Cálculo I: no aparecen en el
            curso ni en sus rutas. Se editan como cualquier tema y se muestran en la página pública.
          </p>
          <div className="fila-botones">
            <Link className="pnl-btn pnl-btn-secundario pnl-btn-chico" to="/conceptos-previos">
              Ver página pública
            </Link>
          </div>
        </div>
      </div>

      <Carga datos={datos} reintentar={reintentar}>
        {(d) => {
          if (!d.modulo || d.modulo.temas.length === 0) {
            return (
              <div className="admin-vacio">
                <b>No hay conceptos previos</b>
                <p className="suave-txt">
                  Ejecuta <code>npm run migrar-conceptos-previos</code> en la carpeta backend para
                  crear los temas iniciales.
                </p>
              </div>
            );
          }

          return (
            <ul className="lista">
              {d.modulo.temas.map((tema) => (
                <li key={tema.id} className="item">
                  <span className="item-icono"><FiBookOpen /></span>
                  <span className="item-txt">
                    <b>{tema.titulo}</b>
                    <span>Tema {tema.id}</span>
                  </span>
                  {tema.tieneBorrador && <Pastilla estado="borrador" />}
                  {tema.visibilidad === 'privado' && <Pastilla estado="oculta" />}
                  <Link
                    className="pnl-btn pnl-btn-secundario pnl-btn-chico"
                    to={rutaTema(MODULO_CONCEPTOS_PREVIOS, tema.id)}
                  >
                    Editar tema
                  </Link>
                </li>
              ))}
            </ul>
          );
        }}
      </Carga>
    </>
  );
}

const fechaCorta = (valor) => (valor
  ? new Date(valor).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
  : '—');

function VistaPapelera({ recargar }) {
  const [estado, setEstado] = useState('cargando');
  const [temas, setTemas] = useState([]);
  const [error, setError] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [ocupado, setOcupado] = useState('');

  useEffect(() => {
    let vigente = true;

    api('/admin/temas/papelera')
      .then((respuesta) => {
        if (!vigente) return;
        setTemas(respuesta.temas ?? []);
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
  }, []);

  const quitar = (tema) => setTemas((actual) => actual.filter(
    (item) => !(item.modulo === tema.modulo && item.numero === tema.numero),
  ));

  const restaurar = async (tema) => {
    const clave = `${tema.modulo}/${tema.numero}`;
    setOcupado(clave);

    try {
      await api(`${rutaTema(tema.modulo, tema.numero)}/restaurar`, { metodo: 'POST' });
      quitar(tema);
      alerta.ok('Tema restaurado', 'Volvió a la lista del módulo con su visibilidad anterior.');
      recargar();
    } catch (e) {
      alertaError('No se pudo restaurar el tema', e);
    } finally {
      setOcupado('');
    }
  };

  const eliminarDefinitivo = async (tema) => {
    const clave = `${tema.modulo}/${tema.numero}`;
    setConfirmar('');
    setOcupado(clave);

    try {
      await api(`${rutaTema(tema.modulo, tema.numero)}/definitivo`, {
        metodo: 'DELETE',
        cuerpo: { confirmar: true },
      });
      quitar(tema);
      alerta.info('Tema eliminado', 'Esta acción no se puede deshacer.');
      recargar();
    } catch (e) {
      alertaError('No se pudo eliminar el tema', e);
    } finally {
      setOcupado('');
    }
  };

  return (
    <>
      <div className="admin-cabeza">
        <div>
          <h1>Papelera</h1>
          <p>Los temas eliminados se guardan aquí. Los estudiantes y docentes no los ven.</p>
        </div>
      </div>

      {estado === 'cargando' && <div className="sesion-espera" role="status">Cargando la papelera…</div>}

      {estado === 'error' && (
        <div className="admin-vacio">
          <b>No se pudo cargar la papelera</b>
          <p className="suave-txt">{error}</p>
        </div>
      )}

      {estado === 'listo' && temas.length === 0 && (
        <div className="admin-vacio">
          <b>La papelera está vacía</b>
          <p className="suave-txt">Cuando muevas un tema a la papelera, aparecerá aquí para restaurarlo.</p>
        </div>
      )}

      {estado === 'listo' && temas.length > 0 && (
        <div className="tarjeta">
          <div className="tabla-caja">
            <table className="tabla-panel">
              <thead>
                <tr>
                  <th>Módulo</th>
                  <th>Tema</th>
                  <th>Eliminado</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {temas.map((tema) => {
                  const clave = `${tema.modulo}/${tema.numero}`;
                  return (
                    <tr key={clave}>
                      <td>{tema.moduloTitulo}</td>
                      <td><b>{tema.numero}</b> · {tema.titulo}</td>
                      <td className="suave-txt">{fechaCorta(tema.eliminadoEn)}</td>
                      <td style={{ textAlign: 'right' }}>
                        {confirmar === clave ? (
                          <span className="fila-botones">
                            <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico" onClick={() => setConfirmar('')}>Cancelar</button>
                            <button
                              type="button"
                              className="pnl-btn pnl-btn-peligro pnl-btn-chico"
                              onClick={() => eliminarDefinitivo(tema)}
                              disabled={ocupado === clave}
                            >
                              Sí, eliminar para siempre
                            </button>
                          </span>
                        ) : (
                          <span className="fila-botones">
                            <button
                              type="button"
                              className="pnl-btn pnl-btn-primario pnl-btn-chico"
                              onClick={() => restaurar(tema)}
                              disabled={ocupado === clave}
                            >
                              Restaurar
                            </button>
                            <button
                              type="button"
                              className="pnl-btn pnl-btn-secundario pnl-btn-chico"
                              onClick={() => setConfirmar(clave)}
                              disabled={ocupado === clave}
                            >
                              Eliminar definitivamente
                            </button>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function VistaUsuarios() {
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [correo, setCorreo] = useState('');
  const [invitando, setInvitando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState(null);

  const texto = sinAcentos(busqueda.trim());
  const filas = DOCENTES.filter((d) => sinAcentos(`${d.nombre} ${d.correo}`).includes(texto));
  const activos = DOCENTES.filter((d) => d.estado === 'activo').length;

  const cerrarModal = () => {
    setMostrarModal(false);
    setCorreo('');
    setMensaje('');
    setError('');
    setResultado(null);
  };

  const invitar = async () => {
    setError('');
    setMensaje('');
    setResultado(null);

    if (!correo.trim()) {
      setError('Escribe el correo del docente.');
      return;
    }

    try {
      setInvitando(true);

      const respuesta = await api('/usuarios/invitar-docente', {
        metodo: 'POST',
        cuerpo: { correo: correo.trim() }
      });

      setResultado(respuesta);
      setMensaje(respuesta.mensaje);
    } catch (err) {
      setError(err.message);
    } finally {
      setInvitando(false);
    }
  };

  return (
    <>
      <div className="admin-cabeza">
        <div>
          <h1>Usuarios</h1>
          <p>Docentes de la plataforma: {activos} activos de {DOCENTES.length}.</p>
        </div>
        <button type="button" className="pnl-btn pnl-btn-primario" onClick={() => setMostrarModal(true)}>
          <FiPlus />Invitar docente
        </button>
      </div>

      {mostrarModal && (
        <div className="modal-fondo" role="dialog" aria-modal="true" aria-labelledby="invitar-titulo">
          <div className="modal-caja tarjeta">
            <div className="cabeza-fila">
              <h2 id="invitar-titulo">Invitar docente</h2>
              <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico" onClick={cerrarModal}>Cerrar</button>
            </div>

            {error && (
              <div className="aviso-caja" role="alert">
                {error}
              </div>
            )}

            {mensaje && (
              <div className="aviso-caja" role="status">
                {mensaje}
              </div>
            )}

            {!resultado && (
              <>
                <label htmlFor="invitar-correo">
                  <strong>Correo institucional</strong>
                </label>
                <input
                  id="invitar-correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="docente@uniautonoma.edu.co"
                  disabled={invitando}
                />

                <button
                  type="button"
                  className="pnl-btn pnl-btn-primario"
                  onClick={invitar}
                  disabled={invitando}
                >
                  {invitando ? 'Invitando...' : 'Enviar invitación'}
                </button>
              </>
            )}

            {resultado?.enlace && (
              <div>
                <label htmlFor="invitar-enlace">
                  <strong>Enlace de respaldo</strong>
                </label>
                <p className="suave-txt">
                  Copia y envía este enlace si el correo no llegó.
                </p>
                <div className="fila-botones">
                  <input
                    id="invitar-enlace"
                    type="text"
                    value={resultado.enlace}
                    readOnly
                  />
                  <button
                    type="button"
                    className="pnl-btn pnl-btn-secundario"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(resultado.enlace);
                        setMensaje('Enlace copiado.');
                      } catch {
                        setError('No se pudo copiar el enlace.');
                      }
                    }}
                  >
                    Copiar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="tarjeta">
        <label className="pregunta-caja" htmlFor="buscar-usuario">
          <FiSearch aria-hidden="true" />
          <input
            id="buscar-usuario"
            type="search"
            placeholder="Buscar por nombre o correo"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </label>

        {filas.length === 0 ? (
          <div className="admin-vacio">
            <b>Ningún docente coincide con la búsqueda</b>
            <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico" onClick={() => setBusqueda('')}>Limpiar búsqueda</button>
          </div>
        ) : (
          <div className="tabla-caja">
            <table className="tabla-panel">
              <thead>
                <tr>
                  <th>Docente</th>
                  <th>Módulos</th>
                  <th>Lecciones</th>
                  <th>Quices</th>
                  <th>Exámenes</th>
                  <th>Último ingreso</th>
                  <th>Estado</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {filas.map((d) => {
                  const creado = creadoPor(d.id);
                  return (
                    <tr key={d.id}>
                      <td>
                        <span className="alumno">
                          <span>{d.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
                          <span className="alumno-datos" style={{ width: 'auto', height: 'auto', background: 'none' }}>
                            <b>{d.nombre}</b>
                            <small>{d.correo}</small>
                          </span>
                        </span>
                      </td>
                      <td>{d.modulos.map((m) => moduloPorId(m).titulo).join(', ')}</td>
                      <td className="num-celda">{cuantos(creado, 'Lección')}</td>
                      <td className="num-celda">{cuantos(creado, 'Quiz')}</td>
                      <td className="num-celda">{cuantos(creado, 'Examen')}</td>
                      <td className="suave-txt">{d.acceso}</td>
                      <td><Pastilla estado={d.estado} /></td>
                      <td style={{ textAlign: 'right' }}>
                        <Link className="pnl-btn pnl-btn-secundario pnl-btn-chico" to={`/admin/evaluate?docente=${d.id}`}>Ver lo creado</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function VistaConfiguracion() {
  return (
    <>
      <div className="admin-cabeza">
        <div>
          <h1>Configuración</h1>
          <p>Identidad de la plataforma y avisos que reciben los usuarios.</p>
        </div>
      </div>

      <div className="fila-2">
        <div className="tarjeta">
          <h2>Identidad de la plataforma</h2>
          <div className="campo">
            <label htmlFor="cfg-nombre">Nombre visible</label>
            <input id="cfg-nombre" type="text" defaultValue="EDUCALC XE" />
          </div>
          <div className="campo">
            <label htmlFor="cfg-lema">Bajada</label>
            <input id="cfg-lema" type="text" defaultValue="Plataforma Educativa de Cálculo" />
          </div>
          <div className="campo">
            <label htmlFor="cfg-correo">Correo de soporte</label>
            <input id="cfg-correo" type="email" defaultValue="soporte@educalcxe.edu" />
          </div>
          <button type="button" className="pnl-btn pnl-btn-azul">Guardar cambios</button>
        </div>

        <div className="tarjeta">
          <h2>Notificaciones y permisos</h2>
          <label className="ajuste" htmlFor="cfg-avisos">
            <span>
              Avisar nuevas entregas
              <small>Los maestros reciben un correo cuando un estudiante entrega</small>
            </span>
            <input className="switch" type="checkbox" id="cfg-avisos" defaultChecked />
          </label>
          <label className="ajuste" htmlFor="cfg-registro">
            <span>
              Registro abierto
              <small>Cualquier correo institucional puede crear cuenta</small>
            </span>
            <input className="switch" type="checkbox" id="cfg-registro" defaultChecked />
          </label>
          <label className="ajuste" htmlFor="cfg-ia">
            <span>
              Tutor IA disponible
              <small>Activa el asistente dentro de cada lección</small>
            </span>
            <input className="switch" type="checkbox" id="cfg-ia" defaultChecked />
          </label>
        </div>
      </div>
    </>
  );
}
