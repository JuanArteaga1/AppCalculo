import "dotenv/config";
import mongoose from "mongoose";
import { uriMongo } from "../config/uriMongo.js";
import { sincronizarTodosLosVideos } from "../lib/videoteca.js";

/**
 * Reconstruye la colección `videos` desde `temas.videos`.
 *
 * Es una copia derivada: se puede ejecutar las veces que haga falta. No cambia
 * ningún tema ni borra contenido; solo reemplaza la copia de lectura.
 */
async function sincronizar() {
    await mongoose.connect(uriMongo());

    const cuenta = await sincronizarTodosLosVideos();
    console.log("Videoteca sincronizada:", cuenta);
}

sincronizar()
    .catch((error) => {
        console.error("No se pudo sincronizar la videoteca:", error.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
