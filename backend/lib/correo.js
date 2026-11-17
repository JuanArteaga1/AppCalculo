import nodemailer from "nodemailer";
import { fileURLToPath } from "node:url";

// Correos de EDUCALC XE. Diseño en tablas y estilos en línea, que es lo único que
// respetan Gmail y Outlook. El logo va adjunto en línea (cid): un enlace a
// URL_APP no carga desde el correo cuando es localhost, y muchos clientes
// bloquean las imágenes externas.

const COLOR = {
    indigo: "#312E81",
    indigoVivo: "#4F46E5",
    ambar: "#F59E0B",
    ambarTexto: "#B45309",
    fondo: "#F3F2FC",
    blanco: "#FFFFFF",
    texto: "#252350",
    texto2: "#64628A",
    borde: "#E6E5F5",
    aviso: "#FFFBEB",
    dorado: "#FCD34D",
};
const FUENTE = "'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/** Logo adjunto en línea; la plantilla lo usa con `cid:logo-uniautonoma`. */
export const LOGO = {
    filename: "logo-uniautonoma.png",
    path: fileURLToPath(new URL("../assets/correo/logo-uniautonoma.png", import.meta.url)),
    cid: "logo-uniautonoma",
};

function urlBase() {
    return (process.env.URL_APP ?? "http://localhost:5173").replace(/\/$/, "");
}

/**
 * Plantilla común de todos los correos.
 * @param {{ resumen: string, titulo: string, saludo?: string, parrafos: string[],
 *   enlace: string, textoBoton: string, vigencia?: string, notaSeguridad: string }} datos
 */
export function plantillaEmail({ resumen, titulo, saludo = "¡Hola!", parrafos, enlace, textoBoton, vigencia, notaSeguridad }) {
    const cuerpo = parrafos
        .map((parrafo) => `<p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${COLOR.texto};">${parrafo}</p>`)
        .join("");

    const caja = vigencia
        ? `<tr><td style="padding:0 40px 8px 40px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr><td style="background:${COLOR.aviso};border:1px solid #FDE68A;border-radius:12px;padding:14px 18px;font-size:14px;line-height:1.5;color:${COLOR.ambarTexto};">
              <strong>Ten en cuenta:</strong> este enlace vence en ${vigencia} y sirve una sola vez.
            </td></tr>
          </table>
        </td></tr>`
        : "";

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light only">
<title>${titulo}</title>
</head>
<body style="margin:0;padding:0;background:${COLOR.fondo};font-family:${FUENTE};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${resumen}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${COLOR.fondo};">
  <tr><td align="center" style="padding:32px 12px;">
    <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:${COLOR.blanco};border-radius:20px;overflow:hidden;border:1px solid ${COLOR.borde};">

      <tr><td align="center" style="padding:28px 24px 22px 24px;background:${COLOR.blanco};">
        <img src="cid:${LOGO.cid}" width="220" alt="Universidad Autónoma del Cauca" style="display:block;width:220px;max-width:70%;height:auto;border:0;">
      </td></tr>

      <tr><td style="background:${COLOR.indigo};padding:14px 24px;text-align:center;">
        <span style="font-family:${FUENTE};font-size:18px;font-weight:800;letter-spacing:0.5px;color:${COLOR.blanco};">EDUCALC <span style="color:${COLOR.dorado};">XE</span></span>
        <span style="display:block;font-size:12px;color:#C7D2FE;margin-top:2px;">Plataforma de Cálculo Diferencial</span>
      </td></tr>

      <tr><td style="padding:36px 40px 8px 40px;">
        <p style="margin:0 0 6px 0;font-size:15px;font-weight:600;color:${COLOR.indigoVivo};">${saludo}</p>
        <h1 style="margin:0 0 20px 0;font-family:${FUENTE};font-size:26px;line-height:1.25;font-weight:800;color:${COLOR.indigo};">${titulo}</h1>
        ${cuerpo}
      </td></tr>

      <tr><td align="center" style="padding:8px 40px 28px 40px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
          <tr><td align="center" style="border-radius:12px;background:${COLOR.ambar};">
            <a href="${enlace}" style="display:inline-block;padding:16px 36px;font-family:${FUENTE};font-size:16px;font-weight:700;color:${COLOR.texto};text-decoration:none;border-radius:12px;">${textoBoton}</a>
          </td></tr>
        </table>
      </td></tr>

      ${caja}

      <tr><td style="padding:12px 40px 32px 40px;">
        <p style="margin:0 0 4px 0;font-size:13px;color:${COLOR.texto2};">¿El botón no funciona? Copia y pega este enlace en tu navegador:</p>
        <p style="margin:0;font-size:13px;line-height:1.5;word-break:break-all;"><a href="${enlace}" style="color:${COLOR.indigoVivo};">${enlace}</a></p>
      </td></tr>

      <tr><td style="background:${COLOR.fondo};padding:22px 40px;border-top:1px solid ${COLOR.borde};text-align:center;">
        <p style="margin:0 0 8px 0;font-size:13px;line-height:1.5;color:${COLOR.texto2};">${notaSeguridad}</p>
        <p style="margin:0;font-size:12px;color:${COLOR.texto2};">EDUCALC XE · Universidad Autónoma del Cauca · Popayán</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

const TIPOS = {
    invitacion: {
        ruta: "registro",
        asunto: "Te damos la bienvenida como docente en EDUCALC XE",
        texto(enlace, vigencia) {
            return `¡Hola!\n\nEl administrador de EDUCALC XE te invitó a unirte como docente. Con tu cuenta podrás crear quices, compartirlos con un enlace o un código QR y ver las notas de tus estudiantes.\n\nCompleta tu registro aquí: ${enlace}\n\nEste enlace vence en ${vigencia} y sirve una sola vez. Si no esperabas esta invitación, ignora este correo.`;
        },
        html(enlace, vigencia) {
            return plantillaEmail({
                resumen: "Completa tu registro como docente en EDUCALC XE.",
                titulo: "Te invitamos a ser docente en EDUCALC XE",
                parrafos: [
                    "El administrador de la plataforma te invitó a unirte como <strong>docente</strong>.",
                    "Con tu cuenta podrás crear quices para tus estudiantes, compartirlos con un enlace o un código QR y ver sus notas al instante.",
                ],
                enlace,
                textoBoton: "Completar mi registro",
                vigencia,
                notaSeguridad: "Si no esperabas esta invitación, ignora este correo. No compartas este enlace: es personal.",
            });
        },
        vigencia: "72 horas (10 minutos desde que lo abras)",
    },
    confirmacion: {
        ruta: "confirmar",
        asunto: "Confirma tu correo y empieza a estudiar en EDUCALC XE",
        texto(enlace, vigencia) {
            return `¡Hola!\n\nGracias por crear tu cuenta en EDUCALC XE. Solo falta confirmar que este correo es tuyo.\n\nConfírmalo aquí: ${enlace}\n\nEste enlace vence en ${vigencia}. Si no creaste esta cuenta, ignora este correo.`;
        },
        html(enlace, vigencia) {
            return plantillaEmail({
                resumen: "Confirma tu correo para activar tu cuenta de EDUCALC XE.",
                titulo: "¡Ya casi terminas!",
                parrafos: [
                    "Gracias por crear tu cuenta en <strong>EDUCALC XE</strong>. Solo falta confirmar que este correo es tuyo.",
                    "Después podrás estudiar los temas de límites y derivadas, practicar en el laboratorio de gráficas y responder los quices de tus docentes.",
                ],
                enlace,
                textoBoton: "Confirmar mi correo",
                vigencia,
                notaSeguridad: "Si no creaste esta cuenta, ignora este correo y nadie podrá usarla.",
            });
        },
        vigencia: "24 horas",
    },
    restablecimiento: {
        ruta: "recuperar",
        asunto: "Recupera el acceso a tu cuenta de EDUCALC XE",
        texto(enlace, vigencia) {
            return `¡Hola!\n\nRecibimos una solicitud para cambiar la contraseña de tu cuenta de EDUCALC XE. Si fuiste tú, crea una nueva aquí: ${enlace}\n\nEste enlace vence en ${vigencia}. Al cambiarla, se cerrará tu sesión en los demás equipos. Si no pediste el cambio, ignora este correo: tu contraseña sigue igual.`;
        },
        html(enlace, vigencia) {
            return plantillaEmail({
                resumen: "Crea una contraseña nueva para tu cuenta de EDUCALC XE.",
                titulo: "Vamos a recuperar tu acceso",
                parrafos: [
                    "Recibimos una solicitud para cambiar la contraseña de tu cuenta. Si fuiste tú, toca el botón y crea una nueva.",
                    "Al cambiarla, cerraremos tu sesión en los demás equipos para proteger tu cuenta.",
                ],
                enlace,
                textoBoton: "Crear contraseña nueva",
                vigencia,
                notaSeguridad: "Si no pediste este cambio, ignora este correo: tu contraseña sigue igual.",
            });
        },
        vigencia: "72 horas (10 minutos desde que lo abras)",
    },
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
            html: config.html(enlace, config.vigencia),
            attachments: [LOGO]
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
        parrafos: [
            "Alguien intentó crear una cuenta de <strong>EDUCALC XE</strong> con este correo, pero tú ya tienes una.",
            "Ingresa con tu correo y tu contraseña. Si no la recuerdas, usa <strong>Recuperar acceso</strong> en la pantalla de ingreso.",
        ],
        texto: "Alguien intentó crear una cuenta de EDUCALC XE con este correo, pero tú ya tienes una. Ingresa con tu correo y tu contraseña; si no la recuerdas, usa Recuperar acceso.",
    },
    invitado: {
        parrafos: [
            "Alguien intentó crear una cuenta de estudiante en <strong>EDUCALC XE</strong> con este correo, pero tienes una invitación de docente pendiente.",
            "Complétala con el enlace del correo de invitación; si ya venció, pídele otra al administrador.",
        ],
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
            text: `¡Hola!\n\n${aviso.texto}\n\nIngresa aquí: ${enlace}\n\nSi no fuiste tú, ignora este correo.`,
            html: plantillaEmail({
                resumen: "Ya tienes una cuenta en EDUCALC XE.",
                titulo: "Ya tienes una cuenta",
                parrafos: aviso.parrafos,
                enlace,
                textoBoton: "Ir a iniciar sesión",
                notaSeguridad: "Si no fuiste tú, ignora este correo: tu cuenta sigue igual.",
            }),
            attachments: [LOGO]
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
