import "./entorno.js";

/**
 * MONGO_URI completa tiene prioridad: un mongod local no tiene registro SRV.
 * Si falta, se arma la URI de Atlas con las tres variables de siempre.
 */
export function uriMongo() {
    if (process.env.MONGO_URI) {
        return process.env.MONGO_URI;
    }

    const usuario = process.env.USER_DB;
    const clave = process.env.PASS_DB;
    const servidor = process.env.SERVER_DB;

    if (!usuario || !clave || !servidor) {
        throw new Error("Faltan MONGO_URI o USER_DB, PASS_DB y SERVER_DB en backend/.env");
    }

    return `mongodb+srv://${encodeURIComponent(usuario)}:${encodeURIComponent(clave)}@${servidor}/PlataformaEducativa?retryWrites=true&w=majority`;
}
