import express from "express";
import rateLimit from "express-rate-limit";
import usuarioController from "../controllers/usuarioController.js";
import { errorCliente } from "../lib/respuestas.js";
import { requiereRol, requiereSesion } from "../middlewares/sesion.js";

const route = express.Router();

// Frena los intentos de adivinar contraseñas.
const limiteLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => errorCliente(res, 429, "DEMASIADOS_INTENTOS", "Demasiados intentos. Espera unos minutos e inténtalo de nuevo."),
});

// Primero las rutas fijas: si no, "/:id" las atraparía.
route.post('/login', limiteLogin, usuarioController.login);
route.post('/logout', usuarioController.logout);
route.get('/me', requiereSesion, usuarioController.me);

const soloAdmin = requiereRol('administrador');

route.post('/', soloAdmin, usuarioController.create);
route.get('/', soloAdmin, usuarioController.getAll);
route.get('/:id', soloAdmin, usuarioController.getOne);
route.put('/:id', soloAdmin, usuarioController.update);
route.delete('/:id', soloAdmin, usuarioController.delete);

export default route;
