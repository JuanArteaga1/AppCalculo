import "./config/entorno.js";
import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import routesUsuarios from "./routes/usuarios.js";
import routesTemas from "./routes/temas.js";
import routesVideos from "./routes/videos.js";
import routesConceptosPrevios from "./routes/conceptosPrevios.js";
import routesProgreso from "./routes/progreso.js";
import routesAdmin, { CARPETA_ARCHIVOS } from "./routes/admin.js";
import visitaController from "./controllers/visitaController.js";
import tutorController from "./controllers/tutorController.js";
import { comprobarSecreto, sesionOpcional } from "./middlewares/sesion.js";
import { registrarMongo, registrarPeticiones } from "./middlewares/registro.js";
import { errorCliente, errorSistema } from "./lib/respuestas.js";
import bodyParser from "body-parser";
import dbClient from "./config/dbClient.js";
import cors from 'cors';
import routesEvaluaciones from "./routes/evaluaciones.js";
import routesEjerciciosGuardados from "./routes/ejerciciosGuardados.js";

comprobarSecreto();
registrarMongo();

const app = express();

// Detrás del proxy de Vercel la IP real viene en una cabecera.
if (process.env.CONFIAR_PROXY === "true") {
    app.set("trust proxy", 1);
}

const origenes = (process.env.ORIGENES_PERMITIDOS || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim());

app.use(registrarPeticiones);
app.use(helmet());
app.use(cors({ origin: origenes, credentials: true }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "2mb" }));

const limiteVisitas = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => errorCliente(res, 429, "DEMASIADAS_PETICIONES", "Demasiadas peticiones. Inténtalo en un momento."),
});

app.use('/api/usuarios', routesUsuarios);
app.use('/api/temas', routesTemas);
app.use('/api/videos', routesVideos);
app.use('/api/conceptos-previos', routesConceptosPrevios);
app.use('/api/progreso', routesProgreso);
app.use('/api/ejercicios-guardados', routesEjerciciosGuardados);
app.use('/api/admin', routesAdmin);
app.use("/api/evaluaciones", routesEvaluaciones);
app.post('/api/visitas', limiteVisitas, sesionOpcional, visitaController.registrar);
app.post('/api/tutor', limiteVisitas, tutorController.preguntar);
app.use('/api/archivos', express.static(CARPETA_ARCHIVOS, {
    dotfiles: "deny",
    index: false,
    maxAge: "7d",
    setHeaders: (res) => res.set("Cross-Origin-Resource-Policy", "cross-origin"),
}));

app.use('/api', (req, res) => errorCliente(res, 404, "RUTA_NO_ENCONTRADA", "Esa ruta no existe."));

// Último recurso: sin esto, Express responde con una página HTML que muestra rutas internas.
app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    const estado = error.status ?? error.statusCode ?? 500;

    if (estado >= 400 && estado < 500) {
        return errorCliente(res, estado, "PETICION_INVALIDA", "La petición no tiene un formato válido.");
    }

    return errorSistema(res, `${req.method} ${req.originalUrl}`, error);
});

try{
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log('Servidor activo en el puerto ' + PORT);
    });
} catch(e){
    console.log(e);
}

process.on('SIGINT', async () => {
    dbClient.cerrarConexion();
    process.exit(0);
});
