import { api } from './api';

/**
 * Consulta la lista de ejercicios guardados en el laboratorio del usuario autenticado.
 * Si falla la petición (por ejemplo, sin conexión o sin sesión), retorna [] sin lanzar error.
 */
export async function listarEjerciciosGuardados() {
  try {
    const datos = await api('/ejercicios-guardados');
    return datos.ejercicios ?? [];
  } catch {
    return [];
  }
}

/**
 * Obtiene el detalle de un ejercicio guardado por su identificador.
 */
export async function obtenerEjercicioGuardado(id) {
  const datos = await api(`/ejercicios-guardados/${encodeURIComponent(id)}`);
  return datos.ejercicio;
}

/**
 * Guarda o actualiza un ejercicio en el laboratorio con sus funciones, herramienta y vista.
 */
export function guardarEjercicioGuardado(cuerpo) {
  return api('/ejercicios-guardados', { metodo: 'POST', cuerpo });
}

/**
 * Elimina un ejercicio guardado por su identificador.
 */
export function borrarEjercicioGuardado(id) {
  return api(`/ejercicios-guardados/${encodeURIComponent(id)}`, { metodo: 'DELETE' });
}
