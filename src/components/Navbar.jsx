import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { MdMenu, MdClose } from 'react-icons/md';
import { PERFILES } from '../data/mockEspacio';

const ENLACES = [
  { path: '/', label: 'Inicio' },
  { path: '/conceptos-previos', label: 'Conceptos Previos' },
  { path: '/calculo1', label: 'Cálculo I' },
  { path: '/evaluate', label: 'Evalúate' },
  { path: '/laboratorio', label: 'Laboratorio' },
  { path: '/videoteca', label: 'Videoteca' },
];

/**
 * Barra de navegación en cápsula de vidrio: flota sobre el contenido y lo
 * deja translucir. Dentro de un espacio (estudiante o maestro) las acciones
 * cambian de "Ingresar / Comenzar" a la ficha del usuario.
 */
export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuUsuario, setMenuUsuario] = useState(false);

  // El rol sale de la ruta: la maqueta todavía no tiene sesión de verdad.
  const enEspacio = location.pathname.startsWith('/espacio/');
  const rol = location.pathname.startsWith('/espacio/maestro') ? 'maestro' : 'estudiante';
  const perfil = PERFILES[rol];

  // Se cierra al navegar desde el propio enlace: el compilador de React no
  // permite hacerlo en un efecto.
  const cerrar = () => {
    setMobileOpen(false);
    setMenuUsuario(false);
  };

  const activo = (path) => (path === '/'
    ? location.pathname === '/'
    : location.pathname === path || location.pathname.startsWith(path + '/'));

  return (
    <nav className="nav-glass">
      <div className="nav-fila">
        <Link to="/" className="nav-marca">
          <img className="nav-logo" src="/LogoUniversidad.png" alt="Logo Universidad" />
          <span className="nav-marca-txt">
            <span className="nav-marca-nombre">EDUCALC XE</span>
            <span className="nav-marca-bajada">Plataforma Educativa</span>
          </span>
        </Link>

        <button
          className="nav-hamburguesa"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menú"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
        </button>

        <div className={`nav-links ${mobileOpen ? 'abierto' : ''}`}>
          {ENLACES.map((e) => (
            <Link key={e.path} to={e.path} aria-current={activo(e.path) ? 'page' : undefined} onClick={cerrar}>
              {e.label}
            </Link>
          ))}

          <div className="nav-acciones">
            {enEspacio ? (
              <div className="nav-usuario">
                <button
                  type="button"
                  className="usuario-btn"
                  onClick={() => setMenuUsuario(!menuUsuario)}
                  aria-expanded={menuUsuario}
                >
                  <span className="usuario-avatar">{perfil.iniciales}</span>
                  <span className="usuario-txt">
                    <b>{perfil.nombre.split(' ')[0]}</b>
                    <span>{rol === 'maestro' ? 'Maestro' : 'Estudiante'}</span>
                  </span>
                </button>

                {menuUsuario && (
                  <div className="menu-usuario">
                    <Link to={`/espacio/${rol}/${rol === 'maestro' ? 'aprender' : 'progreso'}`} onClick={cerrar}>Mi espacio</Link>
                    <Link to={`/espacio/${rol}/ajustes`} onClick={cerrar}>Ajustes</Link>
                    <Link to="/" onClick={cerrar}>Cerrar sesión</Link>
                  </div>
                )}
              </div>
            ) : (
              // Un solo botón, directo al acceso: antes "Ingresar" y "Comenzar"
              // llevaban al mismo sitio. Los perfiles se eligen ya en el login.
              <Link className="nav-btn nav-btn-ingresar" to="/acceso" onClick={cerrar}>
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// El CSS va aquí para que la barra viaje completa con su componente.
if (typeof document !== 'undefined' && !document.getElementById('css-navbar')) {
  const style = document.createElement('style');
  style.id = 'css-navbar';
  style.textContent = `
    /* --- cápsula de vidrio --- */
    .nav-glass {
      position: sticky;
      top: 0;
      z-index: 1000;
      padding: 14px 16px 0;
    }
    .nav-fila {
      position: relative;
      max-width: 1180px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 76px;
      padding: 12px 12px 12px 20px;
      border-radius: 26px;
      background: linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.58) 100%);
      -webkit-backdrop-filter: blur(16px) saturate(190%);
      backdrop-filter: blur(16px) saturate(190%);
      border: 1px solid rgba(255,255,255,0.85);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), 0 8px 28px rgba(37,35,80,0.09);
    }

    .nav-marca { display: flex; align-items: center; gap: 10px; flex-shrink: 0; text-decoration: none; }
    .nav-logo { height: 44px; width: auto; object-fit: contain; flex-shrink: 0; }
    .nav-marca-txt { display: flex; flex-direction: column; min-width: 0; }
    .nav-marca-nombre { font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 16.5px; color: #3730A3; line-height: 1.05; }
    .nav-marca-bajada { font-size: 9.5px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #64628A; margin-top: 3px; }

    .nav-hamburguesa {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #FFFFFF;
      border: 1px solid #E6E5F5;
      border-radius: 12px;
      color: #252350;
      cursor: pointer;
      padding: 8px;
    }

    /* --- móvil: el menú se despliega bajo la cápsula --- */
    .nav-links {
      display: none;
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      right: 0;
      flex-direction: column;
      align-items: stretch;
      gap: 2px;
      padding: 10px;
      border-radius: 20px;
      background: rgba(255,255,255,0.96);
      -webkit-backdrop-filter: blur(16px);
      backdrop-filter: blur(16px);
      border: 1px solid #E6E5F5;
      box-shadow: 0 16px 38px rgba(37,35,80,0.12);
      max-height: 70vh;
      overflow-y: auto;
    }
    .nav-links.abierto { display: flex; }
    .nav-links a {
      border: 0;
      background: transparent;
      font-size: 15px;
      font-weight: 600;
      color: #252350;
      padding: 12px 14px;
      border-radius: 12px;
      text-decoration: none;
    }
    .nav-links a:hover { background: #F3F2FC; color: #3730A3; }
    .nav-links a[aria-current="page"] { color: #4F46E5; font-weight: 700; }
    .nav-acciones { display: flex; align-items: center; gap: 8px; margin-top: 10px; }

    /* --- botones de la barra ---
       Van con .nav-links delante porque el selector .nav-links a (clase +
       etiqueta) gana en especificidad y les borraba el fondo. */
    .nav-links .nav-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      height: 44px;
      padding: 0 20px;
      border-radius: 999px;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 14px;
      font-weight: 700;
      white-space: nowrap;
      text-decoration: none;
      cursor: pointer;
      transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease, color 0.18s ease;
    }
    .nav-links .nav-acciones .nav-btn { flex: 1; }
    .nav-links .nav-btn-ingresar {
      background: #FACC15;
      color: #252350;
      border: 1.5px solid transparent;
      box-shadow: 0 6px 16px rgba(250,204,21,0.38);
    }
    .nav-links .nav-btn-ingresar:hover {
      background: #FDE047;
      box-shadow: 0 9px 22px rgba(250,204,21,0.46);
      transform: translateY(-1px);
    }
    .nav-links .nav-btn:active { transform: translateY(0); }
    .nav-links .nav-btn:focus-visible,
    .nav-links a:focus-visible,
    .usuario-btn:focus-visible,
    .nav-hamburguesa:focus-visible { outline: 2px solid #4F46E5; outline-offset: 2px; }

    /* --- ficha de usuario --- */
    .nav-usuario { position: relative; flex: 1; }
    .usuario-btn {
      display: flex;
      align-items: center;
      gap: 9px;
      width: 100%;
      padding: 5px 12px 5px 5px;
      border-radius: 99px;
      border: 1.5px solid #E6E5F5;
      background: #FFFFFF;
      cursor: pointer;
    }
    .usuario-btn:hover { border-color: #4F46E5; }
    .usuario-avatar {
      width: 34px; height: 34px; border-radius: 50%;
      display: grid; place-items: center;
      background: #312E81; color: #FFFFFF;
      font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 12.5px;
      flex-shrink: 0;
    }
    .usuario-txt { display: flex; flex-direction: column; line-height: 1.1; text-align: left; }
    .usuario-txt b { font-size: 12.5px; color: #3730A3; font-weight: 700; }
    .usuario-txt span { font-size: 10.5px; color: #64628A; }
    .menu-usuario {
      position: absolute; right: 0; top: calc(100% + 8px); min-width: 190px; z-index: 5;
      background: #FFFFFF; border: 1px solid #E6E5F5; border-radius: 14px;
      box-shadow: 0 8px 28px rgba(37,35,80,0.12); padding: 6px;
      display: flex; flex-direction: column;
    }
    .menu-usuario a {
      display: flex; align-items: center; gap: 10px;
      text-align: left; font-size: 13.5px; color: #252350;
      padding: 10px 12px; border-radius: 9px; text-decoration: none; font-weight: 500;
    }
    .menu-usuario a svg { width: 16px; height: 16px; color: #4F46E5; flex-shrink: 0; }
    .menu-usuario a:hover { background: #F3F2FC; color: #3730A3; }
    .menu-usuario-rotulo {
      font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
      color: #64628A; padding: 8px 12px 4px;
    }
    .menu-usuario-pie {
      margin-top: 4px; padding-top: 10px !important;
      border-top: 1px solid #E6E5F5; color: #64628A !important; font-size: 12.5px !important;
    }

    /* --- escritorio --- */
    @media (min-width: 1200px) {
      .nav-hamburguesa { display: none; }
      .nav-links {
        display: flex;
        position: static;
        flex-direction: row;
        align-items: center;
        gap: 2px;
        margin-left: auto;
        padding: 0;
        background: none;
        backdrop-filter: none;
        border: 0;
        box-shadow: none;
        max-height: none;
        overflow: visible;
      }
      .nav-links a { font-size: 14px; padding: 10px 13px; border-radius: 999px; }
      .nav-links a:hover { background: rgba(79,70,229,0.09); color: #3730A3; }
      /* Una línea separa los enlaces de las acciones: sin ella los botones
         parecen un enlace más de la lista. */
      .nav-acciones {
        margin-top: 0;
        margin-left: 12px;
        padding-left: 14px;
        border-left: 1px solid rgba(37,35,80,0.12);
      }
      .nav-links .nav-acciones .nav-btn { flex: none; height: 46px; padding: 0 22px; font-size: 14px; }
      .nav-usuario { flex: none; }
    }
  `;
  document.head.appendChild(style);
}
