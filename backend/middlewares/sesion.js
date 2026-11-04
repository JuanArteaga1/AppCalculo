import jwt from "jsonwebtoken";
import Usuario from "../schemas/usuarios.js";
import { errorCliente, errorSistema } from "../lib/respuestas.js";

const NOMBRE_COOKIE = "sesion";
const DURACION_MS = 8 * 60 * 60 * 1000;

function secreto() {
    const valor = process.env.JWT_SECRET;

    if (!valor || valor.length < 32) {
        throw new Error("Configura JWT_SECRET en .env con al menos 32 caracteres.");
    }

    return valor;
}

const opcionesCookie = () => ({
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
});

/** Falla al arrancar, no en el primer login, si falta el secreto. */
export function comprobarSecreto() {
    secreto();
}

export function abrirSesion(res, usuario) {
    const token = jwt.sign({ id: String(usuario._id) }, secreto(), {
        expiresIn: Math.floor(DURACION_MS / 1000),
    });

    res.cookie(NOMBRE_COOKIE, token, { ...opcionesCookie(), maxAge: DURACION_MS });
}

export function cerrarSesion(res) {
    res.clearCookie(NOMBRE_COOKIE, opcionesCookie());
}

/**
 * Exige una sesión válida. Consulta la base en cada petición para que un
 * usuario desactivado o con otro rol pierda el acceso sin esperar a que venza
 * el token.
 */
export async function requiereSesion(req, res, next) {
    try {
        const token = req.cookies?.[NOMBRE_COOKIE];

        if (!token) {
            return errorCliente(res, 401, "SESION_REQUERIDA", "Inicia sesión para continuar.");
        }

        const { id } = jwt.verify(token, secreto());
        const usuario = await Usuario.findById(id);

        if (!usuario || usuario.estado !== "activo") {
            cerrarSesion(res);
            return errorCliente(res, 401, "SESION_INVALIDA", "Tu sesión ya no es válida.");
        }

        req.usuario = usuario;
        return next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            cerrarSesion(res);
            return errorCliente(res, 401, "SESION_VENCIDA", "Tu sesión venció. Ingresa de nuevo.");
        }

        return errorSistema(res, "Validar sesión", error);
    }
}

export function requiereRol(...roles) {
    return [
        requiereSesion,
        (req, res, next) => {
            if (!roles.includes(req.usuario.rol)) {
                return errorCliente(res, 403, "SIN_PERMISO", "No tienes permiso para esta acción.");
            }

            return next();
        },
    ];
}
