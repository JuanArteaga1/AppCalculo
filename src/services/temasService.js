import { api } from './api';

/**
 * El curso sale siempre de la API. data/temas.js no se usa como respaldo:
 * esa copia no conoce la visibilidad actual y podría mostrar temas privados,
 * en papelera o ya eliminados.
 */
export async function obtenerCurso() {
  return api('/temas');
}

export async function obtenerTema(modulo, numero) {
  try {
    return await api(`/temas/${encodeURIComponent(modulo)}/${encodeURIComponent(numero)}`);
  } catch (error) {
    // Privado o en papelera: el backend responde 404 y el tema no existe.
    if (error?.estado === 404) return null;
    throw error;
  }
}

/** Cuenta una visita por tema y por sesión del navegador. Si falla, no pasa nada. */
export function registrarVisita(modulo, tema) {
  const clave = `visita:${modulo}:${tema}`;

  try {
    if (sessionStorage.getItem(clave)) return;
    sessionStorage.setItem(clave, '1');
  } catch {
    // Sin almacenamiento se cuenta igual.
  }

  api('/visitas', { metodo: 'POST', cuerpo: { modulo, tema } }).catch(() => {});
}
