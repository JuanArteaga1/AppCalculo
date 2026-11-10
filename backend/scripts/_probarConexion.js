import dns from "node:dns";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(raiz, ".env") });

const user = process.env.USER_DB;
const pass = process.env.PASS_DB;
const server = process.env.SERVER_DB;
const uri = `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${server}/PlataformaEducativa?retryWrites=true&w=majority`;

try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log("RESULTADO: conexion OK, estado", mongoose.connection.readyState);
    await mongoose.disconnect();
} catch (e) {
    console.log("RESULTADO: fallo");
    console.log("nombre:", e.name);
    console.log("codigo:", e.code);
    console.log("mensaje:", e.message);
    process.exitCode = 1;
}
