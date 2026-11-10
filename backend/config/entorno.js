import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

/** Carga `backend/.env` aunque el proceso se arranque desde otra carpeta. */
const raizBackend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(raizBackend, ".env") });
