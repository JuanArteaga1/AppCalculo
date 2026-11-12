import "dotenv/config";
import mongoose from "mongoose";
import { uriMongo } from "../config/uriMongo.js";
import Modulo from "../schemas/modulos.js";
import Tema from "../schemas/temas.js";
import { validarBloques } from "../lib/validarBloques.js";
import { MODULO_CONCEPTOS_PREVIOS } from "../lib/visibilidad.js";
import { conceptosPrevios } from "../../src/data/conceptosPrevios.js";

/**
 * Crea el módulo especial de conceptos previos y sus temas.
 *
 * Solo inserta lo que falta: si un tema ya existe, no lo toca. Se puede repetir
 * sin riesgo y nunca pisa el trabajo del administrador.
 */
async function migrar() {
    await mongoose.connect(uriMongo());

    await Modulo.updateOne(
        { clave: MODULO_CONCEPTOS_PREVIOS },
        {
            $setOnInsert: {
                titulo: "Conceptos previos",
                descripcion: "Temas que conviene repasar antes de empezar Cálculo I.",
                icono: "💡",
                color: "#B45309",
                orden: 99,
            },
        },
        { upsert: true },
    );

    const cuenta = { creados: 0, existentes: 0 };

    for (const [i, concepto] of conceptosPrevios.entries()) {
        const numero = `CP.${i + 1}`;
        const existente = await Tema.findOne({
            modulo: MODULO_CONCEPTOS_PREVIOS,
            numero,
        });

        if (existente) {
            cuenta.existentes += 1;
            continue;
        }

        await Tema.create({
            modulo: MODULO_CONCEPTOS_PREVIOS,
            numero,
            orden: i,
            titulo: concepto.titulo,
            descripcion: `Repaso de ${concepto.titulo.toLowerCase()}.`,
            bloques: validarBloques([{
                id: `cp-${concepto.id}`,
                tipo: "texto",
                texto: concepto.temas.map((tema) => `- ${tema}`).join("\n"),
            }]),
            videos: [],
            practicas: [],
            visibilidad: "publico",
            eliminado: false,
        });
        cuenta.creados += 1;
    }

    console.log("Conceptos previos listos:", cuenta);
}

migrar()
    .catch((error) => {
        console.error("No se pudieron migrar los conceptos previos:", error.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
