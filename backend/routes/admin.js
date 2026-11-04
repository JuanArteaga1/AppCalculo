import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import multer from "multer";
import temaController from "../controllers/temaController.js";
import visitaController from "../controllers/visitaController.js";
import { errorCliente, errorSistema } from "../lib/respuestas.js";
import { requiereRol } from "../middlewares/sesion.js";

export const CARPETA_ARCHIVOS = path.resolve(process.env.CARPETA_ARCHIVOS || "uploads");

fs.mkdirSync(CARPETA_ARCHIVOS, { recursive: true });

// SVG queda fuera a propósito: puede llevar scripts dentro.
const TIPOS_IMAGEN = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

const subida = multer({
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    storage: multer.diskStorage({
        destination: CARPETA_ARCHIVOS,
        // El nombre lo pone el servidor: el del archivo original no se usa.
        filename: (req, archivo, listo) => {
            listo(null, `${crypto.randomUUID()}.${TIPOS_IMAGEN[archivo.mimetype]}`);
        },
    }),
    fileFilter: (req, archivo, listo) => listo(null, Boolean(TIPOS_IMAGEN[archivo.mimetype])),
}).single("imagen");

function subirImagen(req, res) {
    subida(req, res, (error) => {
        if (error?.code === "LIMIT_FILE_SIZE") {
            return errorCliente(res, 413, "IMAGEN_MUY_GRANDE", "La imagen supera los 5 MB.");
        }

        if (error) {
            return errorSistema(res, "Subir imagen", error);
        }

        if (!req.file) {
            return errorCliente(res, 400, "IMAGEN_INVALIDA", "Sube una imagen PNG, JPG o WebP.");
        }

        return res.status(201).json({ url: `/api/archivos/${req.file.filename}` });
    });
}

const route = express.Router();

// Todo lo de este archivo es solo para el administrador.
route.use(requiereRol("administrador"));

route.get("/visitas", visitaController.resumen);
route.post("/archivos", subirImagen);

route.get("/temas", temaController.listaAdmin);
route.get("/temas/:modulo/:numero", temaController.detalleAdmin);
route.put("/temas/:modulo/:numero", temaController.guardarBorrador);
route.delete("/temas/:modulo/:numero/borrador", temaController.descartarBorrador);
route.post("/temas/:modulo/:numero/publicar", temaController.publicar);
route.get("/temas/:modulo/:numero/versiones", temaController.versiones);
route.post("/temas/:modulo/:numero/versiones/:version/restaurar", temaController.restaurar);

export default route;
