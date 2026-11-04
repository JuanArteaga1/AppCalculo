import mongoose from "mongoose";

const activo = () => process.env.LOG_PETICIONES !== "false";

const hora = () => new Date().toLocaleTimeString("es-CO", { hour12: false });

/** Una línea por petición al terminar: método, ruta, código y tiempo. Sin cuerpo ni cookies. */
export function registrarPeticiones(req, res, next) {
    if (!activo()) {
        return next();
    }

    const inicio = Date.now();

    res.on("finish", () => {
        console.log(`[${hora()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - inicio} ms)`);
    });

    return next();
}

/** Muestra cada operación que llega a MongoDB. Solo colección y operación, nunca los datos. */
export function registrarMongo() {
    if (activo()) {
        mongoose.set("debug", (coleccion, operacion) => {
            console.log(`[${hora()}]   mongo: ${coleccion}.${operacion}`);
        });
    }
}
