/**
 * Reglas de visibilidad de los temas. Un tema privado o en papelera no debe
 * existir para estudiantes ni docentes: se responde 404, nunca 403, para no
 * revelar que existe. El administrador ve todo, incluida la papelera.
 */

export const MODULO_CONCEPTOS_PREVIOS = "conceptos-previos";
export const VISIBILIDAD_PUBLICA = "publico";
export const VISIBILIDAD_PRIVADA = "privado";
export const VISIBILIDADES = [VISIBILIDAD_PUBLICA, VISIBILIDAD_PRIVADA];

export const esAdministrador = (usuario) => usuario?.rol === "administrador";

/** Los documentos viejos no tienen el campo: `$ne: true` los deja pasar. */
export const filtroNoEliminados = { eliminado: { $ne: true } };

export function filtroTemasVisibles(usuario) {
    if (esAdministrador(usuario)) {
        return { ...filtroNoEliminados };
    }

    return { ...filtroNoEliminados, visibilidad: { $ne: VISIBILIDAD_PRIVADA } };
}

/** El curso de Cálculo I nunca incluye "conceptos previos". */
export function filtroTemasDelCurso(usuario) {
    return { ...filtroTemasVisibles(usuario), modulo: { $ne: MODULO_CONCEPTOS_PREVIOS } };
}

export function esTemaVisible(tema, usuario) {
    if (!tema || tema.eliminado === true) {
        return false;
    }

    return esAdministrador(usuario) || tema.visibilidad !== VISIBILIDAD_PRIVADA;
}

export function esTemaVisibleEnCurso(tema, usuario) {
    return tema?.modulo !== MODULO_CONCEPTOS_PREVIOS && esTemaVisible(tema, usuario);
}

/** Mismo filtro en memoria, para lo que ya vino de la base con populate. */
export function soloTemasVisibles(temas, usuario) {
    return (temas ?? []).filter((tema) => esTemaVisible(tema, usuario));
}
