import { api } from './api';

const vacio = {
  porModulo: [],
  ultimo: null,
  notas: [],
  promedio: 0,
  totalTemas: 0,
  temasVisitados: 0,
  pctGeneral: 0,
};

/** Si el backend no responde, el estudiante nuevo ve 0 % y no un error en pantalla. */
export async function obtenerProgreso() {
  try {
    return await api('/progreso');
  } catch {
    return vacio;
  }
}

export function registrarTemaAbierto({ modulo, tema, titulo }) {
  api('/progreso/tema', { metodo: 'POST', cuerpo: { modulo, tema, titulo } }).catch(() => {});
}

export async function listarEjercicios() {
  try {
    const datos = await api('/progreso/ejercicios');
    return datos.ejercicios ?? [];
  } catch {
    return [];
  }
}

export async function obtenerEjercicio(id) {
  const datos = await api(`/progreso/ejercicios/${encodeURIComponent(id)}`);
  return datos.ejercicio;
}

export function guardarEjercicio(cuerpo) {
  return api('/progreso/ejercicios', { metodo: 'POST', cuerpo });
}

export function borrarEjercicio(id) {
  return api(`/progreso/ejercicios/${encodeURIComponent(id)}`, { metodo: 'DELETE' });
}

export async function listarVideosVistos() {
  try {
    const datos = await api('/progreso/videos');
    return datos.videos ?? [];
  } catch {
    return [];
  }
}

export function registrarVideoVisto(video) {
  if (!video?.youtubeId) return;
  api('/progreso/videos', {
    metodo: 'POST',
    cuerpo: {
      videoId: video.videoId || video.id || '',
      youtubeId: video.youtubeId,
      titulo: video.titulo || 'Video',
      unidad: video.unidad || '',
    },
  }).catch(() => {});
}

export async function listarChats() {
  try {
    const datos = await api('/progreso/chats');
    return datos.chats ?? [];
  } catch {
    return [];
  }
}

export function guardarChat({ id, titulo, tema, mensajes }) {
  return api('/progreso/chats', { metodo: 'POST', cuerpo: { id, titulo, tema, mensajes } });
}
