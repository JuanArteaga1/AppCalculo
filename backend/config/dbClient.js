import dns from "node:dns";
import "./entorno.js";
import mongoose from "mongoose";

dns.setDefaultResultOrder("ipv4first");

const DNS_PUBLICO = ["8.8.8.8", "1.1.1.1"];

function dnsLocalNoResuelveSrv() {
    const servidores = dns.getServers();
    return servidores.length === 0 || servidores.every((s) => s.startsWith("127.") || s === "::1");
}

/** En Windows el DNS a 127.0.0.1 suele rechazar consultas SRV de Atlas. */
function prepararDns() {
    if (dnsLocalNoResuelveSrv()) {
        dns.setServers(DNS_PUBLICO);
        console.log("DNS local no resuelve MongoDB Atlas; se usa un DNS público para el SRV.");
    }
}

function uriMongo() {
    const usuario = process.env.USER_DB;
    const clave = process.env.PASS_DB;
    const servidor = process.env.SERVER_DB;

    if (!usuario || !clave || !servidor) {
        throw new Error("Faltan USER_DB, PASS_DB o SERVER_DB en backend/.env");
    }

    return `mongodb+srv://${encodeURIComponent(usuario)}:${encodeURIComponent(clave)}@${servidor}/PlataformaEducativa?retryWrites=true&w=majority`;
}

function explicarError(error) {
    const texto = error?.message ?? String(error);

    if (/whitelist|not allowed to connect|IP that isn't|AtlasError/i.test(texto) || error.code === 8000) {
        return "Atlas rechazó esta IP. En Network Access autoriza tu red (o 0.0.0.0/0 en desarrollo).";
    }

    if (/querySrv|ENOTFOUND|ECONNREFUSED|ETIMEOUT|queryTxt/i.test(texto)) {
        return "No se resolvió el cluster de Atlas (DNS). Revisa internet o el nombre en SERVER_DB.";
    }

    if (/auth|bad auth|AuthenticationFailed/i.test(texto)) {
        return "Usuario o contraseña de MongoDB incorrectos.";
    }

    return texto;
}

class dbClient {
    constructor() {
        this.conectarBaseDatos();
    }

    async conectarBaseDatos(intento = 1) {
        try {
            prepararDns();

            if (mongoose.connection.readyState === 1) return;

            if (mongoose.connection.readyState !== 0) {
                await mongoose.disconnect();
            }

            await mongoose.connect(uriMongo(), {
                serverSelectionTimeoutMS: 15000,
                family: 4,
            });
            console.log("Conexión a la base de datos establecida");
        } catch (e) {
            const esDns = /querySrv|ECONNREFUSED|ENOTFOUND|ETIMEOUT|queryTxt/i.test(e?.message ?? "");

            if (esDns && intento === 1) {
                dns.setServers(DNS_PUBLICO);
                return this.conectarBaseDatos(2);
            }

            console.error("Error al conectar con MongoDB:", explicarError(e));
            const espera = Math.min(30000, 4000 * intento);
            setTimeout(() => this.conectarBaseDatos(Math.min(intento + 1, 8)), espera);
        }
    }

    async cerrarConexion() {
        try {
            await mongoose.disconnect();
            console.log("Conexión a la base de datos cerrada");
        } catch (e) {
            console.log(e);
        }
    }
}

export default new dbClient();
