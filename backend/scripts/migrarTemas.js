import "dotenv/config";
import mongoose from "mongoose";
import Modulo from "../schemas/modulos.js";
import Tema from "../schemas/temas.js";
import { validarBloques } from "../lib/validarBloques.js";
import { unidades } from "../../src/data/temas.js";
import { videosDeTema } from "../../src/data/videos.js";
import { contenidoABloques } from "../../src/lib/bloques.js";

/**
 * Pasa los temas de src/data/temas.js a MongoDB.
 *
 * Por defecto solo crea lo que falta, así que se puede repetir sin riesgo: nunca
 * pisa un tema que ya esté en la base. Con --forzar reemplaza lo publicado
 * (no toca los borradores ni el historial).
 *
 * Los videos y ejercicios de práctica se agregan a los temas que aún no tienen
 * esos campos, sin tocar su contenido, aunque el administrador ya los haya editado.
 */
async function migrar() {
    const forzar = process.argv.includes("--forzar");
    const { USER_DB, PASS_DB, SERVER_DB } = process.env;

    if (!USER_DB || !PASS_DB || !SERVER_DB) {
        throw new Error("Faltan las variables de conexión de MongoDB en .env");
    }

    await mongoose.connect(
        `mongodb+srv://${encodeURIComponent(USER_DB)}:${encodeURIComponent(PASS_DB)}@${SERVER_DB}/PlataformaEducativa?retryWrites=true&w=majority`,
    );

    const cuenta = { creados: 0, reemplazados: 0, sinCambios: 0, conVideos: 0 };

    for (const [iModulo, unidad] of unidades.entries()) {
        await Modulo.updateOne(
            { clave: unidad.id },
            {
                $set: {
                    titulo: unidad.titulo,
                    descripcion: unidad.descripcion,
                    icono: unidad.icono ?? "",
                    color: unidad.color ?? "",
                    orden: iModulo,
                },
            },
            { upsert: true },
        );

        for (const [iTema, tema] of unidad.temas.entries()) {
            const datos = {
                titulo: tema.titulo,
                descripcion: tema.descripcion ?? "",
                bloques: validarBloques(contenidoABloques(tema.contenido)),
            };
            const existente = await Tema.findOne({ modulo: unidad.id, numero: tema.id });

            if (!existente) {
                await Tema.create({
                    modulo: unidad.id,
                    numero: tema.id,
                    orden: iTema,
                    ...datos,
                    videos: videosDeTema(unidad.id, tema.id),
                    practicas: [],
                });
                cuenta.creados += 1;
            } else if (forzar) {
                Object.assign(existente, datos, { orden: iTema });
                await existente.save();
                cuenta.reemplazados += 1;
            } else {
                cuenta.sinCambios += 1;
            }

            const { modifiedCount } = await Tema.updateOne(
                { modulo: unidad.id, numero: tema.id, videos: { $exists: false } },
                { $set: { videos: videosDeTema(unidad.id, tema.id) } },
            );
            cuenta.conVideos += modifiedCount;

            await Tema.updateOne(
                { modulo: unidad.id, numero: tema.id, practicas: { $exists: false } },
                { $set: { practicas: [] } },
            );
        }
    }

    console.log("Migración terminada:", cuenta);
}

migrar()
    .catch((error) => {
        console.error("No se pudo migrar:", error.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
