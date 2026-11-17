import { createHash } from "node:crypto";
import IaUso from "../../schemas/iaUso.js";

// Topes por día y ritmo del tutor (spec-gestion-ia RF-01, RF-02, RF-05, BR-02 a BR-04).

const DEFECTO = { sinsesion: 2, estudiante: 20, docente: 50, administrador: 100 };
const ENTORNO = {
    sinsesion: "IA_LIMITE_SIN_SESION",
    estudiante: "IA_LIMITE_ESTUDIANTE",
    docente: "IA_LIMITE_DOCENTE",
    administrador: "IA_LIMITE_ADMINISTRADOR",
};
const DESPLAZAMIENTO_COLOMBIA_MS = 5 * 60 * 60 * 1000;
const DIA_MS = 24 * 60 * 60 * 1000;

const ultimaPregunta = new Map();

/** `IA_SIN_SESION=false` apaga la IA para quien no inició sesión. */
export const iaSinSesionActiva = () => String(process.env.IA_SIN_SESION ?? "true").toLowerCase() !== "false";

const intervaloMs = () => {
    const valor = Number(process.env.IA_INTERVALO_MS);
    return Number.isFinite(valor) && valor >= 0 ? valor : 3000;
};

/** El rol del que cuenta el tope: sin sesión, estudiante, docente o administrador. */
export const rolDelTope = (usuario) => (usuario ? usuario.rol : "sinsesion");

export function topeDelRol(rol) {
    const valor = Number(process.env[ENTORNO[rol]]);
    return Number.isInteger(valor) && valor >= 0 ? valor : DEFECTO[rol] ?? DEFECTO.sinsesion;
}

/** Día de Colombia (UTC−5) en formato AAAA-MM-DD. */
export const diaColombia = (ahora = Date.now()) => new Date(ahora - DESPLAZAMIENTO_COLOMBIA_MS).toISOString().slice(0, 10);

/** Medianoche de Colombia que sigue: cuándo se reinicia el tope. */
function proximoReinicio(ahora = Date.now()) {
    const inicioDelDia = Math.floor((ahora - DESPLAZAMIENTO_COLOMBIA_MS) / DIA_MS) * DIA_MS + DESPLAZAMIENTO_COLOMBIA_MS;
    return new Date(inicioDelDia + DIA_MS);
}

export const horaDeReinicio = () =>
    new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeStyle: "short", timeZone: "America/Bogota" }).format(proximoReinicio());

/** Quién cuenta: la IP con hash para quien no inició sesión, o el usuario. */
export function claveDeUso(req) {
    if (req.usuario) return `usuario:${req.usuario._id}`;

    const sal = process.env.JWT_SECRET ?? "tutor";
    return `ip:${createHash("sha256").update(`${sal}|${req.ip || "local"}`).digest("hex").slice(0, 32)}`;
}

/** Mínimo entre preguntas (3 s por defecto). Devuelve los segundos que faltan, o 0. */
export function esperaTutor(clave) {
    const ahora = Date.now();
    const falta = intervaloMs() - (ahora - (ultimaPregunta.get(clave) ?? 0));

    if (falta > 0) return Math.ceil(falta / 1000) || 1;

    ultimaPregunta.set(clave, ahora);
    return 0;
}

/**
 * Reserva una pregunta del día con una operación atómica: si ya está en el tope,
 * el índice único impide crear el documento y no se reserva. Devuelve cuántas quedan,
 * o null si llegó al tope.
 */
export async function reservarPregunta(clave, tope) {
    if (tope <= 0) return null;

    const dia = diaColombia();

    try {
        const uso = await IaUso.findOneAndUpdate(
            { clave, dia, cuenta: { $lt: tope } },
            { $inc: { cuenta: 1 }, $setOnInsert: { venceEn: new Date(Date.now() + 3 * DIA_MS) } },
            { upsert: true, new: true }
        );

        return tope - uso.cuenta;
    } catch (error) {
        // El documento del día ya existe y está en el tope.
        if (error?.code === 11000) return null;
        throw error;
    }
}

/** Devuelve la pregunta reservada si el proveedor falló (CA-10). */
export async function devolverPregunta(clave) {
    await IaUso.updateOne({ clave, dia: diaColombia(), cuenta: { $gt: 0 } }, { $inc: { cuenta: -1 } });
}
