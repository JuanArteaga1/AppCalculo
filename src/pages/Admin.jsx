import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiArrowRight,
  FiClipboard,
  FiFolder,
  FiGrid,
  FiLogOut,
  FiPlus,
  FiSearch,
  FiSettings,
  FiUsers,
} from 'react-icons/fi';
import EditorTema from '../components/admin/EditorTema';
import { decimal, entero } from '../components/admin/formato';
import { BarrasMagnitud, LineaSemanas } from '../components/admin/GraficasAdmin';
import {
  CREACIONES,
  DOCENTES,
  PASTILLA_ESTADO,
  RECURSOS,
} from '../data/mockAdmin';
import { unidades } from '../data/temas';
import { useSesion } from '../context/sesion';
import { api } from '../services/api';
import NoEncontrado from './NoEncontrado';

/** Nombres de los módulos para Evalúate y Usuarios, que aún usan datos de ejemplo. */
const MODULOS = unidades.map(({ id, titulo, temas }) => ({ id, titulo, temas }));

const TIPOS = [
  ['Todos', 'Todo'],
  ['Lección', 'Lecciones'],
  ['Quiz', 'Quices'],
  ['Examen', 'Exámenes'],
];

const SECCIONES = [
  ['panel', 'Panel', FiGrid, null],
  ['modulos', 'Módulos', FiFolder, MODULOS.length],
  ['evaluate', 'Evalúate', FiClipboard, CREACIONES.length],
  ['recursos', 'Recursos', FiGrid, RECURSOS.length],
  ['usuarios', 'Usuarios', FiUsers, DOCENTES.length],
  ['configuracion', 'Configuración', FiSettings, null],
];

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

const COLOR_MODULO = (id) => `var(--serie-${id})`;
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
          {(d) => (detalle ? <VistaModulo id={detalle} {...d} /> : <VistaModulos {...d} />)}
        </Carga>
      ),
    evaluate: detalle ? <VistaCreacion id={detalle} /> : <VistaEvaluate />,
    recursos: <VistaRecursos />,
    usuarios: <VistaUsuarios />,
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

function VistaModulo({ id, curso, visitas }) {
  const modulo = curso.modulos.find((m) => m.id === id);

  if (!modulo) return <NoEncontrado titulo="Módulo no encontrado" mensaje="Ese módulo no existe." destino="/admin/modulos" textoDestino="Volver a Módulos" />;

  const color = COLOR_MODULO(modulo.id);
  const { porTema } = visitas;
  const maximo = Math.max(...modulo.temas.map((t) => porTema[t.id] ?? 0), 1);

  return (
    <>
      <Link className="boton-volver" to="/admin/modulos"><FiArrowLeft />Módulos</Link>

      <div className="admin-cabeza">
        <div>
          <h1>{modulo.titulo}</h1>
          <p>{modulo.temas.length} temas · {entero(visitasDe(modulo, porTema))} visitas en 8 semanas</p>
        </div>
      </div>

      <div className="tarjeta">
        <div className="tabla-caja">
          <table className="tabla-panel">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Tema</th>
                <th>Visitas</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {modulo.temas.map((t) => {
                const cantidad = porTema[t.id] ?? 0;
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
                    <td style={{ textAlign: 'right' }}>
                      <Link className="pnl-btn pnl-btn-secundario pnl-btn-chico" to={`/admin/modulos/${modulo.id}/${t.id}`}>Editar</Link>
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
  const [tipo, setTipo] = useState('Todos');
  const [modulo, setModulo] = useState('todos');
  const [docente, setDocente] = useState(params.get('docente') ?? 'todos');
  const [busqueda, setBusqueda] = useState('');

  const texto = sinAcentos(busqueda.trim());
  const filas = CREACIONES.filter((c) => (
    (tipo === 'Todos' || c.tipo === tipo)
    && (modulo === 'todos' || c.modulo === modulo)
    && (docente === 'todos' || c.docente === docente)
    && sinAcentos(c.titulo).includes(texto)
  ));

  const limpiar = () => {
    setTipo('Todos');
    setModulo('todos');
    setDocente('todos');
    setBusqueda('');
  };

  return (
    <>
      <div className="admin-cabeza">
        <div>
          <h1>Evalúate</h1>
          <p>Todas las lecciones, quices y exámenes que crearon los docentes en sus módulos.</p>
        </div>
      </div>

      <div className="tarjeta">
        <div className="admin-filtros">
          {TIPOS.map(([valor, nombre]) => (
            <button
              key={valor}
              type="button"
              className="pildora"
              aria-pressed={tipo === valor}
              onClick={() => setTipo(valor)}
            >
              {nombre} ({valor === 'Todos' ? CREACIONES.length : cuantos(CREACIONES, valor)})
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
          <select className="admin-select" aria-label="Filtrar por módulo" value={modulo} onChange={(e) => setModulo(e.target.value)}>
            <option value="todos">Todos los módulos</option>
            {MODULOS.map((m) => <option key={m.id} value={m.id}>{m.titulo}</option>)}
          </select>
          <select className="admin-select" aria-label="Filtrar por docente" value={docente} onChange={(e) => setDocente(e.target.value)}>
            <option value="todos">Todos los docentes</option>
            {DOCENTES.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
          </select>
        </div>

        {filas.length === 0 ? (
          <div className="admin-vacio">
            <b>No hay contenido con estos filtros</b>
            <p className="suave-txt">Prueba con otro tipo, módulo o docente.</p>
            <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico" onClick={limpiar}>Limpiar filtros</button>
          </div>
        ) : (
          <div className="tabla-caja">
            <table className="tabla-panel">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Módulo</th>
                  <th>Docente</th>
                  <th>Estado</th>
                  <th>Creado</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {filas.map((c) => (
                  <tr key={c.id}>
                    <td><b>{c.titulo}</b></td>
                    <td>{c.tipo}</td>
                    <td>{moduloPorId(c.modulo).titulo}</td>
                    <td>{docentePorId(c.docente).nombre}</td>
                    <td><Pastilla estado={c.estado} /></td>
                    <td className="suave-txt num-celda">{c.creado}</td>
                    <td style={{ textAlign: 'right' }}>
                      <Link className="pnl-btn pnl-btn-secundario pnl-btn-chico" to={`/admin/evaluate/${c.id}`}>Ver</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function VistaCreacion({ id }) {
  const creacion = CREACIONES.find((c) => c.id === id);

  if (!creacion) return <NoEncontrado titulo="Evaluación no encontrada" mensaje="Esa evaluación no existe." destino="/admin/evaluate" textoDestino="Volver a Evalúate" />;

  const modulo = moduloPorId(creacion.modulo);
  const tema = modulo.temas.find((t) => t.id === creacion.tema);
  const docente = docentePorId(creacion.docente);
  const esLeccion = creacion.preguntas == null;

  return (
    <>
      <Link className="boton-volver" to="/admin/evaluate"><FiArrowLeft />Evalúate</Link>

      <div className="admin-cabeza">
        <div>
          <h1>{creacion.titulo}</h1>
          <p>{creacion.tipo} de {docente.nombre} · {creacion.creado}</p>
        </div>
        <Pastilla estado={creacion.estado} />
      </div>

      <div className="tarjeta">
        <dl className="ficha">
          <div><dt>Módulo</dt><dd>{modulo.titulo}</dd></div>
          <div><dt>Tema</dt><dd>{creacion.tema} {tema.titulo}</dd></div>
          <div><dt>Docente</dt><dd>{docente.nombre}</dd></div>
          {!esLeccion && (
            <>
              <div><dt>Preguntas</dt><dd>{creacion.preguntas}</dd></div>
              <div><dt>Entregas</dt><dd>{creacion.entregas} de {creacion.total}</dd></div>
              <div><dt>Promedio</dt><dd>{creacion.promedio == null ? 'Sin calificar' : decimal(creacion.promedio)}</dd></div>
            </>
          )}
        </dl>
        <div>
          <Link className="pnl-btn pnl-btn-secundario pnl-btn-chico" to={`/calculo1/${modulo.id}/${creacion.tema}`}>Abrir el tema</Link>
        </div>
      </div>
    </>
  );
}

function VistaRecursos() {
  return (
    <>
      <div className="admin-cabeza">
        <div>
          <h1>Recursos</h1>
          <p>Son las pestañas que el estudiante ve dentro de cada lección.</p>
        </div>
        <button type="button" className="pnl-btn pnl-btn-primario"><FiPlus />Agregar recurso</button>
      </div>

      <ul className="lista">
        {RECURSOS.map((r) => (
          <li key={r.id} className="item">
            <span className="item-icono">{r.nombre.slice(0, 1)}</span>
            <span className="item-txt">
              <b>{r.nombre}</b>
              <span>{r.descripcion}</span>
            </span>
            <span className="suave-txt">{r.piezas} piezas</span>
            <Pastilla estado={r.visible ? 'activo' : 'oculta'} />
            <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico">Editar</button>
          </li>
        ))}
      </ul>
    </>
  );
}

function VistaUsuarios() {
  const [busqueda, setBusqueda] = useState('');
  const texto = sinAcentos(busqueda.trim());
  const filas = DOCENTES.filter((d) => sinAcentos(`${d.nombre} ${d.correo}`).includes(texto));
  const activos = DOCENTES.filter((d) => d.estado === 'activo').length;

  return (
    <>
      <div className="admin-cabeza">
        <div>
          <h1>Usuarios</h1>
          <p>Docentes de la plataforma: {activos} activos de {DOCENTES.length}.</p>
        </div>
        <button type="button" className="pnl-btn pnl-btn-primario" disabled title="Disponible cuando esta pantalla se conecte al backend">
          <FiPlus />Invitar docente
        </button>
      </div>

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
