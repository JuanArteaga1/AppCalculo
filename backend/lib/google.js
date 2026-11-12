const DOMINIO = "uniautonoma.edu.co";

const ADMIN_POR_DEFECTO = "estiven.realpe.h@uniautonoma.edu.co";
const DOCENTE_POR_DEFECTO = "juan.arteaga.f@uniautonoma.edu.co";

export const GOOGLE_AUTORIZACION = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
export const GOOGLE_USERINFO = "https://openidconnect.googleapis.com/v1/userinfo";

export function normalizarCorreo(valor) {
    return typeof valor === "string" ? valor.trim().toLowerCase() : "";
}

export function esCorreoInstitucional(correo) {
    const limpio = normalizarCorreo(correo);
    const partes = limpio.split("@");

    return partes.length === 2 && partes[0].length > 0 && partes[1] === DOMINIO;
}

function listaCorreos(valor, porDefecto) {
    return (valor ?? porDefecto)
        .split(",")
        .map(normalizarCorreo)
        .filter(Boolean);
}

/**
 * Estiven queda como administrador y Juan como docente. Cualquier otro correo
 * nuevo entra como estudiante; a una cuenta existente se le respeta su rol.
 */
export function rolParaCorreo(correo, rolActual = null) {
    const limpio = normalizarCorreo(correo);

    if (listaCorreos(process.env.ADMIN_CORREOS, ADMIN_POR_DEFECTO).includes(limpio)) {
        return "administrador";
    }

    if (listaCorreos(process.env.DOCENTE_CORREOS, DOCENTE_POR_DEFECTO).includes(limpio)) {
        return rolActual === "administrador" ? "administrador" : "docente";
    }

    return rolActual ?? "estudiante";
}

export function googleConfigurado() {
    return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function urlAplicacion() {
    return (process.env.URL_APP || "http://localhost:5173").replace(/\/+$/, "");
}

export function urlRedireccionGoogle() {
    return process.env.GOOGLE_REDIRECT_URI || `${urlAplicacion()}/api/usuarios/google/callback`;
}

/** Solo rutas internas: evita que `volver` mande a otro sitio. */
export function rutaSegura(valor) {
    if (typeof valor !== "string" || !valor.startsWith("/") || valor.startsWith("//")) {
        return "";
    }

    return valor;
}
