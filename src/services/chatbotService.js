/**
 * Tutor con IA (spec-gestion-ia). Todo pasa por el backend (`POST /api/tutor`):
 * el navegador no tiene ninguna clave ni llama directo a ningún proveedor (CA-09).
 * El backend aplica los topes por rol, los guardrails y las fuentes de la plataforma.
 */

import { api } from './api';

// Códigos con los que conviene ofrecer «Iniciar sesión» junto al mensaje.
const PIDEN_SESION = new Set(['LIMITE_SIN_SESION', 'IA_REQUIERE_SESION']);

/**
 * Envía una pregunta al tutor.
 * @returns {Promise<{ ok: true, respuesta: string, restantes?: number, fuentes: Array, sinContenido: boolean }
 *   | { ok: false, error: string, codigo?: string, requiereSesion: boolean }>}
 */
export async function chatbotMensaje(tema, mensaje) {
  try {
    const datos = await api('/tutor', { metodo: 'POST', cuerpo: { tema, mensaje } });

    return {
      ok: true,
      respuesta: datos.respuesta,
      restantes: datos.restantes,
      fuentes: datos.fuentes ?? [],
      sinContenido: Boolean(datos.sinContenido),
    };
  } catch (error) {
    return {
      ok: false,
      error: error?.message || 'El tutor no pudo responder. Inténtalo en un momento.',
      codigo: error?.codigo,
      requiereSesion: PIDEN_SESION.has(error?.codigo),
    };
  }
}

/** Enlace al ingreso que vuelve a la página actual. */
export const enlaceIniciarSesion = () =>
  `/acceso?volver=${encodeURIComponent(window.location.pathname)}`;
