import Tema from "../schemas/temas.js";
import Visita from "../schemas/visitas.js";
import { errorCliente, errorSistema } from "../lib/respuestas.js";
import { filtroTemasVisibles } from "../lib/visibilidad.js";

const SEMANAS = 8;
const DIA_MS = 24 * 60 * 60 * 1000;
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const aFecha = (d) => d.toISOString().slice(0, 10);

/** Lunes de la semana en curso, en UTC. */
function lunesActual() {
    const hoy = new Date();
    const dia = (hoy.getUTCDay() + 6) % 7;

    return new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate() - dia));
}

class visitaController {
    /** Suma una visita. El tema se comprueba para no llenar la base de filas falsas. */
    async registrar(req, res) {
        try {
            const modulo = String(req.body?.modulo ?? "");
            const tema = String(req.body?.tema ?? "");

            if (!(await Tema.exists({ modulo, numero: tema, ...filtroTemasVisibles(req.usuario) }))) {
                return errorCliente(res, 404, "TEMA_NO_ENCONTRADO", "Ese tema no existe.");
            }

            await Visita.updateOne(
                { fecha: aFecha(new Date()), modulo, tema },
                { $inc: { total: 1 } },
                { upsert: true },
            );

            return res.status(204).end();
        } catch (error) {
            return errorSistema(res, "Registrar visita", error);
        }
    }

    /** Las últimas 8 semanas, contando la actual, y el acumulado por tema. */
    async resumen(req, res) {
        try {
            const lunes = lunesActual();
            const inicios = Array.from({ length: SEMANAS }, (_, i) => (
                new Date(lunes.getTime() - (SEMANAS - 1 - i) * 7 * DIA_MS)
            ));

            const filas = await Visita.find({ fecha: { $gte: aFecha(inicios[0]) } }).lean();
            const porModulo = {};
            const porTema = {};

            for (const { fecha, modulo, tema, total } of filas) {
                const semana = Math.floor((Date.parse(fecha) - inicios[0].getTime()) / (7 * DIA_MS));

                porModulo[modulo] ??= Array(SEMANAS).fill(0);
                porModulo[modulo][semana] += total;
                porTema[tema] = (porTema[tema] ?? 0) + total;
            }

            return res.json({
                semanas: inicios.map((d) => `${d.getUTCDate()} ${MESES[d.getUTCMonth()]}`),
                porModulo,
                porTema,
            });
        } catch (error) {
            return errorSistema(res, "Resumen de visitas", error);
        }
    }
}

export default new visitaController();
