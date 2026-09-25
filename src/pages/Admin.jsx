import { Link, Navigate, useParams } from 'react-router-dom';
import {
  FiBook,
  FiFolder,
  FiGrid,
  FiLogOut,
  FiPlus,
  FiSearch,
  FiSettings,
  FiUsers,
} from 'react-icons/fi';
import {
  LECCIONES,
  MODULOS,
  PASTILLA_ESTADO,
  RECIENTES,
  RECURSOS,
  USUARIOS,
} from '../data/mockAdmin';

const SECCIONES = [
  ['panel', 'Panel', FiGrid, null],
  ['modulos', 'Módulos', FiFolder, MODULOS.length],
  ['lecciones', 'Lecciones', FiBook, LECCIONES.length],
  ['recursos', 'Recursos', FiGrid, RECURSOS.length],
  ['usuarios', 'Usuarios', FiUsers, USUARIOS.length],
  ['configuracion', 'Configuración', FiSettings, null],
];

function Pastilla({ estado }) {
  const [clase, texto] = PASTILLA_ESTADO[estado] || PASTILLA_ESTADO.borrador;
  return <span className={`pastilla ${clase}`}>{texto}</span>;
}

/**
 * Panel de administrador: gestiona lo que ve el estudiante.
 * Maqueta estática, sin guardado; la navegación entre secciones sí funciona.
 */
export default function Admin() {
  const { seccion } = useParams();
  const activa = SECCIONES.some(([k]) => k === seccion) ? seccion : null;

  if (!activa) return <Navigate to="/admin/panel" replace />;

  const vistas = {
    panel: <VistaPanel />,
    modulos: <VistaModulos />,
    lecciones: <VistaLecciones />,
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
              <div className="lat-nombre">Administrador</div>
              <div className="lat-sub">admin@educalc.xe</div>
            </div>
          </div>
          <nav className="menu-lat">
            <Link to="/"><FiLogOut />Cerrar sesión</Link>
          </nav>
        </div>
      </aside>

      <main className="admin-cuerpo">{vistas[activa]}</main>
    </div>
  );
}

function VistaPanel() {
  const publicadas = LECCIONES.filter((l) => l.estado === 'publicada').length;
  const visibles = RECURSOS.filter((r) => r.visible).length;
  const datos = [
    ['modulos', 'Módulos', MODULOS.length, `${MODULOS.filter((m) => m.estado === 'activo').length} activo`, FiFolder],
    ['lecciones', 'Lecciones', LECCIONES.length, `${publicadas} publicadas`, FiBook],
    ['recursos', 'Recursos', RECURSOS.length, `${visibles} visibles para el estudiante`, FiGrid],
    ['usuarios', 'Usuarios', USUARIOS.length, '12 nuevos esta semana', FiUsers],
  ];

  return (
    <>
      <div className="admin-cabeza">
        <div>
          <h1>Panel de administración</h1>
          <p>Edita todo lo que ve el estudiante desde aquí. Los cambios se publican sin tocar código.</p>
        </div>
        <div className="admin-acciones">
          <Link className="pnl-btn pnl-btn-secundario" to="/admin/modulos">Ir a Cálculo I</Link>
          <Link className="pnl-btn pnl-btn-primario" to="/admin/lecciones"><FiPlus />Nueva lección</Link>
        </div>
      </div>

      <section className="tira">
        {datos.map(([destino, titulo, numero, detalle, Icono]) => (
          <Link key={destino} className="tira-dato" to={`/admin/${destino}`}>
            <span className="tira-tit"><Icono />{titulo}</span>
            <span className="tira-num">{numero}</span>
            <span className="tira-desc">{detalle}</span>
          </Link>
        ))}
      </section>

      <section className="tarjeta">
        <div className="cabeza-fila">
          <h2>Contenido reciente</h2>
          <Link className="pnl-btn pnl-btn-secundario pnl-btn-chico" to="/admin/lecciones">Ver todo</Link>
        </div>
        <ul className="lista">
          {RECIENTES.map((r) => (
            <li key={r.titulo} className="item">
              <span className="item-icono">{r.tipo.slice(0, 1)}</span>
              <span className="item-txt">
                <b>{r.titulo}</b>
                <span>{r.tipo} · {r.cuando}</span>
              </span>
              <Pastilla estado={r.estado} />
              <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico">Editar</button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function VistaModulos() {
  return (
    <>
      <div className="admin-cabeza">
        <div>
          <h1>Módulos</h1>
          <p>Cada módulo agrupa las lecciones y recursos de una asignatura.</p>
        </div>
        <button type="button" className="pnl-btn pnl-btn-primario"><FiPlus />Nuevo módulo</button>
      </div>

      <div className="rejilla-tarjetas">
        {MODULOS.map((m) => (
          <article key={m.id} className="tarjeta">
            <div className="cabeza-fila">
              <h2>{m.nombre}</h2>
              <Pastilla estado={m.estado === 'activo' ? 'activo' : m.estado === 'borrador' ? 'borrador' : 'inactivo'} />
            </div>
            <p className="suave-txt">{m.descripcion}</p>
            <div className="cabeza-fila">
              <span className="suave-txt">{m.lecciones} lecciones · {m.actualizado}</span>
              <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico">Administrar</button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function VistaLecciones() {
  return (
    <>
      <div className="admin-cabeza">
        <div>
          <h1>Lecciones</h1>
          <p>El orden de esta lista es el que ve el estudiante dentro de cada unidad.</p>
        </div>
        <button type="button" className="pnl-btn pnl-btn-primario"><FiPlus />Nueva lección</button>
      </div>

      <div className="tarjeta">
        <label className="pregunta-caja" htmlFor="buscar-leccion">
          <FiSearch aria-hidden="true" />
          <input id="buscar-leccion" type="search" placeholder="Buscar por título o número…" />
        </label>

        <div className="tabla-caja">
          <table className="tabla-panel">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Título</th>
                <th>Unidad</th>
                <th>Estado</th>
                <th>Actualizada</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {LECCIONES.map((l) => (
                <tr key={l.id}>
                  <td><b>{l.num}</b></td>
                  <td>{l.titulo}</td>
                  <td>{l.unidad}</td>
                  <td><Pastilla estado={l.estado} /></td>
                  <td className="suave-txt">{l.actualizado}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
  return (
    <>
      <div className="admin-cabeza">
        <div>
          <h1>Usuarios</h1>
          <p>Mostrando {USUARIOS.length} de {USUARIOS.length + 240} cuentas del curso.</p>
        </div>
        <button type="button" className="pnl-btn pnl-btn-primario"><FiPlus />Invitar usuario</button>
      </div>

      <div className="tarjeta">
        <label className="pregunta-caja" htmlFor="buscar-usuario">
          <FiSearch aria-hidden="true" />
          <input id="buscar-usuario" type="search" placeholder="Buscar por nombre o correo…" />
        </label>

        <div className="tabla-caja">
          <table className="tabla-panel">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Progreso</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {USUARIOS.map((u) => (
                <tr key={u.id}>
                  <td>
                    <span className="alumno">
                      <span>{u.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
                      <span style={{ width: 'auto', height: 'auto', background: 'none', display: 'block', textAlign: 'left' }}>
                        <b style={{ display: 'block', color: '#3730A3' }}>{u.nombre}</b>
                        <small className="suave-txt">{u.correo}</small>
                      </span>
                    </span>
                  </td>
                  <td>{u.rol}</td>
                  <td>
                    {u.progreso == null ? '—' : (
                      <div className="barra-simple" style={{ minWidth: '90px' }}>
                        <i style={{ width: `${u.progreso}%` }} />
                      </div>
                    )}
                  </td>
                  <td><Pastilla estado={u.activo ? 'activo' : 'inactivo'} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
