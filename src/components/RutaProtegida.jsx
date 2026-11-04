import { Navigate, useLocation, useParams } from 'react-router-dom';
import { INICIO_POR_ROL, MODO_DEMO, ROL_DE_RUTA, useSesion } from '../context/sesion';

function Espera() {
  return <div className="sesion-espera" role="status">Comprobando tu sesión…</div>;
}

/** Decide qué mostrar según la sesión. El permiso real lo exige el backend. */
export default function RutaProtegida({ roles, children }) {
  const { usuario, cargando } = useSesion();
  const { pathname } = useLocation();

  if (cargando) return <Espera />;

  if (!usuario) {
    return <Navigate to={`/acceso?volver=${encodeURIComponent(pathname)}`} replace />;
  }

  // Una página de otro rol lleva a su propio espacio, no a la portada.
  return roles.includes(usuario.rol) ? children : <Navigate to={INICIO_POR_ROL[usuario.rol] ?? '/'} replace />;
}

export function RutaEspacio({ children }) {
  const { rol } = useParams();

  if (MODO_DEMO) return children;

  return <RutaProtegida roles={[ROL_DE_RUTA[rol] ?? 'estudiante']}>{children}</RutaProtegida>;
}
