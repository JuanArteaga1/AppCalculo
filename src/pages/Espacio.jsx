import { Link, useParams } from 'react-router-dom';
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
import { MENUS } from '../data/mockEspacio';
import { useSesion } from '../context/sesion';
import { useEvaluacionesEstudiante } from '../hooks/useEvaluacionesEstudiante';
import { PanelAprenderEstudiante, PanelAprenderMaestro, PanelProgreso } from '../components/espacio/PanelesEstudiante';
import { PanelAjustes, PanelLaboratorio, PanelTutor, PanelVideos } from '../components/espacio/PanelesComunes';
import PanelEstudiantes from '../components/espacio/PanelEstudiantes';
import NoEncontrado from './NoEncontrado';

function inicialesDe(nombre = '') {
  return nombre
    .split(' ')
    .filter(Boolean)
    .map((parte) => parte[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function notaEstudiante(evaluaciones) {
  const pendientes = evaluaciones.filter((e) => e.estado === 'pendiente');
  if (pendientes.length === 0) {
    return { titulo: 'Sin evaluate pendientes', detalle: 'Todo al día' };
  }
  if (pendientes.length === 1) {
    return { titulo: '1 evaluate por hacer', detalle: pendientes[0].titulo };
  }
  return { titulo: `${pendientes.length} evaluate por hacer`, detalle: 'Revisa la sección Evalúate' };
}

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
  const { usuario } = useSesion();
  const { evaluaciones } = useEvaluacionesEstudiante({ rol });

  if (rol !== 'estudiante' && rol !== 'maestro') return <NoEncontrado />;

  const menu = MENUS[rol];

  if (seccion && !menu.some(([k]) => k === seccion)) return <NoEncontrado />;

  const esEstudiante = rol === 'estudiante';
  const activa = seccion ?? menu[0][0];

  const perfil = esEstudiante
    ? {
        nombre: usuario?.nombre || 'Estudiante',
        iniciales: inicialesDe(usuario?.nombre || 'E'),
        sub: usuario?.correo ? `Estudiante · ${usuario.correo}` : 'Estudiante',
        nota: notaEstudiante(evaluaciones),
      }
    : {
        nombre: usuario?.nombre || 'Docente',
        iniciales: inicialesDe(usuario?.nombre || 'D'),
        sub: 'Docente',
        nota: {
          titulo: 'Mis módulos',
          detalle: `${usuario?.modulosAsignados?.length ?? 0} módulos asignados`,
        },
      };

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

        <nav className="menu-lat" aria-label={esEstudiante ? 'Secciones de tu espacio' : 'Secciones del espacio docente'}>
          {menu.map(([clave, texto]) => {
            const Icono = ICONOS[clave];
            return (
              <Link
                key={clave}
                to={`/espacio/${rol}/${clave}`}
                aria-current={clave === activa ? 'page' : undefined}
                // En el celular el menú es una fila con desplazamiento: la pestaña
                // activa se trae a la vista para que nunca quede escondida.
                ref={clave === activa ? (el) => el?.scrollIntoView({ block: 'nearest', inline: 'nearest' }) : undefined}
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
