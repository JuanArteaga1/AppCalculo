import { getTemaById, unidades } from '../data/temas';
import { videosDeTema } from '../data/videos';
import { contenidoABloques } from '../lib/bloques';
import { api } from './api';

/**
 * El curso sale de la base de datos. data/temas.js queda como respaldo: si el
 * backend no responde, la app pública sigue funcionando con esa copia.
 */
export const cursoLocal = () => ({
  modulos: unidades.map(({ id, titulo, descripcion, icono, color, temas }) => ({
    id,
    titulo,
    descripcion,
    icono,
    color,
    temas: temas.map((t) => ({ id: t.id, titulo: t.titulo, descripcion: t.descripcion })),
  })),
});

export async function obtenerCurso() {
  try {
    const curso = await api('/temas');
    return curso.modulos.length ? curso : cursoLocal();
  } catch {
    return cursoLocal();
  }
}

export async function obtenerTema(modulo, numero) {
  try {
    const tema = await api(`/temas/${encodeURIComponent(modulo)}/${encodeURIComponent(numero)}`);
    return { ...tema, videos: tema.videos ?? videosDeTema(modulo, numero) };
  } catch {
    const local = getTemaById(modulo, numero);

    return local
      ? {
        ...local,
        modulo,
        bloques: contenidoABloques(local.contenido),
        videos: videosDeTema(modulo, numero),
        practicas: [],
      }
      : null;
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
