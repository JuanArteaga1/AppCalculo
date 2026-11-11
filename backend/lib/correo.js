import nodemailer from "nodemailer";

const COLOR_PRIMARIO = "#312E81";
const COLOR_FONDO = "#F3F4F6";
const COLOR_TEXTO = "#1F2937";
const COLOR_BLANCO = "#FFFFFF";

function urlBase() {
    return (process.env.URL_APP ?? "http://localhost:5173").replace(/\/$/, "");
}

function urlLogo(nombre) {
    const base = urlBase();
    if (!base) return "";
    return `${base}/${encodeURIComponent(nombre)}`;
}

function plantillaEmail({ titulo, mensaje, enlace, textoBoton, vigencia, notaSeguridad }) {
    const logoUniversidad = urlLogo("LogoUniversidad.png");
    const logoApp = urlLogo("logo matematicas.png");

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titulo}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLOR_FONDO};font-family:Arial,Helvetica,sans-serif;color:${COLOR_TEXTO};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td align="center" style="padding:32px 16px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:${COLOR_BLANCO};border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                    <tr>
                        <td style="background:${COLOR_PRIMARIO};padding:24px;text-align:center;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                                <tr>
                                    ${logoUniversidad ? `<td style="padding-right:16px;"><img src="${logoUniversidad}" alt="Universidad Autónoma" style="height:48px;display:block;"></td>` : ""}
                                    ${logoApp ? `<td><img src="${logoApp}" alt="EDUCALC XE" style="height:48px;display:block;"></td>` : ""}
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;">
                            <h1 style="margin:0 0 16px 0;font-size:22px;color:${COLOR_PRIMARIO};">${titulo}</h1>
                            <p style="margin:0 0 16px 0;line-height:1.6;font-size:16px;">${mensaje}</p>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
                                <tr>
                                    <td style="border-radius:8px;background:${COLOR_PRIMARIO};text-align:center;">
                                        <a href="${enlace}" style="display:inline-block;padding:14px 28px;color:${COLOR_BLANCO};text-decoration:none;font-weight:bold;font-size:16px;border-radius:8px;">${textoBoton}</a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin:16px 0 0 0;font-size:14px;color:#6B7280;">O copia y pega este enlace en tu navegador:</p>
                            <p style="margin:4px 0 16px 0;font-size:14px;word-break:break-all;"><a href="${enlace}" style="color:${COLOR_PRIMARIO};">${enlace}</a></p>
                            ${vigencia ? `<p style="margin:16px 0 0 0;font-size:13px;color:#6B7280;">Este enlace vence en ${vigencia}.</p>` : ""}
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#F9FAFB;padding:20px 32px;text-align:center;font-size:12px;color:#6B7280;border-top:1px solid #E5E7EB;">
                            <p style="margin:0 0 8px 0;">${notaSeguridad}</p>
                            <p style="margin:0;">EDUCALC XE · Universidad Autónoma del Cauca</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

const TIPOS = {
    invitacion: {
        ruta: "registro",
        asunto: "Invitación para registrarte como docente en EDUCALC XE",
        texto(token, vigencia) {
            return `El administrador de EDUCALC XE te invitó a registrarte como docente. Completa tu registro aquí: ${token}\n\nEste enlace vence en ${vigencia}.\n\nSi no esperabas esta invitación, ignórala.`;
        },
        html(token, vigencia) {
            return plantillaEmail({
                titulo: "Invitación como docente",
                mensaje: "Hola,<br><br>El administrador de <strong>EDUCALC XE</strong> te invitó a registrarte como docente. Haz clic en el botón para completar tu registro.",
                enlace: token,
                textoBoton: "Completar registro",
                vigencia,
                notaSeguridad: "Si no esperabas esta invitación, ignórala. No compartas este enlace con otras personas."
            });
        },
        vigencia: "72 horas"
    },
    confirmacion: {
        ruta: "confirmar",
        asunto: "Confirma tu correo en EDUCALC XE",
        texto(token, vigencia) {
            return `Para activar tu cuenta de EDUCALC XE confirma tu correo aquí: ${token}\n\nEste enlace vence en ${vigencia}.`;
        },
        html(token, vigencia) {
            return plantillaEmail({
                titulo: "Confirma tu correo",
                mensaje: "Hola,<br><br>Para activar tu cuenta de <strong>EDUCALC XE</strong>, confirma tu correo haciendo clic en el botón.",
                enlace: token,
                textoBoton: "Confirmar correo",
                vigencia,
                notaSeguridad: "Si no creaste esta cuenta, ignórala."
            });
        },
        vigencia: "24 horas"
    },
    restablecimiento: {
        ruta: "restablecer",
        asunto: "Restablece tu contraseña de EDUCALC XE",
        texto(token, vigencia) {
            return `Recibimos una solicitud para restablecer tu contraseña de EDUCALC XE. Si fuiste tú, usa este enlace (vence en ${vigencia}): ${token}\n\nSi no pediste el cambio, ignóralo.`;
        },
        html(token, vigencia) {
            return plantillaEmail({
                titulo: "Restablecer contraseña",
                mensaje: "Hola,<br><br>Recibimos una solicitud para restablecer tu contraseña de <strong>EDUCALC XE</strong>. Si fuiste tú, haz clic en el botón.",
                enlace: token,
                textoBoton: "Nueva contraseña",
                vigencia,
                notaSeguridad: "Si no pediste este cambio, ignóralo."
            });
        },
        vigencia: "1 hora"
    }
};

let transporteForzado = null;

function leerEnv(nombre, alternativo) {
    return process.env[nombre] ?? process.env[alternativo] ?? "";
}

function crearTransporteReal() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT);
    const user = leerEnv("SMTP_USER", "SMTP_USUARIO");
    const pass = leerEnv("SMTP_PASS", "SMTP_CLAVE");

    if (!host || !user || !pass || Number.isNaN(port)) {
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
    });
}

function obtenerTransporte() {
    if (transporteForzado !== null) return transporteForzado;
    return crearTransporteReal();
}

function armarEnlace(ruta, token) {
    const base = (process.env.URL_APP ?? "http://localhost:5173").replace(/\/$/, "");
    if (!base) return "";
    return `${base}/${ruta}#${token}`;
}

/** Solo para tests: inyecta un transporte falso o vuelve al real con null. */
export function usarTransporte(transport) {
    transporteForzado = transport;
}

/**
 * Envía un enlace por correo. Si no hay SMTP configurado o falla el envío,
 * devuelve { enviado: false, enlace } para que el administrador lo copie.
 */
export async function enviarEnlace(tipo, destinatario, token) {
    const config = TIPOS[tipo];

    if (!config) {
        throw new Error(`Tipo de enlace desconocida: ${tipo}`);
    }

    const enlace = armarEnlace(config.ruta, token);
    const transporte = obtenerTransporte();

    if (!transporte) {
        return { enviado: false, enlace };
    }

    try {
        await transporte.sendMail({
            from: process.env.SMTP_REMITENTE ?? "EDUCALC XE <no-responder@uniautonoma.edu.co>",
            to: destinatario,
            subject: config.asunto,
            text: config.texto(enlace, config.vigencia),
            html: config.html(enlace, config.vigencia)
        });

        return { enviado: true, enlace };
    } catch (error) {
        return { enviado: false, enlace, error: error.message };
    }
}

/** Envía la invitación al docente. */
export async function enviarInvitacionDocente({ correo, token }) {
    return enviarEnlace("invitacion", correo, token);
}

/** Envía la confirmación de correo del estudiante. */
export async function enviarConfirmacionCorreo({ correo, token }) {
    return enviarEnlace("confirmacion", correo, token);
}

const AVISOS_CUENTA = {
    activa: {
        mensaje: "Hola,<br><br>Alguien intentó crear una cuenta de <strong>EDUCALC XE</strong> con este correo, pero ya tienes una. Ingresa con tu correo y tu contraseña. Si no la recuerdas, usa <strong>Recuperar acceso</strong> en la pantalla de ingreso.",
        texto: "Alguien intentó crear una cuenta de EDUCALC XE con este correo, pero ya tienes una. Ingresa con tu correo y tu contraseña; si no la recuerdas, usa Recuperar acceso.",
    },
    invitado: {
        mensaje: "Hola,<br><br>Alguien intentó crear una cuenta de estudiante en <strong>EDUCALC XE</strong> con este correo, pero tienes una invitación de docente pendiente. Complétala con el enlace del correo de invitación; si venció, pídele otra al administrador.",
        texto: "Alguien intentó crear una cuenta de estudiante en EDUCALC XE con este correo, pero tienes una invitación de docente pendiente. Complétala con el enlace del correo de invitación; si venció, pídele otra al administrador.",
    },
};

/**
 * Aviso al dueño de un correo que ya tiene cuenta cuando alguien se registra
 * con él (spec-login BR-13). La pantalla no lo revela: solo lo sabe el dueño.
 */
export async function enviarAvisoCuentaExistente({ correo, caso = "activa" }) {
    const aviso = AVISOS_CUENTA[caso] ?? AVISOS_CUENTA.activa;
    const enlace = `${urlBase()}/acceso`;
    const transporte = obtenerTransporte();

    if (!transporte) {
        return { enviado: false };
    }

    try {
        await transporte.sendMail({
            from: process.env.SMTP_REMITENTE ?? "EDUCALC XE <no-responder@uniautonoma.edu.co>",
            to: correo,
            subject: "Ya tienes una cuenta en EDUCALC XE",
            text: `${aviso.texto}\n\nIngresa aquí: ${enlace}\n\nSi no fuiste tú, ignora este correo.`,
            html: plantillaEmail({
                titulo: "Ya tienes una cuenta",
                mensaje: aviso.mensaje,
                enlace,
                textoBoton: "Ir a iniciar sesión",
                vigencia: "",
                notaSeguridad: "Si no fuiste tú, ignora este correo: tu cuenta sigue igual."
            })
        });

        return { enviado: true };
    } catch (error) {
        return { enviado: false, error: error.message };
    }
}

/** Envía el restablecimiento de contraseña. */
export async function enviarRestablecimiento({ correo, token }) {
    return enviarEnlace("restablecimiento", correo, token);
}
