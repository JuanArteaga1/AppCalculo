import { Link, Navigate, useParams } from 'react-router-dom';
import {
  FiBarChart2,
  FiClipboard,
  FiMessageCircle,
  FiSettings,
  FiTrendingUp,
  FiUsers,
  FiVideo,
} from 'react-icons/fi';
import { HiOutlineLightBulb } from 'react-icons/hi';
import { MENUS, PERFILES } from '../data/mockEspacio';
import { PanelAprenderEstudiante, PanelAprenderMaestro, PanelProgreso } from '../components/espacio/PanelesEstudiante';
import { PanelAjustes, PanelLaboratorio, PanelTutor, PanelVideos } from '../components/espacio/PanelesComunes';
import PanelEstudiantes from '../components/espacio/PanelEstudiantes';

const ICONOS = {
  progreso: FiTrendingUp,
  aprender: FiClipboard,
  estudiantes: FiUsers,
  laboratorio: FiBarChart2,
  videos: FiVideo,
  tutor: FiMessageCircle,
  ajustes: FiSettings,
};

/**
 * Espacio personal de estudiante y maestro: menú lateral fijo + panel.
 * Maqueta estática; el rol se decide por la ruta mientras no haya sesión.
 */
export default function Espacio() {
  const { rol, seccion } = useParams();

  if (rol !== 'estudiante' && rol !== 'maestro') {
    return <Navigate to="/espacio/estudiante/progreso" replace />;
  }

  const menu = MENUS[rol];
  const activa = menu.some(([k]) => k === seccion) ? seccion : menu[0][0];
  const perfil = PERFILES[rol];

  const paneles = {
    progreso: <PanelProgreso />,
    aprender: rol === 'maestro' ? <PanelAprenderMaestro /> : <PanelAprenderEstudiante />,
    estudiantes: <PanelEstudiantes />,
    laboratorio: <PanelLaboratorio rol={rol} />,
    videos: <PanelVideos rol={rol} />,
    tutor: <PanelTutor rol={rol} />,
    ajustes: <PanelAjustes rol={rol} />,
  };

  return (
    <div className="espacio">
      <aside className="lateral">
        <div className="lat-perfil">
          <span className="lat-avatar">{perfil.iniciales}</span>
          <div>
            <div className="lat-nombre">{perfil.nombre}</div>
            <div className="lat-sub">{perfil.sub}</div>
          </div>
        </div>

        <nav className="menu-lat">
          {menu.map(([clave, texto]) => {
            const Icono = ICONOS[clave];
            return (
              <Link
                key={clave}
                to={`/espacio/${rol}/${clave}`}
                aria-current={clave === activa ? 'page' : undefined}
              >
                <Icono />
                {texto}
              </Link>
            );
          })}
        </nav>

        <div className="lat-nota">
          <HiOutlineLightBulb />
          <div>
            <b>{perfil.nota.titulo}</b>
            <span>{perfil.nota.detalle}</span>
          </div>
        </div>
      </aside>

      {paneles[activa]}
    </div>
  );
}
