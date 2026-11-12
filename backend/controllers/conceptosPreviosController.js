import Tema from "../schemas/temas.js";
import { errorSistema } from "../lib/respuestas.js";
import { filtroTemasVisibles, MODULO_CONCEPTOS_PREVIOS } from "../lib/visibilidad.js";

class conceptosPreviosController {
    /** Contenido publicado de los temas de repaso; privados o en papelera no salen. */
    async lista(req, res) {
        try {
            const temas = await Tema.find({
                ...filtroTemasVisibles(req.usuario),
                modulo: MODULO_CONCEPTOS_PREVIOS,
            })
                .select("numero titulo descripcion bloques orden")
                .sort({ orden: 1 })
                .lean();

            return res.json({
                temas: temas.map((tema) => ({
                    id: tema.numero,
                    titulo: tema.titulo,
                    descripcion: tema.descripcion,
                    bloques: tema.bloques,
                })),
            });
        } catch (error) {
            return errorSistema(res, "Listar conceptos previos", error);
        }
    }
}

export default new conceptosPreviosController();
