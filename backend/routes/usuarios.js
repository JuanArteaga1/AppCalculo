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

// Registro y reenvío mandan correos: se limitan para que no sirvan de spam.
const limiteCorreos = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    // Un 400 de validación no envía correo: no cuenta.
    skipFailedRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => errorCliente(res, 429, "DEMASIADOS_INTENTOS", "Demasiados intentos. Espera unos minutos e inténtalo de nuevo."),
});

// Abrir enlaces (invitación y confirmación): límite propio, para no gastar los
// intentos de login. Los tokens son de 64 caracteres: no se pueden adivinar.
const limiteEnlaces = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => errorCliente(res, 429, "DEMASIADOS_INTENTOS", "Demasiados intentos. Espera unos minutos e inténtalo de nuevo."),
});

// Primero las rutas fijas: si no, "/:id" las atraparía.
route.get('/google', limiteLogin, usuarioController.iniciarGoogle);
route.get('/google/callback', limiteEnlaces, usuarioController.callbackGoogle);
route.post('/login', limiteLogin, usuarioController.login);
// Atajo de desarrollo, apagado salvo DEMO_ACCESO=true; responde 404 en producción.
route.post('/demo', usuarioController.entrarDemo);
route.post('/logout', usuarioController.logout);
route.get('/me', requiereSesion, usuarioController.me);
// El token va en el cuerpo, no en la dirección: así no queda en el registro de peticiones.
route.post('/invitacion', limiteEnlaces, usuarioController.validarInvitacion);
route.post('/registrar-docente', usuarioController.registrarDocente);
route.get('/carreras', usuarioController.carreras);
route.post('/registro', limiteCorreos, usuarioController.registrarEstudiante);
route.post('/confirmar', limiteEnlaces, usuarioController.confirmarCorreo);
route.post('/reenviar-confirmacion', limiteCorreos, usuarioController.reenviarConfirmacion);

const soloAdmin = requiereRol('administrador');

route.post('/', soloAdmin, usuarioController.create);
route.post('/invitar-docente', soloAdmin, usuarioController.invitarDocente);
route.get('/', soloAdmin, usuarioController.getAll);
route.get('/:id', soloAdmin, usuarioController.getOne);
route.put('/:id', soloAdmin, usuarioController.update);
route.delete('/:id', soloAdmin, usuarioController.delete);

export default route;
