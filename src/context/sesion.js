import { createContext, useContext } from 'react';

export const SesionContext = createContext(null);

export const useSesion = () => useContext(SesionContext);

/** Ruta inicial de cada rol después de ingresar. */
export const INICIO_POR_ROL = {
  administrador: '/admin/panel',
  docente: '/espacio/maestro/aprender',
  estudiante: '/espacio/estudiante/progreso',
};

/** Zonas privadas y el rol que puede verlas; lo demás es público. */
const ZONAS = [
  ['/admin', 'administrador'],
  ['/espacio/estudiante', 'estudiante'],
  ['/espacio/maestro', 'docente'],
];

/**
 * A dónde va alguien al ingresar: de vuelta a `volver` solo si es una ruta de
 * la app que su rol puede ver; si no, a su espacio.
 */
export function destinoAlIngresar(rol, volver) {
  const inicio = INICIO_POR_ROL[rol] ?? '/';
  if (!volver?.startsWith('/') || volver.startsWith('//')) return inicio;

  const zona = ZONAS.find(([prefijo]) => volver === prefijo || volver.startsWith(`${prefijo}/`));
  return !zona || zona[1] === rol ? volver : inicio;
}

/** En las rutas el docente aparece como "maestro". */
export const ROL_DE_RUTA = { estudiante: 'estudiante', maestro: 'docente' };

/** Muestra los espacios sin sesión para revisar las maquetas. Apagado por defecto. */
export const MODO_DEMO = import.meta.env.VITE_DEMO_ESPACIOS === 'true';
